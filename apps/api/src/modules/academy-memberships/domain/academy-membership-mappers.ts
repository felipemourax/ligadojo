import type { AcademyMembership, MembershipStatus, AcademyRole } from "@prisma/client"
import type { AcademyMembershipEntity } from "@/apps/api/src/modules/academy-memberships/domain/academy-membership"

function mapMembershipStatus(status: MembershipStatus): AcademyMembershipEntity["status"] {
  return status.toLowerCase() as AcademyMembershipEntity["status"]
}

function mapMembershipRole(role: AcademyRole): AcademyMembershipEntity["role"] {
  return role.toLowerCase() as AcademyMembershipEntity["role"]
}

export function toAcademyMembershipEntity(
  membership: AcademyMembership
): AcademyMembershipEntity {
  return {
    id: membership.id,
    userId: membership.userId,
    tenantId: membership.tenantId,
    role: mapMembershipRole(membership.role),
    status: mapMembershipStatus(membership.status),
    invitedByName: membership.invitedByName ?? undefined,
    acceptedAt: membership.acceptedAt?.toISOString(),
  }
}
