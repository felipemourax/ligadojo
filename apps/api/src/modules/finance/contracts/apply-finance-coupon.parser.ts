import type { ApplyFinanceCouponInput } from "@/apps/api/src/modules/finance/contracts/apply-finance-coupon.input"

export class InvalidApplyFinanceCouponInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidApplyFinanceCouponInputError"
  }
}

export function parseApplyFinanceCouponInput(
  body: Record<string, unknown>
): ApplyFinanceCouponInput {
  if (typeof body.code !== "string" || body.code.trim().length === 0) {
    throw new InvalidApplyFinanceCouponInputError(
      "Informe um codigo de cupom valido."
    )
  }

  return {
    code: body.code.trim(),
  }
}
