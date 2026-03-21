import type { AgeGroupValue } from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding"
import type {
  ClassGroupInput,
  ClassSessionInput,
  ClassSessionStatusValue,
} from "@/apps/api/src/modules/classes/domain/class-group"
import { FinanceDelinquencyService } from "@/apps/api/src/modules/finance/services/finance-delinquency.service"
import { ClassGroupRepository } from "@/apps/api/src/modules/classes/repositories/class-group.repository"

function isAgeGroupValue(value: unknown): value is AgeGroupValue {
  return value === "kids" || value === "juvenile" || value === "adult" || value === "mixed"
}

function isSessionStatus(value: unknown): value is ClassSessionStatusValue {
  return value === "scheduled" || value === "cancelled"
}

export class ClassGroupService {
  constructor(
    private readonly repository = new ClassGroupRepository(),
    private readonly financeDelinquencyService = new FinanceDelinquencyService()
  ) {}

  async listForTenant(tenantId: string) {
    return this.repository.listByTenantId(tenantId)
  }

  async listForActor(input: { tenantId: string; userId: string; role: "academy_admin" | "teacher" | "student" | "platform_admin" }) {
    return this.repository.listByActor(input)
  }

  async create(input: { tenantId: string; payload: Record<string, unknown> }) {
    return this.repository.create(input.tenantId, await this.normalizeClassInput(input.tenantId, input.payload))
  }

  async update(input: { tenantId: string; classGroupId: string; payload: Record<string, unknown> }) {
    return this.repository.update(
      input.classGroupId,
      input.tenantId,
      await this.normalizeClassInput(input.tenantId, input.payload)
    )
  }

  async remove(input: { tenantId: string; classGroupId: string }) {
    return this.repository.remove(input.classGroupId, input.tenantId)
  }

  async upsertSession(input: { tenantId: string; payload: Record<string, unknown> }) {
    return this.repository.upsertSession(
      input.tenantId,
      await this.normalizeSessionInput(input.tenantId, input.payload)
    )
  }

  async upsertSessionForActor(input: {
    tenantId: string
    userId: string
    role: "academy_admin" | "teacher" | "student" | "platform_admin"
    payload: Record<string, unknown>
  }) {
    return this.repository.upsertSessionForActor(
      input.tenantId,
      input.userId,
      input.role,
      await this.normalizeSessionInput(input.tenantId, input.payload)
    )
  }

  async replaceEnrollments(input: {
    tenantId: string
    classGroupId: string
    studentUserIds: string[]
  }) {
    await this.financeDelinquencyService.assertUsersCanJoinNewClasses({
      tenantId: input.tenantId,
      userIds: input.studentUserIds,
    })

    return this.repository.replaceEnrollmentsByStudentUserIds(input)
  }

  async replaceEnrollmentsForActor(input: {
    tenantId: string
    userId: string
    role: "academy_admin" | "teacher" | "student" | "platform_admin"
    classGroupId: string
    studentUserIds: string[]
  }) {
    if (input.role === "teacher") {
      const ownsClass = await this.repository.teacherOwnsClass({
        tenantId: input.tenantId,
        userId: input.userId,
        classGroupId: input.classGroupId,
      })

      if (!ownsClass) {
        throw new Error("Você só pode gerenciar alunos das suas próprias turmas.")
      }
    }

    if (input.role === "student") {
      throw new Error("Alunos não podem gerenciar a lista completa da turma.")
    }

    await this.financeDelinquencyService.assertUsersCanJoinNewClasses({
      tenantId: input.tenantId,
      userIds: input.studentUserIds,
    })

    return this.repository.replaceEnrollmentsByStudentUserIds({
      tenantId: input.tenantId,
      classGroupId: input.classGroupId,
      studentUserIds: input.studentUserIds,
    })
  }

  async joinStudent(input: {
    tenantId: string
    classGroupId: string
    userId: string
  }) {
    await this.financeDelinquencyService.assertStudentCanJoinNewClasses({
      tenantId: input.tenantId,
      userId: input.userId,
    })

    return this.repository.addStudentEnrollmentByUserId(input)
  }

  async leaveStudent(input: {
    tenantId: string
    classGroupId: string
    userId: string
  }) {
    return this.repository.removeStudentEnrollmentByUserId(input)
  }

  private async normalizeClassInput(tenantId: string, payload: Record<string, unknown>): Promise<ClassGroupInput> {
    if (typeof payload.name !== "string" || payload.name.trim().length === 0) {
      throw new Error("Toda turma precisa ter um nome.")
    }

    if (typeof payload.modalityId !== "string" || payload.modalityId.trim().length === 0) {
      throw new Error("Selecione uma modalidade válida para a turma.")
    }

    if (typeof payload.teacherProfileId !== "string" || payload.teacherProfileId.trim().length === 0) {
      throw new Error("Selecione um professor válido para a turma.")
    }

    if (!Array.isArray(payload.ageGroups) || payload.ageGroups.length === 0 || !payload.ageGroups.every(isAgeGroupValue)) {
      throw new Error("Selecione ao menos uma faixa etária para a turma.")
    }

    const maxStudents = Number(payload.maxStudents)
    if (!Number.isFinite(maxStudents) || maxStudents <= 0) {
      throw new Error("O limite de alunos precisa ser maior que zero.")
    }

    if (typeof payload.beltRange !== "string" || payload.beltRange.trim().length === 0) {
      throw new Error("Informe o nível de faixa da turma.")
    }

    if (!Array.isArray(payload.schedules) || payload.schedules.length === 0) {
      throw new Error("Cadastre ao menos um dia da semana para a turma.")
    }

    const schedules = payload.schedules.map((item) => {
      const value = item as Record<string, unknown>
      const weekday = Number(value.weekday)
      if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
        throw new Error("Dia da semana inválido na agenda da turma.")
      }
      if (typeof value.startTime !== "string" || value.startTime.length === 0) {
        throw new Error("Horário inicial inválido na agenda da turma.")
      }
      if (typeof value.endTime !== "string" || value.endTime.length === 0) {
        throw new Error("Horário final inválido na agenda da turma.")
      }

      return {
        weekday,
        startTime: value.startTime,
        endTime: value.endTime,
      }
    })

