import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { roles } from "@/lib/access-control"
import { resolvePreferredDashboardMembership } from "@/lib/auth/dashboard-tenant"
import { AUTH_DASHBOARD_TENANT_COOKIE } from "@/lib/auth/session"
import { getCapabilitiesForRoles, hasCapability, mergeCapabilities, type Capability } from "@/lib/capabilities"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"

const tenantRepository = new TenantRepository()

export async function requireDashboardTenantCapability(input: {
  capability: Capability
}) {
  const requestHeaders = await headers()
  const cookieStore = await cookies()
  const tenantContext = resolveTenantFromHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  )

  const auth = await resolveAuthenticatedUser()

  if (!auth.user || !auth.session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "unauthorized",
          message: "Sessão inválida.",
        },
        { status: 401 }
      ),
    }
  }

  const tenant =
    tenantContext.kind === "tenant" && tenantContext.tenantSlug
      ? await tenantRepository.findBySlug(tenantContext.tenantSlug)
      : null

  const preferredDashboardTenantId = cookieStore.get(AUTH_DASHBOARD_TENANT_COOKIE)?.value ?? null
  const membership = tenant
    ? auth.session.tenantMemberships.find(
        (item) => item.tenantId === tenant.id && item.status === "active"
      ) ?? null
    : resolvePreferredDashboardMembership(auth.session.tenantMemberships, preferredDashboardTenantId)

  const activeTenant = tenant ?? (membership?.tenantId ? await tenantRepository.findById(membership.tenantId) : null)

  if (!activeTenant || !membership) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "forbidden",
          message: "Nenhum tenant ativo foi encontrado para esta sessão.",
        },
        { status: 403 }
      ),
    }
  }

  const isPlatformAdmin = auth.session.systemRoles.includes(roles.PLATFORM_ADMIN)
  const canAccessDashboardSurface = isPlatformAdmin || membership.role === roles.ACADEMY_ADMIN

  if (!canAccessDashboardSurface) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "forbidden",
          message: "Sem acesso à superfície administrativa do dashboard.",
        },
        { status: 403 }
      ),
    }
  }

  const userCapabilities = mergeCapabilities(
    getCapabilitiesForRoles(auth.session.systemRoles),
    getCapabilitiesForRoles([membership.role])
  )

  if (!hasCapability(userCapabilities, input.capability)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "forbidden",
          message: "Capability insuficiente para esta operação.",
        },
        { status: 403 }
      ),
    }
  }

  return {
    ok: true as const,
    auth,
    tenant: activeTenant,
    membership,
    userCapabilities,
  }
}
