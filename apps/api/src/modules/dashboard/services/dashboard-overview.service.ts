import {
  endOfMonth,
  endOfWeek,
  format,
  isToday,
  isYesterday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { calculateAttendanceRate } from "@/apps/api/src/modules/classes/domain/session-attendance"
import type { DashboardOverviewData } from "@/apps/api/src/modules/dashboard/domain/dashboard-overview"

function calculateTrend(current: number, previous: number) {
  if (previous <= 0) {
    return current > 0 ? 100 : 0
  }

  return Math.round(((current - previous) / previous) * 100)
}

function toJoinedAtLabel(date: Date) {
  if (isToday(date)) {
    return "Hoje"
  }

  if (isYesterday(date)) {
    return "Ontem"
  }

  const diffDays = Math.max(
    1,
    Math.floor((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / (1000 * 60 * 60 * 24))
  )

  return `${diffDays} dia${diffDays === 1 ? "" : "s"}`
}

function resolveSessionStatus(input: {
  status: "SCHEDULED" | "CANCELLED"
  finalizedAt: Date | null
  sessionDate: Date
  startTime: string
  endTime: string
}) {
  if (input.status === "CANCELLED") {
    return "cancelled" as const
  }

  if (input.finalizedAt) {
    return "completed" as const
  }

  const now = new Date()
  const sessionDate = format(input.sessionDate, "yyyy-MM-dd")
  const startAt = new Date(`${sessionDate}T${input.startTime}:00`)
  const endAt = new Date(`${sessionDate}T${input.endTime}:00`)

  if (now >= startAt && now <= endAt) {
    return "ongoing" as const
  }

  if (now > endAt) {
    return "completed" as const
  }

  return "upcoming" as const
}

function calculateAttendanceAverage(
  sessions: Array<{
    presentStudentIds: string[]
    absentStudentIds: string[]
    justifiedStudentIds: string[]
    confirmedStudentIds: string[]
  }>
) {
  const present = sessions.reduce((sum, session) => sum + session.presentStudentIds.length, 0)
  const expected = sessions.reduce((sum, session) => {
    const total = session.presentStudentIds.length + session.absentStudentIds.length
    if (total > 0) {
      return sum + total
    }

    return sum + Math.max(0, session.confirmedStudentIds.length - session.justifiedStudentIds.length)
  }, 0)

  return calculateAttendanceRate({
    presentCount: present,
    absentCount: Math.max(0, expected - present),
  })
}

export class DashboardOverviewService {
  async getOverviewData(tenantId: string): Promise<DashboardOverviewData> {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const prevMonthStart = startOfMonth(subMonths(now, 1))
    const prevMonthEnd = endOfMonth(subMonths(now, 1))
    const todayStart = startOfDay(now)
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const last15Days = subDays(now, 15)
    const last7DaysStart = subDays(todayStart, 6)
    const previous7DaysStart = subDays(todayStart, 13)
    const previous7DaysEnd = subDays(todayStart, 7)

    const [
      activeStudents,
      previousActiveStudents,
      newStudentsThisMonth,
      newStudentsPreviousMonth,
      paidChargesThisMonth,
      paidChargesPreviousMonth,
      activeStudentProfiles,
      recentStudents,
      todaySessions,
      attendanceSessions,
      overdueCharges,
      inactiveAlertUsers,
    ] = await Promise.all([
      prisma.studentProfile.count({
        where: { tenantId, status: "ACTIVE" },
      }),
      prisma.studentProfile.count({
        where: {
          tenantId,
          status: "ACTIVE",
          createdAt: { lt: monthStart },
        },
      }),
      prisma.studentProfile.count({
        where: {
          tenantId,
          createdAt: { gte: monthStart },
        },
      }),
      prisma.studentProfile.count({
        where: {
          tenantId,
          createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
        },
      }),
      prisma.financeCharge.findMany({
        where: {
          tenantId,
          status: "PAID",
          paidAt: { gte: monthStart },
        },
        select: { amountCents: true },
      }),
      prisma.financeCharge.findMany({
        where: {
          tenantId,
          status: "PAID",
          paidAt: { gte: prevMonthStart, lte: prevMonthEnd },
        },
        select: { amountCents: true },
      }),
      prisma.studentProfile.findMany({
        where: { tenantId, status: "ACTIVE" },
        select: { id: true, userId: true, createdAt: true },
      }),
      prisma.studentProfile.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          user: {
            select: { name: true, email: true },
          },
          modalities: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "asc" },
            include: {
              modality: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.classSession.findMany({
        where: {
          tenantId,
          sessionDate: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
        orderBy: [{ startTime: "asc" }],
        include: {
          classGroup: {
            select: {
              id: true,
              name: true,
              teacherName: true,
              maxStudents: true,
              currentStudents: true,
            },
          },
        },
      }),
      prisma.classSession.findMany({
        where: {
          tenantId,
          sessionDate: { gte: previous7DaysStart, lte: now },
        },
        orderBy: { sessionDate: "asc" },
        select: {
          sessionDate: true,
          presentStudentIds: true,
          absentStudentIds: true,
          justifiedStudentIds: true,
          confirmedStudentIds: true,
        },
      }),
      prisma.financeCharge.findMany({
        where: {
          tenantId,
          status: "OVERDUE",
        },
        orderBy: [{ dueDate: "asc" }],
        take: 3,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.user.findMany({
        where: {
          studentProfiles: {
            some: {
              tenantId,
              status: "ACTIVE",
              createdAt: { lte: last15Days },
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ])

    const attendanceMap = new Map<string, Date>()
    for (const session of await prisma.classSession.findMany({
      where: {
        tenantId,
        sessionDate: { gte: subDays(now, 60), lte: now },
      },
      select: {
        sessionDate: true,
        presentStudentIds: true,
      },
    })) {
      for (const studentId of session.presentStudentIds) {
        const previous = attendanceMap.get(studentId)
        if (!previous || session.sessionDate > previous) {
          attendanceMap.set(studentId, session.sessionDate)
        }
      }
    }

    const inactiveUserMap = new Map(inactiveAlertUsers.map((user) => [user.id, user.name]))

    const inactiveAlerts = activeStudentProfiles
      .filter((student) => student.createdAt <= last15Days)
      .filter((student) => {
        const lastAttendance = attendanceMap.get(student.userId)
        return !lastAttendance || lastAttendance < last15Days
      })
      .slice(0, 3)

    const attendanceSeries = Array.from({ length: 7 }, (_, index) => {
      const day = subDays(todayStart, 6 - index)
      const dayKey = format(day, "yyyy-MM-dd")
      const total = attendanceSessions
        .filter((session) => format(session.sessionDate, "yyyy-MM-dd") === dayKey)
        .reduce((sum, session) => sum + session.presentStudentIds.length, 0)

      return {
        day: format(day, "EEE", { locale: ptBR }).replace(".", "").slice(0, 3),
        attendanceCount: total,
      }
    })

    const current7DaySessions = attendanceSessions.filter((session) => session.sessionDate >= last7DaysStart)
    const previous7DaySessions = attendanceSessions.filter(
      (session) => session.sessionDate >= previous7DaysStart && session.sessionDate <= previous7DaysEnd
    )

    const revenueThisMonth = paidChargesThisMonth.reduce((sum, charge) => sum + charge.amountCents, 0)
    const revenuePreviousMonth = paidChargesPreviousMonth.reduce((sum, charge) => sum + charge.amountCents, 0)

    return {
      stats: {
        totalStudents: {
          value: activeStudents,
          trend: calculateTrend(activeStudents, previousActiveStudents),
        },
        newStudentsThisMonth: {
          value: newStudentsThisMonth,
          trend: calculateTrend(newStudentsThisMonth, newStudentsPreviousMonth),
        },
        revenueThisMonth: {
          value: revenueThisMonth / 100,
          trend: calculateTrend(revenueThisMonth, revenuePreviousMonth),
        },
        attendanceAverage: {
          value: calculateAttendanceAverage(current7DaySessions),
          trend: calculateTrend(
            calculateAttendanceAverage(current7DaySessions),
            calculateAttendanceAverage(previous7DaySessions)
          ),
        },
      },
      attendance: {
        totalLast7Days: attendanceSeries.reduce((sum, item) => sum + item.attendanceCount, 0),
        trend: calculateTrend(
          current7DaySessions.reduce((sum, session) => sum + session.presentStudentIds.length, 0),
          previous7DaySessions.reduce((sum, session) => sum + session.presentStudentIds.length, 0)
        ),
        series: attendanceSeries,
      },
      recentStudents: recentStudents.map((student) => {
        const primaryModality = student.modalities[0]

        return {
          id: student.id,
          name: student.user.name ?? student.user.email,
          belt: primaryModality?.belt ?? "Sem faixa",
          beltColorHex: null,
          modality: primaryModality?.modality.name ?? "Sem modalidade",
          joinedAtLabel: toJoinedAtLabel(student.createdAt),
        }
      }),
      todayClasses: todaySessions.map((session) => ({
        id: session.classGroup.id,
        name: session.classGroup.name,
        time: `${session.startTime} - ${session.endTime}`,
        instructor: session.classGroup.teacherName,
        students: Math.max(
          session.confirmedStudentIds.length,
          session.presentStudentIds.length + session.absentStudentIds.length,
          session.classGroup.currentStudents
        ),
        maxStudents: session.classGroup.maxStudents,
        status: resolveSessionStatus({
          status: session.status,
          finalizedAt: session.finalizedAt,
          sessionDate: session.sessionDate,
          startTime: session.startTime,
          endTime: session.endTime,
        }),
      })),
      alerts: [
        ...overdueCharges.map((charge) => ({
          id: `overdue-${charge.id}`,
          name: charge.user.name ?? charge.user.email,
          issue: `Cobrança vencida em ${format(charge.dueDate, "dd/MM")}`,
          type: "overdue" as const,
        })),
        ...inactiveAlerts.map((student) => {
          const lastAttendance = attendanceMap.get(student.userId)
          const referenceDate = lastAttendance ?? student.createdAt
          const daysWithoutAttendance = Math.max(
            15,
            Math.floor(
              (todayStart.getTime() - startOfDay(referenceDate).getTime()) / (1000 * 60 * 60 * 24)
            )
          )

          return {
            id: `inactive-${student.id}`,
            name: inactiveUserMap.get(student.userId) ?? "Aluno",
            issue: `Sem treinar há ${daysWithoutAttendance} dias`,
            type: "inactive" as const,
          }
        }),
      ].slice(0, 4),
    }
  }
}
