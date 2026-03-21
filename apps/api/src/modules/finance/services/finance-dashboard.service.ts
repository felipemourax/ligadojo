import {
  BillingCycle,
  FinanceDiscountType,
  FinanceRecurringSetupSource,
  FinanceChargeStatus as PrismaFinanceChargeStatus,
} from "@prisma/client"
import type { CreateFinanceChargeInput } from "@/apps/api/src/modules/finance/contracts/create-finance-charge.input"
import type { CreateFinanceCouponInput } from "@/apps/api/src/modules/finance/contracts/create-finance-coupon.input"
import type { ApplyFinanceDiscountInput } from "@/apps/api/src/modules/finance/contracts/apply-finance-discount.input"
import type { RegisterFinancePaymentInput } from "@/apps/api/src/modules/finance/contracts/register-finance-payment.input"
import {
  currencyFromCents,
  cycleKeyForDate,
  mapFinanceChargeStatus,
  recurringChargeExternalKey,
  recurringSetupChargeExternalKey,
  resolveRecurringChargeStatus,
  resolveCurrentCycleStartDate,
  toDateOnly,
  toPrismaFinancePaymentMethod,
} from "@/apps/api/src/modules/finance/domain/finance-charge"
import {
  formatCouponDiscountLabel,
  mapFinanceDiscountSource,
  normalizeCouponCode,
} from "@/apps/api/src/modules/finance/domain/finance-coupon"
import type {
  FinanceChargeRecord,
  FinanceCouponRecord,
  FinanceDashboardData,
  FinancePlanRecord,
} from "@/apps/api/src/modules/finance/domain/finance-dashboard"
import { FinanceRepository } from "@/apps/api/src/modules/finance/repositories/finance.repository"
import { FinanceDelinquencyService } from "@/apps/api/src/modules/finance/services/finance-delinquency.service"
import { FinancePlanTransitionService } from "@/apps/api/src/modules/finance/services/finance-plan-transition.service"

export class FinanceDashboardService {
  constructor(
    private readonly repository = new FinanceRepository(),
    private readonly planTransitionService = new FinancePlanTransitionService(),
    private readonly financeDelinquencyService = new FinanceDelinquencyService()
  ) {}

