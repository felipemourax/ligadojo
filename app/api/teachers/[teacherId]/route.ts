import { badRequest, notFound, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"
import { TeacherProfileRegistrationService } from "@/apps/api/src/modules/teachers/services/teacher-profile-registration.service"
import { capabilities } from "@/lib/capabilities"
import {
  TeacherCompensationType,
  TeacherProfileCompleteness,
  TeacherProfileStatus,
} from "@prisma/client"

const userRepository = new UserRepository()
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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ teacherId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.TEACHERS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { teacherId } = await context.params

  if (!teacherId) {
    return badRequest("Identificador do professor não informado.")
  }

  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    include: {
      compensation: true,
    },
  })

  if (!teacher || teacher.tenantId !== access.tenant.id) {
    return notFound("Professor não encontrado.")
  }

  const payload = await req.json().catch(() => null)

  if (!payload || typeof payload !== "object") {
    return badRequest("Corpo da requisição inválido.")
  }

  const body = payload as Record<string, unknown>
  const nextName = Object.prototype.hasOwnProperty.call(body, "name")
    ? normalizeInput(body.name)
    : teacher.name

  if (!nextName) {
    return badRequest("Informe o nome completo do professor.")
  }

  const nextEmail = Object.prototype.hasOwnProperty.call(body, "email")
    ? normalizeEmail(body.email)
    : teacher.email
  const nextPhone = Object.prototype.hasOwnProperty.call(body, "phone")
    ? normalizeInput(body.phone)
    : teacher.phone
  const nextRank = Object.prototype.hasOwnProperty.call(body, "rank")
    ? normalizeInput(body.rank)
    : teacher.rank
  const nextSpecialty = Object.prototype.hasOwnProperty.call(body, "specialty")
    ? normalizeInput(body.specialty)
    : teacher.specialty
  const nextRoleTitle = Object.prototype.hasOwnProperty.call(body, "roleTitle") || Object.prototype.hasOwnProperty.call(body, "role")
    ? resolveRoleTitle(body.roleTitle ?? body.role)
    : teacher.roleTitle
  const compensation = normalizeCompensation(body)
  const requestedModalityIds = await resolveLegacyModalityIds({
    tenantId: access.tenant.id,
    requestedModalityIds: normalizeRequestedModalityIds(body.requestedModalityIds),
    specialty: nextSpecialty,
  })

  if (nextEmail) {
    const existingTeacher = await prisma.teacherProfile.findFirst({
      where: {
        tenantId: access.tenant.id,
        id: { not: teacher.id },
        email: {
          equals: nextEmail,
          mode: "insensitive",
        },
      },
      select: { id: true },
    })

    if (existingTeacher) {
      return badRequest("Já existe outro professor cadastrado com este e-mail nesta academia.")
    }
  }

  let linkedUserId = teacher.userId
  if (nextEmail) {
    const user = await userRepository.findOrCreateByEmail({
      email: nextEmail,
      cpfNormalized: normalizeCpf(body.cpf) ?? undefined,
      name: nextName,
      phone: nextPhone ?? undefined,
    })
    linkedUserId = user.id
  }

  const updatedTeacher = await teacherProfileRegistrationService.upsertFromUser({
    tenantId: teacher.tenantId,
    userId: linkedUserId,
    membershipId: teacher.membershipId,
    fallbackEmail: nextEmail,
    fallbackName: nextName,
    fallbackPhone: nextPhone,
    requestedModalityIds,
    rank: nextRank,
    roleTitle: nextRoleTitle,
    status: teacher.status as TeacherProfileStatus,
    profileCompleteness:
      compensation
        ? TeacherProfileCompleteness.COMPLETE
        : teacher.profileCompleteness,
  })

  if (compensation) {
    await prisma.teacherCompensation.upsert({
      where: {
        teacherProfileId: updatedTeacher.id,
      },
      create: {
        teacherProfileId: updatedTeacher.id,
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

  return ok({
    teacher: {
      id: updatedTeacher.id,
      name: updatedTeacher.name,
      email: updatedTeacher.email,
      specialty: updatedTeacher.specialty,
      status: updatedTeacher.status.toLowerCase(),
    },
  })
}
