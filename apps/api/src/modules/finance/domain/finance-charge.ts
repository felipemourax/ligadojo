import {
  BillingCycle,
  FinanceChargeStatus as PrismaFinanceChargeStatus,
  FinancePaymentMethod as PrismaFinancePaymentMethod,
  SubscriptionStatus,
} from "@prisma/client"
import type {
  FinanceChargeStatus,
  FinancePaymentMethod,
} from "@/apps/api/src/modules/finance/domain/finance-dashboard"

export function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10)
}

export function toOperationalDate(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0)
}

export function addOperationalDays(value: Date, days: number) {
  const date = toOperationalDate(value)
  date.setDate(date.getDate() + days)
  return date
}

export function isOperationalDateBefore(left: Date, right: Date) {
  return toDateOnly(toOperationalDate(left)) < toDateOnly(toOperationalDate(right))
}

export function currencyFromCents(value: number) {
  return Math.round(value) / 100
}

export function cycleKeyForDate(date: Date, billingCycle: BillingCycle) {
  const year = date.getFullYear()
  const month = date.getMonth()

  if (billingCycle === BillingCycle.MONTHLY) {
    return `${year}-${String(month + 1).padStart(2, "0")}`
  }

  if (billingCycle === BillingCycle.QUARTERLY) {
    return `${year}-Q${Math.floor(month / 3) + 1}`
  }

  if (billingCycle === BillingCycle.SEMIANNUAL) {
    return `${year}-S${month < 6 ? 1 : 2}`
  }

  return `${year}`
}

function resolveMonthDay(year: number, month: number, billingDay: number) {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
  return Math.min(Math.max(billingDay, 1), lastDayOfMonth)
}

function cycleMonthIncrement(billingCycle: BillingCycle) {
  switch (billingCycle) {
    case BillingCycle.QUARTERLY:
      return 3
    case BillingCycle.SEMIANNUAL:
      return 6
    case BillingCycle.YEARLY:
      return 12
    default:
      return 1
  }
}

function toAnchoredDate(date: Date, billingDay: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    resolveMonthDay(date.getFullYear(), date.getMonth(), billingDay),
    12,
    0,
    0
  )
}

export function addBillingCycle(
  date: Date,
  billingCycle: BillingCycle,
  billingDay = date.getDate()
) {
  const anchoredDate = toAnchoredDate(date, billingDay)
  const nextMonth = anchoredDate.getMonth() + cycleMonthIncrement(billingCycle)

  return new Date(
    anchoredDate.getFullYear(),
    nextMonth,
    resolveMonthDay(anchoredDate.getFullYear(), nextMonth, billingDay),
    12,
    0,
    0
  )
}

export function resolveCurrentCycleStartDate(
  referenceDate: Date,
  startDate: Date,
  billingCycle: BillingCycle,
  billingDay = startDate.getDate()
) {
  let cycleStart = toAnchoredDate(startDate, billingDay)

  if (referenceDate < cycleStart) {
    return cycleStart
  }

  while (true) {
    const nextCycleStart = addBillingCycle(cycleStart, billingCycle, billingDay)

    if (nextCycleStart > referenceDate) {
      return cycleStart
    }

    cycleStart = nextCycleStart
  }
}

export function recurringChargeExternalKey(subscriptionId: string, cycleStartDate: Date) {
  return `subscription:${subscriptionId}:${toDateOnly(cycleStartDate)}`
}

export function recurringSetupChargeExternalKey(
  recurringSetupId: string,
  cycleStartDate: Date
) {
  return `recurring-setup:${recurringSetupId}:${toDateOnly(cycleStartDate)}`
}

export function dueDateForCycle(
  date: Date,
  billingCycle: BillingCycle,
  billingDay = 5
) {
  const year = date.getFullYear()
  const month = date.getMonth()

  if (billingCycle === BillingCycle.MONTHLY) {
    return new Date(year, month, resolveMonthDay(year, month, billingDay), 12, 0, 0)
  }

  if (billingCycle === BillingCycle.QUARTERLY) {
    const quarterMonth = Math.floor(month / 3) * 3
    return new Date(year, quarterMonth, resolveMonthDay(year, quarterMonth, billingDay), 12, 0, 0)
  }

  if (billingCycle === BillingCycle.SEMIANNUAL) {
    const semesterMonth = month < 6 ? 0 : 6
    return new Date(year, semesterMonth, resolveMonthDay(year, semesterMonth, billingDay), 12, 0, 0)
  }

  return new Date(year, 0, resolveMonthDay(year, 0, billingDay), 12, 0, 0)
}

export function mapFinanceChargeStatus(
  value: PrismaFinanceChargeStatus
): FinanceChargeStatus {
  switch (value) {
    case PrismaFinanceChargeStatus.PAID:
      return "paid"
    case PrismaFinanceChargeStatus.OVERDUE:
      return "overdue"
    case PrismaFinanceChargeStatus.CANCELLED:
      return "cancelled"
    default:
      return "pending"
  }
}

export function resolveRecurringChargeStatus(input: {
  persistedStatus?: PrismaFinanceChargeStatus | null
  subscriptionStatus?: SubscriptionStatus | null
  dueDate: Date
  now: Date
}) {
  if (
    input.persistedStatus === PrismaFinanceChargeStatus.PAID ||
    input.persistedStatus === PrismaFinanceChargeStatus.CANCELLED
  ) {
    return input.persistedStatus
  }

  const isOverdue =
    input.subscriptionStatus === SubscriptionStatus.PAST_DUE ||
    isOperationalDateBefore(input.dueDate, input.now)

  return isOverdue
    ? PrismaFinanceChargeStatus.OVERDUE
    : PrismaFinanceChargeStatus.PENDING
}

export function toPrismaFinancePaymentMethod(value: FinancePaymentMethod) {
  switch (value) {
    case "CARD":
      return PrismaFinancePaymentMethod.CARD
    case "BOLETO":
      return PrismaFinancePaymentMethod.BOLETO
    case "CASH":
      return PrismaFinancePaymentMethod.CASH
    default:
      return PrismaFinancePaymentMethod.PIX
  }
}