  async ensureCurrentCharges(tenantId: string) {
    await this.planTransitionService.syncDueTransitions({ tenantId })

    const now = new Date()
    const [subscriptions, recurringSetups] = await Promise.all([
      this.repository.listRecurringSubscriptions(tenantId),
      this.repository.listRecurringSetups(tenantId),
    ])
    const recurringUserIds = Array.from(
      new Set([
        ...subscriptions.map((subscription) => subscription.userId),
        ...recurringSetups.map((setup) => setup.userId),
      ])
    )
    const [{ settings, states }, studentProfiles, charges] = await Promise.all([
      this.financeDelinquencyService.syncPolicies({
        tenantId,
        userIds: recurringUserIds,
      }),
      this.repository.listStudentProfilesByUserIds(
        tenantId,
        recurringUserIds
      ),
      this.repository.listChargesForUsers(tenantId, recurringUserIds),
    ])
    const studentProfileIdByUserId = new Map(
      studentProfiles.map((studentProfile) => [studentProfile.userId, studentProfile.id])
    )
    const openChargesByUserId = new Map<string, number>()

    for (const charge of charges) {
      if (
        charge.status !== PrismaFinanceChargeStatus.PENDING &&
        charge.status !== PrismaFinanceChargeStatus.OVERDUE
      ) {
        continue
      }

      openChargesByUserId.set(
        charge.userId,
        (openChargesByUserId.get(charge.userId) ?? 0) + 1
      )
    }

    const shouldPauseRecurringCharge = (userId: string) => {
      const delinquencyState = states.get(userId)

      if (!delinquencyState?.isDelinquent) {
        return false
      }

      if (settings.delinquencyRecurringMode === "pause") {
        return true
      }

      if (!settings.delinquencyAccumulatesDebt) {
        return (openChargesByUserId.get(userId) ?? 0) > 0
      }

      return false
    }

    for (const subscription of subscriptions) {
      const cycleStartDate = resolveCurrentCycleStartDate(
        now,
        subscription.startDate,
        subscription.plan.billingCycle,
        subscription.billingDay
      )
      const externalKey = recurringChargeExternalKey(subscription.id, cycleStartDate)
      const legacyExternalKey = `subscription:${subscription.id}:${cycleKeyForDate(
        now,
        subscription.plan.billingCycle
      )}`
      const dueDate = cycleStartDate
      const existing = await this.repository.findChargeByExternalKeys([
        externalKey,
        legacyExternalKey,
      ])
      const nextStatus = resolveRecurringChargeStatus({
        persistedStatus: existing?.status,
        subscriptionStatus: subscription.status,
        dueDate,
        now,
      })

      if (existing) {
        await this.repository.updateRecurringCharge({
          chargeId: existing.id,
          externalKey,
          amountCents:
            existing.discountAmountCents > 0
              ? existing.amountCents
              : subscription.plan.amountCents,
          dueDate,
          description: subscription.plan.name,
          category: "Mensalidade",
          planId: subscription.planId,
          status: nextStatus,
        })
        continue
      }

      if (shouldPauseRecurringCharge(subscription.userId)) {
        continue
      }

      await this.repository.createRecurringCharge({
        tenantId,
        userId: subscription.userId,
        studentProfileId: studentProfileIdByUserId.get(subscription.userId) ?? null,
        subscriptionId: subscription.id,
        planId: subscription.planId,
        externalKey,
        description: subscription.plan.name,
        category: "Mensalidade",
        amountCents: subscription.plan.amountCents,
        dueDate,
        status: nextStatus,
      })

      await this.applyAvailableCreditToUser(tenantId, subscription.userId)
    }

    for (const recurringSetup of recurringSetups) {
      const cycleStartDate = resolveCurrentCycleStartDate(
        now,
        recurringSetup.startDate,
        recurringSetup.billingCycle,
        recurringSetup.billingDay
      )
      const externalKey = recurringSetupChargeExternalKey(recurringSetup.id, cycleStartDate)
      const dueDate = cycleStartDate
      const existing = await this.repository.findChargeByExternalKey(externalKey)
      const nextStatus = resolveRecurringChargeStatus({
        persistedStatus: existing?.status,
        dueDate,
        now,
      })

      if (existing) {
        await this.repository.updateRecurringCharge({
          chargeId: existing.id,
          externalKey,
          amountCents:
            existing.discountAmountCents > 0
              ? existing.amountCents
              : recurringSetup.amountCents,
          dueDate,
          description: recurringSetup.description,
          category: recurringSetup.category,
          planId: recurringSetup.planId,
          status: nextStatus,
        })
        continue
      }

      if (shouldPauseRecurringCharge(recurringSetup.userId)) {
        continue
      }

      await this.repository.createRecurringCharge({
        tenantId,
        userId: recurringSetup.userId,
        studentProfileId:
          recurringSetup.studentProfileId ??
          studentProfileIdByUserId.get(recurringSetup.userId) ??
          null,
        recurringSetupId: recurringSetup.id,
        planId: recurringSetup.planId,
        externalKey,
        description: recurringSetup.description,
        category: recurringSetup.category,
        amountCents: recurringSetup.amountCents,
        dueDate,
        status: nextStatus,
      })

      await this.applyAvailableCreditToUser(tenantId, recurringSetup.userId)
    }

    await this.financeDelinquencyService.syncPolicies({
      tenantId,
      userIds: recurringUserIds,
    })
  }

