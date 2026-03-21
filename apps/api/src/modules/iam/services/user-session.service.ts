import { AUTH_SESSION_COOKIE_MAX_AGE } from "@/lib/auth/session"
import { createOpaqueSessionToken, hashSessionToken } from "@/apps/api/src/common/auth/session-token"
import { UserSessionRepository } from "@/apps/api/src/modules/iam/repositories/user-session.repository"

export class UserSessionService {
  constructor(private readonly userSessionRepository = new UserSessionRepository()) {}

  async createForUser(userId: string) {
    const token = createOpaqueSessionToken()
    const sessionTokenHash = hashSessionToken(token)
    const expiresAt = new Date(Date.now() + AUTH_SESSION_COOKIE_MAX_AGE * 1000)

    const session = await this.userSessionRepository.create({
      userId,
      sessionTokenHash,
      expiresAt,
    })

    return {
      token,
      session,
    }
  }

  async resolveUserId(token: string) {
    const session = await this.userSessionRepository.findByTokenHash(hashSessionToken(token))
    return session?.userId ?? null
  }

  async destroy(token: string) {
    await this.userSessionRepository.deleteByTokenHash(hashSessionToken(token))
  }
}
