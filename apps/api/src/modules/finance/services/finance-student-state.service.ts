import {
  FinanceChargeStatus as PrismaFinanceChargeStatus,
  BillingCycle,
  SubscriptionStatus,
} from "@prisma/client"
import {
  addBillingCycle,
  isOperationalDateBefore,
  cycleKeyForDate,
  mapFinanceChargeStatus,
  recurringChargeExternalKey,
  resolveCurrentCycleStartDate,
  toDateOnly,
} from "@/apps/api/src/modules/finance/domain/finance-charge"
import type {
  FinanceStudentPaymentStatus,
  FinanceStudentState,
} from "@/apps/api/src/modules/finance/domain/finance-student-state"
import { FinanceDelinquencyService } from "@/apps/api/src/modules/finance/services/finance-delinquency.service"
import { FinancePlanTransitionService } from "@/apps/api/src/modules/finance/services/finance-plan-transition.service"
import { FinanceRepository } from "@/apps/api/src/modules/finance/repositories/finance.repository"

const relevantSubscriptionStatuses = new Set<SubscriptionStatus>([
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAST_DUE,
])

export class FinanceStudentStateService {
  constructor(
    private readonly repository = new FinanceRepository(),
    private readonly planTransitionService = new FinancePlanTransitionService(),
    private readonly financeDelinquencyService = new FinanceDelinquencyService()
  ) {}

  async listForUsers(input: {
    tenantId: string
    userIds: string[]
  }): Promise<Map<string, FinanceStudentState>> {
    const userIds = Array.from(new Set(input.userIds)).filter(Boolean)
    if (userIds.length === 0) {
      return new Map()
    }

    await this.planTransitionService.syncDueTransitions({
      tenantId: input.tenantId,
      userIds,
    })
    await this.financeDelinquencyService.syncPolicies({
      tenantId: input.tenantId,
      userIds,
    })

    const now = new Date()
    const [subscriptions, charges] = await Promise.all([
      this.repository.listSubscriptionsForUsers(input.tenantId, userIds),
      this.repository.listChargesForUsers(input.tenantId, userIds),
    ])

    const subscriptionsByUserId = new Map<string, typeof subscriptions>()
    const chargesByUserId = new Map<string, typeof charges>()

    for (const subscription of subscriptions) {
      const current = subscriptionsByUserId.get(subscription.userId) ?? []
      current.push(subscription)
      subscriptionsByUserId.set(subscription.userId, current)
    }

    for (const charge of charges) {
      const current = chargesByUserId.get(charge.userId) ?? []
      current.push(charge)
      chargesByUserId.set(charge.userId, current)
    }

    return new Map(
      userIds.map((userId) => [
        userId,
        this.buildUserState({
          userId,
          now,
          subscriptions: subscriptionsByUserId.get(userId) ?? [],
          charges: chargesByUserId.get(userId) ?? [],
        }),
      ])
    )
  }

