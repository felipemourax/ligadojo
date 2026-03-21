import { FinanceDiscountType } from "@prisma/client"
import type { CreateFinanceCouponInput } from "@/apps/api/src/modules/finance/contracts/create-finance-coupon.input"

export class InvalidCreateFinanceCouponInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidCreateFinanceCouponInputError"
  }
}

function isOptionalDate(value: unknown) {
  return (
    value == null ||
    (typeof value === "string" && value.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()))
  )
}

export function parseCreateFinanceCouponInput(
  body: Record<string, unknown>
): CreateFinanceCouponInput {
  if (
    typeof body.code !== "string" ||
    typeof body.title !== "string" ||
    typeof body.value !== "number"
  ) {
    throw new InvalidCreateFinanceCouponInputError(
      "Informe codigo, titulo e valor do cupom."
    )
  }

  const code = body.code.trim()
  const title = body.title.trim()
  const description =
    typeof body.description === "string" && body.description.trim().length > 0
      ? body.description.trim()
      : null
  const appliesToPlanId =
    typeof body.appliesToPlanId === "string" && body.appliesToPlanId.trim().length > 0
      ? body.appliesToPlanId.trim()
      : null
  const maxRedemptions =
    typeof body.maxRedemptions === "number" && Number.isFinite(body.maxRedemptions)
      ? Math.trunc(body.maxRedemptions)
      : null
  const startsAt =
    typeof body.startsAt === "string" && body.startsAt.trim().length > 0
      ? body.startsAt.trim()
      : null
  const endsAt =
    typeof body.endsAt === "string" && body.endsAt.trim().length > 0
      ? body.endsAt.trim()
      : null

  if (!code || !title) {
    throw new InvalidCreateFinanceCouponInputError(
      "Informe codigo e titulo do cupom."
    )
  }

  if (!/^[A-Za-z0-9_-]{4,24}$/.test(code)) {
    throw new InvalidCreateFinanceCouponInputError(
      "Use de 4 a 24 caracteres em letras, numeros, '_' ou '-'."
    )
  }

  const discountType =
    body.discountType === FinanceDiscountType.PERCENTAGE ||
    body.discountType === "PERCENTAGE"
      ? FinanceDiscountType.PERCENTAGE
      : body.discountType === FinanceDiscountType.FIXED_AMOUNT ||
          body.discountType === "FIXED_AMOUNT"
        ? FinanceDiscountType.FIXED_AMOUNT
        : null

  if (!discountType) {
    throw new InvalidCreateFinanceCouponInputError(
      "Selecione se o cupom e percentual ou valor fixo."
    )
  }

  if (!Number.isFinite(body.value) || body.value <= 0) {
    throw new InvalidCreateFinanceCouponInputError(
      "Informe um valor maior que zero para o cupom."
    )
  }

  if (discountType === FinanceDiscountType.PERCENTAGE && body.value > 100) {
    throw new InvalidCreateFinanceCouponInputError(
      "O cupom percentual nao pode ultrapassar 100%."
    )
  }

  if (maxRedemptions != null && maxRedemptions <= 0) {
    throw new InvalidCreateFinanceCouponInputError(
      "O limite de usos precisa ser maior que zero."
    )
  }

  if (!isOptionalDate(startsAt) || !isOptionalDate(endsAt)) {
    throw new InvalidCreateFinanceCouponInputError(
      "Informe datas validas para inicio e fim do cupom."
    )
  }

  if (startsAt && endsAt && startsAt > endsAt) {
    throw new InvalidCreateFinanceCouponInputError(
      "A data final do cupom precisa ser igual ou posterior a data inicial."
    )
  }

  return {
    code,
    title,
    description,
    discountType,
    value: body.value,
    appliesToPlanId,
    maxRedemptions,
    startsAt,
    endsAt,
  }
}
