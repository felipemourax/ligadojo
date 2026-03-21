import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"

function normalizeOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export class TeacherGraduationService {
  async register(input: {
    tenantId: string
    userId: string
    payload: {
      activityCategory: string
      toBelt: string
      toStripes: number
      graduatedAt: string
      notes?: string | null
    }
  }) {
    const graduatedAt = new Date(`${input.payload.graduatedAt}T12:00:00.000Z`)
    if (Number.isNaN(graduatedAt.getTime())) {
      throw new Error("Informe uma data válida para a graduação.")
    }

    return prisma.$transaction(async (tx) => {
      const teacherProfile = await tx.teacherProfile.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
        },
        include: {
          modalities: {
            include: {
              modality: {
                select: {
                  activityCategory: true,
                },
              },
            },
          },
          graduations: {
            orderBy: [{ graduatedAt: "desc" }, { createdAt: "desc" }],
          },
        },
      })

      if (!teacherProfile) {
        throw new Error("Professor não encontrado para este tenant.")
      }

      const allowedActivityCategories = new Set(
        teacherProfile.modalities
          .map((item) => item.modality.activityCategory)
          .filter((value): value is string => Boolean(value))
      )

      if (!allowedActivityCategories.has(input.payload.activityCategory)) {
        throw new Error("Atividade não encontrada para este professor.")
      }

      const latestForActivity =
        teacherProfile.graduations.find(
          (graduation) => graduation.activityCategory === input.payload.activityCategory
        ) ?? null
      const currentBelt = latestForActivity?.toBelt ?? teacherProfile.rank ?? "Branca"
      const currentStripes = latestForActivity?.toStripes ?? 0

      await tx.teacherGraduation.create({
        data: {
          teacherProfileId: teacherProfile.id,
          activityCategory: input.payload.activityCategory,
          fromBelt: currentBelt,
          fromStripes: currentStripes,
          toBelt: input.payload.toBelt,
          toStripes: input.payload.toStripes,
          graduatedAt,
          notes: normalizeOptionalString(input.payload.notes),
        },
      })

    })
  }

  async update(input: {
    tenantId: string
    userId: string
    graduationId: string
    payload: {
      activityCategory: string
      toBelt: string
      toStripes: number
      graduatedAt: string
      notes?: string | null
    }
  }) {
    const graduatedAt = new Date(`${input.payload.graduatedAt}T12:00:00.000Z`)
    if (Number.isNaN(graduatedAt.getTime())) {
      throw new Error("Informe uma data válida para a graduação.")
    }

    return prisma.$transaction(async (tx) => {
      const teacherProfile = await tx.teacherProfile.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
        },
        include: {
          modalities: {
            include: {
              modality: {
                select: {
                  activityCategory: true,
                },
              },
            },
          },
          graduations: {
            orderBy: [{ graduatedAt: "desc" }, { createdAt: "desc" }],
          },
        },
      })

      if (!teacherProfile) {
        throw new Error("Professor não encontrado para este tenant.")
      }

      const allowedActivityCategories = new Set(
        teacherProfile.modalities
          .map((item) => item.modality.activityCategory)
          .filter((value): value is string => Boolean(value))
      )

      if (!allowedActivityCategories.has(input.payload.activityCategory)) {
        throw new Error("Atividade não encontrada para este professor.")
      }

      const existingGraduation = await tx.teacherGraduation.findUnique({
        where: { id: input.graduationId },
        select: {
          id: true,
          teacherProfileId: true,
        },
      })

      if (!existingGraduation || existingGraduation.teacherProfileId !== teacherProfile.id) {
        throw new Error("Graduação não encontrada para este professor.")
      }

      await tx.teacherGraduation.update({
        where: { id: input.graduationId },
        data: {
          activityCategory: input.payload.activityCategory,
          toBelt: input.payload.toBelt,
          toStripes: input.payload.toStripes,
          graduatedAt,
          notes: normalizeOptionalString(input.payload.notes),
        },
      })
    })
  }
}
