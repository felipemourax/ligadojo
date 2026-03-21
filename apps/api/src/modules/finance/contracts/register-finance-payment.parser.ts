import type { RegisterFinancePaymentInput } from "@/apps/api/src/modules/finance/contracts/register-finance-payment.input"

export class InvalidRegisterFinancePaymentInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidRegisterFinancePaymentInputError"
  }
}

export function parseRegisterFinancePaymentInput(
  body: Record<string, unknown>
): RegisterFinancePaymentInput {
  const method = body.method

  if (method !== "PIX" && method !== "CARD" && method !== "BOLETO" && method !== "CASH") {
    throw new InvalidRegisterFinancePaymentInputError(
      "Selecione PIX, Cartão, Boleto ou Dinheiro para registrar o pagamento."
    )
  }

  return { method }
}
