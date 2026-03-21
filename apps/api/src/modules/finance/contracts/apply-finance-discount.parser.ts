import type { ApplyFinanceDiscountInput } from "@/apps/api/src/modules/finance/contracts/apply-finance-discount.input"

export class InvalidApplyFinanceDiscountInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidApplyFinanceDiscountInputError"
  }
}

export function parseApplyFinanceDiscountInput(
  body: Record<string, unknown>
): ApplyFinanceDiscountInput {
  if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount <= 0) {
    throw new InvalidApplyFinanceDiscountInputError(
      "Informe um valor de desconto maior que zero."
    )
  }

  return {
    amount: body.amount,
    reason:
      typeof body.reason === "string" && body.reason.trim().length > 0
        ? body.reason.trim()
        : null,
  }
}
