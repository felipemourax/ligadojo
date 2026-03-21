import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  calculateAttendanceRate,
  listCountedAttendanceUserIds,
} from "@/apps/api/src/modules/classes/domain/session-attendance"

interface AttendanceRateInput {
  tenantId: string
  userIds: string[]
  classGroupIds?: string[]
}

export class AttendanceRateService {
  async getRatesByUserIds(input: AttendanceRateInput) {
    const userIds = Array.from(new Set(input.userIds.filter((value) => value.trim().length > 0)))

    if (userIds.length === 0) {
      return new Map<string, number>()
    }

    const classGroupIds = Array.from(new Set(input.classGroupIds ?? []))

    const sessions = await prisma.classSession.findMany({
      where: {
        tenantId: input.tenantId,
        ...(classGroupIds.length > 0
          ? {
              classGroupId: {
                in: classGroupIds,
              },
            }
          : {}),
        OR: [
          {
            presentStudentIds: {
              hasSome: userIds,
            },
          },
          {
            absentStudentIds: {
              hasSome: userIds,
            },
          },
          {
            justifiedStudentIds: {
              hasSome: userIds,
            },
          },
        ],
      },
      select: {
        presentStudentIds: true,
        absentStudentIds: true,
        justifiedStudentIds: true,
      },
    })

    const summaryByUserId = new Map(
      userIds.map((userId) => [
        userId,
        {
          present: 0,
          total: 0,
        },
      ])
    )

    for (const session of sessions) {
      const involvedUserIds = new Set(listCountedAttendanceUserIds(session))

      for (const userId of involvedUserIds) {
        const summary = summaryByUserId.get(userId)

        if (!summary) {
          continue
        }

        summary.total += 1

        if (session.presentStudentIds.includes(userId)) {
          summary.present += 1
        }
      }
    }

    return new Map(
      Array.from(summaryByUserId.entries()).map(([userId, summary]) => [
        userId,
        calculateAttendanceRate({
          presentCount: summary.present,
          absentCount: summary.total - summary.present,
        }),
      ])
    )
  }
}
