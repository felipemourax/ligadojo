import { AcademyMembershipService } from "@/apps/api/src/modules/academy-memberships/services/academy-membership.service"
import {
  systemAccessRoles,
  type SystemAccessRole,
} from "@/apps/api/src/modules/iam/domain/access-roles"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"
import type { SessionContext } from "@/apps/api/src/common/auth/session-context"

function getPlatformAdminEmails(): string[] {
  return (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

function resolveSystemRolesForEmail(email: string): SystemAccessRole[] {
  const platformAdminEmails = getPlatformAdminEmails()

  if (platformAdminEmails.includes(email.toLowerCase())) {
    return [systemAccessRoles[0]]
  }

  return []
}

export class SessionComposerService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly academyMembershipService = new AcademyMembershipService()
  ) {}

  async composeByEmail(email: string): Promise<SessionContext | null> {
    const systemRoles = resolveSystemRolesForEmail(email)
    const user = await this.userRepository.findByEmail(email, systemRoles)

    if (!user) {
      return null
    }

    return this.composeByUserId(user.id, systemRoles)
  }

  async composeByUserId(
    userId: string,
    presetSystemRoles?: SystemAccessRole[]
  ): Promise<SessionContext | null> {
    const user = await this.userRepository.findById(userId, presetSystemRoles)

    if (!user) {
      return null
    }

    const systemRoles = presetSystemRoles ?? resolveSystemRolesForEmail(user.email)

    const memberships = await this.academyMembershipService.listMembershipsForUser(user.id)

    return {
      userId: user.id,
      systemRoles,
      tenantMemberships: memberships.map((membership) => ({
        tenantId: membership.tenantId,
        role: membership.role,
        status: membership.status,
      })),
    }
  }
}
