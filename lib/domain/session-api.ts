import type { Role } from "@/lib/access-control"
import type { Capability } from "@/lib/capabilities"
import type { AcademyMembership, Tenant, User } from "@/lib/domain/types"

export interface SessionMembership extends AcademyMembership {
  tenant: Tenant | null
}

export interface SessionApiResponse {
  user: User
  systemRoles: Role[]
  capabilities: Capability[]
  currentTenantCapabilities: Capability[]
  memberships: SessionMembership[]
  currentMembership: SessionMembership | null
}
