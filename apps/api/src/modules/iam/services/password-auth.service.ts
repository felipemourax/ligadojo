import { createPasswordHash, verifyPassword } from "@/apps/api/src/common/auth/password-hasher"
import { PasswordCredentialRepository } from "@/apps/api/src/modules/iam/repositories/password-credential.repository"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"

export class PasswordAuthService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly passwordCredentialRepository = new PasswordCredentialRepository()
  ) {}

  async setPassword(input: { userId: string; password: string }) {
    const credential = createPasswordHash(input.password)

    return this.passwordCredentialRepository.upsert({
      userId: input.userId,
      passwordHash: credential.passwordHash,
      passwordSalt: credential.passwordSalt,
    })
  }

  async authenticateByEmail(input: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(input.email)

    if (!user) {
      return null
    }

    const credential = await this.passwordCredentialRepository.findByUserId(user.id)

    if (!credential) {
      return null
    }

    const valid = verifyPassword({
      password: input.password,
      passwordHash: credential.passwordHash,
      passwordSalt: credential.passwordSalt,
    })

    return valid ? user : null
  }

  async verifyPassword(input: { userId: string; password: string }) {
    const credential = await this.passwordCredentialRepository.findByUserId(input.userId)

    if (!credential) {
      return false
    }

    return verifyPassword({
      password: input.password,
      passwordHash: credential.passwordHash,
      passwordSalt: credential.passwordSalt,
    })
  }
}
