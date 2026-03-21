import { FinanceChargeStatus as PrismaFinanceChargeStatus } from "@prisma/client"
import type { ApplyFinanceCouponInput } from "@/apps/api/src/modules/finance/contracts/apply-finance-coupon.input"
import { normalizeCouponCode, resolveCouponDiscountCents } from "@/apps/api/src/modules/finance/domain/finance-coupon"
import type { FinanceStudentPaymentsSnapshot } from "@/apps/api/src/modules/finance/domain/finance-student-payments"
import { FinancePlanTransitionService } from "@/apps/api/src/modules/finance/services/finance-plan-transition.service"
import { FinanceStudentStateService } from "@/apps/api/src/modules/finance/services/finance-student-state.service"
import { FinanceRepository } from "@/apps/api/src/modules/finance/repositories/finance.repository"

function toDateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null
}

export class FinanceStudentPaymentsService {
  constructor(
    private readonly repository = new FinanceRepository(),
    private readonly financeStudentStateService = new FinanceStudentStateService(),
    private readonly financePlanTransitionService = new FinancePlanTransitionService()
  ) {}

  async getSnapshot(input: {
    tenantId: string
    userId: string
  }): Promise<FinanceStudentPaymentsSnapshot> {
    const [financialStateByUserId, openCharge] = await Promise.all([
      this.financeStudentStateService.listForUsers({
        tenantId: input.tenantId,
        userIds: [input.userId],
      }),
      this.repository.findNextOpenChargeForUser(input.tenantId, input.userId),
    ])

    const financialState = financialStateByUserId.get(input.userId)

    return {
      planName: financialState?.planName ?? null,
      paymentStatus: financialState?.paymentStatus ?? "pending",
      lastPayment: financialState?.lastPayment ?? null,
      nextPayment: financialState?.nextPayment ?? null,
      planValueCents: financialState?.planValueCents ?? null,
      openCharge: openCharge
        ? {
            id: openCharge.id,
            description: openCharge.description,
            dueDate: toDateOnly(openCharge.dueDate) ?? new Date().toISOString().slice(0, 10),
            status:
              openCharge.status === PrismaFinanceChargeStatus.OVERDUE
                ? "overdue"
                : "pending",
            amountCents: openCharge.amountCents,
            originalAmountCents: openCharge.originalAmountCents ?? openCharge.amountCents,
            discountAmountCents: openCharge.discountAmountCents,
            appliedCouponCode: openCharge.coupon?.code ?? null,
            appliedCouponTitle: openCharge.coupon?.title ?? null,
          }
        : null,
    }
  }

  async applyCoupon(input: {
    tenantId: string
    userId: string
    coupon: ApplyFinanceCouponInput
  }) {
    const openCharge = await this.repository.findNextOpenChargeForUser(
      input.tenantId,
      input.userId
    )

    if (!openCharge) {
      throw new Error("Voce nao possui cobranca em aberto para aplicar cupom.")
    }

    if (openCharge.couponId || openCharge.discountAmountCents > 0) {
      throw new Error("Essa cobranca ja possui desconto aplicado.")
    }

    const coupon = await this.repository.findCouponByCode(
      input.tenantId,
      normalizeCouponCode(input.coupon.code)
    )

    if (!coupon || !coupon.isActive) {
      throw new Error("Cupom invalido ou inativo.")
    }

    const now = new Date()
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new Error("Esse cupom ainda nao esta disponivel para uso.")
    }

    if (coupon.endsAt && coupon.endsAt < now) {
      throw new Error("Esse cupom ja expirou.")
    }

    if (
      coupon.maxRedemptions != null &&
      coupon.redemptionCount >= coupon.maxRedemptions
    ) {
      throw new Error("Esse cupom atingiu o limite de usos.")
    }

    if (coupon.appliesToPlanId && openCharge.planId !== coupon.appliesToPlanId) {
      throw new Error("Esse cupom nao e valido para o plano desta cobranca.")
    }

    const originalAmountCents = openCharge.originalAmountCents ?? openCharge.amountCents
    const discountAmountCents = resolveCouponDiscountCents({
      chargeAmountCents: originalAmountCents,
      discountType: coupon.discountType,
      amountCents: coupon.amountCents,
      percentageOff: coupon.percentageOff,
    })

    if (discountAmountCents <= 0) {
      throw new Error("Esse cupom nao gera desconto valido para a cobranca atual.")
    }

    const finalAmountCents = Math.max(originalAmountCents - discountAmountCents, 0)
    const resultingStatus =
      finalAmountCents === 0
        ? PrismaFinanceChargeStatus.PAID
        : openCharge.status
    const paidAt = finalAmountCents === 0 ? now : null

    await this.repository.applyCouponToCharge({
      chargeId: openCharge.id,
      couponId: coupon.id,
      originalAmountCents,
      discountAmountCents,
      finalAmountCents,
      resultingStatus,
      paidAt,
    })

    if (resultingStatus === PrismaFinanceChargeStatus.PAID && openCharge.subscriptionId) {
      await this.financePlanTransitionService.activatePendingSubscriptionForCharge({
        chargeId: openCharge.id,
        activatedAt: paidAt ?? now,
      })
    }

    return this.getSnapshot({
      tenantId: input.tenantId,
      userId: input.userId,
    })
  }
}
