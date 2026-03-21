import {
  BillingCycle,
  PlanTransitionChargeHandling,
  PlanTransitionPolicy,
  StudentProfileStatus,
  SubscriptionStatus,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  addBillingCycle,
  recurringChargeExternalKey,
  resolveCurrentCycleStartDate,
  toDateOnly,
} from "@/apps/api/src/modules/finance/domain/finance-charge"
import { FinancePlanTransitionService } from "@/apps/api/src/modules/finance/services/finance-plan-transition.service"
import type { StudentAppPlansData } from "@/apps/api/src/modules/app/domain/student-app"

function formatAmountLabel(amountCents: number) {
  return (amountCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

function toBillingCycleLabel(value: BillingCycle) {
  switch (value) {
    case BillingCycle.QUARTERLY:
      return "Trimestral"
    case BillingCycle.SEMIANNUAL:
      return "Semestral"
    case BillingCycle.YEARLY:
      return "Anual"
    default:
      return "Mensal"
  }
}

function toPlanTransitionPolicy(value: PlanTransitionPolicy | null | undefined) {
  switch (value) {
    case PlanTransitionPolicy.IMMEDIATE:
      return {
        value: "immediate" as const,
        label: "Imediata",
      }
    case PlanTransitionPolicy.PRORATA:
      return {
        value: "prorata" as const,
        label: "Pró-rata por dias corridos",
      }
    default:
      return {
        value: "next_cycle" as const,
        label: "No próximo ciclo",
      }
  }
}

function toPlanTransitionChargeHandling(
  value: PlanTransitionChargeHandling | null | undefined
) {
  switch (value) {
    case PlanTransitionChargeHandling.REPLACE_OPEN_CHARGE:
      return {
        value: "replace_open_charge" as const,
        label: "substituir a cobrança aberta",
      }
    case PlanTransitionChargeHandling.CONVERT_TO_CREDIT:
      return {
        value: "convert_to_credit" as const,
        label: "converter o saldo anterior em crédito",
      }
    default:
      return {
        value: "charge_difference" as const,
        label: "cobrar apenas a diferença",
      }
  }
}

const effectiveSubscriptionStatuses: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAST_DUE,
]

export class StudentAppPlansService {
  constructor(
    private readonly planTransitionService = new FinancePlanTransitionService()
  ) {}

  async getData(input: {
    tenantId: string
    userId: string
  }): Promise<StudentAppPlansData> {
    await this.planTransitionService.syncDueTransitions({
      tenantId: input.tenantId,
      userIds: [input.userId],
    })

    const studentProfilePromise = prisma.studentProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        status: StudentProfileStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    })

    const plansPromise = prisma.plan.findMany({
      where: {
        tenantId: input.tenantId,
        isActive: true,
      },
      include: {
        modalities: {
          include: {
            modality: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })

    const currentSubscriptionPromise = prisma.subscription.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        status: {
          in: effectiveSubscriptionStatuses,
        },
      },
      include: {
        plan: true,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    })

    const pendingActivationSubscriptionPromise = prisma.subscription.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        status: SubscriptionStatus.PENDING,
      },
      include: {
        plan: true,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    })

    const pendingPlanChangePromise = prisma.subscriptionPlanChange.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        status: "PENDING",
      },
      include: {
        toPlan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ requestedAt: "desc" }],
    })

    const tenantPaymentSettingsPromise = prisma.tenantPaymentSettings.findUnique({
      where: {
        tenantId: input.tenantId,
      },
      select: {
        planTransitionPolicy: true,
        planTransitionChargeHandling: true,
      },
    })

    const [
      studentProfile,
      plans,
      currentSubscription,
      pendingActivationSubscription,
      tenantPaymentSettings,
      pendingPlanChange,
    ] = await Promise.all([
      studentProfilePromise,
      plansPromise,
      currentSubscriptionPromise,
      pendingActivationSubscriptionPromise,
      tenantPaymentSettingsPromise,
      pendingPlanChangePromise,
    ])

    if (!studentProfile) {
      throw new Error("Aluno ativo não encontrado para esta academia.")
    }

    const activationBillingDay =
      currentSubscription?.billingDay ??
      pendingActivationSubscription?.billingDay ??
      new Date().getDate()
    const nextBillingDate = currentSubscription
      ? toDateOnly(
          addBillingCycle(
            resolveCurrentCycleStartDate(
              new Date(),
              currentSubscription.startDate,
              currentSubscription.plan.billingCycle,
              currentSubscription.billingDay
            ),
            currentSubscription.plan.billingCycle,
            currentSubscription.billingDay
          )
        )
      : null

    const transitionPolicy = toPlanTransitionPolicy(
      tenantPaymentSettings?.planTransitionPolicy
    )
    const transitionChargeHandling = toPlanTransitionChargeHandling(
      tenantPaymentSettings?.planTransitionChargeHandling
    )

    return {
      role: "student",
      studentId: studentProfile.id,
      currentPlanId: currentSubscription?.planId ?? null,
      currentPlanName: currentSubscription?.plan.name ?? null,
      pendingPlanId:
        pendingActivationSubscription?.planId ??
        pendingPlanChange?.toPlan.id ??
        null,
      pendingPlanName:
        pendingActivationSubscription?.plan.name ??
        pendingPlanChange?.toPlan.name ??
        null,
      pendingPlanEffectiveDate: pendingPlanChange?.effectiveDate
        ? toDateOnly(pendingPlanChange.effectiveDate)
        : null,
      activationBillingDay,
      nextBillingDate,
      canActivateNewPlan: pendingActivationSubscription == null,
      planTransitionPolicy: transitionPolicy.value,
      planTransitionPolicyLabel: transitionPolicy.label,
      planTransitionChargeHandling: transitionChargeHandling.value,
      planTransitionChargeHandlingLabel: transitionChargeHandling.label,
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        amountLabel: formatAmountLabel(plan.amountCents),
        billingCycleLabel: toBillingCycleLabel(plan.billingCycle),
        modalityNames: plan.modalities.map((item) => item.modality.name),
        isCurrent: plan.id === currentSubscription?.planId,
      })),
    }
  }

  async activatePlan(input: {
    tenantId: string
    userId: string
    planId: string
  }) {
    const message = await this.planTransitionService.activateOrChangePlan(input)
    const data = await this.getData({
      tenantId: input.tenantId,
      userId: input.userId,
    })

    return {
      data,
      message,
    }
  }
}
