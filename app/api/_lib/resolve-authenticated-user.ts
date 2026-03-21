import { cookies } from "next/headers"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"
import { UserSessionService } from "@/apps/api/src/modules/iam/services/user-session.service"
import { SessionComposerService } from "@/apps/api/src/modules/iam/services/session-composer.service"
import { AUTH_SESSION_COOKIE } from "@/lib/auth/session"

const userSessionService = new UserSessionService()
const userRepository = new UserRepository()
const sessionComposerService = new SessionComposerService()

export async function resolveAuthenticatedUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value

  if (!sessionToken) {
    return {
      sessionToken: null,
      userId: null,
      session: null,
      user: null,
    }
  }

  const userId = await userSessionService.resolveUserId(sessionToken)

  if (!userId) {
    return {
      sessionToken,
      userId: null,
      session: null,
      user: null,
    }
  }

  const session = await sessionComposerService.composeByUserId(userId)
  const user = await userRepository.findById(userId, session?.systemRoles ?? [])

  return {
    sessionToken,
    userId,
    session,
    user,
  }
}
