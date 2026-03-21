import type { PlanInput } from "@/apps/api/src/modules/plans/domain/plan"
import { PlanRepository } from "@/apps/api/src/modules/plans/repositories/plan.repository"

function isBillingCycle(value: unknown): value is PlanInput["billingCycle"] {
  return value === "monthly" || value === "quarterly" || value === "semiannual" || value === "yearly"
}

function isClassLimitKind(value: unknown): value is PlanInput["classLimitKind"] {
  return value === "unlimited" || value === "weekly"
}

export class PlanService {
  constructor(private readonly planRepository = new PlanRepository()) {}

  async listForTenant(tenantId: string) {
    return this.planRepository.listByTenantId(tenantId)
  }

  async replaceForTenant(input: {
    tenantId: string
    plans: Array<Record<string, unknown>>
  }) {
    const payload = input.plans.map((item) => this.normalizeInput(item))

    if (payload.length === 0) {
      throw new Error("Cadastre pelo menos um plano.")
    }

    const result = await this.planRepository.replaceForTenant(input.tenantId, payload)
    await this.planRepository.syncOnboardingSnapshot(input.tenantId)

    return {
      plans: result.plans,
      modalityReferences: result.modalityReferences,
      message:
        result.deactivatedPlans.length > 0
          ? this.buildDeactivatedPlansMessage(result.deactivatedPlans.map((item) => item.name))
          : null,
    }
  }

  private normalizeInput(item: Record<string, unknown>): PlanInput {
    if (typeof item.name !== "string" || item.name.trim().length === 0) {
      throw new Error("Todo plano precisa ter um nome.")
    }

    if (!isBillingCycle(item.billingCycle)) {
      throw new Error(`Ciclo inválido para o plano "${item.name}".`)
    }

    if (!isClassLimitKind(item.classLimitKind)) {
      throw new Error(`Limite de aulas inválido para o plano "${item.name}".`)
    }

    const amountCents = Number(item.amountCents)

    if (!Number.isFinite(amountCents) || amountCents < 0) {
      throw new Error(`O valor do plano "${item.name}" não pode ser negativo.`)
    }

    const weeklyFrequency =
      item.weeklyFrequency === null || item.weeklyFrequency === undefined || item.weeklyFrequency === ""
        ? null
        : Number(item.weeklyFrequency)

    if (weeklyFrequency !== null && (!Number.isFinite(weeklyFrequency) || weeklyFrequency <= 0)) {
      throw new Error(`A frequência semanal do plano "${item.name}" precisa ser maior que zero.`)
    }

    const classLimitValue =
      item.classLimitValue === null || item.classLimitValue === undefined || item.classLimitValue === ""
        ? null
        : Number(item.classLimitValue)

    if (
      item.classLimitKind === "weekly" &&
      (classLimitValue === null || !Number.isFinite(classLimitValue) || classLimitValue <= 0)
    ) {
      throw new Error(`O limite semanal do plano "${item.name}" precisa ser maior que zero.`)
    }

    if (!Array.isArray(item.includedModalityIds) || item.includedModalityIds.length === 0) {
      throw new Error(`Selecione pelo menos uma modalidade para o plano "${item.name}".`)
    }

    return {
      id: typeof item.id === "string" && item.id.length > 0 ? item.id : undefined,
      name: item.name.trim(),
      amountCents,
      billingCycle: item.billingCycle,
      weeklyFrequency,
      classLimitKind: item.classLimitKind,
      classLimitValue: item.classLimitKind === "weekly" ? classLimitValue : null,
      includedModalityIds: item.includedModalityIds.filter(
        (value): value is string => typeof value === "string" && value.length > 0
      ),
    }
  }

  private buildDeactivatedPlansMessage(planNames: string[]) {
    if (planNames.length === 1) {
      return `O plano "${planNames[0]}" possui alunos ativos e foi desativado para novas contratações. Exclua apenas depois de migrar todos os alunos.`
    }

    return `Os planos ${planNames.map((name) => `"${name}"`).join(", ")} possuem alunos ativos e foram desativados para novas contratações. Exclua apenas depois de migrar todos os alunos.`
  }
}
