import type { TeacherAppAttendanceData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { resolveSessionAttendanceStatus } from "@/apps/api/src/modules/classes/domain/session-attendance"
import { ClassGroupService } from "@/apps/api/src/modules/classes/services/class-group.service"
import { toDateKey } from "@/lib/date/to-date-key"

export class TeacherAppAttendanceService {
  constructor(private readonly classGroupService = new ClassGroupService()) {}

  async getData(input: { tenantId: string; userId: string }): Promise<TeacherAppAttendanceData> {
    const actorData = await this.classGroupService.listForActor({
      tenantId: input.tenantId,
      userId: input.userId,
      role: "teacher",
    })

    const weekDates = buildCurrentWeekDates()
    const enrolledUserIds = Array.from(
      new Set(actorData.classes.flatMap((classGroup) => classGroup.enrolledStudentIds))
    )

    const students = enrolledUserIds.length
      ? await prisma.studentProfile.findMany({
          where: {
            tenantId: input.tenantId,
            status: "ACTIVE",
            userId: {
              in: enrolledUserIds,
            },
          },
          include: {
            user: true,
            modalities: {
              where: {
                status: "ACTIVE",
                modality: {
                  isActive: true,
                },
              },
              include: {
                modality: true,
              },
            },
          },
        })
      : []

    const studentsByUserId = new Map(students.map((student) => [student.userId, student]))

    const classOptions = actorData.classes.map((classGroup) => ({
      id: `${classGroup.id}:${weekDates[0] ?? toDateKey(new Date())}`,
      classGroupId: classGroup.id,
      name: classGroup.name,
      dayLabel: formatWeekdays(classGroup.schedules),
      startTime: classGroup.schedules[0]?.startTime ?? "--:--",
      endTime: classGroup.schedules[0]?.endTime ?? "--:--",
      teacherLabel: classGroup.teacherName,
      modalityLabel: classGroup.modalityName,
      studentCount: classGroup.currentStudents,
    }))

    const sessions = weekDates.flatMap((sessionDate) => {
      const weekday = toScheduleWeekday(parseDateKey(sessionDate))

      return actorData.classes.flatMap((classGroup) => {
        const matchingSchedule = classGroup.schedules.find((schedule) => schedule.weekday === weekday) ?? null
        const recordedSession =
          actorData.sessions.find(
            (session) =>
              session.classGroupId === classGroup.id && session.sessionDate.slice(0, 10) === sessionDate
          ) ?? null

        if (!matchingSchedule && !recordedSession) {
          return []
        }

        const startTime = recordedSession?.startTime ?? matchingSchedule?.startTime ?? "--:--"
        const endTime = recordedSession?.endTime ?? matchingSchedule?.endTime ?? "--:--"
        const classStudents = classGroup.enrolledStudentIds.map((userId) => {
          const student = studentsByUserId.get(userId)
          const modality = student?.modalities.find((item) => item.modalityId === classGroup.modalityId)
          const attendanceStatus = resolveSessionAttendanceStatus(recordedSession, userId)

          return {
            id: userId,
            name: student?.user.name ?? student?.user.email ?? "Aluno",
            belt: modality?.belt ?? "Branca",
            modalityName: modality?.modality.name ?? classGroup.modalityName,
            attendanceStatus,
          } as const
        })

        return [
          {
            id: recordedSession?.id ?? `${classGroup.id}:${sessionDate}`,
            classGroupId: classGroup.id,
            className: classGroup.name,
            sessionDate,
            dateLabel: formatDateLabel(sessionDate),
            dayLabel: formatWeekdayLabel(sessionDate),
            weekday,
            timeLabel: `${startTime} - ${endTime}`,
            isFinalized: Boolean(recordedSession?.finalizedAt),
            students: classStudents,
          },
        ]
      })
    })

    return {
      role: "teacher",
      teacherId: input.userId,
      classOptions,
      sessions,
    }
  }
}

function buildCurrentWeekDates() {
  const today = new Date()
  const start = new Date(today)
  start.setHours(12, 0, 0, 0)
  start.setDate(today.getDate() - today.getDay())

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return toDateKey(date)
  })
}

function parseDateKey(value: string) {
  const [year = "0", month = "1", day = "1"] = value.split("-")
  return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0)
}

function toScheduleWeekday(value: Date) {
  const weekDay = value.getDay()
  return weekDay === 0 ? 6 : weekDay - 1
}

function formatDateLabel(value: string) {
  return parseDateKey(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })
}

function formatWeekdayLabel(value: string) {
  return parseDateKey(value).toLocaleDateString("pt-BR", {
    weekday: "long",
  }).replace(/^\w/, (letter) => letter.toUpperCase())
}

function formatWeekdays(
  schedules: Array<{
    weekday: number
    startTime: string
    endTime: string
  }>
) {
  const weekDaysFull = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
  return schedules.map((item) => weekDaysFull[item.weekday] ?? "Outro").join(", ")
}
