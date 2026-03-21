import type { FinanceDiscountType } from "@prisma/client"

export interface CreateFinanceCouponInput {
  code: string
  title: string
  description: string | null
  discountType: FinanceDiscountType
  value: number
  appliesToPlanId: string | null
  maxRedemptions: number | null
  startsAt: string | null
  endsAt: string | null
}
