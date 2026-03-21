import type { Invitation, InvitationStatus, AcademyRole } from "@prisma/client"
import type { InvitationEntity } from "@/apps/api/src/modules/invitations/domain/invitation"

function mapInvitationStatus(status: InvitationStatus): InvitationEntity["status"] {
  return status.toLowerCase() as InvitationEntity["status"]
}

function mapInvitationRole(role: AcademyRole): InvitationEntity["role"] {
  return role.toLowerCase() as InvitationEntity["role"]
}

export function toInvitationEntity(invitation: Invitation): InvitationEntity {
  return {
    id: invitation.id,
    tenantId: invitation.tenantId,
    email: invitation.email,
    role: mapInvitationRole(invitation.role),
    token: invitation.token,
    status: mapInvitationStatus(invitation.status),
    invitedByName: invitation.invitedByName,
    acceptedByUserId: invitation.acceptedById ?? undefined,
    expiresAt: invitation.expiresAt.toISOString(),
  }
}
