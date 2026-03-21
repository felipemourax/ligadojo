import { FinanceDiscountSource, FinanceDiscountType } from "@prisma/client"
import type {
  FinanceCouponDiscountType,
  FinanceDiscountSource as FinanceDiscountSourceView,
} from "@/apps/api/src/modules/finance/domain/finance-dashboard"
import { currencyFromCents } from "@/apps/api/src/modules/finance/domain/finance-charge"

export function normalizeCouponCode(value: string) {
  return value.trim().toUpperCase()
}

export function mapFinanceDiscountType(
  value: FinanceDiscountType
): FinanceCouponDiscountType {
  return value === FinanceDiscountType.PERCENTAGE ? "percentage" : "fixed_amount"
}

export function formatCouponDiscountLabel(input: {
  discountType: FinanceDiscountType
  amountCents: number | null
  percentageOff: number | null
}) {
  if (input.discountType === FinanceDiscountType.PERCENTAGE) {
    return `${input.percentageOff ?? 0}%`
  }

  return currencyFromCents(input.amountCents ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

export function resolveCouponDiscountCents(input: {
  chargeAmountCents: number
  discountType: FinanceDiscountType
  amountCents: number | null
  percentageOff: number | null
}) {
  if (input.chargeAmountCents <= 0) {
    return 0
  }

  if (input.discountType === FinanceDiscountType.PERCENTAGE) {
    const percentage = Math.min(Math.max(input.percentageOff ?? 0, 0), 100)
    return Math.round((input.chargeAmountCents * percentage) / 100)
  }

  return Math.min(input.chargeAmountCents, Math.max(input.amountCents ?? 0, 0))
}

export function mapFinanceDiscountSource(
  value: FinanceDiscountSource | null | undefined
): FinanceDiscountSourceView {
  if (value === FinanceDiscountSource.COUPON) {
    return "coupon"
  }

  if (value === FinanceDiscountSource.MANUAL) {
    return "manual"
  }

  return null
}
