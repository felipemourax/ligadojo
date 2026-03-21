import { AUTH_SESSION_COOKIE_MAX_AGE } from "@/lib/auth/session"
import { createPasswordResetToken, hashPasswordResetToken } from "@/apps/api/src/common/auth/password-reset-token"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"
import { PasswordResetTokenRepository } from "@/apps/api/src/modules/iam/repositories/password-reset-token.repository"
import { PasswordAuthService } from "@/apps/api/src/modules/iam/services/password-auth.service"

const PASSWORD_RESET_TOKEN_MAX_AGE_SECONDS = 60 * 30

export class PasswordResetService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly passwordResetTokenRepository = new PasswordResetTokenRepository(),
    private readonly passwordAuthService = new PasswordAuthService()
  ) {}

  async requestByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      return {
        ok: true as const,
        token: null,
        expiresInSeconds: PASSWORD_RESET_TOKEN_MAX_AGE_SECONDS,
      }
    }

    const { token, tokenHash } = createPasswordResetToken()
    await this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_MAX_AGE_SECONDS * 1000),
    })

    return {
      ok: true as const,
      token,
      expiresInSeconds: PASSWORD_RESET_TOKEN_MAX_AGE_SECONDS,
    }
  }

  async validateToken(token: string) {
    const existing = await this.passwordResetTokenRepository.findActiveByTokenHash(
      hashPasswordResetToken(token)
    )

    return Boolean(existing)
  }

  async resetWithToken(input: { token: string; password: string }) {
    const existing = await this.passwordResetTokenRepository.findActiveByTokenHash(
      hashPasswordResetToken(input.token)
    )

    if (!existing) {
      return null
    }

    await this.passwordAuthService.setPassword({
      userId: existing.userId,
      password: input.password,
    })

    await this.passwordResetTokenRepository.markUsed(existing.id)

    return {
      userId: existing.userId,
      sessionMaxAgeSeconds: AUTH_SESSION_COOKIE_MAX_AGE,
    }
  }
}
