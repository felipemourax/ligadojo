import { StudentModalityStatus, type Prisma } from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { toPrismaAgeGroup, toModalityEntity } from "@/apps/api/src/modules/modalities/domain/modality-mappers"
import type { ModalityEntity, ModalityInput } from "@/apps/api/src/modules/modalities/domain/modality"

export interface ModalityPlanImpact {
  planId: string
  planName: string
  removedModalityNames: string[]
}

export interface ModalityStudentImpact {
  removedModalityNames: string[]
  affectedStudentCount: number
}

export interface ModalityClassImpact {
  removedModalityNames: string[]
  affectedClassCount: number
}

export interface ModalityRestoreImpact {
  restoredModalityNames: string[]
  restoredClassCount: number
}

function normalizeModalityKey(input: { activityCategory: string | null; name: string }) {
  return `${input.activityCategory ?? ""}::${input.name.trim().toLowerCase()}`
}

export class ModalityRepository {
  async listAvailableActivityCategories(tenantId: string) {
    const onboarding = await prisma.tenantOnboarding.findUnique({
      where: { tenantId },
      select: { academyInfoJson: true },
    })

    const activityCategories = (
      onboarding?.academyInfoJson &&
      typeof onboarding.academyInfoJson === "object" &&
      !Array.isArray(onboarding.academyInfoJson) &&
      Array.isArray((onboarding.academyInfoJson as { activityCategories?: unknown }).activityCategories)
        ? (onboarding.academyInfoJson as { activityCategories: unknown[] }).activityCategories
        : []
    ).filter((item): item is string => typeof item === "string" && item.trim().length > 0)

    return Array.from(new Set(activityCategories))
  }

