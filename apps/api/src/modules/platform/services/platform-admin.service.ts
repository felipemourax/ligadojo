import { Prisma, TenantStatus } from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import type {
  PlatformAcademyAction,
  PlatformAcademyDetail,
  PlatformAcademyListItem,
  PlatformOverviewData,
  PlatformTenantStatus,
} from "@/apps/api/src/modules/platform/domain/platform-admin"

function mapTenantStatus(status: TenantStatus): PlatformTenantStatus {
  return status === TenantStatus.SUSPENDED ? "suspended" : "active"
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

function startOfCurrentMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

type PlatformAcademyRecord = Prisma.TenantGetPayload<{
  include: {
    branding: true
    domains: {
      where: { isPrimary: true }
      orderBy: [{ isPrimary: "desc" }, { domain: "asc" }]
      take: 1
    }
    memberships: {
      where: {
        role: "ACADEMY_ADMIN"
      }
      orderBy: [{ acceptedAt: "asc" }, { createdAt: "asc" }]
      take: 1
      include: {
        user: true
      }
    }
    _count: {
      select: {
        studentProfiles: true
        teacherProfiles: true
      }
    }
  }
}>

function toAcademyListItem(input: {
  academy: PlatformAcademyRecord
}): PlatformAcademyListItem {
  const brandingJson =
    input.academy.brandingJson && isObject(input.academy.brandingJson) ? input.academy.brandingJson : null
  const primaryAdmin = input.academy.memberships[0] ?? null
  const primaryDomain = input.academy.domains[0]?.domain ?? null

  return {
    id: input.academy.id,
    slug: input.academy.slug,
    legalName: input.academy.legalName,
    displayName: input.academy.displayName,
    status: mapTenantStatus(input.academy.status),
    primaryDomain,
    appName: readString(brandingJson?.appName) ?? input.academy.branding?.appName ?? null,
    logoUrl: readString(brandingJson?.logoUrl) ?? input.academy.branding?.logoUrl ?? null,
    primaryColor:
      readString(brandingJson?.primaryColor) ?? input.academy.branding?.primaryColor ?? null,
    ownerName: primaryAdmin?.user.name ?? null,
    ownerEmail: primaryAdmin?.user.email ?? null,
    studentsCount: input.academy._count.studentProfiles,
    teachersCount: input.academy._count.teacherProfiles,
    createdAt: input.academy.createdAt.toISOString(),
  }
}

export class PlatformAdminService {
  async getOverview(): Promise<PlatformOverviewData> {
    const currentMonth = startOfCurrentMonth()

    const [totalAcademies, activeAcademies, suspendedAcademies, newAcademiesThisMonth] =
      await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { status: TenantStatus.ACTIVE } }),
        prisma.tenant.count({ where: { status: TenantStatus.SUSPENDED } }),
        prisma.tenant.count({
          where: {
            createdAt: {
              gte: currentMonth,
            },
          },
        }),
      ])

    return {
      totalAcademies,
      activeAcademies,
      suspendedAcademies,
      newAcademiesThisMonth,
    }
  }

  async listAcademies(input?: { query?: string; status?: PlatformTenantStatus | "all" }) {
    const normalizedQuery = input?.query?.trim() ?? ""
    const statusFilter =
      input?.status === "active"
        ? TenantStatus.ACTIVE
        : input?.status === "suspended"
          ? TenantStatus.SUSPENDED
          : null

    const academies = await prisma.tenant.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(normalizedQuery
          ? {
              OR: [
                { legalName: { contains: normalizedQuery, mode: "insensitive" } },
                { displayName: { contains: normalizedQuery, mode: "insensitive" } },
                { slug: { contains: normalizedQuery.toLowerCase().replace(/\s+/g, "-") } },
                {
                  memberships: {
                    some: {
                      user: {
                        OR: [
                          { name: { contains: normalizedQuery, mode: "insensitive" } },
                          { email: { contains: normalizedQuery, mode: "insensitive" } },
                        ],
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }],
      include: {
        branding: true,
        domains: {
          where: { isPrimary: true },
          orderBy: [{ isPrimary: "desc" }, { domain: "asc" }],
          take: 1,
        },
        memberships: {
          where: {
            role: "ACADEMY_ADMIN",
          },
          orderBy: [{ acceptedAt: "asc" }, { createdAt: "asc" }],
          take: 1,
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            studentProfiles: true,
            teacherProfiles: true,
          },
        },
      },
    })

    return academies.map((academy) => toAcademyListItem({ academy }))
  }

  async getAcademyBySlug(slug: string): Promise<PlatformAcademyDetail | null> {
    const academy = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        branding: true,
        onboarding: true,
        domains: {
          orderBy: [{ isPrimary: "desc" }, { domain: "asc" }],
        },
        memberships: {
          where: {
            role: "ACADEMY_ADMIN",
          },
          orderBy: [{ acceptedAt: "asc" }, { createdAt: "asc" }],
          take: 1,
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            studentProfiles: true,
            teacherProfiles: true,
            modalities: true,
            plans: true,
          },
        },
      },
    })

    if (!academy) {
      return null
    }

    return {
      ...toAcademyListItem({ academy }),
      domains: academy.domains.map((domain) => ({
        id: domain.id,
        domain: domain.domain,
        isPrimary: domain.isPrimary,
        isVerified: domain.isVerified,
      })),
      modalitiesCount: academy._count.modalities,
      plansCount: academy._count.plans,
      onboardingStatus: academy.onboarding?.status ?? null,
    }
  }

  async updateAcademyStatus(input: { slug: string; action: PlatformAcademyAction }) {
    const academy = await prisma.tenant.findUnique({
      where: { slug: input.slug },
      select: {
        id: true,
        slug: true,
        status: true,
      },
    })

    if (!academy) {
      return null
    }

    const nextStatus =
      input.action === "approve" ? TenantStatus.ACTIVE : TenantStatus.SUSPENDED

    await prisma.tenant.update({
      where: { id: academy.id },
      data: {
        status: nextStatus,
      },
    })

    return this.getAcademyBySlug(input.slug)
  }
}
