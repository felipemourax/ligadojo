import type { AcademyAccessRole } from "@/apps/api/src/modules/iam/domain/access-roles"

export interface InvitationEntity {
  id: string
  tenantId: string
  email: string
  role: AcademyAccessRole
  token: string
  status: "pending" | "accepted" | "expired" | "revoked"
  invitedByName: string
  acceptedByUserId?: string
  expiresAt: string
}
