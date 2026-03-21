import type { AcademyAccessRole } from "@/apps/api/src/modules/iam/domain/access-roles"

export interface AcademyMembershipEntity {
  id: string
  userId: string
  tenantId: string
  role: AcademyAccessRole
  status: "invited" | "pending" | "active" | "suspended" | "revoked"
  invitedByName?: string
  acceptedAt?: string
}
