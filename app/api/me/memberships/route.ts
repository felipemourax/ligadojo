import { cookies, headers } from "next/headers"
import { badRequest, ok, notFound } from "@/app/api/_lib/http"
import { AcademyMembershipService } from "@/apps/api/src/modules/academy-memberships/services/academy-membership.service"
import { SessionComposerService } from "@/apps/api/src/modules/iam/services/session-composer.service"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"
import { UserSessionService } from "@/apps/api/src/modules/iam/services/user-session.service"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { AUTH_SESSION_COOKIE } from "@/lib/auth/session"
import { AUTH_DASHBOARD_TENANT_COOKIE } from "@/lib/auth/session"
import { resolvePreferredDashboardMembership } from "@/lib/auth/dashboard-tenant"
import { getCapabilitiesForRoles, mergeCapabilities } from "@/lib/capabilities"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"

const sessionComposerService = new SessionComposerService()
const userRepository = new UserRepository()
const tenantRepository = new TenantRepository()
const academyMembershipService = new AcademyMembershipService()
const userSessionService = new UserSessionService()

export async function GET() {
  const requestHeaders = await headers()
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value

  if (!sessionToken) {
    return badRequest("Nenhuma sessão ativa encontrada.")
  }

  const userId = await userSessionService.resolveUserId(sessionToken)

  if (!userId) {
    return notFound("Sessão inválida ou expirada.")
  }

  const session = await sessionComposerService.composeByUserId(userId)

  if (!session) {
    return notFound("Usuário não encontrado.")
  }

  const user = await userRepository.findById(session.userId, session.systemRoles)

  if (!user) {
    return notFound("Usuário não encontrado.")
  }

  const memberships = await academyMembershipService.listMembershipsForUser(user.id)
  const tenantIds = [...new Set(memberships.map((membership) => membership.tenantId))]
  const tenants = await Promise.all(tenantIds.map((tenantId) => tenantRepository.findById(tenantId)))
  const resolvedTenants = tenants.filter((tenant): tenant is NonNullable<typeof tenant> => Boolean(tenant))
  const tenantMap = new Map(resolvedTenants.map((tenant) => [tenant.id, tenant]))

  const tenantContext = resolveTenantFromHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  )
  const currentTenant =
    tenantContext.kind === "tenant" && tenantContext.tenantSlug
      ? await tenantRepository.findBySlug(tenantContext.tenantSlug)
      : null
  const preferredDashboardTenantId = cookieStore.get(AUTH_DASHBOARD_TENANT_COOKIE)?.value ?? null

  const detailedMemberships = memberships.map((membership) => ({
    ...membership,
    tenant: tenantMap.get(membership.tenantId) ?? null,
  }))
  const currentMembership =
    currentTenant
      ? detailedMemberships.find((membership) => membership.tenantId === currentTenant.id) ?? null
      : resolvePreferredDashboardMembership(detailedMemberships, preferredDashboardTenantId)
  const capabilities = getCapabilitiesForRoles(session.systemRoles)
  const currentTenantCapabilities = mergeCapabilities(
    capabilities,
    currentMembership ? getCapabilitiesForRoles([currentMembership.role]) : []
  )

  return ok({
    user,
    systemRoles: session.systemRoles,
    capabilities,
    currentTenantCapabilities,
    memberships: detailedMemberships,
    currentMembership,
  })
}
