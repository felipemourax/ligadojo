import { SubscriptionStatus } from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { toModalityReference, toPlanEntity, toPrismaBillingCycle, toPrismaPlanClassLimitKind } from "@/apps/api/src/modules/plans/domain/plan-mappers"
import type { PlanInput, PlansCollectionEntity } from "@/apps/api/src/modules/plans/domain/plan"

export interface DeactivatedPlanRecord {
  id: string
  name: string
}

export class PlanRepository {
  async listByTenantId(tenantId: string): Promise<PlansCollectionEntity> {
    const [plans, modalities] = await Promise.all([
      prisma.plan.findMany({
        where: { tenantId, isActive: true },
        include: {
          modalities: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.modality.findMany({
        where: { tenantId, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ])

    return {
      plans: plans.map(toPlanEntity),
      modalityReferences: modalities.map(toModalityReference),
    }
  }

  async replaceForTenant(tenantId: string, plans: PlanInput[]) {
    const deactivatedPlans = await prisma.$transaction(async (tx) => {
      const existing = await tx.plan.findMany({
        where: { tenantId, isActive: true },
        include: {
          subscriptions: {
            where: {
              status: {
                in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING, SubscriptionStatus.PAST_DUE],
              },
            },
            select: { id: true },
          },
        },
      })

      const incomingIds = new Set(
        plans.map((item) => item.id).filter((item): item is string => typeof item === "string" && item.length > 0)
      )

      for (const [index, item] of plans.entries()) {
        const data = {
          name: item.name.trim(),
          amountCents: item.amountCents,
          billingCycle: toPrismaBillingCycle(item.billingCycle),
          weeklyFrequency: item.weeklyFrequency,
          classLimitKind: toPrismaPlanClassLimitKind(item.classLimitKind),
          classLimitValue: item.classLimitKind === "weekly" ? item.classLimitValue : null,
          sortOrder: index,
          isActive: true,
        }

        let planId = item.id

        if (item.id) {
          await tx.plan.updateMany({
            where: { id: item.id, tenantId },
            data,
          })

          await tx.planModality.deleteMany({
            where: { planId: item.id },
          })
        } else {
          const created = await tx.plan.create({
            data: {
              tenantId,
              ...data,
            },
          })
          planId = created.id
        }

        if (planId && item.includedModalityIds.length > 0) {
          await tx.planModality.createMany({
            data: item.includedModalityIds.map((modalityId) => ({
              planId,
              modalityId,
            })),
          })
        }
      }

      const removed = existing.filter((item) => !incomingIds.has(item.id))
      const deactivated: DeactivatedPlanRecord[] = []
      const removableIds: string[] = []

      for (const item of removed) {
        if (item.subscriptions.length > 0) {
          await tx.plan.update({
            where: { id: item.id },
            data: {
              isActive: false,
            },
          })

          deactivated.push({
            id: item.id,
            name: item.name,
          })
          continue
        }

        removableIds.push(item.id)
      }

      if (removableIds.length > 0) {
        await tx.planModality.deleteMany({
          where: {
            planId: {
              in: removableIds,
            },
          },
        })

        await tx.plan.deleteMany({
          where: {
            id: {
              in: removableIds,
            },
          },
        })
      }

      return deactivated
    })

    return {
      ...(await this.listByTenantId(tenantId)),
      deactivatedPlans,
    }
  }

  async syncOnboardingSnapshot(tenantId: string) {
    const plans = await prisma.plan.findMany({
      where: { tenantId, isActive: true },
      include: {
        modalities: true,
      },
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
        plansSetupJson: {
          plans: plans.map((item) => ({
            clientId: item.id,
            name: item.name,
            amountCents: item.amountCents,
            billingCycle: toPlanEntity(item).billingCycle,
            weeklyFrequency: item.weeklyFrequency,
            classLimitKind: toPlanEntity(item).classLimitKind,
            classLimitValue: item.classLimitValue,
            includedModalityIds: item.modalities.map((link) => link.modalityId),
          })),
        },
      },
    })
  }
}
