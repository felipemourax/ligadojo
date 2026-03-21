export interface FinanceStudentOpenCharge {
  id: string
  description: string
  dueDate: string
  status: "pending" | "overdue"
  amountCents: number
  originalAmountCents: number
  discountAmountCents: number
  appliedCouponCode: string | null
  appliedCouponTitle: string | null
}

export interface FinanceStudentPaymentsSnapshot {
  planName: string | null
  paymentStatus: "paid" | "pending" | "overdue"
  lastPayment: string | null
  nextPayment: string | null
  planValueCents: number | null
  openCharge: FinanceStudentOpenCharge | null
}
