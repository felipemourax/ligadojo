export type FinanceChargeStatus = "paid" | "pending" | "overdue" | "cancelled"
export type FinancePaymentMethod = "PIX" | "CARD" | "BOLETO" | "CASH"
export type FinanceCouponDiscountType = "fixed_amount" | "percentage"
export type FinanceDiscountSource = "manual" | "coupon" | null

export interface FinancePlanRecord {
  id: string
  name: string
  price: number
  modalities: number
  description: string
  students: number
}

export interface FinanceChargeRecord {
  id: string
  userId: string
  studentProfileId: string | null
  name: string
  category: string
  amount: number
  originalAmount: number | null
  discountAmount: number
  date: string | null
  dueDate: string
  status: FinanceChargeStatus
  method: FinancePaymentMethod | null
  plan: string
  description: string
  discountSource: FinanceDiscountSource
  discountReason: string | null
  appliedCouponCode: string | null
}

export interface FinanceCouponRecord {
  id: string
  code: string
  title: string
  description: string | null
  discountType: FinanceCouponDiscountType
  discountLabel: string
  appliesToPlanId: string | null
  appliesToPlanName: string | null
  isActive: boolean
  redemptionCount: number
  maxRedemptions: number | null
}

export interface FinanceDashboardData {
  stats: {
    revenue: number
    pending: number
    overdue: number
    activeStudents: number
    avgTicket: number
  }
  references: {
    students: Array<{
      userId: string
      studentProfileId: string | null
      name: string
      planId: string | null
      planName: string | null
    }>
  }
  plans: FinancePlanRecord[]
  payments: FinanceChargeRecord[]
  coupons: FinanceCouponRecord[]
}
