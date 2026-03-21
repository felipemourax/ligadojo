import {
  FinanceChargeStatus,
  StudentProfileStatus,
  SubscriptionStatus,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { addOperationalDays, isOperationalDateBefore, toOperationalDate } from "@/apps/api/src/modules/finance/domain/finance-charge"
import { FinanceSettingsService } from "@/apps/api/src/modules/finance/services/finance-settings.service"

function isChargePastGrace(input: {
  dueDate: Date
  graceDays: number
  now: Date
}) {
  const graceDeadline = addOperationalDays(input.dueDate, input.graceDays)
  return isOperationalDateBefore(graceDeadline, toOperationalDate(input.now))
}

export interface FinanceDelinquencyUserState {
  userId: string
  isDelinquent: boolean
  blockingNewClasses: boolean
  overdueChargeIds: string[]
}

export class FinanceDelinquencyService {
  constructor(private readonly financeSettingsService = new FinanceSettingsService()) {}

  async listStates(input: {
    tenantId: string
    userIds?: string[]
  }): Promise<Map<string, FinanceDelinquencyUserState>> {
    const settings = await this.financeSettingsService.getSettings(input.tenantId)
    const now = new Date()

    const candidateUsers = input.userIds?.length
      ? Array.from(new Set(input.userIds))
      : (
          await prisma.studentProfile.findMany({
            where: {
              tenantId: input.tenantId,
              status: StudentProfileStatus.ACTIVE,
            },
            select: {
              userId: true,
            },
          })
        ).map((item) => item.userId)

    if (candidateUsers.length === 0) {
      return new Map()
    }

    const openCharges = await prisma.financeCharge.findMany({
      where: {
        tenantId: input.tenantId,
        userId: {
          in: candidateUsers,
        },
        status: {
          in: [FinanceChargeStatus.PENDING, FinanceChargeStatus.OVERDUE],
        },
        amountCents: {
          gt: 0,
        },
      },
      select: {
        id: true,
        userId: true,
        dueDate: true,
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    })

    const overdueChargeIdsByUserId = new Map<string, string[]>()

    for (const charge of openCharges) {
      if (
        !isChargePastGrace({
          dueDate: charge.dueDate,
          graceDays: settings.delinquencyGraceDays,
          now,
        })
      ) {
        continue
      }

      const current = overdueChargeIdsByUserId.get(charge.userId) ?? []
      current.push(charge.id)
      overdueChargeIdsByUserId.set(charge.userId, current)
    }

    return new Map(
      candidateUsers.map((userId) => {
        const overdueChargeIds = overdueChargeIdsByUserId.get(userId) ?? []
        const isDelinquent = overdueChargeIds.length > 0

        return [
          userId,
          {
            userId,
            isDelinquent,
            blockingNewClasses: settings.delinquencyBlocksNewClasses && isDelinquent,
            overdueChargeIds,
          },
        ]
      })
    )
  }

  async syncPolicies(input: {
    tenantId: string
    userIds?: string[]
  }) {
    const settings = await this.financeSettingsService.getSettings(input.tenantId)
    const states = await this.listStates(input)
    const delinquentUserIds = Array.from(states.values())
      .filter((state) => state.isDelinquent)
      .map((state) => state.userId)
    const regularUserIds = Array.from(states.values())
      .filter((state) => !state.isDelinquent)
      .map((state) => state.userId)

    if (delinquentUserIds.length > 0) {
      await prisma.subscription.updateMany({
        where: {
          tenantId: input.tenantId,
          userId: {
            in: delinquentUserIds,
          },
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
          },
        },
        data: {
          status: SubscriptionStatus.PAST_DUE,
        },
      })
    }

    if (regularUserIds.length > 0) {
      await prisma.subscription.updateMany({
        where: {
          tenantId: input.tenantId,
          userId: {
            in: regularUserIds,
          },
          status: SubscriptionStatus.PAST_DUE,
        },
        data: {
          status: SubscriptionStatus.ACTIVE,
        },
      })
    }

    if (settings.delinquencyRemovesCurrentClasses && delinquentUserIds.length > 0) {
      await prisma.$transaction(async (tx) => {
        const studentProfiles = await tx.studentProfile.findMany({
          where: {
            tenantId: input.tenantId,
            userId: {
              in: delinquentUserIds,
            },
            status: StudentProfileStatus.ACTIVE,
          },
          select: {
            id: true,
          },
        })

        if (studentProfiles.length === 0) {
          return
        }

        const activeEnrollments = await tx.classGroupEnrollment.findMany({
          where: {
            studentProfileId: {
              in: studentProfiles.map((item) => item.id),
            },
            status: "ACTIVE",
            classGroup: {
              tenantId: input.tenantId,
            },
          },
          select: {
            classGroupId: true,
          },
        })

        if (activeEnrollments.length === 0) {
          return
        }

        await tx.classGroupEnrollment.updateMany({
          where: {
            studentProfileId: {
              in: studentProfiles.map((item) => item.id),
            },
            status: "ACTIVE",
            classGroup: {
              tenantId: input.tenantId,
            },
          },
          data: {
            status: "INACTIVE",
            leftAt: new Date(),
          },
        })

        const classGroupIds = Array.from(
          new Set(activeEnrollments.map((enrollment) => enrollment.classGroupId))
        )

        const activeCounts = await tx.classGroupEnrollment.groupBy({
          by: ["classGroupId"],
          where: {
            classGroupId: {
              in: classGroupIds,
            },
            status: "ACTIVE",
          },
          _count: {
            _all: true,
          },
        })

        const countsByClassGroupId = new Map(
          activeCounts.map((item) => [item.classGroupId, item._count._all])
        )

        for (const classGroupId of classGroupIds) {
          await tx.classGroup.update({
            where: { id: classGroupId },
            data: {
              currentStudents: countsByClassGroupId.get(classGroupId) ?? 0,
            },
          })
        }
      })
    }

    return {
      settings,
      states,
    }
  }

  async assertStudentCanJoinNewClasses(input: {
    tenantId: string
    userId: string
  }) {
    await this.assertUsersCanJoinNewClasses({
      tenantId: input.tenantId,
      userIds: [input.userId],
    })
  }

  async assertUsersCanJoinNewClasses(input: {
    tenantId: string
    userIds: string[]
  }) {
    const { settings, states } = await this.syncPolicies({
      tenantId: input.tenantId,
      userIds: input.userIds,
    })

    if (!settings.delinquencyBlocksNewClasses) {
      return
    }

    const blockedStates = Array.from(states.values()).filter((state) => state.isDelinquent)

    if (blockedStates.length > 0) {
      throw new Error(
        blockedStates.length === 1
          ? "O acesso a novas turmas está bloqueado até regularizar os pagamentos."
          : "Existem alunos bloqueados para novas turmas até regularizarem os pagamentos."
      )
    }
  }
}
