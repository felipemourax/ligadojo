import {
  FinanceChargeStatus,
  FinancePaymentMethod,
  PlanTransitionChargeHandling,
  PlanTransitionPolicy,
  StudentProfileStatus,
  SubscriptionPlanChangeStatus,
  SubscriptionStatus,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  addBillingCycle,
  recurringChargeExternalKey,
  cycleKeyForDate,
  resolveCurrentCycleStartDate,
  toOperationalDate,
} from "@/apps/api/src/modules/finance/domain/finance-charge"

const effectiveSubscriptionStatuses: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAST_DUE,
]

const msPerDay = 1000 * 60 * 60 * 24

function legacyRecurringChargeExternalKey(
  subscriptionId: string,
  referenceDate: Date,
  billingCycle: Parameters<typeof cycleKeyForDate>[1]
) {
  return `subscription:${subscriptionId}:${cycleKeyForDate(referenceDate, billingCycle)}`
}

function formatDateLabel(value: Date) {
  return value.toLocaleDateString("pt-BR")
}

function computeProratedAmount(input: {
  fullAmountCents: number
  cycleStartDate: Date
  nextCycleStartDate: Date
  now: Date
}) {
  const totalDays = Math.max(
    1,
    Math.ceil(
      (input.nextCycleStartDate.getTime() - input.cycleStartDate.getTime()) / msPerDay
    )
  )
  const remainingDays = Math.max(
    1,
    Math.ceil((input.nextCycleStartDate.getTime() - input.now.getTime()) / msPerDay)
  )

  return Math.max(0, Math.round((input.fullAmountCents * remainingDays) / totalDays))
}

