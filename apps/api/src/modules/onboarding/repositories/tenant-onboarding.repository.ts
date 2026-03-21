import { OnboardingStatus, Prisma } from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { toTenantOnboardingEntity } from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding-mappers"
import type {
  OnboardingStepKey,
  TenantOnboardingEntity,
} from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding"

function toPrismaStatus(status: TenantOnboardingEntity["status"]): OnboardingStatus {
  switch (status) {
    case "draft":
      return OnboardingStatus.DRAFT
    case "in_progress":
      return OnboardingStatus.IN_PROGRESS
    case "completed":
      return OnboardingStatus.COMPLETED
  }
}

export class TenantOnboardingRepository {
  async findByTenantId(tenantId: string) {
    const onboarding = await prisma.tenantOnboarding.findUnique({
      where: { tenantId },
    })

    return onboarding ? toTenantOnboardingEntity(onboarding) : null
  }

  async upsertStep(input: {
    tenantId: string
    step: OnboardingStepKey
    data: Record<string, unknown>
    currentStep?: number
  }) {
    const current = await prisma.tenantOnboarding.findUnique({
      where: { tenantId: input.tenantId },
    })

    const payloadField = this.getFieldForStep(input.step)
    const onboarding = await prisma.tenantOnboarding.upsert({
      where: { tenantId: input.tenantId },
      update: {
        status:
          current?.status === OnboardingStatus.COMPLETED
            ? OnboardingStatus.COMPLETED
            : OnboardingStatus.IN_PROGRESS,
        currentStep: input.currentStep ?? current?.currentStep ?? 1,
        completedSteps: (current?.completedSteps ?? []) as string[],
        [payloadField]: input.data as Prisma.InputJsonValue,
      },
      create: {
        tenantId: input.tenantId,
        status: OnboardingStatus.IN_PROGRESS,
        currentStep: input.currentStep ?? 1,
        completedSteps: [],
        [payloadField]: input.data as Prisma.InputJsonValue,
      },
    })

    return toTenantOnboardingEntity(onboarding)
  }

  async syncCompletedSteps(input: {
    tenantId: string
    completedSteps: OnboardingStepKey[]
    status?: TenantOnboardingEntity["status"]
  }) {
    const onboarding = await prisma.tenantOnboarding.update({
      where: { tenantId: input.tenantId },
      data: {
        completedSteps: input.completedSteps,
        ...(input.status ? { status: toPrismaStatus(input.status) } : {}),
      },
    })

    return toTenantOnboardingEntity(onboarding)
  }

  async markCompleted(input: {
    tenantId: string
    currentStep?: number
  }) {
    const onboarding = await prisma.tenantOnboarding.update({
      where: { tenantId: input.tenantId },
      data: {
        status: toPrismaStatus("completed"),
        currentStep: input.currentStep ?? 7,
        completedAt: new Date(),
      },
    })

    return toTenantOnboardingEntity(onboarding)
  }

  private getFieldForStep(step: OnboardingStepKey) {
    switch (step) {
      case "academy_info":
        return "academyInfoJson"
      case "location":
        return "locationJson"
      case "class_structure":
        return "classStructureJson"
      case "plans":
        return "plansSetupJson"
      case "branding":
        return "brandingSetupJson"
      case "payments":
        return "paymentsSetupJson"
    }
  }
}
