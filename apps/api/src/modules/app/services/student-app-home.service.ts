import type { StudentAppHomeData } from "@/apps/api/src/modules/app/domain/student-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { StudentAppAcademyActivitiesService } from "@/apps/api/src/modules/app/services/student-app-academy-activities.service"
import {
  calculateAttendanceRate,
  listCountedAttendanceUserIds,
} from "@/apps/api/src/modules/classes/domain/session-attendance"
import { StudentDashboardService } from "@/apps/api/src/modules/students/services/student-dashboard.service"

export class StudentAppHomeService {
  constructor(
    private readonly studentDashboardService = new StudentDashboardService(),
    private readonly studentAppAcademyActivitiesService = new StudentAppAcademyActivitiesService()
  ) {}

  async listClasses(input: { tenantId: string; userId: string }) {
    const dashboard = await this.studentDashboardService.listForTenant(input.tenantId)
    const student = dashboard.students.find((item) => item.linkedUserId === input.userId)

    if (!student) {
      throw new Error("Aluno não encontrado para este tenant.")
    }

    const activeActivityCategories = Array.from(
      new Set(
        student.activities
          .filter(
            (activity): activity is typeof activity & { activityCategory: string } =>
              activity.status === "active" && typeof activity.activityCategory === "string"
          )
          .map((activity) => activity.activityCategory)
      )
    )

    const classGroups = activeActivityCategories.length
      ? await prisma.classGroup.findMany({
          where: {
            tenantId: input.tenantId,
            status: "ACTIVE",
            modality: {
              isActive: true,
              activityCategory: {
                in: activeActivityCategories,
              },
            },
          },
          include: {
            schedules: true,
            enrollments: {
              where: {
                status: "ACTIVE",
              },
              include: {
                studentProfile: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
          orderBy: [{ createdAt: "asc" }],
        })
      : []

    const sessions = classGroups.length
      ? await prisma.classSession.findMany({
          where: {
            tenantId: input.tenantId,
            classGroupId: {
              in: classGroups.map((classGroup) => classGroup.id),
            },
            OR: [
              {
                presentStudentIds: {
                  has: input.userId,
                },
              },
              {
                absentStudentIds: {
                  has: input.userId,
                },
              },
              {
                justifiedStudentIds: {
                  has: input.userId,
                },
              },
            ],
          },
          orderBy: [{ sessionDate: "desc" }],
        })
      : []

    const classes = classGroups
      .map((classGroup) => {
        const joined = classGroup.enrollments.some(
          (enrollment) => enrollment.studentProfile.userId === input.userId
        )
        const classSessions = sessions.filter((session) => session.classGroupId === classGroup.id)
        const presentCount = classSessions.filter((session) =>
          session.presentStudentIds.includes(input.userId)
        ).length
        const countedSessions = classSessions.filter((session) =>
          listCountedAttendanceUserIds(session).includes(input.userId)
        )
        const totalClasses = countedSessions.length

        return {
          id: classGroup.id,
          name: classGroup.name,
          modalityName: classGroup.modalityName,
          teacherName: classGroup.teacherName,
          dayLabel: classGroup.schedules
            .slice()
            .sort((left, right) => left.weekday - right.weekday)
            .map((schedule) => ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"][schedule.weekday] ?? "Outro")
            .join(", "),
          timeLabel: classGroup.schedules[0]
            ? `${classGroup.schedules[0].startTime} - ${classGroup.schedules[0].endTime}`
            : "--:--",
          attendanceRate: calculateAttendanceRate({
            presentCount,
            absentCount: totalClasses - presentCount,
          }),
          totalClasses,
          currentStudents: classGroup.enrollments.length,
          maxStudents: classGroup.maxStudents,
          joined,
        }
      })

    return {
      student,
      classes,
    }
  }

  async getData(input: { tenantId: string; userId: string }): Promise<StudentAppHomeData> {
    const { student, classes } = await this.listClasses(input)
    const academyActivities = await this.studentAppAcademyActivitiesService.listForTenant(input.tenantId)
    const joinedClasses = classes.filter((classGroup) => classGroup.joined)

    return {
      role: "student",
      student: {
        id: student.id,
        name: student.name,
        planName: student.planName,
        paymentStatus: student.paymentStatus,
      },
      academyActivities,
      stats: [
        {
          title: "Plano",
          value: student.planName ?? "Sem plano",
          description: student.paymentStatus === "paid" ? "Pagamento em dia" : "Verifique seus pagamentos",
        },
        {
          title: "Atividades",
          value: String(academyActivities.length),
          description: "Atividades principais oferecidas pela academia",
        },
        {
          title: "Frequência",
          value: `${joinedClasses[0]?.attendanceRate ?? 0}%`,
          description: "Recorte da sua atividade principal",
        },
      ],
      classes: joinedClasses,
    }
  }
}
