import type { OnboardingStatus, Prisma, TenantOnboarding } from "@prisma/client"
import type {
  AcademyInfoStepData,
  AgeGroupValue,
  BrandingStepData,
  ClassStructureStepData,
  LocationStepData,
  PaymentsStepData,
  PlansStepData,
  TenantOnboardingEntity,
} from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding"

function mapStatus(status: OnboardingStatus): TenantOnboardingEntity["status"] {
  return status.toLowerCase() as TenantOnboardingEntity["status"]
}

function asRecord(value: Prisma.JsonValue | null): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function asType<T>(value: Prisma.JsonValue | null): T | undefined {
  return asRecord(value) as T | undefined
}

function normalizeAgeGroups(value: unknown): AgeGroupValue[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is AgeGroupValue =>
        item === "kids" || item === "juvenile" || item === "adult" || item === "mixed"
    )
  }

  if (value === "kids" || value === "juvenile" || value === "adult" || value === "mixed") {
    return [value]
  }

  return []
}

function normalizeClassStructure(
  value: Prisma.JsonValue | null
): ClassStructureStepData | undefined {
  type LegacyModality = ClassStructureStepData["modalities"][number] & {
    ageGroup?: AgeGroupValue
    activityCategory?: string
  }
  type LegacyClassStructure = Omit<ClassStructureStepData, "modalities"> & {
    modalities?: LegacyModality[] | string
  }

  const classStructure = asType<LegacyClassStructure>(value)

  if (!classStructure) {
    return undefined
  }

  const rawModalities = Array.isArray(classStructure.modalities)
    ? classStructure.modalities
    : typeof classStructure.modalities === "string"
      ? classStructure.modalities
          .split("\n")
          .map((item: string) => item.trim())
          .filter(Boolean)
          .map((name: string, index: number) => ({
            clientId: `legacy-${index + 1}`,
            activityCategory: undefined,
            name,
            ageGroups: ["adult"] as AgeGroupValue[],
            defaultDurationMinutes: 60,
            defaultCapacity: 20,
          }))
      : []

  return {
    ...classStructure,
    modalities: rawModalities.map((item: LegacyModality) => {
      const legacyItem = item

      return {
        clientId: item.clientId,
        activityCategory:
          typeof legacyItem.activityCategory === "string" ? legacyItem.activityCategory : undefined,
        name: item.name,
        ageGroups: normalizeAgeGroups(legacyItem.ageGroups ?? legacyItem.ageGroup),
        defaultDurationMinutes: item.defaultDurationMinutes,
        defaultCapacity: item.defaultCapacity,
      }
    }),
  }
}

export function toTenantOnboardingEntity(
  onboarding: TenantOnboarding
): TenantOnboardingEntity {
  return {
    id: onboarding.id,
    tenantId: onboarding.tenantId,
    status: mapStatus(onboarding.status),
    currentStep: onboarding.currentStep,
    completedSteps: onboarding.completedSteps as TenantOnboardingEntity["completedSteps"],
    academyInfo: asType<AcademyInfoStepData>(onboarding.academyInfoJson),
    location: asType<LocationStepData>(onboarding.locationJson),
    classStructure: normalizeClassStructure(onboarding.classStructureJson),
    plansSetup: asType<PlansStepData>(onboarding.plansSetupJson),
    brandingSetup: asType<BrandingStepData>(onboarding.brandingSetupJson),
    paymentsSetup: asType<PaymentsStepData>(onboarding.paymentsSetupJson),
    references: {
      modalities: [],
      plans: [],
    },
    stepValidity: {
      academy_info: false,
      location: false,
      class_structure: false,
      plans: false,
      branding: false,
      payments: false,
    },
    blockingSteps: [],
    completedAt: onboarding.completedAt?.toISOString(),
  }
}
