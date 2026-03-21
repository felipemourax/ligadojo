import type { TeacherAppEvolutionData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { GraduationDashboardService } from "@/apps/api/src/modules/graduations/services/graduation-dashboard.service"
import { buildTeacherPermissions } from "@/apps/api/src/modules/teachers/domain/teacher-permissions"

function normalizeTeacherRole(roleTitle: string | null | undefined, sortOrder: number) {
  const normalized = roleTitle?.trim().toLowerCase()

  if (normalized?.includes("chefe")) {
    return "head_instructor" as const
  }

  if (normalized?.includes("assist")) {
    return "assistant" as const
  }

  if (normalized?.includes("instrutor") || normalized?.includes("professor")) {
    return "instructor" as const
  }

  if (sortOrder === 0) return "head_instructor" as const
  if (sortOrder <= 2) return "instructor" as const
  return "assistant" as const
}

interface TeacherEvolutionContext {
  teacherProfile: {
    id: string
    name: string
    sortOrder: number
    roleTitle: string | null
    modalities: Array<{
      modalityId: string
    }>
  }
  permissions: ReturnType<typeof buildTeacherPermissions>
  teacherModalityIds: Set<string>
  useModalityFilter: boolean
}

export class TeacherAppEvolutionService {
  constructor(private readonly graduationDashboardService = new GraduationDashboardService()) {}

  async getData(input: { tenantId: string; userId: string }): Promise<TeacherAppEvolutionData> {
    const context = await this.resolveTeacherContext(input)
    const dashboard = await this.graduationDashboardService.getDashboardData(input.tenantId)
    return this.buildTeacherEvolutionData({
      dashboard,
      context,
      teacherId: input.userId,
    })
  }

  async markStudentAsEligible(input: {
    tenantId: string
    userId: string
    studentActivityId: string
  }) {
    const context = await this.resolveTeacherContext(input)
    this.ensureManageGraduationsPermission(context)

    const dashboard = await this.graduationDashboardService.getDashboardData(input.tenantId)
    const data = this.buildTeacherEvolutionData({
      dashboard,
      context,
      teacherId: input.userId,
    })
    const student = data.eligibleStudents.find(
      (item) => item.studentActivityId === input.studentActivityId
    )

    if (!student) {
      throw new Error("Aluno fora do escopo do professor para graduação.")
    }

    await this.graduationDashboardService.updateEligibilityOverride({
      tenantId: input.tenantId,
      studentActivityId: input.studentActivityId,
      eligibleOverride: true,
      actor: {
        userId: input.userId,
        name: context.teacherProfile.name,
        role: "teacher",
      },
    })

    return {
      message:
        student.manualEligibleOverride === true
          ? "Aluno já estava marcado como apto para graduar."
          : "Aluno marcado como apto para graduar.",
      data: await this.getData(input),
    }
  }

  async addStudentToScheduledExam(input: {
    tenantId: string
    userId: string
    examId: string
    studentActivityId: string
  }) {
    const context = await this.resolveTeacherContext(input)
    this.ensureManageGraduationsPermission(context)

    const dashboard = await this.graduationDashboardService.getDashboardData(input.tenantId)
    const data = this.buildTeacherEvolutionData({
      dashboard,
      context,
      teacherId: input.userId,
    })
    const student = data.eligibleStudents.find(
      (item) => item.studentActivityId === input.studentActivityId
    )

    if (!student) {
      throw new Error("Aluno fora do escopo do professor para graduação.")
    }

    const exam = data.exams.find((item) => item.id === input.examId)

    if (!exam || exam.status !== "scheduled") {
      throw new Error("Selecione um exame agendado disponível para este professor.")
    }

    await this.graduationDashboardService.addCandidateToExam({
      tenantId: input.tenantId,
      examId: input.examId,
      studentActivityId: input.studentActivityId,
    })

    return {
      message: "Aluno incluído no exame agendado com sucesso.",
      data: await this.getData(input),
    }
  }

  private async resolveTeacherContext(input: {
    tenantId: string
    userId: string
  }): Promise<TeacherEvolutionContext> {
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      select: {
        id: true,
        name: true,
        sortOrder: true,
        roleTitle: true,
        modalities: {
          select: {
            modalityId: true,
          },
        },
      },
    })

    if (!teacherProfile) {
      throw new Error("Professor não encontrado para este tenant.")
    }

    const permissions = buildTeacherPermissions(
      normalizeTeacherRole(teacherProfile.roleTitle, teacherProfile.sortOrder)
    )
    const teacherModalityIds = new Set(teacherProfile.modalities.map((item) => item.modalityId))

    return {
      teacherProfile,
      permissions,
      teacherModalityIds,
      useModalityFilter: teacherModalityIds.size > 0,
    }
  }

  private buildTeacherEvolutionData(input: {
    dashboard: Awaited<ReturnType<GraduationDashboardService["getDashboardData"]>>
    context: TeacherEvolutionContext
    teacherId: string
  }): TeacherAppEvolutionData {
    const { dashboard, context, teacherId } = input

    const eligibleStudents = dashboard.eligibleStudents
      .filter(
        (student) =>
          !context.useModalityFilter ||
          (student.modalityId != null && context.teacherModalityIds.has(student.modalityId))
      )
      .map((student) => {
        const track = dashboard.tracks.find((item) => item.id === student.trackId)
        const currentLevelIndex = track?.levels.findIndex((level) => level.name === student.currentBelt) ?? -1
        const nextLevel = currentLevelIndex >= 0 ? track?.levels[currentLevelIndex + 1] ?? null : null

        return {
          studentActivityId: student.studentActivityId,
          studentId: student.studentId,
          studentName: student.studentName,
          activityLabel: student.activityLabel,
          currentBelt: student.currentBelt,
          nextBelt: nextLevel?.name ?? null,
          attendanceRate: student.attendanceRate,
          monthsAtCurrentBelt: student.monthsAtCurrentBelt,
          eligible: student.eligible,
          manualEligibleOverride: student.manualEligibleOverride,
        }
      })

    const exams = dashboard.exams
      .filter((exam) => {
        const modalityMatch =
          !context.useModalityFilter ||
          (exam.modalityId != null && context.teacherModalityIds.has(exam.modalityId))
        const evaluatorMatch =
          exam.allEvaluators ||
          exam.evaluatorNames.includes(context.teacherProfile.name) ||
          exam.evaluatorName === context.teacherProfile.name
        return modalityMatch || evaluatorMatch
      })
      .map((exam) => ({
        id: exam.id,
        title: exam.title,
        date: exam.date,
        time: exam.time,
        location: exam.location,
        status: exam.status,
        candidateCount: exam.candidateCount,
      }))

    const history = dashboard.history.filter(
      (item) => item.evaluatorName === context.teacherProfile.name
    )

    return {
      role: "teacher",
      teacherId,
      permissions: {
        manageGraduations: context.permissions.manageGraduations,
      },
      metrics: {
        eligibleStudents: eligibleStudents.filter((item) => item.eligible).length,
        scheduledExams: exams.filter((item) => item.status === "scheduled").length,
        promotions: history.length,
      },
      eligibleStudents,
      exams,
      history: history.map((item) => ({
        id: item.id,
        studentId: item.studentId,
        studentName: item.studentName,
        fromBelt: item.fromBelt,
        toBelt: item.toBelt,
        date: item.date,
        evaluatorName: item.evaluatorName,
        })),
    }
  }

  private ensureManageGraduationsPermission(context: TeacherEvolutionContext) {
    if (!context.permissions.manageGraduations) {
      throw new Error("Seu perfil não possui permissão para gerenciar graduações.")
    }
  }
}
