import type { Role } from "@/lib/access-control"

export type UserStatus = "active" | "blocked"
export type TenantStatus = "active" | "suspended" | "archived"
export type MembershipStatus = "invited" | "pending" | "active" | "suspended" | "revoked"
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked"
export type EnrollmentRequestStatus = "pending" | "approved" | "rejected" | "cancelled"

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  status: UserStatus
}

export interface Tenant {
  id: string
  slug: string
  legalName: string
  displayName: string
  status: TenantStatus
}

export interface AcademyMembership {
  id: string
  userId: string
  tenantId: string
  role: Exclude<Role, "platform_admin"> | "platform_admin"
  status: MembershipStatus
  invitedByName?: string
  acceptedAt?: string
}

export interface Invitation {
  id: string
  tenantId: string
  email: string
  role: Exclude<Role, "platform_admin">
  status: InvitationStatus
  invitedByName: string
  expiresAt: string
  token: string
}

export interface EnrollmentRequest {
  id: string
  tenantId: string
  userId: string
  userName: string
  userEmail: string
  requestedRole: "student" | "teacher" | "academy_admin"
  status: EnrollmentRequestStatus
  createdAt: string
}

export interface SessionContext {
  user: User
  systemRoles: Role[]
  memberships: AcademyMembership[]
  currentMembership: AcademyMembership | null
}
