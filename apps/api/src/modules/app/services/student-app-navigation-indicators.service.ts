import { FinanceChargeStatus, StudentProfileStatus } from "@prisma/client"
import type { StudentAppNavigationIndicatorsData } from "@/apps/api/src/modules/app/domain/student-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { StudentAppEventsService } from "@/apps/api/src/modules/app/services/student-app-events.service"
import { FinanceStudentStateService } from "@/apps/api/src/modules/finance/services/finance-student-state.service"

export class StudentAppNavigationIndicatorsService {
  constructor(
    private readonly eventsService = new StudentAppEventsService(),
    private readonly financeStudentStateService = new FinanceStudentStateService()
  ) {}

  async getData(input: {
    tenantId: string
    userId: string
  }): Promise<StudentAppNavigationIndicatorsData> {
    const student = await prisma.studentProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        status: StudentProfileStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    })

    if (!student) {
      throw new Error("Aluno ativo não encontrado para esta academia.")
    }

    await this.financeStudentStateService.listForUsers({
      tenantId: input.tenantId,
      userIds: [input.userId],
    })

    const [paymentsBadgeCount, eventsData] = await Promise.all([
      prisma.financeCharge.count({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
          status: {
            in: [FinanceChargeStatus.PENDING, FinanceChargeStatus.OVERDUE],
          },
        },
      }),
      this.eventsService.getData(input),
    ])

    const eventInvitesCount = eventsData.myEvents.filter(
      (event) => event.enrollmentStatus === "invited"
    ).length
    const eventUpcomingCount = eventsData.upcomingEvents.length

    return {
      role: "student",
      studentId: student.id,
      paymentsBadgeCount,
      eventsBadgeCount: eventInvitesCount + eventUpcomingCount,
      eventInvitesCount,
      eventUpcomingCount,
    }
  }
}
