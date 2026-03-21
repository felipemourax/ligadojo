export type OnboardingStepKey =
  | "academy_info"
  | "location"
  | "class_structure"
  | "plans"
  | "branding"
  | "payments"

export type AgeGroupValue = "kids" | "juvenile" | "adult" | "mixed"
export type ActivityCategoryValue =
  | "jiu-jitsu"
  | "muay-thai"
  | "judo"
  | "karate"
  | "taekwondo"
  | "boxe"
  | "mma"
  | "outras"
export type BillingCycleValue = "monthly" | "quarterly" | "semiannual" | "yearly"
export type PlanClassLimitKindValue = "unlimited" | "weekly"
export type PaymentGatewayValue = "mercado_pago" | "asaas" | "stripe"

export interface AcademyInfoStepData {
  legalName: string
  phone: string
  contactEmail: string
  document: string
  hasNoDocument?: boolean
  foundedYear: string
  activityCategories?: string[]
}

export interface LocationStepData {
  zipCode: string
  street: string
  number: string
  complement: string
  city: string
  state: string
  country: string
}

export interface ClassStructureModalityInput {
  clientId: string
  activityCategory?: string
  name: string
  ageGroups: AgeGroupValue[]
  defaultDurationMinutes: number
  defaultCapacity: number
}

export interface ClassStructureStepData {
  modalities: ClassStructureModalityInput[]
}

export interface PlanSetupInput {
  clientId: string
  name: string
  amountCents: number
  billingCycle: BillingCycleValue
  weeklyFrequency: number | null
  classLimitKind: PlanClassLimitKindValue
  classLimitValue: number | null
  includedModalityIds: string[]
}

export interface PlansStepData {
  plans: PlanSetupInput[]
}

export interface BrandingStepData {
  appName: string
  logoUrl: string
  bannerUrl: string
  primaryColor: string
  secondaryColor: string
}

export interface PaymentsStepData {
  acceptedMethods: Array<"pix" | "card" | "boleto">
  gateway: PaymentGatewayValue | ""
}

export interface ModalityReference {
  id: string
  activityCategory?: string
  name: string
  ageGroups: AgeGroupValue[]
}

export interface PlanReference {
  id: string
  name: string
}

export interface TenantOnboardingEntity {
  id: string
  tenantId: string
  status: "draft" | "in_progress" | "completed"
  currentStep: number
  completedSteps: OnboardingStepKey[]
  academyInfo?: AcademyInfoStepData
  location?: LocationStepData
  classStructure?: ClassStructureStepData
  plansSetup?: PlansStepData
  brandingSetup?: BrandingStepData
  paymentsSetup?: PaymentsStepData
  references: {
    modalities: ModalityReference[]
    plans: PlanReference[]
  }
  stepValidity: Record<OnboardingStepKey, boolean>
  blockingSteps: OnboardingStepKey[]
  completedAt?: string
}
