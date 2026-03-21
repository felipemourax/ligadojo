import {
  AgeGroup,
  BillingCycle,
  OnboardingStatus,
  PaymentGateway,
  PlanClassLimitKind,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { activityCategoryOptions } from "@/apps/api/src/modules/modalities/domain/modality"
import { TenantOnboardingRepository } from "@/apps/api/src/modules/onboarding/repositories/tenant-onboarding.repository"
import type {
  AcademyInfoStepData,
  AgeGroupValue,
  BrandingStepData,
  ClassStructureStepData,
  LocationStepData,
  OnboardingStepKey,
  PaymentsStepData,
  PlansStepData,
  TenantOnboardingEntity,
} from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding"

const REQUIRED_STEPS: OnboardingStepKey[] = [
  "academy_info",
  "location",
  "class_structure",
  "plans",
  "branding",
  "payments",
]

const supportedActivityCategories = new Set(activityCategoryOptions.map((option) => option.value))
const supportedPaymentGateways = new Set<PaymentsStepData["gateway"] | "">([
  "",
  "mercado_pago",
  "asaas",
  "stripe",
])

function toAgeGroup(value: AgeGroupValue) {
  switch (value) {
    case "kids":
      return AgeGroup.KIDS
    case "juvenile":
      return AgeGroup.JUVENILE
    case "adult":
      return AgeGroup.ADULT
    case "mixed":
      return AgeGroup.MIXED
  }
}

function fromAgeGroup(value: AgeGroup): AgeGroupValue {
  switch (value) {
    case AgeGroup.KIDS:
      return "kids"
    case AgeGroup.JUVENILE:
      return "juvenile"
    case AgeGroup.ADULT:
      return "adult"
    case AgeGroup.MIXED:
      return "mixed"
  }
}

function toAgeGroups(values: AgeGroupValue[]) {
  return values.map((value) => toAgeGroup(value))
}

function fromAgeGroups(values: AgeGroup[]) {
  return values.map((value) => fromAgeGroup(value))
}

function toBillingCycle(value: PlansStepData["plans"][number]["billingCycle"]) {
  switch (value) {
    case "monthly":
      return BillingCycle.MONTHLY
    case "quarterly":
      return BillingCycle.QUARTERLY
    case "semiannual":
      return BillingCycle.SEMIANNUAL
    case "yearly":
      return BillingCycle.YEARLY
  }
}

function toPlanClassLimitKind(value: PlansStepData["plans"][number]["classLimitKind"]) {
  return value === "weekly" ? PlanClassLimitKind.WEEKLY : PlanClassLimitKind.UNLIMITED
}

function toPaymentGateway(value: PaymentsStepData["gateway"]) {
  switch (value) {
    case "mercado_pago":
      return PaymentGateway.MERCADO_PAGO
    case "asaas":
      return PaymentGateway.ASAAS
    case "stripe":
      return PaymentGateway.STRIPE
    default:
      return null
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function hasAtLeastOneMethod(value: PaymentsStepData | undefined) {
  return Boolean(value && value.acceptedMethods.length > 0)
}

function hasOnlyExistingModalityIds(includedModalityIds: string[], availableModalityIds: Set<string>) {
  return (
    includedModalityIds.length > 0 &&
    includedModalityIds.every((modalityId) => availableModalityIds.has(modalityId))
  )
}

function isSupportedActivityCategory(value: string) {
  return supportedActivityCategories.has(value as (typeof activityCategoryOptions)[number]["value"])
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

export class TenantOnboardingValidationError extends Error {
  constructor(
    public readonly code: "invalid_step_payload",
    message: string
  ) {
    super(message)
    this.name = "TenantOnboardingValidationError"
  }
}

export class TenantOnboardingService {
  constructor(
    private readonly tenantOnboardingRepository = new TenantOnboardingRepository()
  ) {}

  async getTenantOnboarding(tenantId: string) {
    const onboarding = await this.tenantOnboardingRepository.findByTenantId(tenantId)

    if (!onboarding) {
      return null
    }

    return this.enrichOnboarding(onboarding, tenantId, false)
  }

  async saveStep(input: {
    tenantId: string
    step: OnboardingStepKey
    data: Record<string, unknown>
    currentStep?: number
  }) {
    await this.validateStepData(input)

    const onboarding = await this.tenantOnboardingRepository.upsertStep(input)
    await this.syncTenantFromOnboarding(input.tenantId, input.step, onboarding)

    if (input.step === "academy_info") {
      await this.reconcileClassStructureWithCurrentActivityCategories(input.tenantId)
    }

    if (input.step === "class_structure") {
      await this.ensureSeededPlansFromModalities(input.tenantId)
      await this.reconcilePlansWithCurrentModalities(input.tenantId)
    }

    const refreshedOnboarding = await this.tenantOnboardingRepository.findByTenantId(input.tenantId)
    return this.enrichOnboarding(refreshedOnboarding ?? onboarding, input.tenantId, true)
  }

  private async validateStepData(input: {
    tenantId: string
    step: OnboardingStepKey
    data: Record<string, unknown>
  }) {
    switch (input.step) {
      case "academy_info":
        this.validateAcademyInfoStep(input.data)
        return
      case "location":
        this.validateLocationStep(input.data)
        return
      case "class_structure":
        this.validateClassStructureStep(input.data)
        return
      case "plans":
        await this.validatePlansStep(input.tenantId, input.data)
        return
      case "branding":
        this.validateBrandingStep(input.data)
        return
      case "payments":
        this.validatePaymentsStep(input.data)
        return
    }
  }

  async complete(tenantId: string) {
    const onboarding = await this.getTenantOnboarding(tenantId)

    if (!onboarding) {
      return null
    }

    const hasRequiredSteps = REQUIRED_STEPS.every((step) => onboarding.stepValidity[step])

    if (!hasRequiredSteps) {
      return {
        onboarding,
        canComplete: false,
      }
    }

    const completed = await this.tenantOnboardingRepository.markCompleted({
      tenantId,
      currentStep: REQUIRED_STEPS.length,
    })

    return {
      onboarding: await this.enrichOnboarding(completed, tenantId, true),
      canComplete: true,
    }
  }

  private async enrichOnboarding(
    onboarding: TenantOnboardingEntity,
    tenantId: string,
    persistCompletedSteps = false
  ) {
    const [modalities, plans] = await Promise.all([
      prisma.modality.findMany({
        where: { tenantId, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.plan.findMany({
        where: { tenantId, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ])

    const enriched = {
      ...onboarding,
        references: {
          modalities: modalities.map((item) => ({
            id: item.id,
            activityCategory: item.activityCategory ?? undefined,
            name: item.name,
            ageGroups: fromAgeGroups(item.ageGroups),
          })),
        plans: plans.map((item) => ({
          id: item.id,
          name: item.name,
        })),
      },
    }

    const stepValidity = this.computeStepValidity(enriched)
    const derivedCompletedSteps = Object.entries(stepValidity)
      .filter(([, isValid]) => isValid)
      .map(([step]) => step as OnboardingStepKey)
    const wasCompleted = Boolean(onboarding.completedAt || onboarding.status === "completed")
    const completedSteps = wasCompleted ? [...REQUIRED_STEPS] : derivedCompletedSteps
    const blockingSteps = wasCompleted ? [] : REQUIRED_STEPS.filter((step) => !stepValidity[step])
    const effectiveStatus: TenantOnboardingEntity["status"] = wasCompleted
      ? "completed"
      : completedSteps.length > 0
        ? "in_progress"
        : "draft"

    const withValidity = {
      ...enriched,
      status: effectiveStatus,
      completedSteps,
      stepValidity,
      blockingSteps,
    }

    if (persistCompletedSteps) {
      await this.tenantOnboardingRepository.syncCompletedSteps({
        tenantId,
        completedSteps,
        status:
          effectiveStatus === "completed"
            ? "completed"
            : completedSteps.length > 0
              ? "in_progress"
              : "draft",
      })
    }

    return withValidity
  }

  private computeStepValidity(onboarding: TenantOnboardingEntity) {
    const availableModalityIds = new Set(onboarding.references.modalities.map((item) => item.id))

    return {
      academy_info: Boolean(
        isNonEmptyString(onboarding.academyInfo?.legalName) &&
          isNonEmptyString(onboarding.academyInfo?.phone) &&
          isNonEmptyString(onboarding.academyInfo?.contactEmail) &&
          Boolean(onboarding.academyInfo?.activityCategories?.length)
      ),
      location: Boolean(
        isNonEmptyString(onboarding.location?.zipCode) &&
          isNonEmptyString(onboarding.location?.street) &&
          isNonEmptyString(onboarding.location?.city) &&
          isNonEmptyString(onboarding.location?.state)
      ),
      class_structure: Boolean(
        onboarding.classStructure?.modalities.length &&
          onboarding.classStructure.modalities.every(
            (item) =>
              isNonEmptyString(item.name) &&
              item.defaultDurationMinutes > 0 &&
              item.defaultCapacity > 0
          )
      ),
      plans: Boolean(
        onboarding.plansSetup?.plans.length &&
          onboarding.plansSetup.plans.every(
            (item) =>
              isNonEmptyString(item.name) &&
              item.amountCents >= 0 &&
              hasOnlyExistingModalityIds(item.includedModalityIds, availableModalityIds) &&
              (item.classLimitKind === "unlimited" || (item.classLimitValue ?? 0) > 0)
          )
      ),
      branding: Boolean(
        isNonEmptyString(onboarding.brandingSetup?.appName) &&
          isNonEmptyString(onboarding.brandingSetup?.primaryColor) &&
          isNonEmptyString(onboarding.brandingSetup?.secondaryColor)
      ),
      payments: hasAtLeastOneMethod(onboarding.paymentsSetup),
    } satisfies Record<OnboardingStepKey, boolean>
  }

  private async syncTenantFromOnboarding(
    tenantId: string,
    step: OnboardingStepKey,
    onboarding: TenantOnboardingEntity
  ) {
    switch (step) {
      case "academy_info":
        await this.syncAcademyInfo(tenantId, onboarding.academyInfo)
        return
      case "location":
        await this.syncLocation(tenantId, onboarding.location)
        return
      case "class_structure":
        await this.syncClassStructure(tenantId, onboarding.classStructure)
        return
      case "plans":
        await this.syncPlans(tenantId, onboarding.plansSetup)
        return
      case "branding":
        await this.syncBranding(tenantId, onboarding.brandingSetup)
        return
      case "payments":
        await this.syncPayments(tenantId, onboarding.paymentsSetup)
        return
    }
  }

  private validateAcademyInfoStep(data: Record<string, unknown>) {
    const legalName = typeof data.legalName === "string" ? data.legalName.trim() : ""
    const phone = typeof data.phone === "string" ? data.phone.replace(/\D/g, "") : ""
    const contactEmail = typeof data.contactEmail === "string" ? data.contactEmail.trim() : ""
    const foundedYear = typeof data.foundedYear === "string" ? data.foundedYear.trim() : ""
    const activityCategories = Array.isArray(data.activityCategories)
      ? data.activityCategories.filter((value): value is string => typeof value === "string")
      : []

    if (!legalName || phone.length < 10 || !isValidEmail(contactEmail)) {
      throw new TenantOnboardingValidationError(
        "invalid_step_payload",
        "Academy info inválido. Revise nome, telefone e e-mail."
      )
    }

    if (activityCategories.length === 0 || activityCategories.some((value) => !isSupportedActivityCategory(value))) {
      throw new TenantOnboardingValidationError(
        "invalid_step_payload",
        "Academy info inválido. Selecione atividades principais válidas."
      )
    }

    if (foundedYear && !/^\d{4}$/.test(foundedYear)) {
      throw new TenantOnboardingValidationError(
        "invalid_step_payload",
        "Academy info inválido. O ano de fundação deve ter 4 dígitos."
      )
    }
  }

  private validateLocationStep(data: Record<string, unknown>) {
    const zipCode = typeof data.zipCode === "string" ? data.zipCode.trim() : ""
    const street = typeof data.street === "string" ? data.street.trim() : ""
    const city = typeof data.city === "string" ? data.city.trim() : ""
    const state = typeof data.state === "string" ? data.state.trim() : ""

    if (!zipCode || !street || !city || !state) {
      throw new TenantOnboardingValidationError(
        "invalid_step_payload",
        "Localização inválida. Preencha CEP, rua, cidade e estado."
      )
    }
  }

  private validateClassStructureStep(data: Record<string, unknown>) {
    const modalities = Array.isArray(data.modalities) ? data.modalities : []

    if (modalities.length === 0) {
      throw new TenantOnboardingValidationError(
        "invalid_step_payload",
        "Estrutura de turmas inválida. Cadastre ao menos uma modalidade."
      )
    }

    for (const modality of modalities) {
      if (!modality || typeof modality !== "object" || Array.isArray(modality)) {
        throw new TenantOnboardingValidationError(
          "invalid_step_payload",
          "Estrutura de turmas inválida. Cada modalidade precisa ter um formato válido."
        )
      }

      const item = modality as Record<string, unknown>
      const name = typeof item.name === "string" ? item.name.trim() : ""
      const activityCategory = typeof item.activityCategory === "string" ? item.activityCategory.trim() : ""
      const ageGroups = Array.isArray(item.ageGroups) ? item.ageGroups : []
      const defaultDurationMinutes = Number(item.defaultDurationMinutes)
      const defaultCapacity = Number(item.defaultCapacity)

      if (!name || !isSupportedActivityCategory(activityCategory)) {
        throw new TenantOnboardingValidationError(
          "invalid_step_payload",
          "Estrutura de turmas inválida. Use uma atividade principal suportada e um nome de modalidade."
        )
      }

      if (
        ageGroups.length === 0 ||
        !ageGroups.every(
          (value) => value === "kids" || value === "juvenile" || value === "adult" || value === "mixed"
        )
      ) {
        throw new TenantOnboardingValidationError(
          "invalid_step_payload",
          "Estrutura de turmas inválida. As faixas etárias informadas não são válidas."
        )
      }

      if (!Number.isFinite(defaultDurationMinutes) || defaultDurationMinutes <= 0 || !Number.isFinite(defaultCapacity) || defaultCapacity <= 0) {
        throw new TenantOnboardingValidationError(
          "invalid_step_payload",
          "Estrutura de turmas inválida. Duração e capacidade devem ser maiores que zero."
        )
      }
    }
  }

  private async validatePlansStep(tenantId: string, data: Record<string, unknown>) {
    const plans = Array.isArray(data.plans) ? data.plans : []

    if (plans.length === 0) {
      throw new TenantOnboardingValidationError(
        "invalid_step_payload",
        "Planos inválidos. Cadastre ao menos um plano."
      )
    }

    const validModalityIds = new Set(
      (
        await prisma.modality.findMany({
          where: { tenantId, isActive: true },
          select: { id: true },
        })
      ).map((item) => item.id)
    )

    for (const plan of plans) {
      if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
        throw new TenantOnboardingValidationError(
          "invalid_step_payload",
          "Planos inválidos. Revise os dados enviados."
        )
      }

      const item = plan as Record<string, unknown>
      const name = typeof item.name === "string" ? item.name.trim() : ""
      const amountCents = Number(item.amountCents)
      const billingCycle = item.billingCycle
      const classLimitKind = item.classLimitKind
      const classLimitValue = item.classLimitValue == null || item.classLimitValue === "" ? null : Number(item.classLimitValue)
      const includedModalityIds = Array.isArray(item.includedModalityIds)
        ? item.includedModalityIds.filter((value): value is string => typeof value === "string")
        : []

      if (!name || !Number.isFinite(amountCents) || amountCents < 0) {
        throw new TenantOnboardingValidationError(
          "invalid_step_payload",
          "Planos inválidos. Todo plano precisa ter nome e valor maior ou igual a zero."
        )
      }

      if (
        billingCycle !== "monthly" &&
        billingCycle !== "quarterly" &&
        billingCycle !== "semiannual" &&
        billingCycle !== "yearly"
      ) {
        throw new TenantOnboardingValidationError(
          "invalid_step_payload",
          "Planos inválidos. O ciclo de cobrança informado não é suportado."
        )
      }

      if (classLimitKind !== "unlimited" && classLimitKind !== "weekly") {
        throw new TenantOnboardingValidationError(
          "invalid_step_payload",
          "Planos inválidos. O limite de aulas informado não é suportado."
        )
      }

      if (!hasOnlyExistingModalityIds(includedModalityIds, validModalityIds)) {
        throw new TenantOnboardingValidationError(
          "invalid_step_payload",
          "Planos inválidos. Selecione modalidades existentes para o plano."
        )
      }

      if (classLimitKind === "weekly" && (!Number.isFinite(classLimitValue) || (classLimitValue ?? 0) <= 0)) {
        throw new TenantOnboardingValidationError(
          "invalid_step_payload",
          "Planos inválidos. O limite semanal precisa ser maior que zero."
        )
      }
    }
  }

  private validateBrandingStep(data: Record<string, unknown>) {
    const appName = typeof data.appName === "string" ? data.appName.trim() : ""
    const primaryColor = typeof data.primaryColor === "string" ? data.primaryColor.trim() : ""
    const secondaryColor = typeof data.secondaryColor === "string" ? data.secondaryColor.trim() : ""

    if (!appName || !isHexColor(primaryColor) || !isHexColor(secondaryColor)) {
      throw new TenantOnboardingValidationError(
        "invalid_step_payload",
        "Branding inválido. Revise nome do app e cores."
      )
    }
  }

  private validatePaymentsStep(data: Record<string, unknown>) {
    const acceptedMethods = Array.isArray(data.acceptedMethods)
      ? data.acceptedMethods.filter((value): value is string => typeof value === "string")
      : []
    const gateway = typeof data.gateway === "string" ? data.gateway : ""

    if (
      acceptedMethods.length === 0 ||
      !acceptedMethods.every((value) => value === "pix" || value === "card" || value === "boleto")
    ) {
      throw new TenantOnboardingValidationError(
        "invalid_step_payload",
        "Pagamentos inválidos. Selecione ao menos uma forma de pagamento suportada."
      )
    }

    if (!supportedPaymentGateways.has(gateway as PaymentsStepData["gateway"] | "")) {
      throw new TenantOnboardingValidationError(
        "invalid_step_payload",
        "Pagamentos inválidos. O gateway informado não é suportado."
      )
    }
  }

  private async syncAcademyInfo(tenantId: string, academyInfo?: AcademyInfoStepData) {
    if (!academyInfo) {
      return
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        legalName: academyInfo.legalName || "Academia",
        displayName: academyInfo.legalName || "Academia",
        profile: {
          upsert: {
            update: {
              phone: academyInfo.phone || null,
              contactEmail: academyInfo.contactEmail || null,
              description: null,
              document: academyInfo.hasNoDocument ? null : academyInfo.document || null,
              foundedYear: academyInfo.foundedYear ? Number(academyInfo.foundedYear) : null,
              website: null,
            },
            create: {
              phone: academyInfo.phone || null,
              contactEmail: academyInfo.contactEmail || null,
              description: null,
              document: academyInfo.hasNoDocument ? null : academyInfo.document || null,
              foundedYear: academyInfo.foundedYear ? Number(academyInfo.foundedYear) : null,
              website: null,
            },
          },
        },
      },
    })
  }

  private async syncLocation(tenantId: string, location?: LocationStepData) {
    if (!location) {
      return
    }

    await prisma.tenantLocation.upsert({
      where: { tenantId },
      update: {
        zipCode: location.zipCode || null,
        street: location.street || null,
        number: location.number || null,
        complement: location.complement || null,
        city: location.city || null,
        state: location.state || null,
        country: location.country || "Brasil",
      },
      create: {
        tenantId,
        zipCode: location.zipCode || null,
        street: location.street || null,
        number: location.number || null,
        complement: location.complement || null,
        city: location.city || null,
        state: location.state || null,
        country: location.country || "Brasil",
      },
    })
  }

  private async syncClassStructure(tenantId: string, classStructure?: ClassStructureStepData) {
    if (!classStructure) {
      return
    }

    await prisma.$transaction(async (tx) => {
      await tx.modality.deleteMany({ where: { tenantId } })

      if (!classStructure.modalities.length) {
        return
      }

      await tx.modality.createMany({
        data: classStructure.modalities.map((item, index) => ({
          tenantId,
          activityCategory: item.activityCategory ?? null,
          name: item.name,
          ageGroups: toAgeGroups(item.ageGroups),
          defaultDurationMinutes: item.defaultDurationMinutes,
          defaultCapacity: item.defaultCapacity,
          sortOrder: index,
        })),
      })
    })
  }

  private async ensureSeededPlansFromModalities(tenantId: string) {
    const onboarding = await this.tenantOnboardingRepository.findByTenantId(tenantId)

    if (onboarding?.plansSetup?.plans.length) {
      return
    }

    const modalities = await prisma.modality.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    })

    if (modalities.length === 0) {
      return
    }

    await prisma.tenantOnboarding.update({
      where: { tenantId },
      data: {
        plansSetupJson: {
          plans: [
            {
              clientId: `seed-plan-${tenantId}`,
              name: "Plano mensal",
              amountCents: 0,
              billingCycle: "monthly",
              weeklyFrequency: 3,
              classLimitKind: "unlimited",
              classLimitValue: null,
              includedModalityIds: modalities.map((item) => item.id),
            },
          ],
        },
      },
    })
  }

  private async reconcileClassStructureWithCurrentActivityCategories(tenantId: string) {
    const onboarding = await this.tenantOnboardingRepository.findByTenantId(tenantId)

    if (!onboarding?.classStructure?.modalities.length) {
      return
    }

    const activityCategories = (onboarding.academyInfo?.activityCategories ?? []).filter(
      (value): value is string => typeof value === "string" && isSupportedActivityCategory(value)
    )

    if (activityCategories.length === 0) {
      return
    }

    const fallbackActivityCategory = activityCategories[0]
    const normalizedModalities = onboarding.classStructure.modalities.map((item) => {
      const normalizedActivityCategory = isSupportedActivityCategory(item.activityCategory ?? "")
        && activityCategories.includes(item.activityCategory ?? "")
        ? item.activityCategory
        : fallbackActivityCategory

      return normalizedActivityCategory === item.activityCategory
        ? item
        : {
            ...item,
            activityCategory: normalizedActivityCategory,
          }
    })

    const hasChanges = normalizedModalities.some(
      (item, index) => item.activityCategory !== onboarding.classStructure?.modalities[index]?.activityCategory
    )

    if (!hasChanges) {
      return
    }

    await this.tenantOnboardingRepository.upsertStep({
      tenantId,
      step: "class_structure",
      data: {
        modalities: normalizedModalities,
      },
      currentStep: onboarding.currentStep,
    })

    await this.syncClassStructure(tenantId, {
      modalities: normalizedModalities,
    })
  }

  private async reconcilePlansWithCurrentModalities(tenantId: string) {
    const onboarding = await this.tenantOnboardingRepository.findByTenantId(tenantId)

    if (!onboarding?.plansSetup?.plans.length) {
      return
    }

    const validModalityIds = new Set(
      (
        await prisma.modality.findMany({
          where: { tenantId, isActive: true },
          select: { id: true },
        })
      ).map((item) => item.id)
    )

    const normalizedPlans = onboarding.plansSetup.plans.map((plan) => ({
      ...plan,
      includedModalityIds: plan.includedModalityIds.filter((modalityId) => validModalityIds.has(modalityId)),
    }))

    const hasChanges = normalizedPlans.some(
      (plan, index) =>
        plan.includedModalityIds.length !== onboarding.plansSetup?.plans[index]?.includedModalityIds.length
    )

    if (!hasChanges) {
      return
    }

    await this.tenantOnboardingRepository.upsertStep({
      tenantId,
      step: "plans",
      data: {
        plans: normalizedPlans,
      },
      currentStep: onboarding.currentStep,
    })

    await this.syncPlans(tenantId, {
      plans: normalizedPlans,
    })
  }

  private async syncPlans(tenantId: string, plansSetup?: PlansStepData) {
    if (!plansSetup) {
      return
    }

    await prisma.$transaction(async (tx) => {
      await tx.planModality.deleteMany({
        where: {
          plan: {
            tenantId,
          },
        },
      })

      await tx.plan.deleteMany({
        where: {
          tenantId,
        },
      })

      for (const [index, item] of plansSetup.plans.entries()) {
        const plan = await tx.plan.create({
          data: {
            tenantId,
            name: item.name,
            amountCents: item.amountCents,
            billingCycle: toBillingCycle(item.billingCycle),
            weeklyFrequency: item.weeklyFrequency,
            classLimitKind: toPlanClassLimitKind(item.classLimitKind),
            classLimitValue: item.classLimitValue,
            sortOrder: index,
            isActive: true,
          },
        })

        if (item.includedModalityIds.length) {
          await tx.planModality.createMany({
            data: item.includedModalityIds.map((modalityId) => ({
              planId: plan.id,
              modalityId,
            })),
          })
        }
      }
    })
  }

  private async syncBranding(tenantId: string, brandingSetup?: BrandingStepData) {
    if (!brandingSetup) {
      return
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { brandingJson: true },
    })

    const currentBranding =
      tenant?.brandingJson && typeof tenant.brandingJson === "object" && !Array.isArray(tenant.brandingJson)
        ? (tenant.brandingJson as Record<string, unknown>)
        : {}

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        brandingJson: {
          ...currentBranding,
          appName: brandingSetup.appName || null,
          logoUrl: brandingSetup.logoUrl || null,
          bannerUrl: brandingSetup.bannerUrl || null,
          primaryColor: brandingSetup.primaryColor || null,
          secondaryColor: brandingSetup.secondaryColor || null,
        },
        branding: {
          upsert: {
            update: {
              appName: brandingSetup.appName || null,
              logoUrl: brandingSetup.logoUrl || null,
              bannerUrl: brandingSetup.bannerUrl || null,
              primaryColor: brandingSetup.primaryColor || null,
              secondaryColor: brandingSetup.secondaryColor || null,
            },
            create: {
              appName: brandingSetup.appName || null,
              logoUrl: brandingSetup.logoUrl || null,
              bannerUrl: brandingSetup.bannerUrl || null,
              primaryColor: brandingSetup.primaryColor || null,
              secondaryColor: brandingSetup.secondaryColor || null,
            },
          },
        },
      },
    })
  }

  private async syncPayments(tenantId: string, paymentsSetup?: PaymentsStepData) {
    if (!paymentsSetup) {
      return
    }

    await prisma.tenantPaymentSettings.upsert({
      where: { tenantId },
      update: {
        pixEnabled: paymentsSetup.acceptedMethods.includes("pix"),
        cardEnabled: paymentsSetup.acceptedMethods.includes("card"),
        boletoEnabled: paymentsSetup.acceptedMethods.includes("boleto"),
        gateway: toPaymentGateway(paymentsSetup.gateway),
      },
      create: {
        tenantId,
        pixEnabled: paymentsSetup.acceptedMethods.includes("pix"),
        cardEnabled: paymentsSetup.acceptedMethods.includes("card"),
        boletoEnabled: paymentsSetup.acceptedMethods.includes("boleto"),
        gateway: toPaymentGateway(paymentsSetup.gateway),
      },
    })
  }
}
