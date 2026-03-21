import { Prisma } from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import type { ActivityCategoryValue } from "@/apps/api/src/modules/modalities/domain/modality"
import { toUserEntity } from "@/apps/api/src/modules/iam/domain/user-mappers"
import { createSeededModalityTemplates } from "@/apps/api/src/modules/onboarding/domain/academy-modality-seeds"
import { toTenantDomainEntity, toTenantEntity } from "@/apps/api/src/modules/tenancy/domain/tenant-mappers"
import { AcademySelfServiceOnboardingError } from "@/apps/api/src/modules/onboarding/services/academy-owner-resolution.service"
import { buildManagedTenantDomain } from "@/lib/tenancy/config"

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function normalizeActivityCategories(activityCategories?: string[]) {
  return Array.from(
    new Set(
      (activityCategories ?? [])
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

function toPrismaAgeGroup(value: "kids" | "juvenile" | "adult" | "mixed") {
  switch (value) {
    case "kids":
      return "KIDS" as const
    case "juvenile":
      return "JUVENILE" as const
    case "adult":
      return "ADULT" as const
    case "mixed":
      return "MIXED" as const
  }
}

function fromPrismaAgeGroup(value: "KIDS" | "JUVENILE" | "ADULT" | "MIXED") {
  switch (value) {
    case "KIDS":
      return "kids" as const
    case "JUVENILE":
      return "juvenile" as const
    case "ADULT":
      return "adult" as const
    case "MIXED":
      return "mixed" as const
  }
}

function getInitialCompletedSteps(input: {
  academyName: string
  ownerEmail: string
  ownerPhone?: string
  activityCategories?: string[]
}) {
  const completedSteps = [] as string[]
  const activityCategories = normalizeActivityCategories(input.activityCategories)

  if (input.academyName.trim() && input.ownerEmail.trim() && input.ownerPhone?.trim() && activityCategories.length > 0) {
    completedSteps.push("academy_info")
  }

  if (createSeededModalityTemplates(activityCategories as ActivityCategoryValue[]).length > 0) {
    completedSteps.push("class_structure")
  }

  completedSteps.push("branding", "payments")

  return completedSteps
}

function buildTenantSlug(baseSlug: string, attempt: number) {
  return attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`
}

function isSlugOrDomainUniqueConflict(error: unknown) {
  const targets = (() => {
    if (!error || typeof error !== "object" || !("meta" in error)) {
      return []
    }

    const meta = (error as { meta?: { target?: unknown } }).meta
    const target = meta?.target

    if (Array.isArray(target)) {
      return target.filter((value): value is string => typeof value === "string")
    }

    if (typeof target === "string") {
      return [target]
    }

    return []
  })()

  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002" &&
    (targets.length === 0 || targets.some((target) => target === "slug" || target === "domain"))
  )
}

export interface ProvisionAcademyInput {
  academyName: string
  ownerName: string
  ownerEmail: string
  ownerUserId?: string
  ownerPhone?: string
  activityCategories?: string[]
  passwordHash?: string
  passwordSalt?: string
}

export class AcademyProvisioningService {
  async provisionAcademy(input: ProvisionAcademyInput) {
    const normalizedOwnerEmail = input.ownerEmail.trim().toLowerCase()
    const normalizedActivityCategories = normalizeActivityCategories(input.activityCategories) as ActivityCategoryValue[]
    const baseSlug = slugify(input.academyName) || "academia"
    const modalityPresets = createSeededModalityTemplates(normalizedActivityCategories)
    const initialCompletedSteps = getInitialCompletedSteps({
      academyName: input.academyName,
      ownerEmail: normalizedOwnerEmail,
      ownerPhone: input.ownerPhone,
      activityCategories: normalizedActivityCategories,
    })

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const slug = buildTenantSlug(baseSlug, attempt)

      try {
        const result = await prisma.$transaction(async (tx) => {
          const user = input.ownerUserId
            ? await tx.user.findUnique({
                where: { id: input.ownerUserId },
              })
            : await tx.user.upsert({
                where: { email: normalizedOwnerEmail },
                update: {
                  name: input.ownerName,
                  phone: input.ownerPhone,
                },
                create: {
                  email: normalizedOwnerEmail,
                  name: input.ownerName,
                  phone: input.ownerPhone,
                },
              })

          if (!user) {
            throw new Error("Nao foi possivel resolver o proprietario da academia.")
          }

          const tenant = await tx.tenant.create({
            data: {
              slug,
              legalName: input.academyName,
              displayName: input.academyName,
              profile: {
                create: {
                  phone: input.ownerPhone,
                  contactEmail: normalizedOwnerEmail,
                },
              },
            },
          })

          const domain = await tx.tenantDomain.create({
            data: {
              tenantId: tenant.id,
              domain: buildManagedTenantDomain(slug),
              isPrimary: true,
              isVerified: false,
            },
          })

          const membership = await tx.academyMembership.create({
            data: {
              userId: user.id,
              tenantId: tenant.id,
              role: "ACADEMY_ADMIN",
              status: "ACTIVE",
              invitedByName: "Auto-onboarding",
              acceptedAt: new Date(),
            },
          })

          const seededModalities = await Promise.all(
            modalityPresets.map((item, index) =>
              tx.modality.create({
                data: {
                  tenantId: tenant.id,
                  activityCategory: item.activityCategory,
                  name: item.name,
                  ageGroups: item.ageGroups.map(toPrismaAgeGroup),
                  defaultDurationMinutes: item.defaultDurationMinutes,
                  defaultCapacity: item.defaultCapacity,
                  sortOrder: index,
                },
              })
            )
          )

          await tx.tenantOnboarding.create({
            data: {
              tenantId: tenant.id,
              status: "IN_PROGRESS",
              currentStep: 1,
              completedSteps: initialCompletedSteps,
              academyInfoJson: {
                legalName: input.academyName,
                phone: input.ownerPhone,
                contactEmail: normalizedOwnerEmail,
                document: "",
                hasNoDocument: false,
                foundedYear: "",
                activityCategories: normalizedActivityCategories,
              },
              classStructureJson: normalizedActivityCategories.length
                ? {
                    modalities: seededModalities.map((item) => ({
                      clientId: item.id,
                      activityCategory: item.activityCategory ?? undefined,
                      name: item.name,
                      ageGroups: item.ageGroups.map(fromPrismaAgeGroup),
                      defaultDurationMinutes: item.defaultDurationMinutes,
                      defaultCapacity: item.defaultCapacity,
                    })),
                  }
                : undefined,
              plansSetupJson: {
                plans: [],
              },
              brandingSetupJson: {
                appName: input.academyName,
                logoUrl: "",
                bannerUrl: "",
                primaryColor: "#16a34a",
                secondaryColor: "#0f172a",
              },
              paymentsSetupJson: {
                acceptedMethods: ["pix", "card", "boleto"],
                gateway: "",
              },
            },
          })

          if (input.passwordHash && input.passwordSalt) {
            await tx.passwordCredential.upsert({
              where: { userId: user.id },
              update: {
                passwordHash: input.passwordHash,
                passwordSalt: input.passwordSalt,
              },
              create: {
                userId: user.id,
                passwordHash: input.passwordHash,
                passwordSalt: input.passwordSalt,
              },
            })
          }

          return {
            user: toUserEntity(user, []),
            tenant: toTenantEntity(tenant),
            domain: toTenantDomainEntity(domain),
            membership: {
              id: membership.id,
              userId: membership.userId,
              tenantId: membership.tenantId,
              role: "academy_admin" as const,
              status: "active" as const,
              invitedByName: membership.invitedByName ?? undefined,
              acceptedAt: membership.acceptedAt?.toISOString(),
            },
          }
        })

        return {
          user: result.user,
          tenant: result.tenant,
          domain: result.domain,
          membership: result.membership,
        }
      } catch (error) {
        if (isSlugOrDomainUniqueConflict(error) && attempt < 4) {
          continue
        }

        throw error
      }
    }

    throw new AcademySelfServiceOnboardingError(
      409,
      "slug_generation_failed",
      "Nao foi possivel reservar um identificador unico para a nova academia. Tente novamente."
    )
  }
}
