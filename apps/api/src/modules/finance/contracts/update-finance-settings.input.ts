import type {
  FinanceDelinquencyRecurringMode,
  FinancePlanTransitionChargeHandling,
  FinancePlanTransitionPolicy,
} from "@/apps/api/src/modules/finance/domain/finance-settings"

export interface UpdateFinanceSettingsInput {
  acceptedMethods: Array<"pix" | "card" | "boleto">
  gateway: "mercado_pago" | "asaas" | "stripe" | ""
  planTransitionPolicy: FinancePlanTransitionPolicy
  planTransitionChargeHandling: FinancePlanTransitionChargeHandling
  delinquencyGraceDays: number
  delinquencyBlocksNewClasses: boolean
  delinquencyRemovesCurrentClasses: boolean
  delinquencyRecurringMode: FinanceDelinquencyRecurringMode
  delinquencyAccumulatesDebt: boolean
}