  async listByTenantId(tenantId: string) {
    const modalities = await prisma.modality.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })

    return modalities.map(toModalityEntity)
  }

  async replaceForTenant(tenantId: string, modalities: ModalityInput[]) {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.modality.findMany({
        where: { tenantId },
      })
      const existingActive = existing.filter((item) => item.isActive)
      const existingInactive = existing.filter((item) => !item.isActive)

      const persistedIds = new Set<string>()
      const restoredIds = new Set<string>()
      const restoredModalityNames = new Set<string>()
      const usedInactiveIds = new Set<string>()

      for (const [index, item] of modalities.entries()) {
        const data = {
          activityCategory: item.activityCategory,
          name: item.name.trim(),
          ageGroups: item.ageGroups.map((value) => toPrismaAgeGroup(value)),
          defaultDurationMinutes: item.defaultDurationMinutes,
          defaultCapacity: item.defaultCapacity,
          sortOrder: index,
          isActive: true,
        }

        if (item.id) {
          await tx.modality.updateMany({
            where: { id: item.id, tenantId },
            data,
          })
          persistedIds.add(item.id)
          if (existingInactive.some((record) => record.id === item.id)) {
            restoredIds.add(item.id)
            restoredModalityNames.add(item.name.trim())
          }
          continue
        }

        const restoreCandidate = existingInactive.find(
          (record) =>
            !usedInactiveIds.has(record.id) &&
            normalizeModalityKey(record) ===
              normalizeModalityKey({
                activityCategory: item.activityCategory,
                name: item.name,
              })
        )

        if (restoreCandidate) {
          await tx.modality.update({
            where: { id: restoreCandidate.id },
            data,
          })
          usedInactiveIds.add(restoreCandidate.id)
          persistedIds.add(restoreCandidate.id)
          restoredIds.add(restoreCandidate.id)
          restoredModalityNames.add(item.name.trim())
          continue
        }

        const created = await tx.modality.create({
          data: {
            tenantId,
            ...data,
          },
        })
        persistedIds.add(created.id)
      }

      const removed = existingActive.filter((item) => !persistedIds.has(item.id))
      const removedIds = removed.map((item) => item.id)
      const impactedPlansMap = new Map<string, ModalityPlanImpact>()
      let studentImpact: ModalityStudentImpact | null = null
      let classImpact: ModalityClassImpact | null = null
      let restoreImpact: ModalityRestoreImpact | null = null

      if (removedIds.length > 0) {
        const impactedPlans = await tx.plan.findMany({
          where: {
            tenantId,
            modalities: {
              some: {
                modalityId: {
                  in: removedIds,
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
            modalities: {
              where: {
                modalityId: {
                  in: removedIds,
                },
              },
              select: {
                modality: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        })

        for (const plan of impactedPlans) {
          impactedPlansMap.set(plan.id, {
            planId: plan.id,
            planName: plan.name,
            removedModalityNames: plan.modalities.map((item) => item.modality.name),
          })
        }

        await tx.planModality.deleteMany({
          where: {
            modalityId: {
              in: removedIds,
            },
          },
        })

        const activeStudentLinks = await tx.studentModality.findMany({
          where: {
            modalityId: {
              in: removedIds,
            },
            status: StudentModalityStatus.ACTIVE,
          },
          select: {
            studentProfileId: true,
            modality: {
              select: {
                name: true,
              },
            },
          },
        })

        if (activeStudentLinks.length > 0) {
          studentImpact = {
            removedModalityNames: Array.from(
              new Set(activeStudentLinks.map((item) => item.modality.name))
            ),
            affectedStudentCount: new Set(activeStudentLinks.map((item) => item.studentProfileId)).size,
          }
        }

        await tx.studentModality.updateMany({
          where: {
            modalityId: {
              in: removedIds,
            },
            status: StudentModalityStatus.ACTIVE,
          },
          data: {
            status: StudentModalityStatus.INACTIVE,
          },
        })

        const activeClassCount = await tx.classGroup.count({
          where: {
            tenantId,
            modalityId: {
              in: removedIds,
            },
            status: "ACTIVE",
          },
        })

        if (activeClassCount > 0) {
          classImpact = {
            removedModalityNames: removed.map((item) => item.name),
            affectedClassCount: activeClassCount,
          }
        }

        await tx.classGroup.updateMany({
          where: {
            tenantId,
            modalityId: {
              in: removedIds,
            },
            status: "ACTIVE",
          },
          data: {
            status: "ARCHIVED",
          },
        })
      }

      if (removed.length > 0) {
        await tx.modality.updateMany({
          where: {
            id: {
              in: removed.map((item) => item.id),
            },
          },
          data: {
            isActive: false,
          },
        })
      }

      if (restoredIds.size > 0) {
        const restoredClassCount = await tx.classGroup.count({
          where: {
            tenantId,
            modalityId: {
              in: Array.from(restoredIds),
            },
            status: "ARCHIVED",
          },
        })

        await tx.classGroup.updateMany({
          where: {
            tenantId,
            modalityId: {
              in: Array.from(restoredIds),
            },
            status: "ARCHIVED",
          },
          data: {
            status: "ACTIVE",
          },
        })

        restoreImpact = {
          restoredModalityNames: Array.from(restoredModalityNames),
          restoredClassCount,
        }
      }

      return {
        impactedPlans: Array.from(impactedPlansMap.values()).map((item) => ({
          ...item,
          removedModalityNames: Array.from(new Set(item.removedModalityNames)),
        })),
        studentImpact,
        classImpact,
        restoreImpact,
      }
    })

    return {
      modalities: await this.listByTenantId(tenantId),
      impactedPlans: result.impactedPlans,
      studentImpact: result.studentImpact,
      classImpact: result.classImpact,
      restoreImpact: result.restoreImpact,
    }
  }

  async replaceActivityCategories(tenantId: string, activityCategories: string[]) {
    const onboarding = await prisma.tenantOnboarding.findUnique({
      where: { tenantId },
      select: { academyInfoJson: true },
    })

    const academyInfo =
      onboarding?.academyInfoJson &&
      typeof onboarding.academyInfoJson === "object" &&
      !Array.isArray(onboarding.academyInfoJson)
        ? { ...(onboarding.academyInfoJson as Record<string, unknown>) }
        : {}

    academyInfo.activityCategories = Array.from(
      new Set(activityCategories.filter((item) => typeof item === "string" && item.trim().length > 0))
    )

    await prisma.tenantOnboarding.upsert({
      where: { tenantId },
      update: {
        academyInfoJson: academyInfo as Prisma.InputJsonValue,
      },
      create: {
        tenantId,
        status: "IN_PROGRESS",
        currentStep: 1,
        completedSteps: [],
        academyInfoJson: academyInfo as Prisma.InputJsonValue,
      },
    })
  }

  async syncOnboardingSnapshot(tenantId: string) {
    const modalities = await prisma.modality.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })

    const onboarding = await prisma.tenantOnboarding.findUnique({
      where: { tenantId },
      select: { tenantId: true },
    })

    if (!onboarding) {
      return
    }

    await prisma.tenantOnboarding.update({
      where: { tenantId },
      data: {
        classStructureJson: {
          modalities: modalities.map((item) => ({
            clientId: item.id,
            activityCategory: item.activityCategory,
            name: item.name,
            ageGroups: toModalityEntity(item).ageGroups,
            defaultDurationMinutes: item.defaultDurationMinutes,
            defaultCapacity: item.defaultCapacity,
          })),
        } as Prisma.InputJsonValue,
      },
    })
  }
}
