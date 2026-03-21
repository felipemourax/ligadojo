import type { FinancePaymentMethod } from "@/apps/api/src/modules/finance/domain/finance-dashboard"

export interface RegisterFinancePaymentInput {
  method: FinancePaymentMethod
}