export class FinancePlanTransitionService {
  async assignPlanFromAdmin(input: {
    tenantId: string
    userId: string
    planId: string
    markAsPaid: boolean
  }) {
    const now = new Date()

    const [pendingSubscription, currentSubscription] = await Promise.all([
      prisma.subscription.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
          status: SubscriptionStatus.PENDING,
        },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.subscription.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
          status: {
            in: effectiveSubscriptionStatuses,
          },
        },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
    ])

    if (pendingSubscription) {
      if (pendingSubscription.planId !== input.planId) {
        throw new Error(
          `Ja existe uma solicitacao pendente para o plano ${pendingSubscription.plan.name}. Confirme ou cancele essa cobranca antes de trocar o plano.`
        )
      }

      if (!input.markAsPaid) {
        return "Plano vinculado com cobrança pendente de confirmação."
      }

      const pendingCharge = await prisma.financeCharge.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
          subscriptionId: pendingSubscription.id,
          status: {
            in: [FinanceChargeStatus.PENDING, FinanceChargeStatus.OVERDUE],
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      })

      if (!pendingCharge) {
        throw new Error("A cobrança pendente desse plano não foi encontrada para confirmação.")
      }

      await prisma.financeCharge.update({
        where: {
          id: pendingCharge.id,
        },
        data: {
          status: FinanceChargeStatus.PAID,
          paymentMethod: FinancePaymentMethod.CASH,
          paidAt: now,
        },
      })

      await this.activatePendingSubscriptionForCharge({
        chargeId: pendingCharge.id,
        activatedAt: now,
      })

      return "Plano vinculado e pagamento confirmado com sucesso."
    }

    if (!currentSubscription) {
      const message = await this.activateOrChangePlan({
        tenantId: input.tenantId,
        userId: input.userId,
        planId: input.planId,
      })

      if (!input.markAsPaid) {
        return message
      }

      const createdPendingSubscription = await prisma.subscription.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
          planId: input.planId,
          status: SubscriptionStatus.PENDING,
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      })

      if (!createdPendingSubscription) {
        return message
      }

      const pendingCharge = await prisma.financeCharge.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
          subscriptionId: createdPendingSubscription.id,
          status: {
            in: [FinanceChargeStatus.PENDING, FinanceChargeStatus.OVERDUE],
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      })

      if (!pendingCharge) {
        return message
      }

      await prisma.financeCharge.update({
        where: {
          id: pendingCharge.id,
        },
        data: {
          status: FinanceChargeStatus.PAID,
          paymentMethod: FinancePaymentMethod.CASH,
          paidAt: now,
        },
      })

      await this.activatePendingSubscriptionForCharge({
        chargeId: pendingCharge.id,
        activatedAt: now,
      })

      return "Plano vinculado e pagamento confirmado com sucesso."
    }

    if (currentSubscription.planId === input.planId) {
      return "Esse plano ja esta ativo para o aluno."
    }

    return this.activateOrChangePlan({
      tenantId: input.tenantId,
      userId: input.userId,
      planId: input.planId,
    })
  }

  async activatePendingSubscriptionForCharge(input: {
    chargeId: string
    activatedAt: Date
  }) {
    const charge = await prisma.financeCharge.findUnique({
      where: {
        id: input.chargeId,
      },
      select: {
        id: true,
        subscriptionId: true,
      },
    })

    if (!charge?.subscriptionId) {
      return
    }

    const activatedAt = toOperationalDate(input.activatedAt)
    const activatedBillingDay = activatedAt.getDate()

    await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({
        where: {
          id: charge.subscriptionId!,
        },
        select: {
          id: true,
          status: true,
        },
      })

      if (!subscription || subscription.status !== SubscriptionStatus.PENDING) {
        return
      }

      await tx.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startDate: activatedAt,
          billingDay: activatedBillingDay,
        },
      })

      await tx.financeCharge.update({
        where: {
          id: charge.id,
        },
        data: {
          dueDate: activatedAt,
          externalKey: recurringChargeExternalKey(subscription.id, activatedAt),
        },
      })
    })
  }

  async syncDueTransitions(input: { tenantId: string; userIds?: string[] }) {
    const now = new Date()

    const dueChanges = await prisma.subscriptionPlanChange.findMany({
      where: {
        tenantId: input.tenantId,
        status: SubscriptionPlanChangeStatus.PENDING,
        effectiveDate: {
          lte: now,
        },
        ...(input.userIds?.length
          ? {
              userId: {
                in: input.userIds,
              },
            }
          : {}),
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
        toPlan: true,
        user: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ effectiveDate: "asc" }, { requestedAt: "asc" }],
    })

    for (const change of dueChanges) {
      await prisma.$transaction(async (tx) => {
        const subscription = await tx.subscription.findUnique({
          where: {
            id: change.subscriptionId,
          },
          include: {
            plan: true,
          },
        })

        if (!subscription || subscription.status === SubscriptionStatus.ENDED) {
          await tx.subscriptionPlanChange.update({
            where: { id: change.id },
            data: {
              status: SubscriptionPlanChangeStatus.CANCELLED,
              appliedAt: now,
            },
          })
          return
        }

        const studentProfile = await tx.studentProfile.findFirst({
          where: {
            tenantId: change.tenantId,
            userId: change.userId,
            status: StudentProfileStatus.ACTIVE,
          },
          select: {
            id: true,
          },
        })

        await tx.subscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            status: SubscriptionStatus.ENDED,
            endDate: change.effectiveDate,
          },
        })

        const nextSubscription = await tx.subscription.create({
          data: {
            tenantId: change.tenantId,
            userId: change.userId,
            planId: change.toPlanId,
            status: SubscriptionStatus.ACTIVE,
            startDate: subscription.startDate,
            billingDay: subscription.billingDay,
          },
        })

        if (change.toPlan.amountCents > 0) {
          await tx.financeCharge.create({
            data: {
              tenantId: change.tenantId,
              userId: change.userId,
              studentProfileId: studentProfile?.id ?? null,
              subscriptionId: nextSubscription.id,
              planId: change.toPlanId,
              externalKey: recurringChargeExternalKey(nextSubscription.id, change.effectiveDate),
              description: change.toPlan.name,
              category: "Mensalidade",
              amountCents: change.toPlan.amountCents,
              dueDate: change.effectiveDate,
              status: FinanceChargeStatus.PENDING,
            },
          })

          await this.applyAvailableCreditToNextCharge({
            tx,
            tenantId: change.tenantId,
            userId: change.userId,
          })
        }

        await tx.subscriptionPlanChange.update({
          where: {
            id: change.id,
          },
          data: {
            status: SubscriptionPlanChangeStatus.APPLIED,
            appliedAt: now,
          },
        })
      })
    }
  }

  async activateOrChangePlan(input: {
    tenantId: string
    userId: string
    planId: string
  }) {
    const now = new Date()

    return prisma.$transaction(async (tx) => {
      const [studentProfile, targetPlan, currentSubscription, settings] = await Promise.all([
        tx.studentProfile.findFirst({
          where: {
            tenantId: input.tenantId,
            userId: input.userId,
            status: StudentProfileStatus.ACTIVE,
          },
          select: {
            id: true,
          },
        }),
        tx.plan.findFirst({
          where: {
            id: input.planId,
            tenantId: input.tenantId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            amountCents: true,
            billingCycle: true,
          },
        }),
        tx.subscription.findFirst({
          where: {
            tenantId: input.tenantId,
            userId: input.userId,
            status: {
              in: effectiveSubscriptionStatuses,
            },
          },
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                amountCents: true,
                billingCycle: true,
              },
            },
          },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        }),
        tx.tenantPaymentSettings.findUnique({
          where: {
            tenantId: input.tenantId,
          },
          select: {
            planTransitionPolicy: true,
            planTransitionChargeHandling: true,
          },
        }),
      ])

      if (!studentProfile) {
        throw new Error("Aluno ativo não encontrado para esta academia.")
      }

      if (!targetPlan) {
        throw new Error("O plano selecionado não está disponível nesta academia.")
      }

      const pendingActivationSubscription = await tx.subscription.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
          status: SubscriptionStatus.PENDING,
        },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      })

      if (pendingActivationSubscription) {
        if (pendingActivationSubscription.planId === input.planId) {
          throw new Error("Esse plano já está aguardando confirmação de pagamento.")
        }

        throw new Error(
          `Já existe uma solicitação pendente para o plano ${pendingActivationSubscription.plan.name}. Aguarde a confirmação do pagamento antes de contratar outro plano.`
        )
      }

      if (!currentSubscription) {
        const requestedAt = toOperationalDate(now)
        const subscription = await tx.subscription.create({
          data: {
            tenantId: input.tenantId,
            userId: input.userId,
            planId: input.planId,
            status:
              targetPlan.amountCents > 0 ? SubscriptionStatus.PENDING : SubscriptionStatus.ACTIVE,
            startDate: requestedAt,
            billingDay: requestedAt.getDate(),
          },
        })

        if (targetPlan.amountCents > 0) {
          await tx.financeCharge.create({
            data: {
              tenantId: input.tenantId,
              userId: input.userId,
              studentProfileId: studentProfile.id,
              subscriptionId: subscription.id,
              planId: targetPlan.id,
              externalKey: recurringChargeExternalKey(subscription.id, requestedAt),
              description: targetPlan.name,
              category: "Mensalidade",
              amountCents: targetPlan.amountCents,
              dueDate: requestedAt,
              status: FinanceChargeStatus.PENDING,
            },
          })
        }

        return targetPlan.amountCents > 0
          ? "Solicitação de plano criada com sucesso. A assinatura será ativada após a confirmação do pagamento pela academia."
          : `Plano ativado com sucesso. O vencimento passa a ser todo mês no dia ${requestedAt.getDate()}.`
      }

      if (currentSubscription.planId === input.planId) {
        throw new Error("Esse plano já está ativo para você.")
      }

      const existingPendingChange = await tx.subscriptionPlanChange.findFirst({
        where: {
          subscriptionId: currentSubscription.id,
          status: SubscriptionPlanChangeStatus.PENDING,
        },
        orderBy: [{ requestedAt: "desc" }],
      })

      const transitionPolicy = settings?.planTransitionPolicy ?? PlanTransitionPolicy.NEXT_CYCLE
      const chargeHandling =
        settings?.planTransitionChargeHandling ?? PlanTransitionChargeHandling.CHARGE_DIFFERENCE

      const currentCycleStartDate = resolveCurrentCycleStartDate(
        now,
        currentSubscription.startDate,
        currentSubscription.plan.billingCycle,
        currentSubscription.billingDay
      )
      const nextCycleStartDate = addBillingCycle(
        currentCycleStartDate,
        currentSubscription.plan.billingCycle,
        currentSubscription.billingDay
      )

      if (transitionPolicy === PlanTransitionPolicy.NEXT_CYCLE) {
        if (existingPendingChange?.toPlanId === targetPlan.id) {
          throw new Error("Essa troca já está agendada para o próximo ciclo.")
        }

        if (existingPendingChange) {
          await tx.subscriptionPlanChange.update({
            where: {
              id: existingPendingChange.id,
            },
            data: {
              fromPlanId: currentSubscription.planId,
              toPlanId: targetPlan.id,
              transitionPolicy,
              chargeHandling,
              effectiveDate: nextCycleStartDate,
            },
          })

          return `Troca reprogramada para ${formatDateLabel(nextCycleStartDate)}. O plano atual segue ativo até essa data.`
        }

        await tx.subscriptionPlanChange.create({
          data: {
            tenantId: input.tenantId,
            userId: input.userId,
            subscriptionId: currentSubscription.id,
            fromPlanId: currentSubscription.planId,
            toPlanId: targetPlan.id,
            transitionPolicy,
            chargeHandling,
            effectiveDate: nextCycleStartDate,
          },
        })

        return `Troca agendada para ${formatDateLabel(nextCycleStartDate)}. O plano atual segue ativo até essa data.`
      }

      if (existingPendingChange) {
        await tx.subscriptionPlanChange.update({
          where: {
            id: existingPendingChange.id,
          },
          data: {
            status: SubscriptionPlanChangeStatus.CANCELLED,
            appliedAt: now,
          },
        })
      }

      const currentCharge = await tx.financeCharge.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
          subscriptionId: currentSubscription.id,
          externalKey: {
            in: [
              recurringChargeExternalKey(currentSubscription.id, currentCycleStartDate),
              legacyRecurringChargeExternalKey(
                currentSubscription.id,
                now,
                currentSubscription.plan.billingCycle
              ),
            ],
          },
        },
        orderBy: [{ createdAt: "desc" }],
      })

      const currentOpenCharge =
        currentCharge &&
        (currentCharge.status === FinanceChargeStatus.PENDING ||
          currentCharge.status === FinanceChargeStatus.OVERDUE)
          ? currentCharge
          : null

      const targetCycleAmountCents =
        transitionPolicy === PlanTransitionPolicy.PRORATA
          ? computeProratedAmount({
              fullAmountCents: targetPlan.amountCents,
              cycleStartDate: currentCycleStartDate,
              nextCycleStartDate,
              now,
            })
          : targetPlan.amountCents

      await tx.subscription.update({
        where: {
          id: currentSubscription.id,
        },
        data: {
          status: SubscriptionStatus.ENDED,
          endDate: now,
        },
      })

      const nextSubscription = await tx.subscription.create({
        data: {
          tenantId: input.tenantId,
          userId: input.userId,
          planId: targetPlan.id,
          status: SubscriptionStatus.ACTIVE,
          startDate: currentSubscription.startDate,
          billingDay: currentSubscription.billingDay,
        },
      })

      if (currentOpenCharge) {
        await this.applyCurrentCycleHandling({
          tx,
          currentOpenCharge,
          newSubscriptionId: nextSubscription.id,
          currentCycleStartDate,
          targetPlanId: targetPlan.id,
          targetPlanName: targetPlan.name,
          targetAmountCents: targetCycleAmountCents,
          chargeHandling,
          tenantId: input.tenantId,
          userId: input.userId,
          studentProfileId: studentProfile.id,
          now,
        })
      }

      if (transitionPolicy === PlanTransitionPolicy.IMMEDIATE) {
        return `Plano alterado com efeito imediato. O próximo ciclo continuará no dia ${currentSubscription.billingDay}.`
      }

      return `Plano alterado com pró-rata por dias corridos. O próximo ciclo continuará no dia ${currentSubscription.billingDay}.`
    })
  }

  private async applyCurrentCycleHandling(input: {
    tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">
    currentOpenCharge: {
      id: string
      amountCents: number
      status: FinanceChargeStatus
    }
    newSubscriptionId: string
    currentCycleStartDate: Date
    targetPlanId: string
    targetPlanName: string
    targetAmountCents: number
    chargeHandling: PlanTransitionChargeHandling
    tenantId: string
    userId: string
    studentProfileId: string
    now: Date
  }) {
    if (input.chargeHandling === PlanTransitionChargeHandling.REPLACE_OPEN_CHARGE) {
      await input.tx.financeCharge.update({
        where: { id: input.currentOpenCharge.id },
        data: {
          subscriptionId: input.newSubscriptionId,
          planId: input.targetPlanId,
          externalKey: recurringChargeExternalKey(
            input.newSubscriptionId,
            input.currentCycleStartDate
          ),
          description: input.targetPlanName,
          category: "Mensalidade",
          dueDate: input.now,
          amountCents: input.targetAmountCents,
          originalAmountCents: null,
          discountAmountCents: 0,
          discountSource: null,
          discountReason: null,
          couponId: null,
          status:
            input.targetAmountCents > 0 ? FinanceChargeStatus.PENDING : FinanceChargeStatus.CANCELLED,
          paidAt: null,
        },
      })
      return
    }

    if (input.chargeHandling === PlanTransitionChargeHandling.CHARGE_DIFFERENCE) {
      const difference = input.targetAmountCents - input.currentOpenCharge.amountCents

      if (difference <= 0) {
        await input.tx.financeCharge.update({
        where: { id: input.currentOpenCharge.id },
        data: {
          subscriptionId: input.newSubscriptionId,
          planId: input.targetPlanId,
          externalKey: recurringChargeExternalKey(
            input.newSubscriptionId,
            input.currentCycleStartDate
          ),
          description: input.targetPlanName,
          category: "Mensalidade",
          dueDate: input.now,
            amountCents: input.targetAmountCents,
            originalAmountCents: null,
            discountAmountCents: 0,
            discountSource: null,
            discountReason: null,
            couponId: null,
            status:
              input.targetAmountCents > 0 ? FinanceChargeStatus.PENDING : FinanceChargeStatus.CANCELLED,
            paidAt: null,
          },
        })
        return
      }

      await input.tx.financeCharge.update({
        where: { id: input.currentOpenCharge.id },
        data: {
          subscriptionId: input.newSubscriptionId,
          planId: input.targetPlanId,
          externalKey: recurringChargeExternalKey(
            input.newSubscriptionId,
            input.currentCycleStartDate
          ),
          description: input.targetPlanName,
          category: "Mensalidade",
          dueDate: input.now,
          amountCents: input.currentOpenCharge.amountCents,
          status: FinanceChargeStatus.PENDING,
          couponId: null,
          discountAmountCents: difference,
          discountSource: "MANUAL",
          discountReason:
            "Base mantida para cobrar apenas a diferença da troca de plano.",
          originalAmountCents: input.targetAmountCents,
          paidAt: null,
        },
      })

      await input.tx.financeCharge.create({
        data: {
          tenantId: input.tenantId,
          userId: input.userId,
          studentProfileId: input.studentProfileId,
          planId: input.targetPlanId,
          description: `Ajuste de troca de plano - ${input.targetPlanName}`,
          category: "Ajuste de plano",
          amountCents: difference,
          dueDate: input.now,
          status: FinanceChargeStatus.PENDING,
        },
      })
      return
    }

    const availableCreditCents = input.currentOpenCharge.amountCents
    const appliedCreditCents = Math.min(availableCreditCents, input.targetAmountCents)
    const remainingCreditCents = Math.max(0, availableCreditCents - appliedCreditCents)
    const finalAmountCents = Math.max(0, input.targetAmountCents - appliedCreditCents)

    await input.tx.financeCharge.update({
      where: { id: input.currentOpenCharge.id },
      data: {
        subscriptionId: input.newSubscriptionId,
        planId: input.targetPlanId,
        externalKey: recurringChargeExternalKey(
          input.newSubscriptionId,
          input.currentCycleStartDate
        ),
        description: input.targetPlanName,
        category: "Mensalidade",
        dueDate: input.now,
        originalAmountCents: input.targetAmountCents,
        discountAmountCents: appliedCreditCents,
        discountSource: appliedCreditCents > 0 ? "MANUAL" : null,
        discountReason:
          appliedCreditCents > 0 ? "Crédito gerado pela troca de plano." : null,
        couponId: null,
        amountCents: finalAmountCents,
        status: finalAmountCents > 0 ? FinanceChargeStatus.PENDING : FinanceChargeStatus.CANCELLED,
        paidAt: null,
      },
    })

    if (remainingCreditCents > 0) {
      await input.tx.financeCreditBalance.upsert({
        where: {
          tenantId_userId: {
            tenantId: input.tenantId,
            userId: input.userId,
          },
        },
        update: {
          balanceCents: {
            increment: remainingCreditCents,
          },
        },
        create: {
          tenantId: input.tenantId,
          userId: input.userId,
          studentProfileId: input.studentProfileId,
          balanceCents: remainingCreditCents,
        },
      })
    }
  }

  private async applyAvailableCreditToNextCharge(input: {
    tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">
    tenantId: string
    userId: string
  }) {
    const creditBalance = await input.tx.financeCreditBalance.findUnique({
      where: {
        tenantId_userId: {
          tenantId: input.tenantId,
          userId: input.userId,
        },
      },
    })

    if (!creditBalance || creditBalance.balanceCents <= 0) {
      return
    }

    const nextCharge = await input.tx.financeCharge.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        status: FinanceChargeStatus.PENDING,
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    })

    if (!nextCharge) {
      return
    }

    const originalAmountCents = nextCharge.originalAmountCents ?? nextCharge.amountCents
    const appliedCreditCents = Math.min(creditBalance.balanceCents, originalAmountCents)
    const finalAmountCents = Math.max(0, originalAmountCents - appliedCreditCents)

    await input.tx.financeCharge.update({
      where: {
        id: nextCharge.id,
      },
      data: {
        originalAmountCents,
        discountAmountCents: appliedCreditCents,
        discountSource: appliedCreditCents > 0 ? "MANUAL" : null,
        discountReason:
          appliedCreditCents > 0 ? "Crédito acumulado de troca de plano." : null,
        amountCents: finalAmountCents,
        status: finalAmountCents > 0 ? FinanceChargeStatus.PENDING : FinanceChargeStatus.CANCELLED,
        paidAt: null,
      },
    })

    await input.tx.financeCreditBalance.update({
      where: {
        tenantId_userId: {
          tenantId: input.tenantId,
          userId: input.userId,
        },
      },
      data: {
        balanceCents: creditBalance.balanceCents - appliedCreditCents,
      },
    })
  }
}
