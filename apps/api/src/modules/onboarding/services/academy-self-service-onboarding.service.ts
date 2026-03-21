import type { CreateAcademyFromSelfServiceInput } from "@/apps/api/src/modules/onboarding/contracts/create-academy-from-self-service.input"
import {
  AcademyOwnerResolutionService,
  AcademySelfServiceOnboardingError,
} from "@/apps/api/src/modules/onboarding/services/academy-owner-resolution.service"
import { AcademyProvisioningService } from "@/apps/api/src/modules/onboarding/services/academy-provisioning.service"

export { AcademySelfServiceOnboardingError }

export class AcademySelfServiceOnboardingService {
  constructor(
    private readonly academyOwnerResolutionService = new AcademyOwnerResolutionService(),
    private readonly academyProvisioningService = new AcademyProvisioningService()
  ) {}

  async createAcademyFromSelfService(input: CreateAcademyFromSelfServiceInput) {
    const resolvedOwner = await this.academyOwnerResolutionService.resolveForSelfService(input)

    return this.academyProvisioningService.provisionAcademy({
      academyName: input.academyName,
      ownerName: resolvedOwner.ownerName,
      ownerEmail: resolvedOwner.ownerEmail,
      ownerUserId: resolvedOwner.ownerUserId,
      ownerPhone: resolvedOwner.ownerPhone,
      activityCategories: input.activityCategories,
      passwordHash: resolvedOwner.passwordHash,
      passwordSalt: resolvedOwner.passwordSalt,
    })
  }
}
