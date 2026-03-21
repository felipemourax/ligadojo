import { roles, type Role } from "@/lib/access-control"

interface MembershipLike {
  tenantId: string
  role: Role
  status: string
}

function isActiveMembership<T extends MembershipLike>(membership: T) {
  return membership.status === "active"
}

function isActiveAcademyAdminMembership<T extends MembershipLike>(membership: T) {
  return isActiveMembership(membership) && membership.role === roles.ACADEMY_ADMIN
}

export function resolvePreferredDashboardMembership<T extends MembershipLike>(
  memberships: T[],
  preferredTenantId?: string | null
) {
  const activeMemberships = memberships.filter(isActiveMembership)

  if (preferredTenantId) {
    const preferredAdminMembership = activeMemberships.find(
      (membership) =>
        membership.tenantId === preferredTenantId && membership.role === roles.ACADEMY_ADMIN
    )

    if (preferredAdminMembership) {
      return preferredAdminMembership
    }
  }

  const defaultAdminMembership = activeMemberships.find(isActiveAcademyAdminMembership)

  if (defaultAdminMembership) {
    return defaultAdminMembership
  }

  if (preferredTenantId) {
    const preferredActiveMembership = activeMemberships.find(
      (membership) => membership.tenantId === preferredTenantId
    )

    if (preferredActiveMembership) {
      return preferredActiveMembership
    }
  }

  return activeMemberships[0] ?? memberships[0] ?? null
}
