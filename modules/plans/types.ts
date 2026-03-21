import type {
  BillingCycleValue,
  PlanClassLimitKindValue,
} from "@/apps/api/src/modules/plans/domain/plan"

export interface PlansDashboardPlanDraft {
  clientId: string
  name: string
  amountCents: number
  billingCycle: BillingCycleValue
  weeklyFrequency: number | null
  classLimitKind: PlanClassLimitKindValue
  classLimitValue: number | null
  includedModalityIds: string[]
}

export interface PlansDashboardState {
  plans: PlansDashboardPlanDraft[]
}
