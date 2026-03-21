export type FinancePlanTransitionPolicy = "immediate" | "next_cycle" | "prorata"
export type FinanceDelinquencyRecurringMode = "continue" | "pause"
export type FinancePlanTransitionChargeHandling =
  | "replace_open_charge"
  | "charge_difference"
  | "convert_to_credit"

export const financePlanTransitionChargeHandlingOptions: Array<{
  value: FinancePlanTransitionChargeHandling
  label: string
  description: string
}> = [
  {
    value: "replace_open_charge",
    label: "Substituir cobrança aberta",
    description:
      "Cancela a cobrança em aberto do plano anterior e passa a usar a nova regra financeira do plano novo a partir da troca.",
  },
  {
    value: "charge_difference",
    label: "Cobrar apenas a diferença",
    description:
      "Mantém a cobrança atual e lança somente o ajuste financeiro necessário quando a troca exigir complemento.",
  },
  {
    value: "convert_to_credit",
    label: "Converter em crédito",
    description:
      "Transforma o saldo aproveitável do plano anterior em crédito ou abatimento para a nova cobrança do plano novo.",
  },
]

export function getFinancePlanTransitionChargeHandlingOption(
  value: FinancePlanTransitionChargeHandling
) {
  return (
    financePlanTransitionChargeHandlingOptions.find((option) => option.value === value) ??
    financePlanTransitionChargeHandlingOptions[1]
  )
}

export interface FinanceSettingsData {
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
