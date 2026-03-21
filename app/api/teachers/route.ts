import { badRequest, created, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { AcademyMembershipRepository } from "@/apps/api/src/modules/academy-memberships/repositories/academy-membership.repository"
import { InvitationService } from "@/apps/api/src/modules/invitations/services/invitation.service"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"
import { TeacherProfileRegistrationService } from "@/apps/api/src/modules/teachers/services/teacher-profile-registration.service"
import { capabilities } from "@/lib/capabilities"
import {
  TeacherCompensationType,
  TeacherProfileCompleteness,
  TeacherProfileStatus,
} from "@prisma/client"

const invitationService = new InvitationService()
const userRepository = new UserRepository()
const academyMembershipRepository = new AcademyMembershipRepository()
const teacherProfileRegistrationService = new TeacherProfileRegistrationService()

function normalizeInput(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function normalizeEmail(value: unknown) {
  const normalized = normalizeInput(value)
  return normalized ? normalized.toLowerCase() : null
}

function normalizeCpf(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const digits = value.replace(/\D/g, "")
  return digits.length === 11 ? digits : null
}

function resolveRoleTitle(value: unknown) {
  if (value === "head_instructor") {
    return "Instrutor chefe"
  }

  if (value === "assistant") {
    return "Assistente"
  }

  if (value === "instructor") {
    return "Instrutor"
  }

  return normalizeInput(value)
}

function normalizeRequestedModalityIds(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
}

function normalizeCompensation(
  payload: Record<string, unknown>
): {
  type: TeacherCompensationType
  amountCents: number
  bonusDescription: string | null
} | null {
  const rawType = payload.compensationType
  const rawValue = payload.compensationValue

  if (typeof rawType !== "string" || (!["fixed", "per_class", "percentage"].includes(rawType))) {
    return null
  }

  const numericValue =
    typeof rawValue === "number"
      ? rawValue
      : typeof rawValue === "string"
        ? Number(rawValue.replace(",", "."))
        : Number.NaN

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null
  }

  return {
    type:
      rawType === "fixed"
        ? TeacherCompensationType.FIXED
        : rawType === "per_class"
          ? TeacherCompensationType.PER_CLASS
          : TeacherCompensationType.PERCENTAGE,
    amountCents: Math.round(numericValue * 100),
    bonusDescription: normalizeInput(payload.bonus) ?? null,
  }
}

async function resolveLegacyModalityIds(input: {
  tenantId: string
  requestedModalityIds: string[]
  specialty: string | null
}) {
  if (input.requestedModalityIds.length > 0 || !input.specialty) {
    return input.requestedModalityIds
  }

  const modality = await prisma.modality.findFirst({
    where: {
      tenantId: input.tenantId,
      name: {
        equals: input.specialty,
        mode: "insensitive",
      },
      isActive: true,
    },
    select: { id: true },
  })

  return modality ? [modality.id] : []
}

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.TEACHERS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const teachers = await prisma.teacherProfile.findMany({
    where: {
      tenantId: access.tenant.id,
      status: {
        in: ["ACTIVE", "INVITED", "DRAFT"],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      specialty: true,
      status: true,
    },
  })

  return ok({
    teachers: teachers.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      specialty: item.specialty,
      status: item.status.toLowerCase(),
    })),
  })
}

export async function POST(req: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.TEACHERS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const payload = await req.json().catch(() => null)

  if (!payload || typeof payload !== "object") {
    return badRequest("Corpo da requisição inválido.")
  }

  const body = payload as Record<string, unknown>
  const name = normalizeInput(body.name)

  if (!name) {
    return badRequest("Informe o nome completo do professor.")
  }

  const email = normalizeEmail(body.email)
  const phone = normalizeInput(body.phone)
  const rank = normalizeInput(body.rank)
  const specialty = normalizeInput(body.specialty)
  const roleTitle = resolveRoleTitle(body.roleTitle ?? body.role)
  const compensation = normalizeCompensation(body)
  const requestedModalityIds = await resolveLegacyModalityIds({
    tenantId: access.tenant.id,
    requestedModalityIds: normalizeRequestedModalityIds(body.requestedModalityIds),
    specialty,
  })

  let linkedUserId: string | null = null
  let membershipId: string | null = null
  let accessInvitation: Awaited<ReturnType<InvitationService["createInvitation"]>> | null = null
  let teacherProfileStatus: TeacherProfileStatus = TeacherProfileStatus.ACTIVE

  if (email) {
    const existingTeacher = await prisma.teacherProfile.findFirst({
      where: {
        tenantId: access.tenant.id,
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    })

    if (existingTeacher) {
      return badRequest("Já existe um professor cadastrado com este e-mail nesta academia.")
    }

    const user = await userRepository.findOrCreateByEmail({
      email,
      cpfNormalized: normalizeCpf(body.cpf) ?? undefined,
      name,
      phone: phone ?? undefined,
    })

    linkedUserId = user.id

    const existingMembership = await academyMembershipRepository.findByUserAndTenant(
      user.id,
      access.tenant.id
    )

    if (existingMembership && existingMembership.role !== "teacher") {
      return badRequest("Este usuário já possui outro tipo de vínculo com a academia.")
    }

    if (existingMembership?.status === "pending") {
      return badRequest("Este professor já possui uma solicitação pendente de aprovação.")
    }

    const membership =
      existingMembership?.status === "active"
        ? existingMembership
        : await academyMembershipRepository.upsert({
            userId: user.id,
            tenantId: access.tenant.id,
            role: "teacher",
            status: "invited",
            invitedByName: access.auth.user?.name?.trim() || access.auth.user?.email || "Academia",
            acceptedAt: null,
          })

    membershipId = membership.id

    if (membership.status === "invited") {
      teacherProfileStatus = TeacherProfileStatus.INVITED
      accessInvitation = await invitationService.createInvitation({
        tenantId: access.tenant.id,
        email,
        role: "teacher",
        invitedByName: access.auth.user?.name?.trim() || access.auth.user?.email || "Academia",
      })
    }
  }

  const teacher = await teacherProfileRegistrationService.upsertFromUser({
    tenantId: access.tenant.id,
    userId: linkedUserId,
    membershipId,
    fallbackEmail: email,
    fallbackName: name,
    fallbackPhone: phone,
    requestedModalityIds,
    rank,
    roleTitle,
    status: teacherProfileStatus,
    profileCompleteness:
      compensation ? TeacherProfileCompleteness.COMPLETE : TeacherProfileCompleteness.PENDING_PAYMENT_DETAILS,
  })

  if (compensation) {
    await prisma.teacherCompensation.upsert({
      where: {
        teacherProfileId: teacher.id,
      },
      create: {
        teacherProfileId: teacher.id,
        type: compensation.type,
        amountCents: compensation.amountCents,
        bonusDescription: compensation.bonusDescription,
      },
      update: {
        type: compensation.type,
        amountCents: compensation.amountCents,
        bonusDescription: compensation.bonusDescription,
      },
    })
  }

  return created({
    teacher: {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      specialty: teacher.specialty,
      status: teacher.status.toLowerCase(),
    },
    accessInvitation:
      accessInvitation
        ? {
            id: accessInvitation.id,
            email: accessInvitation.email,
            token: accessInvitation.token,
            status: accessInvitation.status,
          }
        : null,
  })
}
