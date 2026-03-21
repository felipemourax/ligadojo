import {
  TeacherProfileCompleteness,
  TeacherProfileStatus,
  type Prisma,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"

type TeacherProfileDbClient = Prisma.TransactionClient | typeof prisma

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

async function resolvePrimaryModality(input: {
  db?: TeacherProfileDbClient
  tenantId: string
  requestedModalityIds?: string[]
}) {
  if (!input.requestedModalityIds?.length) {
    return null
  }

  const db = input.db ?? prisma

  return db.modality.findFirst({
    where: {
      tenantId: input.tenantId,
      id: {
        in: input.requestedModalityIds,
      },
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
    },
  })
}

export class TeacherProfileRegistrationService {
  async syncModalities(
    teacherProfileId: string,
    requestedModalityIds: string[] = [],
    db: TeacherProfileDbClient = prisma
  ) {
    await db.teacherModality.deleteMany({
      where: {
        teacherProfileId,
      },
    })

    if (!requestedModalityIds.length) {
      return
    }

    await db.teacherModality.createMany({
      data: requestedModalityIds.map((modalityId) => ({
        teacherProfileId,
        modalityId,
      })),
      skipDuplicates: true,
    })
  }

  async upsertFromUser(input: {
    db?: TeacherProfileDbClient
    tenantId: string
    userId?: string | null
    membershipId?: string | null
    fallbackEmail?: string | null
    fallbackName?: string | null
    fallbackPhone?: string | null
    requestedModalityIds?: string[]
    rank?: string | null
    roleTitle?: string | null
    status: TeacherProfileStatus
    profileCompleteness?: TeacherProfileCompleteness
  }) {
    const db = input.db ?? prisma
    const user = input.userId
      ? await db.user.findUnique({
          where: { id: input.userId },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            firstName: true,
            lastName: true,
            birthDate: true,
          },
        })
      : null

    const primaryModality = await resolvePrimaryModality({
      db,
      tenantId: input.tenantId,
      requestedModalityIds: input.requestedModalityIds,
    })

    const fullName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      user?.name?.trim() ||
      normalizeOptionalText(input.fallbackName) ||
      normalizeOptionalText(input.fallbackEmail)

    const normalizedEmail = normalizeOptionalText(user?.email ?? input.fallbackEmail)

    const candidateFilters = [
      input.membershipId ? { membershipId: input.membershipId } : undefined,
      input.userId ? { userId: input.userId } : undefined,
      normalizedEmail
        ? {
            email: {
              equals: normalizedEmail,
              mode: "insensitive",
            },
          }
        : undefined,
    ].filter(Boolean) as Prisma.TeacherProfileWhereInput[]

    const existingTeacher = candidateFilters.length
      ? await db.teacherProfile.findFirst({
          where: {
            tenantId: input.tenantId,
            OR: candidateFilters,
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        })
      : null

    const baseData = {
      userId: user?.id ?? input.userId ?? existingTeacher?.userId ?? null,
      membershipId: input.membershipId ?? existingTeacher?.membershipId ?? null,
      name: fullName ?? existingTeacher?.name ?? "Professor",
      email: normalizedEmail ?? existingTeacher?.email ?? null,
      phone: normalizeOptionalText(user?.phone ?? input.fallbackPhone) ?? existingTeacher?.phone ?? null,
      rank: normalizeOptionalText(input.rank) ?? existingTeacher?.rank ?? null,
      roleTitle: normalizeOptionalText(input.roleTitle) ?? existingTeacher?.roleTitle ?? null,
      specialty: primaryModality?.name ?? existingTeacher?.specialty ?? null,
      status: input.status,
      profileCompleteness:
        input.profileCompleteness ?? existingTeacher?.profileCompleteness ?? TeacherProfileCompleteness.PENDING_PAYMENT_DETAILS,
    }

    if (existingTeacher) {
      const updatedTeacher = await db.teacherProfile.update({
        where: { id: existingTeacher.id },
        data: baseData,
      })

      await this.syncModalities(updatedTeacher.id, input.requestedModalityIds ?? [], db)
      return updatedTeacher
    }

    const sortOrder = await db.teacherProfile.count({
      where: { tenantId: input.tenantId },
    })

    const createdTeacher = await db.teacherProfile.create({
      data: {
        tenantId: input.tenantId,
        ...baseData,
        sortOrder,
      },
    })

    await this.syncModalities(createdTeacher.id, input.requestedModalityIds ?? [], db)
    return createdTeacher
  }
}
