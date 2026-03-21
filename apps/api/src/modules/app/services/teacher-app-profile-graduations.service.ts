import type { TeacherAppProfileGraduationsData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  buildGraduationActivityCatalog,
  resolveGraduationCatalogLevels,
} from "@/apps/api/src/modules/graduations/domain/graduation-level-catalog"
import { inferTrackBeltColorHex } from "@/apps/api/src/modules/graduations/domain/graduation-presets"
import { formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"
import { TeacherGraduationService } from "@/apps/api/src/modules/teachers/services/teacher-graduation.service"

function normalizeGraduationMonth(value: string) {
  if (/^\d{4}-\d{2}$/.test(value)) {
    return `${value}-01`
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value.slice(0, 10)
  }

  throw new Error("Informe uma data válida para a graduação.")
}

export class TeacherAppProfileGraduationsService {
  constructor(private readonly teacherGraduationService = new TeacherGraduationService()) {}

  async getData(input: { tenantId: string; userId: string }): Promise<TeacherAppProfileGraduationsData> {
    const [teacherProfile, tracks] = await Promise.all([
      prisma.teacherProfile.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
        },
        include: {
          modalities: {
            include: {
              modality: {
                select: {
                  id: true,
                  name: true,
                  activityCategory: true,
                  isActive: true,
                },
              },
            },
          },
          graduations: {
            orderBy: [{ graduatedAt: "desc" }, { createdAt: "desc" }],
          },
        },
      }),
      prisma.graduationTrack.findMany({
        where: {
          tenantId: input.tenantId,
          isActive: true,
        },
        include: {
          modality: {
            select: {
              id: true,
              name: true,
              activityCategory: true,
            },
          },
          levels: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ])

    if (!teacherProfile) {
      throw new Error("Professor não encontrado para este tenant.")
    }

    const activeModalities = teacherProfile.modalities.filter((item) => item.modality.isActive)
    const trackColorInput = tracks.map((track) => ({
      modalityId: track.modalityId,
      levels: track.levels.map((level) => ({
        name: level.name,
        colorHex: level.colorHex,
      })),
    }))
    const graduationCatalog = buildGraduationActivityCatalog(
      tracks.map((track) => ({
        modalityId: track.modalityId,
        modalityName: track.modality?.name ?? null,
        activityCategory: track.modality?.activityCategory ?? null,
        order: track.sortOrder,
        levels: track.levels.map((level) => ({
          name: level.name,
          colorHex: level.colorHex,
          stripes: level.stripes,
          order: level.sortOrder,
        })),
      }))
    )

    const activityCategories = Array.from(
      new Set([
        ...activeModalities.map((item) => item.modality.activityCategory).filter((value): value is string => Boolean(value)),
        ...teacherProfile.graduations
          .map((graduation) => graduation.activityCategory)
          .filter((value): value is string => Boolean(value)),
      ])
    )

    return {
      role: "teacher",
      teacherId: teacherProfile.id,
      activities: activityCategories.map((activityCategory) => {
        const activityHistory = teacherProfile.graduations
          .filter((graduation) => graduation.activityCategory === activityCategory)
          .sort((left, right) => right.graduatedAt.getTime() - left.graduatedAt.getTime())
        const latestGraduation = activityHistory[0] ?? null
        const modalityIds = activeModalities
          .filter((item) => item.modality.activityCategory === activityCategory)
          .map((item) => item.modalityId)

        const currentBelt = teacherProfile.rank ?? latestGraduation?.toBelt ?? "Branca"
        const currentStripes = 0

        return {
          id: activityCategory,
          activityCategory,
          activityLabel: formatActivityCategory(activityCategory),
          currentBelt,
          currentStripes,
          beltColorHex: inferTrackBeltColorHex({
            beltName: currentBelt,
            preferredModalityIds: modalityIds,
            tracks: trackColorInput,
          }),
          levels: resolveGraduationCatalogLevels({
            catalog: graduationCatalog,
            activityCategory,
            preferredModalityIds: modalityIds,
          }).map((level) => ({
            name: level.name,
            colorHex: level.colorHex,
            stripes: level.stripes,
          })),
          history: activityHistory.map((graduation) => ({
            id: graduation.id,
            activityCategory,
            activityLabel: formatActivityCategory(activityCategory),
            belt: graduation.toBelt,
            stripes: graduation.toStripes,
            date: graduation.graduatedAt.toISOString().slice(0, 10),
            notes: graduation.notes,
          })),
        }
      }),
    }
  }

  async registerGraduation(input: {
    tenantId: string
    userId: string
    payload: {
      activityCategory: string
      toBelt: string
      toStripes: number
      graduatedAtMonth: string
      notes?: string | null
    }
  }) {
    await this.teacherGraduationService.register({
      tenantId: input.tenantId,
      userId: input.userId,
      payload: {
        activityCategory: input.payload.activityCategory,
        toBelt: input.payload.toBelt,
        toStripes: input.payload.toStripes,
        graduatedAt: normalizeGraduationMonth(input.payload.graduatedAtMonth),
        notes: input.payload.notes ?? null,
      },
    })

    return this.getData({ tenantId: input.tenantId, userId: input.userId })
  }

  async updateGraduation(input: {
    tenantId: string
    userId: string
    graduationId: string
    payload: {
      activityCategory: string
      toBelt: string
      toStripes: number
      graduatedAtMonth: string
      notes?: string | null
    }
  }) {
    await this.teacherGraduationService.update({
      tenantId: input.tenantId,
      userId: input.userId,
      graduationId: input.graduationId,
      payload: {
        activityCategory: input.payload.activityCategory,
        toBelt: input.payload.toBelt,
        toStripes: input.payload.toStripes,
        graduatedAt: normalizeGraduationMonth(input.payload.graduatedAtMonth),
        notes: input.payload.notes ?? null,
      },
    })

    return this.getData({ tenantId: input.tenantId, userId: input.userId })
  }
}
