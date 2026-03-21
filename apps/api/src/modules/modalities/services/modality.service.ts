import {
  activityCategoryOptions,
  type ActivityCategoryValue,
  type ModalityInput,
} from "@/apps/api/src/modules/modalities/domain/modality"
import { ModalityRepository } from "@/apps/api/src/modules/modalities/repositories/modality.repository"
import { PlanRepository } from "@/apps/api/src/modules/plans/repositories/plan.repository"

function isAgeGroup(value: unknown): value is ModalityInput["ageGroups"][number] {
  return value === "kids" || value === "juvenile" || value === "adult" || value === "mixed"
}

function isActivityCategory(value: unknown): value is ActivityCategoryValue {
  return activityCategoryOptions.some((option) => option.value === value)
}

export class ModalityService {
  constructor(
    private readonly modalityRepository = new ModalityRepository(),
    private readonly planRepository = new PlanRepository()
  ) {}

  async listForTenant(tenantId: string) {
    const [modalities, activityCategories] = await Promise.all([
      this.modalityRepository.listByTenantId(tenantId),
      this.modalityRepository.listAvailableActivityCategories(tenantId),
    ])

    return { modalities, activityCategories }
  }

  async replaceForTenant(input: {
    tenantId: string
    modalities: Array<Record<string, unknown>>
    activityCategories?: unknown
  }) {
    const payload = input.modalities.map((item) => this.normalizeInput(item))
    const activityCategories = this.normalizeActivityCategories(input.activityCategories)

    if (payload.length === 0) {
      throw new Error("Cadastre pelo menos uma modalidade.")
    }

    if (activityCategories.length > 0) {
      await this.modalityRepository.replaceActivityCategories(input.tenantId, activityCategories)
    }

    const result = await this.modalityRepository.replaceForTenant(input.tenantId, payload)
    await this.modalityRepository.syncOnboardingSnapshot(input.tenantId)
    await this.planRepository.syncOnboardingSnapshot(input.tenantId)

    const impactedPlansMessage =
      result.impactedPlans.length > 0
        ? this.buildImpactedPlansMessage(result.impactedPlans)
        : null
    const studentImpactMessage = result.studentImpact
      ? this.buildStudentImpactMessage(result.studentImpact)
      : null
    const classImpactMessage = result.classImpact
      ? this.buildClassImpactMessage(result.classImpact)
      : null
    const restoreImpactMessage = result.restoreImpact
      ? this.buildRestoreImpactMessage(result.restoreImpact)
      : null

    return {
      modalities: result.modalities,
      activityCategories:
        activityCategories.length > 0
          ? activityCategories
          : await this.modalityRepository.listAvailableActivityCategories(input.tenantId),
      message: [impactedPlansMessage, studentImpactMessage, classImpactMessage, restoreImpactMessage]
        .filter(Boolean)
        .join(" ") || null,
    }
  }

  private normalizeInput(item: Record<string, unknown>): ModalityInput {
    if (!isActivityCategory(item.activityCategory)) {
      throw new Error(`Selecione a atividade principal da modalidade "${String(item.name ?? "")}".`)
    }

    if (typeof item.name !== "string" || item.name.trim().length === 0) {
      throw new Error("Toda modalidade precisa ter um nome.")
    }

    if (!Array.isArray(item.ageGroups) || item.ageGroups.length === 0 || !item.ageGroups.every(isAgeGroup)) {
      throw new Error(`Faixa etária inválida para a modalidade "${item.name}".`)
    }

    const defaultDurationMinutes = Number(item.defaultDurationMinutes)
    const defaultCapacity = Number(item.defaultCapacity)

    if (!Number.isFinite(defaultDurationMinutes) || defaultDurationMinutes <= 0) {
      throw new Error(`A duração da modalidade "${item.name}" precisa ser maior que zero.`)
    }

    if (!Number.isFinite(defaultCapacity) || defaultCapacity <= 0) {
      throw new Error(`A capacidade da modalidade "${item.name}" precisa ser maior que zero.`)
    }

    return {
      id: typeof item.id === "string" && item.id.length > 0 ? item.id : undefined,
      activityCategory: item.activityCategory,
      name: item.name.trim(),
      ageGroups: [...new Set(item.ageGroups)],
      defaultDurationMinutes,
      defaultCapacity,
    }
  }

  private normalizeActivityCategories(value: unknown) {
    if (!Array.isArray(value)) {
      return []
    }

    return Array.from(
      new Set(value.filter((item): item is ActivityCategoryValue => isActivityCategory(item)))
    )
  }

  private buildImpactedPlansMessage(
    impactedPlans: Array<{
      planId: string
      planName: string
      removedModalityNames: string[]
    }>
  ) {
    const planNames = impactedPlans.map((item) => item.planName)
    const removedModalityNames = Array.from(
      new Set(impactedPlans.flatMap((item) => item.removedModalityNames))
    )

    const plansLabel =
      planNames.length === 1
        ? `o plano "${planNames[0]}"`
        : `os planos ${planNames.map((name) => `"${name}"`).join(", ")}`

    const modalitiesLabel =
      removedModalityNames.length === 1
        ? `a modalidade "${removedModalityNames[0]}"`
        : `as modalidades ${removedModalityNames.map((name) => `"${name}"`).join(", ")}`

    const verb = removedModalityNames.length === 1 ? "foi removida" : "foram removidas"

    return `${modalitiesLabel} ${verb} dos vínculos com ${plansLabel}. Revise os planos afetados.`
  }

  private buildStudentImpactMessage(input: {
    removedModalityNames: string[]
    affectedStudentCount: number
  }) {
    const modalitiesLabel =
      input.removedModalityNames.length === 1
        ? `A modalidade "${input.removedModalityNames[0]}"`
        : `As modalidades ${input.removedModalityNames.map((name) => `"${name}"`).join(", ")}`

    const studentLabel =
      input.affectedStudentCount === 1
        ? "1 aluno teve"
        : `${input.affectedStudentCount} alunos tiveram`

    return `${modalitiesLabel} deixou de ser oferecida. ${studentLabel} esse vínculo movido para histórico.`
  }

  private buildClassImpactMessage(input: {
    removedModalityNames: string[]
    affectedClassCount: number
  }) {
    const modalitiesLabel =
      input.removedModalityNames.length === 1
        ? `A modalidade "${input.removedModalityNames[0]}"`
        : `As modalidades ${input.removedModalityNames.map((name) => `"${name}"`).join(", ")}`

    const classLabel =
      input.affectedClassCount === 1
        ? "1 turma foi desativada"
        : `${input.affectedClassCount} turmas foram desativadas`

    return `${modalitiesLabel} deixou de ser oferecida. ${classLabel} até que essa modalidade seja restaurada.`
  }

  private buildRestoreImpactMessage(input: {
    restoredModalityNames: string[]
    restoredClassCount: number
  }) {
    const modalitiesLabel =
      input.restoredModalityNames.length === 1
        ? `A modalidade "${input.restoredModalityNames[0]}"`
        : `As modalidades ${input.restoredModalityNames.map((name) => `"${name}"`).join(", ")}`

    if (input.restoredClassCount === 0) {
      return `${modalitiesLabel} foi restaurada com o mesmo vínculo interno.`
    }

    const classLabel =
      input.restoredClassCount === 1
        ? "1 turma foi reativada"
        : `${input.restoredClassCount} turmas foram reativadas`

    return `${modalitiesLabel} foi restaurada com o mesmo vínculo interno. ${classLabel}.`
  }
}