  private buildUserState(input: {
    userId: string
    now: Date
    subscriptions: Awaited<ReturnType<FinanceRepository["listSubscriptionsForUsers"]>>
    charges: Awaited<ReturnType<FinanceRepository["listChargesForUsers"]>>
  }): FinanceStudentState {
    const subscription = selectCurrentSubscription(input.subscriptions)
    const paidCharges = input.charges
      .filter((charge) => charge.status === PrismaFinanceChargeStatus.PAID && charge.paidAt)
      .sort((left, right) => (right.paidAt?.getTime() ?? 0) - (left.paidAt?.getTime() ?? 0))
    const openCharges = input.charges
      .filter(
        (charge) =>
          charge.status === PrismaFinanceChargeStatus.PENDING ||
          charge.status === PrismaFinanceChargeStatus.OVERDUE
      )
      .sort((left, right) => left.dueDate.getTime() - right.dueDate.getTime())

    const currentCycleStartDate = subscription
      ? resolveCurrentCycleStartDate(
          input.now,
          subscription.startDate,
          subscription.plan.billingCycle,
          subscription.billingDay
        )
      : null
    const currentCycleCharge = subscription
      ? input.charges.find(
          (charge) =>
            charge.externalKey === recurringChargeExternalKey(subscription.id, currentCycleStartDate!) ||
            charge.externalKey === legacyRecurringChargeExternalKey(
              subscription.id,
              input.now,
              subscription.plan.billingCycle
            )
        ) ?? null
      : null

    const currentCycleDueDate = currentCycleStartDate
    const nextCycleDueDate = subscription && currentCycleDueDate
      ? addBillingCycle(
          currentCycleDueDate,
          subscription.plan.billingCycle,
          subscription.billingDay
        )
      : null
    const nextPaymentDate =
      openCharges[0]?.dueDate ?? nextCycleDueDate ?? currentCycleCharge?.dueDate ?? null

    return {
      userId: input.userId,
      planId: subscription?.planId ?? null,
      planName: subscription?.plan.name ?? null,
      planValueCents: subscription?.plan.amountCents ?? null,
      paymentStatus: resolveStudentPaymentStatus({
        subscription,
        currentCycleChargeStatus: currentCycleCharge?.status ?? null,
        hasOverdueCharge: openCharges.some(
          (charge) => charge.status === PrismaFinanceChargeStatus.OVERDUE
        ),
        hasPendingCharge: openCharges.some(
          (charge) => charge.status === PrismaFinanceChargeStatus.PENDING
        ),
        hasPaidCharge: paidCharges.length > 0,
        now: input.now,
        currentCycleDueDate,
      }),
      lastPayment: paidCharges[0]?.paidAt ? toDateOnly(paidCharges[0].paidAt) : null,
      nextPayment: nextPaymentDate ? toDateOnly(nextPaymentDate) : null,
    }
  }
}

function selectCurrentSubscription(
  subscriptions: Awaited<ReturnType<FinanceRepository["listSubscriptionsForUsers"]>>
) {
  return subscriptions
    .filter((subscription) => relevantSubscriptionStatuses.has(subscription.status))
    .sort((left, right) => {
      const priority =
        subscriptionPriority(right.status) - subscriptionPriority(left.status)
      if (priority !== 0) {
        return priority
      }

      return right.updatedAt.getTime() - left.updatedAt.getTime()
    })[0] ?? null
}

function subscriptionPriority(status: SubscriptionStatus) {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 3
    case SubscriptionStatus.PAST_DUE:
      return 2
    case SubscriptionStatus.PENDING:
      return 1
    default:
      return 0
  }
}

function resolveStudentPaymentStatus(input: {
  subscription: Awaited<ReturnType<typeof selectCurrentSubscription>>
  currentCycleChargeStatus: PrismaFinanceChargeStatus | null
  hasOverdueCharge: boolean
  hasPendingCharge: boolean
  hasPaidCharge: boolean
  now: Date
  currentCycleDueDate: Date | null
}): FinanceStudentPaymentStatus {
  if (input.currentCycleChargeStatus) {
    const status = mapFinanceChargeStatus(input.currentCycleChargeStatus)

    if (status !== "cancelled") {
      return status
    }
  }

  if (input.hasOverdueCharge) {
    return "overdue"
  }

  if (input.hasPendingCharge) {
    return "pending"
  }

  if (input.subscription?.status === SubscriptionStatus.PAST_DUE) {
    return "overdue"
  }

  if (
    input.subscription &&
    input.currentCycleDueDate &&
    isOperationalDateBefore(input.currentCycleDueDate, input.now) &&
    !input.hasPaidCharge
  ) {
    return "overdue"
  }

  if (input.hasPaidCharge) {
    return "paid"
  }

  return "pending"
}

function legacyRecurringChargeExternalKey(
  subscriptionId: string,
  referenceDate: Date,
  billingCycle: BillingCycle
) {
  return `subscription:${subscriptionId}:${cycleKeyForDate(referenceDate, billingCycle)}`
}
