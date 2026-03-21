import { roles } from "@/lib/access-control"
import type {
  AcademyMembership,
  EnrollmentRequest,
  Invitation,
  SessionContext,
  Tenant,
  User,
} from "@/lib/domain/types"

const tenants: Tenant[] = [
  {
    id: "tenant_dojo_centro",
    slug: "dojo-centro",
    legalName: "Dojo Centro Artes Marciais LTDA",
    displayName: "Dojo Centro",
    status: "active",
  },
  {
    id: "tenant_fight_lab",
    slug: "fight-lab",
    legalName: "Fight Lab Performance LTDA",
    displayName: "Fight Lab",
    status: "active",
  },
]

const currentUser: User = {
  id: "user_joao",
  name: "João da Silva",
  email: "joao@academia.com",
  phone: "(11) 99999-0000",
  status: "active",
}

const memberships: AcademyMembership[] = [
  {
    id: "membership_1",
    userId: currentUser.id,
    tenantId: "tenant_dojo_centro",
    role: roles.ACADEMY_ADMIN,
    status: "active",
    invitedByName: "Sistema",
    acceptedAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "membership_2",
    userId: currentUser.id,
    tenantId: "tenant_fight_lab",
    role: roles.TEACHER,
    status: "active",
    invitedByName: "Marina Costa",
    acceptedAt: "2026-02-10T14:00:00.000Z",
  },
]

const invitations: Invitation[] = [
  {
    id: "invite_1",
    tenantId: "tenant_dojo_centro",
    email: "prof.ricardo@email.com",
    role: roles.TEACHER,
    token: "mock-invite-teacher-1",
    status: "pending",
    invitedByName: "João da Silva",
    expiresAt: "2026-03-25T23:59:59.000Z",
  },
  {
    id: "invite_2",
    tenantId: "tenant_dojo_centro",
    email: "aluna.nova@email.com",
    role: roles.STUDENT,
    token: "mock-invite-student-1",
    status: "pending",
    invitedByName: "João da Silva",
    expiresAt: "2026-03-20T23:59:59.000Z",
  },
]

const enrollmentRequests: EnrollmentRequest[] = [
  {
    id: "request_1",
    tenantId: "tenant_dojo_centro",
    userId: "user_maria",
    userName: "Maria Santos",
    userEmail: "maria@email.com",
    requestedRole: "teacher",
    status: "pending",
    createdAt: "2026-03-14T12:00:00.000Z",
  },
  {
    id: "request_2",
    tenantId: "tenant_dojo_centro",
    userId: "user_pedro",
    userName: "Pedro Costa",
    userEmail: "pedro@email.com",
    requestedRole: "teacher",
    status: "approved",
    createdAt: "2026-03-12T16:30:00.000Z",
  },
]

export function getTenantBySlug(slug: string | null | undefined): Tenant | null {
  if (!slug) {
    return tenants[0] ?? null
  }

  return tenants.find((tenant) => tenant.slug === slug) ?? null
}

export function getSessionContext(tenantSlug?: string | null): SessionContext {
  const tenant = getTenantBySlug(tenantSlug)
  const currentMembership = tenant
    ? memberships.find((membership) => membership.tenantId === tenant.id) ?? null
    : memberships[0] ?? null

  return {
    user: currentUser,
    systemRoles: [roles.PLATFORM_ADMIN],
    memberships,
    currentMembership,
  }
}

export function getInvitationsForTenant(tenantId: string | null | undefined): Invitation[] {
  if (!tenantId) {
    return []
  }

  return invitations.filter((invitation) => invitation.tenantId === tenantId)
}

export function getEnrollmentRequestsForTenant(
  tenantId: string | null | undefined
): EnrollmentRequest[] {
  if (!tenantId) {
    return []
  }

  return enrollmentRequests.filter((request) => request.tenantId === tenantId)
}

export function getMembershipsWithTenantInfo() {
  return memberships.map((membership) => ({
    ...membership,
    tenant: tenants.find((tenant) => tenant.id === membership.tenantId) ?? null,
  }))
}
