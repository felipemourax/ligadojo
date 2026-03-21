import { roles, type Role } from "@/lib/access-control"
import { routes } from "@/lib/routes"

interface MembershipLike {
  role: Role
  status: string
}

function isActiveMembership<T extends MembershipLike>(membership: T) {
  return membership.status === "active"
}

export function resolveSingleAccessRedirect<T extends MembershipLike>(memberships: T[]) {
  const activeMemberships = memberships.filter(isActiveMembership)

  if (activeMemberships.length !== 1) {
    return null
  }

  const [membership] = activeMemberships

  return membership.role === roles.ACADEMY_ADMIN ? routes.dashboard : null
}
