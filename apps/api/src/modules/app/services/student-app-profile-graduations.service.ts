import type { StudentAppProfileGraduationsData } from "@/apps/api/src/modules/app/domain/student-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { GraduationDashboardService } from "@/apps/api/src/modules/graduations/services/graduation-dashboard.service"
import { formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"
import { StudentDashboardService } from "@/apps/api/src/modules/students/services/student-dashboard.service"

function normalizeGraduationMonth(value: string) {
  if (/^\d{4}-\d{2}$/.test(value)) {
    return `${value}-01`
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  throw new Error("Informe uma data válida para a graduação.")
}

export class StudentAppProfileGraduationsService {
  constructor(
    private readonly studentDashboardService = new StudentDashboardService(),
    private readonly graduationDashboardService = new GraduationDashboardService()
  ) {}

  async getData(input: { tenantId: string; userId: string }): Promise<StudentAppProfileGraduationsData> {
    const dashboard = await this.studentDashboardService.listForTenant(input.tenantId)
    const student = dashboard.students.find((item) => item.linkedUserId === input.userId)

    if (!student) {
      throw new Error("Aluno não encontrado para este tenant.")
    }

    return {
      role: "student",
      studentId: student.id,
      activities: student.activities.map((activity) => ({
        id: activity.id,
        activityCategory: activity.activityCategory,
        activityLabel: activity.activityCategory
          ? formatActivityCategory(activity.activityCategory)
          : "Atividade principal",
        currentBelt: activity.belt,
        currentStripes: activity.stripes,
        beltColorHex: activity.beltColorHex,
        levels: activity.graduationLevels,
        history: [...activity.graduationHistory]
          .sort((left, right) => right.date.localeCompare(left.date))
          .map((entry) => ({
            id: entry.id,
            activityCategory: activity.activityCategory,
            activityLabel: activity.activityCategory
              ? formatActivityCategory(activity.activityCategory)
              : "Atividade principal",
            belt: extractBeltName(entry.to),
            stripes: extractStripes(entry.to),
            date: entry.date,
            notes: entry.notes ?? null,
          })),
      })),
    }
  }

  async registerGraduation(input: {
    tenantId: string
    userId: string
    payload: {
      studentActivityId: string
      toBelt: string
      toStripes: number
      graduatedAtMonth: string
      notes?: string | null
    }
  }) {
    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      include: {
        user: true,
      },
    })

    if (!studentProfile) {
      throw new Error("Aluno não encontrado para este tenant.")
    }

    await this.graduationDashboardService.registerStudentGraduation({
      tenantId: input.tenantId,
      studentId: studentProfile.id,
      payload: {
        studentActivityId: input.payload.studentActivityId,
        toBelt: input.payload.toBelt,
        toStripes: input.payload.toStripes,
        evaluatorName: studentProfile.user?.name ?? studentProfile.user?.email ?? "Aluno",
        graduatedAt: normalizeGraduationMonth(input.payload.graduatedAtMonth),
        notes: input.payload.notes ?? null,
      },
    })

    return this.getData({ tenantId: input.tenantId, userId: input.userId })
  }

  async updateGraduation(input: {
    tenantId: string
    userId: string
    graduationId: string
    payload: {
      studentActivityId: string
      toBelt: string
      toStripes: number
      graduatedAtMonth: string
      notes?: string | null
    }
  }) {
    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      include: {
        user: true,
      },
    })

    if (!studentProfile) {
      throw new Error("Aluno não encontrado para este tenant.")
    }

    await this.graduationDashboardService.updateStudentGraduation({
      tenantId: input.tenantId,
      studentId: studentProfile.id,
      graduationId: input.graduationId,
      payload: {
        studentActivityId: input.payload.studentActivityId,
        toBelt: input.payload.toBelt,
        toStripes: input.payload.toStripes,
        evaluatorName: studentProfile.user?.name ?? studentProfile.user?.email ?? "Aluno",
        graduatedAt: normalizeGraduationMonth(input.payload.graduatedAtMonth),
        notes: input.payload.notes ?? null,
      },
    })

    return this.getData({ tenantId: input.tenantId, userId: input.userId })
  }
}

function extractBeltName(value: string) {
  return value.replace(/\s+\d+\s+graus?$/i, "").trim()
}

function extractStripes(value: string) {
  const match = value.match(/(\d+)\s+graus?$/i)
  return match ? Number(match[1]) : 0
}
