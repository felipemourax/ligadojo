export interface CreateFinanceChargeInput {
  userId: string
  studentProfileId: string | null
  description: string
  category: string
  amount: number | null
  dueDate: string
  planId: string | null
  recurrenceMode: "ONE_TIME" | "RECURRING"
  recurringSource: "MANUAL_AMOUNT" | "PLAN_LINKED" | null
  confirmDuplicatePlan: boolean
}