    const modality = await this.repository.findActiveModalityById(tenantId, payload.modalityId)

    if (!modality) {
      throw new Error("A modalidade selecionada não está disponível para esta academia.")
    }

    const teacher = await this.repository.findEligibleTeacherById(tenantId, payload.teacherProfileId)

    if (!teacher) {
      throw new Error("Selecione um professor ativo para a turma.")
    }

    if (
      teacher.status === "INVITED" ||
      teacher.membership?.status === "INVITED" ||
      teacher.membership?.status === "PENDING"
    ) {
      throw new Error("Esse professor ainda não está liberado para assumir turmas.")
    }

    if (teacher.status !== "ACTIVE") {
      throw new Error("Selecione um professor ativo para a turma.")
    }

    const teacherModalityIds = teacher.modalities
      .filter((item) => item.modality.isActive)
      .map((item) => item.modalityId)

    if (teacherModalityIds.length > 0 && !teacherModalityIds.includes(modality.id)) {
      throw new Error("Esse professor não está vinculado à modalidade selecionada.")
    }

    return {
      id: typeof payload.id === "string" && payload.id.length > 0 ? payload.id : undefined,
      modalityId: modality.id,
      activityCategory: modality.activityCategory,
      teacherProfileId: teacher.id,
      name: payload.name.trim(),
      modalityName: modality.name,
      teacherName: teacher.name,
      ageGroups: [...new Set(payload.ageGroups)],
      beltRange: payload.beltRange.trim(),
      maxStudents,
      currentStudents: Number(payload.currentStudents ?? 0) || 0,
      schedules,
      status: payload.status === "archived" ? "archived" : "active",
    }
  }

  private async normalizeSessionInput(tenantId: string, payload: Record<string, unknown>): Promise<ClassSessionInput> {
    if (typeof payload.classGroupId !== "string" || payload.classGroupId.length === 0) {
      throw new Error("Sessão sem turma vinculada.")
    }
    if (typeof payload.sessionDate !== "string" || payload.sessionDate.length === 0) {
      throw new Error("Data da aula inválida.")
    }
    const weekday = Number(payload.weekday)
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      throw new Error("Dia da semana inválido.")
    }
    if (typeof payload.startTime !== "string" || payload.startTime.length === 0) {
      throw new Error("Horário inicial inválido.")
    }
    if (typeof payload.endTime !== "string" || payload.endTime.length === 0) {
      throw new Error("Horário final inválido.")
    }
    if (!isSessionStatus(payload.status)) {
      throw new Error("Status da aula inválido.")
    }

    const confirmedStudentIds = Array.isArray(payload.confirmedStudentIds)
      ? payload.confirmedStudentIds.filter((item): item is string => typeof item === "string" && item.length > 0)
      : []
    const confirmedStudentNames = Array.isArray(payload.confirmedStudentNames)
      ? payload.confirmedStudentNames.filter((item): item is string => typeof item === "string" && item.length > 0)
      : []
    const presentStudentIds = Array.isArray(payload.presentStudentIds)
      ? payload.presentStudentIds.filter((item): item is string => typeof item === "string" && item.length > 0)
      : undefined
    const absentStudentIds = Array.isArray(payload.absentStudentIds)
      ? payload.absentStudentIds.filter((item): item is string => typeof item === "string" && item.length > 0)
      : undefined
    const justifiedStudentIds = Array.isArray(payload.justifiedStudentIds)
      ? payload.justifiedStudentIds.filter((item): item is string => typeof item === "string" && item.length > 0)
      : undefined
    const isFinalized = typeof payload.isFinalized === "boolean" ? payload.isFinalized : undefined

    const activeEnrollmentUserIds = new Set(
      await this.repository.findActiveEnrollmentUserIds(payload.classGroupId, tenantId)
    )

    const allProvidedIds = [
      ...confirmedStudentIds,
      ...(presentStudentIds ?? []),
      ...(absentStudentIds ?? []),
      ...(justifiedStudentIds ?? []),
    ]

    if (allProvidedIds.some((studentUserId) => !activeEnrollmentUserIds.has(studentUserId))) {
      throw new Error("Só é possível registrar presença de alunos vinculados à turma.")
    }

    const attendanceStateByStudentId = new Map<string, "present" | "absent" | "justified">()

    for (const [status, studentIds] of [
      ["present", presentStudentIds ?? []],
      ["absent", absentStudentIds ?? []],
      ["justified", justifiedStudentIds ?? []],
    ] as const) {
      for (const studentId of studentIds) {
        const currentStatus = attendanceStateByStudentId.get(studentId)

        if (currentStatus && currentStatus !== status) {
          throw new Error("Cada aluno deve ter apenas um status de presença por aula.")
        }

        attendanceStateByStudentId.set(studentId, status)
      }
    }

    return {
      classGroupId: payload.classGroupId,
      sessionDate: payload.sessionDate,
      weekday,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: payload.status,
      confirmedStudentIds,
      confirmedStudentNames,
      presentStudentIds,
      absentStudentIds,
      justifiedStudentIds,
      isFinalized,
    }
  }
}
