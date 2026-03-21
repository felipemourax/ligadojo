import {
  BillingCycle,
  FinanceDiscountType,
  FinanceRecurringSetupSource,
  FinanceChargeStatus as PrismaFinanceChargeStatus,
  StudentProfileStatus,
  SubscriptionStatus,
  type FinancePaymentMethod as PrismaFinancePaymentMethod,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"

export class FinanceRepository {
  async listRecurringSubscriptions(tenantId: string) {
    return prisma.subscription.findMany({
      where: {
        tenantId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          include: {
            modalities: true,
          },
        },
      },
    })
  }

  async listRecurringSetups(tenantId: string) {
    return prisma.financeRecurringSetup.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            amountCents: true,
            billingCycle: true,
          },
        },
      },
      orderBy: [{ createdAt: "asc" }],
    })
  }

  async listStudentProfilesByUserIds(tenantId: string, userIds: string[]) {
    if (userIds.length === 0) {
      return []
    }

    return prisma.studentProfile.findMany({
      where: {
        tenantId,
        userId: {
          in: userIds,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    })
  }

  async listSubscriptionsForUsers(tenantId: string, userIds: string[]) {
    if (userIds.length === 0) {
      return []
    }

    return prisma.subscription.findMany({
      where: {
        tenantId,
        userId: {
          in: userIds,
        },
      },
      include: {
        plan: true,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    })
  }

  async listChargesForUsers(tenantId: string, userIds: string[]) {
    if (userIds.length === 0) {
      return []
    }

    return prisma.financeCharge.findMany({
      where: {
        tenantId,
        userId: {
          in: userIds,
        },
      },
      include: {
        coupon: {
          select: {
            code: true,
            title: true,
          },
        },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    })
  }

  async findChargeByExternalKey(externalKey: string) {
    return prisma.financeCharge.findUnique({
      where: { externalKey },
      select: {
        id: true,
        externalKey: true,
        status: true,
        amountCents: true,
        discountAmountCents: true,
      },
    })
  }

  async findChargeByExternalKeys(externalKeys: string[]) {
    if (externalKeys.length === 0) {
      return null
    }

    return prisma.financeCharge.findFirst({
      where: {
        externalKey: {
          in: externalKeys,
        },
      },
      select: {
        id: true,
        externalKey: true,
        status: true,
        amountCents: true,
        discountAmountCents: true,
      },
    })
  }

  async updateRecurringCharge(input: {
    chargeId: string
    amountCents: number
    dueDate: Date
    description: string
    category: string
    planId: string | null
    status: PrismaFinanceChargeStatus
    externalKey?: string
  }) {
    await prisma.financeCharge.update({
      where: { id: input.chargeId },
      data: {
        externalKey: input.externalKey,
        amountCents: input.amountCents,
        dueDate: input.dueDate,
        description: input.description,
        category: input.category,
        planId: input.planId,
        status: input.status,
      },
    })
  }

  async createRecurringCharge(input: {
    tenantId: string
    userId: string
    studentProfileId: string | null
    subscriptionId?: string | null
    recurringSetupId?: string | null
    planId?: string | null
    externalKey: string
    description: string
    category: string
    amountCents: number
    dueDate: Date
    status: PrismaFinanceChargeStatus
  }) {
    return prisma.financeCharge.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        studentProfileId: input.studentProfileId,
        subscriptionId: input.subscriptionId ?? null,
        recurringSetupId: input.recurringSetupId ?? null,
        planId: input.planId ?? null,
        externalKey: input.externalKey,
        description: input.description,
        category: input.category,
        amountCents: input.amountCents,
        dueDate: input.dueDate,
        status: input.status,
      },
    })
  }

  async listDashboardSnapshot(tenantId: string) {
    const [plans, charges, activeStudents, students, coupons] = await Promise.all([
      prisma.plan.findMany({
        where: { tenantId, isActive: true },
        include: {
          modalities: true,
          subscriptions: {
            where: {
              status: {
                in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
              },
            },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.financeCharge.findMany({
        where: { tenantId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          plan: {
            select: { name: true },
          },
          coupon: {
            select: {
              code: true,
              title: true,
            },
          },
        },
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
      }),
      prisma.studentProfile.count({
        where: {
          tenantId,
          status: StudentProfileStatus.ACTIVE,
        },
      }),
      prisma.studentProfile.findMany({
        where: {
          tenantId,
          status: StudentProfileStatus.ACTIVE,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ createdAt: "asc" }],
      }),
      prisma.financeCoupon.findMany({
        where: {
          tenantId,
        },
        include: {
          plan: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
      }),
    ])

    return {
      plans,
      charges,
      activeStudents,
      students,
      coupons,
    }
  }

  async listCouponsByTenant(tenantId: string) {
    return prisma.financeCoupon.findMany({
      where: {
        tenantId,
      },
      include: {
        plan: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    })
  }

  async findActiveStudentReferenceByUserId(tenantId: string, userId: string) {
    return prisma.studentProfile.findFirst({
      where: {
        tenantId,
        userId,
        status: StudentProfileStatus.ACTIVE,
      },
      select: {
        id: true,
        userId: true,
      },
    })
  }

  async findPlanById(tenantId: string, planId: string) {
    return prisma.plan.findFirst({
      where: {
        id: planId,
        tenantId,
      },
      select: {
        id: true,
        name: true,
        amountCents: true,
        billingCycle: true,
      },
    })
  }

  async findLatestActiveSubscriptionByUserId(tenantId: string, userId: string) {
    return prisma.subscription.findFirst({
      where: {
        tenantId,
        userId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.PENDING],
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
    })
  }

  async findCouponByCode(tenantId: string, code: string) {
    return prisma.financeCoupon.findFirst({
      where: {
        tenantId,
        code,
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async createCoupon(input: {
    tenantId: string
    code: string
    title: string
    description: string | null
    discountType: FinanceDiscountType
    amountCents: number | null
    percentageOff: number | null
    appliesToPlanId: string | null
    maxRedemptions: number | null
    startsAt: Date | null
    endsAt: Date | null
    createdByUserId: string | null
  }) {
    return prisma.financeCoupon.create({
      data: input,
    })
  }

  async createManualCharge(input: {
    tenantId: string
    userId: string
    studentProfileId: string | null
    planId: string | null
    description: string
    category: string
    amountCents: number
    dueDate: Date
  }) {
    return prisma.financeCharge.create({
      data: {
        ...input,
        status: PrismaFinanceChargeStatus.PENDING,
      },
    })
  }

  async findCreditBalance(tenantId: string, userId: string) {
    return prisma.financeCreditBalance.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    })
  }

  async updateCreditBalance(input: {
    tenantId: string
    userId: string
    balanceCents: number
  }) {
    return prisma.financeCreditBalance.update({
      where: {
        tenantId_userId: {
          tenantId: input.tenantId,
          userId: input.userId,
        },
      },
      data: {
        balanceCents: input.balanceCents,
      },
    })
  }

  async createSubscription(input: {
    tenantId: string
    userId: string
    planId: string
    startDate: Date
    billingDay: number
  }) {
    return prisma.subscription.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        planId: input.planId,
        status: SubscriptionStatus.ACTIVE,
        startDate: input.startDate,
        billingDay: input.billingDay,
      },
    })
  }

  async createRecurringSetup(input: {
    tenantId: string
    userId: string
    studentProfileId: string | null
    planId: string | null
    source: FinanceRecurringSetupSource
    description: string
    category: string
    amountCents: number
    billingCycle: BillingCycle
    billingDay: number
    startDate: Date
  }) {
    return prisma.financeRecurringSetup.create({
      data: input,
    })
  }

  async findChargeById(tenantId: string, chargeId: string) {
    return prisma.financeCharge.findFirst({
      where: {
        id: chargeId,
        tenantId,
      },
      select: {
        id: true,
        subscriptionId: true,
        status: true,
        amountCents: true,
        originalAmountCents: true,
        discountAmountCents: true,
        couponId: true,
      },
    })
  }

  async findNextOpenChargeForUser(tenantId: string, userId: string) {
    return prisma.financeCharge.findFirst({
      where: {
        tenantId,
        userId,
        status: {
          in: [PrismaFinanceChargeStatus.PENDING, PrismaFinanceChargeStatus.OVERDUE],
        },
      },
      include: {
        coupon: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    })
  }

  async markChargePaid(input: {
    chargeId: string
    paymentMethod: PrismaFinancePaymentMethod
    paidAt: Date
  }) {
    await prisma.financeCharge.update({
      where: { id: input.chargeId },
      data: {
        status: PrismaFinanceChargeStatus.PAID,
        paymentMethod: input.paymentMethod,
        paidAt: input.paidAt,
      },
    })
  }

  async applyCouponToCharge(input: {
    chargeId: string
    couponId: string
    originalAmountCents: number
    discountAmountCents: number
    finalAmountCents: number
    resultingStatus: PrismaFinanceChargeStatus
    paidAt: Date | null
  }) {
    await prisma.$transaction([
      prisma.financeCharge.update({
        where: {
          id: input.chargeId,
        },
        data: {
          couponId: input.couponId,
          originalAmountCents: input.originalAmountCents,
          discountAmountCents: input.discountAmountCents,
          discountSource: "COUPON",
          amountCents: input.finalAmountCents,
          status: input.resultingStatus,
          paidAt: input.paidAt,
        },
      }),
      prisma.financeCoupon.update({
        where: {
          id: input.couponId,
        },
        data: {
          redemptionCount: {
            increment: 1,
          },
        },
      }),
    ])
  }

  async applyManualDiscountToCharge(input: {
    chargeId: string
    originalAmountCents: number
    discountAmountCents: number
    finalAmountCents: number
    discountReason: string | null
    resultingStatus: PrismaFinanceChargeStatus
    paidAt: Date | null
  }) {
    await prisma.financeCharge.update({
      where: {
        id: input.chargeId,
      },
      data: {
        originalAmountCents: input.originalAmountCents,
        discountAmountCents: input.discountAmountCents,
        discountSource: "MANUAL",
        discountReason: input.discountReason,
        amountCents: input.finalAmountCents,
        status: input.resultingStatus,
        paidAt: input.paidAt,
      },
    })
  }
}
