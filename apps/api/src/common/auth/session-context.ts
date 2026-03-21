import type { AcademyAccessRole, SystemAccessRole } from "@/apps/api/src/modules/iam/domain/access-roles"

export interface SessionContext {
  userId: string
  systemRoles: SystemAccessRole[]
  tenantMemberships: Array<{
    tenantId: string
    role: AcademyAccessRole
    status: "invited" | "pending" | "active" | "suspended" | "revoked"
  }>
}