  async getDashboardData(tenantId: string): Promise<FinanceDashboardData> {
    await this.ensureCurrentCharges(tenantId)
    const { plans, charges, activeStudents, students, coupons } = await this.repository.listDashboardSnapshot(
      tenantId
    )

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const paidThisMonth = charges.filter(
      (charge) =>
        charge.status === PrismaFinanceChargeStatus.PAID &&
        charge.paidAt &&
        charge.paidAt.getMonth() === currentMonth &&
        charge.paidAt.getFullYear() === currentYear
    )

    const planRecords: FinancePlanRecord[] = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: currencyFromCents(plan.amountCents),
      modalities: plan.modalities.length,
      description: `${plan.billingCycle === BillingCycle.MONTHLY ? "Mensal" : plan.billingCycle === BillingCycle.QUARTERLY ? "Trimestral" : plan.billingCycle === BillingCycle.SEMIANNUAL ? "Semestral" : "Anual"}`,
      students: plan.subscriptions.length,
    }))

    const paymentRecords: FinanceChargeRecord[] = charges.map((charge) => ({
      id: charge.id,
      userId: charge.userId,
      studentProfileId: charge.studentProfileId,
      name: charge.user.name ?? charge.user.email,
      category: charge.category,
      amount: currencyFromCents(charge.amountCents),
      originalAmount: charge.originalAmountCents != null ? currencyFromCents(charge.originalAmountCents) : null,
      discountAmount: currencyFromCents(charge.discountAmountCents),
      date: charge.paidAt ? toDateOnly(charge.paidAt) : null,
      dueDate: toDateOnly(charge.dueDate),
      status: mapFinanceChargeStatus(charge.status),
      method: charge.paymentMethod,
      plan: charge.plan?.name ?? charge.description,
      description: charge.description,
      discountSource: mapFinanceDiscountSource(charge.discountSource),
      discountReason: charge.discountReason,
      appliedCouponCode: charge.coupon?.code ?? null,
    }))

    const couponRecords: FinanceCouponRecord[] = coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discountType:
        coupon.discountType === FinanceDiscountType.PERCENTAGE ? "percentage" : "fixed_amount",
      discountLabel: formatCouponDiscountLabel({
        discountType: coupon.discountType,
        amountCents: coupon.amountCents,
        percentageOff: coupon.percentageOff,
      }),
      appliesToPlanId: coupon.appliesToPlanId,
      appliesToPlanName: coupon.plan?.name ?? null,
      isActive: coupon.isActive,
      redemptionCount: coupon.redemptionCount,
      maxRedemptions: coupon.maxRedemptions,
    }))

    const revenue = paidThisMonth.reduce((sum, charge) => sum + charge.amountCents, 0)
    const pending = charges
      .filter((charge) => charge.status === PrismaFinanceChargeStatus.PENDING)
      .reduce((sum, charge) => sum + charge.amountCents, 0)
    const overdue = charges
      .filter((charge) => charge.status === PrismaFinanceChargeStatus.OVERDUE)
      .reduce((sum, charge) => sum + charge.amountCents, 0)
    const activeChargeValues = paymentRecords.filter((item) => item.status !== "cancelled")
    const avgTicket =
      activeChargeValues.length > 0
        ? activeChargeValues.reduce((sum, item) => sum + item.amount, 0) / activeChargeValues.length
        : 0

    return {
      stats: {
        revenue: currencyFromCents(revenue),
        pending: currencyFromCents(pending),
        overdue: currencyFromCents(overdue),
        activeStudents,
        avgTicket: Math.round(avgTicket),
      },
      references: {
        students: students.map((student) => {
          const subscription = plans
            .flatMap((plan) =>
              plan.subscriptions
                .filter((subscription) => subscription.userId === student.userId)
                .map((subscription) => ({
                  planId: plan.id,
                  planName: plan.name,
                  startDate: subscription.startDate,
                }))
            )
            .sort((left, right) => right.startDate.getTime() - left.startDate.getTime())[0] ?? null

          return {
            userId: student.userId,
            studentProfileId: student.id,
            name: student.user.name ?? student.user.email,
            planId: subscription?.planId ?? null,
            planName: subscription?.planName ?? null,
          }
        }),
      },
      plans: planRecords,
      payments: paymentRecords,
      coupons: couponRecords,
    }
  }

  private async createAdminRecurringSetup(input: {
    tenantId: string
    userId: string
    studentProfileId: string | null
    planId: string | null
    source: FinanceRecurringSetupSource
    description: string
    category: string
    amountCents: number
    billingCycle: BillingCycle
    dueDate: Date
  }) {
    const recurringSetup = await this.repository.createRecurringSetup({
      tenantId: input.tenantId,
      userId: input.userId,
      studentProfileId: input.studentProfileId,
      planId: input.planId,
      source: input.source,
      description: input.description,
      category: input.category,
      amountCents: input.amountCents,
      billingCycle: input.billingCycle,
      billingDay: input.dueDate.getDate(),
      startDate: input.dueDate,
    })

    await this.repository.createRecurringCharge({
      tenantId: input.tenantId,
      userId: input.userId,
      studentProfileId: input.studentProfileId,
      recurringSetupId: recurringSetup.id,
      planId: input.planId,
      externalKey: recurringSetupChargeExternalKey(recurringSetup.id, input.dueDate),
      description: input.description,
      category: input.category,
      amountCents: input.amountCents,
      dueDate: input.dueDate,
      status: resolveRecurringChargeStatus({
        dueDate: input.dueDate,
        now: new Date(),
      }),
    })

    await this.applyAvailableCreditToUser(input.tenantId, input.userId)
  }

  async createCharge(
    tenantId: string,
    payload: CreateFinanceChargeInput
  ) {
    const student = await this.repository.findActiveStudentReferenceByUserId(tenantId, payload.userId)

    if (!student) {
      throw new Error("Selecione um aluno ativo desta academia para criar a cobrança.")
    }

    if (payload.studentProfileId && payload.studentProfileId !== student.id) {
      throw new Error("O aluno informado para a cobrança não é válido para esta academia.")
    }

    const dueDate = new Date(`${payload.dueDate}T12:00:00`)
    const description = payload.description.trim() || payload.category
    const plan = payload.planId
      ? await this.repository.findPlanById(tenantId, payload.planId)
      : null

    if (payload.planId && !plan) {
      throw new Error("O plano informado para a cobrança não pertence a esta academia.")
    }

    if (payload.recurrenceMode === "ONE_TIME") {
      if (payload.amount == null) {
        throw new Error("Informe um valor maior que zero para criar a cobrança.")
      }

      await this.repository.createManualCharge({
        tenantId,
        userId: student.userId,
        studentProfileId: student.id,
        planId: payload.planId,
        description,
        category: payload.category,
        amountCents: Math.round(payload.amount * 100),
        dueDate,
      })

      await this.applyAvailableCreditToUser(tenantId, student.userId)

      return this.getDashboardData(tenantId)
    }

    if (payload.recurringSource === "MANUAL_AMOUNT") {
      if (payload.amount == null) {
        throw new Error("Informe um valor maior que zero para criar a cobrança recorrente.")
      }

      await this.createAdminRecurringSetup({
        tenantId,
        userId: student.userId,
        studentProfileId: student.id,
        planId: null,
        source: FinanceRecurringSetupSource.MANUAL_AMOUNT,
        description,
        category: payload.category,
        amountCents: Math.round(payload.amount * 100),
        billingCycle: BillingCycle.MONTHLY,
        dueDate,
      })

      return this.getDashboardData(tenantId)
    }

    if (!plan) {
      throw new Error("Selecione um plano válido para criar a mensalidade recorrente.")
    }

    if (plan.amountCents <= 0) {
      throw new Error("Planos gratuitos não geram cobrança recorrente.")
    }

    const activeSubscription = await this.repository.findLatestActiveSubscriptionByUserId(
      tenantId,
      student.userId
    )

    if (activeSubscription && !payload.confirmDuplicatePlan) {
      throw new Error(
        "Este aluno já possui um plano ativo. Confirme que deseja gerar uma cobrança recorrente adicional."
      )
    }

    if (!activeSubscription) {
      const subscription = await this.repository.createSubscription({
        tenantId,
        userId: student.userId,
        planId: plan.id,
        startDate: dueDate,
        billingDay: dueDate.getDate(),
      })

      await this.repository.createRecurringCharge({
        tenantId,
        userId: student.userId,
        studentProfileId: student.id,
        subscriptionId: subscription.id,
        planId: plan.id,
        externalKey: recurringChargeExternalKey(subscription.id, dueDate),
        description: plan.name,
        category: payload.category,
        amountCents: plan.amountCents,
        dueDate,
        status: resolveRecurringChargeStatus({
          subscriptionStatus: subscription.status,
          dueDate,
          now: new Date(),
        }),
      })

      await this.applyAvailableCreditToUser(tenantId, student.userId)

      return this.getDashboardData(tenantId)
    }

    await this.createAdminRecurringSetup({
      tenantId,
      userId: student.userId,
      studentProfileId: student.id,
      planId: plan.id,
      source: FinanceRecurringSetupSource.PLAN_LINKED,
      description: description === payload.category ? plan.name : description,
      category: payload.category,
      amountCents: plan.amountCents,
      billingCycle: plan.billingCycle,
      dueDate,
    })

    return this.getDashboardData(tenantId)
  }

  async registerPayment(
    tenantId: string,
    chargeId: string,
    payload: RegisterFinancePaymentInput
  ) {
    const charge = await this.repository.findChargeById(tenantId, chargeId)

    if (!charge) {
      throw new Error("Cobrança não encontrada.")
    }

    if (charge.status === PrismaFinanceChargeStatus.PAID) {
      throw new Error("Essa cobrança já foi registrada como paga.")
    }

    if (charge.status === PrismaFinanceChargeStatus.CANCELLED) {
      throw new Error("Cobranças canceladas não podem receber pagamento.")
    }

    const paidAt = new Date()

    await this.repository.markChargePaid({
      chargeId: charge.id,
      paymentMethod: toPrismaFinancePaymentMethod(payload.method),
      paidAt,
    })

    if (charge.subscriptionId) {
      await this.planTransitionService.activatePendingSubscriptionForCharge({
        chargeId: charge.id,
        activatedAt: paidAt,
      })
    }

    return this.getDashboardData(tenantId)
  }

  async applyManualDiscount(
    tenantId: string,
    chargeId: string,
    payload: ApplyFinanceDiscountInput
  ) {
    const charge = await this.repository.findChargeById(tenantId, chargeId)

    if (!charge) {
      throw new Error("Cobrança não encontrada.")
    }

    if (charge.status === PrismaFinanceChargeStatus.PAID) {
      throw new Error("Não é possível dar desconto em uma cobrança já paga.")
    }

    if (charge.status === PrismaFinanceChargeStatus.CANCELLED) {
      throw new Error("Não é possível dar desconto em uma cobrança cancelada.")
    }

    if (charge.couponId || charge.discountAmountCents > 0) {
      throw new Error("Essa cobrança já possui desconto aplicado.")
    }

    const originalAmountCents = charge.originalAmountCents ?? charge.amountCents
    const discountAmountCents = Math.round(payload.amount * 100)

    if (discountAmountCents >= originalAmountCents) {
      throw new Error("O desconto manual deve ser menor que o valor atual da cobrança.")
    }

    await this.repository.applyManualDiscountToCharge({
      chargeId: charge.id,
      originalAmountCents,
      discountAmountCents,
      finalAmountCents: originalAmountCents - discountAmountCents,
      discountReason: payload.reason,
      resultingStatus: charge.status,
      paidAt: null,
    })

    return this.getDashboardData(tenantId)
  }

  async createCoupon(
    tenantId: string,
    createdByUserId: string | null,
    payload: CreateFinanceCouponInput
  ) {
    const normalizedCode = normalizeCouponCode(payload.code)
    const existingCoupon = await this.repository.findCouponByCode(tenantId, normalizedCode)

    if (existingCoupon) {
      throw new Error("Ja existe um cupom com esse codigo nesta academia.")
    }

    if (payload.appliesToPlanId) {
      const plan = await this.repository.findPlanById(tenantId, payload.appliesToPlanId)

      if (!plan) {
        throw new Error("O plano informado para o cupom nao pertence a esta academia.")
      }
    }

    await this.repository.createCoupon({
      tenantId,
      code: normalizedCode,
      title: payload.title.trim(),
      description: payload.description,
      discountType: payload.discountType,
      amountCents:
        payload.discountType === FinanceDiscountType.FIXED_AMOUNT
          ? Math.round(payload.value * 100)
          : null,
      percentageOff:
        payload.discountType === FinanceDiscountType.PERCENTAGE
          ? Math.round(payload.value)
          : null,
      appliesToPlanId: payload.appliesToPlanId,
      maxRedemptions: payload.maxRedemptions,
      startsAt: payload.startsAt ? new Date(`${payload.startsAt}T00:00:00`) : null,
      endsAt: payload.endsAt ? new Date(`${payload.endsAt}T23:59:59`) : null,
      createdByUserId,
    })

    return this.getDashboardData(tenantId)
  }

  private async applyAvailableCreditToUser(tenantId: string, userId: string) {
    const creditBalance = await this.repository.findCreditBalance(tenantId, userId)

    if (!creditBalance || creditBalance.balanceCents <= 0) {
      return
    }

    const nextCharge = await this.repository.findNextOpenChargeForUser(tenantId, userId)

    if (!nextCharge || nextCharge.couponId || nextCharge.discountAmountCents > 0) {
      return
    }

    const originalAmountCents = nextCharge.originalAmountCents ?? nextCharge.amountCents
    const appliedCreditCents = Math.min(creditBalance.balanceCents, originalAmountCents)
    const finalAmountCents = Math.max(0, originalAmountCents - appliedCreditCents)

    await this.repository.applyManualDiscountToCharge({
      chargeId: nextCharge.id,
      originalAmountCents,
      discountAmountCents: appliedCreditCents,
      finalAmountCents,
      discountReason: "Crédito acumulado de troca de plano.",
      resultingStatus: finalAmountCents > 0 ? nextCharge.status : PrismaFinanceChargeStatus.CANCELLED,
      paidAt: null,
    })

    await this.repository.updateCreditBalance({
      tenantId,
      userId,
      balanceCents: creditBalance.balanceCents - appliedCreditCents,
    })
  }
}
