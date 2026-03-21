export type FinanceStudentPaymentStatus = "paid" | "pending" | "overdue"

export interface FinanceStudentState {
  userId: string
  planId: string | null
  planName: string | null
  planValueCents: number | null
  paymentStatus: FinanceStudentPaymentStatus
  lastPayment: string | null
  nextPayment: string | null
}
