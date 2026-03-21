import type { UpdateFinanceSettingsInput } from "@/apps/api/src/modules/finance/contracts/update-finance-settings.input"

const validMethods = new Set(["pix", "card", "boleto"])
const validGateways = new Set(["", "mercado_pago", "asaas", "stripe"])
const validTransitionPolicies = new Set(["immediate", "next_cycle", "prorata"])
const validTransitionChargeHandling = new Set([
  "replace_open_charge",
  "charge_difference",
  "convert_to_credit",
])
const validRecurringModes = new Set(["continue", "pause"])

export class InvalidUpdateFinanceSettingsInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidUpdateFinanceSettingsInputError"
  }
}

export function parseUpdateFinanceSettingsInput(
  body: Record<string, unknown>
): UpdateFinanceSettingsInput {
  const acceptedMethods = Array.isArray(body.acceptedMethods)
    ? body.acceptedMethods.filter(
        (value): value is "pix" | "card" | "boleto" =>
          typeof value === "string" && validMethods.has(value)
      )
    : []

  const gateway =
    typeof body.gateway === "string" && validGateways.has(body.gateway)
      ? (body.gateway as UpdateFinanceSettingsInput["gateway"])
      : ""

  const planTransitionPolicy =
    typeof body.planTransitionPolicy === "string" &&
    validTransitionPolicies.has(body.planTransitionPolicy)
      ? (body.planTransitionPolicy as UpdateFinanceSettingsInput["planTransitionPolicy"])
      : null

  const planTransitionChargeHandling =
    typeof body.planTransitionChargeHandling === "string" &&
    validTransitionChargeHandling.has(body.planTransitionChargeHandling)
      ? (body.planTransitionChargeHandling as UpdateFinanceSettingsInput["planTransitionChargeHandling"])
      : null

  const delinquencyRecurringMode =
    typeof body.delinquencyRecurringMode === "string" &&
    validRecurringModes.has(body.delinquencyRecurringMode)
      ? (body.delinquencyRecurringMode as UpdateFinanceSettingsInput["delinquencyRecurringMode"])
      : null

  const delinquencyGraceDays =
    typeof body.delinquencyGraceDays === "number" ? body.delinquencyGraceDays : NaN

  if (acceptedMethods.length === 0) {
    throw new InvalidUpdateFinanceSettingsInputError(
      "Selecione pelo menos um meio de pagamento para a academia."
    )
  }

  if (!Number.isFinite(delinquencyGraceDays) || delinquencyGraceDays < 0) {
    throw new InvalidUpdateFinanceSettingsInputError(
      "Informe uma tolerância válida em dias para inadimplência."
    )
  }

  if (!planTransitionPolicy) {
    throw new InvalidUpdateFinanceSettingsInputError(
      "Selecione uma política válida para troca de plano."
    )
  }

  if (!planTransitionChargeHandling) {
    throw new InvalidUpdateFinanceSettingsInputError(
      "Selecione uma política válida para tratar a cobrança atual na troca de plano."
    )
  }

  if (!delinquencyRecurringMode) {
    throw new InvalidUpdateFinanceSettingsInputError(
      "Selecione uma política válida de recorrência durante a inadimplência."
    )
  }

  return {
    acceptedMethods,
    gateway,
    planTransitionPolicy,
    planTransitionChargeHandling,
    delinquencyGraceDays,
    delinquencyBlocksNewClasses: body.delinquencyBlocksNewClasses === true,
    delinquencyRemovesCurrentClasses: body.delinquencyRemovesCurrentClasses === true,
    delinquencyRecurringMode,
    delinquencyAccumulatesDebt: body.delinquencyAccumulatesDebt === true,
  }
}
