import { AgeGroup, BillingCycle, PlanClassLimitKind, type Plan, type PlanModality } from "@prisma/client"
import type {
  BillingCycleValue,
  ModalityReference,
  PlanClassLimitKindValue,
  PlanEntity,
} from "@/apps/api/src/modules/plans/domain/plan"

function toBillingCycleValue(value: BillingCycle): BillingCycleValue {
  switch (value) {
    case BillingCycle.MONTHLY:
      return "monthly"
    case BillingCycle.QUARTERLY:
      return "quarterly"
    case BillingCycle.SEMIANNUAL:
      return "semiannual"
    case BillingCycle.YEARLY:
      return "yearly"
  }
}

function toPlanClassLimitKindValue(value: PlanClassLimitKind): PlanClassLimitKindValue {
  return value === PlanClassLimitKind.WEEKLY ? "weekly" : "unlimited"
}

export function toPrismaBillingCycle(value: BillingCycleValue) {
  switch (value) {
    case "monthly":
      return BillingCycle.MONTHLY
    case "quarterly":
      return BillingCycle.QUARTERLY
    case "semiannual":
      return BillingCycle.SEMIANNUAL
    case "yearly":
      return BillingCycle.YEARLY
  }
}

export function toPrismaPlanClassLimitKind(value: PlanClassLimitKindValue) {
  return value === "weekly" ? PlanClassLimitKind.WEEKLY : PlanClassLimitKind.UNLIMITED
}

export function toPlanEntity(
  plan: Plan & {
    modalities?: PlanModality[]
  }
): PlanEntity {
  return {
    id: plan.id,
    tenantId: plan.tenantId,
    name: plan.name,
    amountCents: plan.amountCents,
    billingCycle: toBillingCycleValue(plan.billingCycle),
    weeklyFrequency: plan.weeklyFrequency,
    classLimitKind: toPlanClassLimitKindValue(plan.classLimitKind),
    classLimitValue: plan.classLimitValue,
    sortOrder: plan.sortOrder,
    isActive: plan.isActive,
    includedModalityIds: plan.modalities?.map((item) => item.modalityId) ?? [],
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  }
}

export function toModalityReference(item: { id: string; name: string; ageGroups: AgeGroup[] }): ModalityReference {
  return {
    id: item.id,
    name: item.name,
    ageGroups: item.ageGroups.map((ageGroup) =>
      ageGroup === AgeGroup.KIDS
        ? "kids"
        : ageGroup === AgeGroup.JUVENILE
          ? "juvenile"
          : ageGroup === AgeGroup.ADULT
            ? "adult"
            : "mixed"
    ),
  }
}
