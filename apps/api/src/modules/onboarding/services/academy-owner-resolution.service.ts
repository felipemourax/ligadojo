import { createPasswordHash } from "@/apps/api/src/common/auth/password-hasher"
import { PasswordCredentialRepository } from "@/apps/api/src/modules/iam/repositories/password-credential.repository"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"
import { PasswordAuthService } from "@/apps/api/src/modules/iam/services/password-auth.service"
import type { CreateAcademyFromSelfServiceInput } from "@/apps/api/src/modules/onboarding/contracts/create-academy-from-self-service.input"

export class AcademySelfServiceOnboardingError extends Error {
  constructor(
    public readonly status: number,
    public readonly code:
      | "unauthorized_existing_owner"
      | "unsupported_existing_owner_state"
      | "slug_generation_failed",
    message: string
  ) {
    super(message)
    this.name = "AcademySelfServiceOnboardingError"
  }
}

export interface ResolvedAcademyOwner {
  ownerUserId?: string
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
  passwordHash?: string
  passwordSalt?: string
}

export class AcademyOwnerResolutionService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly passwordCredentialRepository = new PasswordCredentialRepository(),
    private readonly passwordAuthService = new PasswordAuthService()
  ) {}

  async resolveForSelfService(
    input: CreateAcademyFromSelfServiceInput
  ): Promise<ResolvedAcademyOwner> {
    const normalizedOwnerEmail = input.ownerEmail.trim().toLowerCase()
    const existingUser = await this.userRepository.findByEmail(normalizedOwnerEmail)
    const existingCredential = existingUser
      ? await this.passwordCredentialRepository.findByUserId(existingUser.id)
      : null

    if (existingUser && existingCredential) {
      const authenticatedUser = await this.passwordAuthService.authenticateByEmail({
        email: normalizedOwnerEmail,
        password: input.password,
      })

      if (!authenticatedUser) {
        throw new AcademySelfServiceOnboardingError(
          401,
          "unauthorized_existing_owner",
          "Ja existe uma conta com este e-mail. Para criar outra academia com o mesmo dono, informe a senha correta da conta existente."
        )
      }
    }

    if (existingUser && !existingCredential) {
      throw new AcademySelfServiceOnboardingError(
        409,
        "unsupported_existing_owner_state",
        "Ja existe uma conta com este e-mail, mas ela ainda nao pode ser reutilizada no self-service de academia sem um acesso autenticado."
      )
    }

    const credential = existingUser ? null : createPasswordHash(input.password)

    return {
      ownerUserId: existingUser?.id,
      ownerName: input.ownerName,
      ownerEmail: normalizedOwnerEmail,
      ownerPhone: input.ownerPhone,
      passwordHash: credential?.passwordHash,
      passwordSalt: credential?.passwordSalt,
    }
  }
}
