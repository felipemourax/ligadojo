import type { AgeGroupValue } from "@/apps/api/src/modules/modalities/domain/modality"

export type BillingCycleValue = "monthly" | "quarterly" | "semiannual" | "yearly"
export type PlanClassLimitKindValue = "unlimited" | "weekly"

export interface ModalityReference {
  id: string
  name: string
  ageGroups: AgeGroupValue[]
}

export interface PlanEntity {
  id: string
  tenantId: string
  name: string
  amountCents: number
  billingCycle: BillingCycleValue
  weeklyFrequency: number | null
  classLimitKind: PlanClassLimitKindValue
  classLimitValue: number | null
  sortOrder: number
  isActive: boolean
  includedModalityIds: string[]
  createdAt: string
  updatedAt: string
}

export interface PlanInput {
  id?: string
  name: string
  amountCents: number
  billingCycle: BillingCycleValue
  weeklyFrequency: number | null
  classLimitKind: PlanClassLimitKindValue
  classLimitValue: number | null
  includedModalityIds: string[]
}

export interface PlansCollectionEntity {
  plans: PlanEntity[]
  modalityReferences: ModalityReference[]
}
