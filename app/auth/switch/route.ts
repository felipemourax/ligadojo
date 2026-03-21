import { NextResponse } from "next/server"
import { attachAuthSessionCookie, attachDashboardTenantCookie } from "@/app/api/_lib/auth-session"
import { verifyTenantSwitchToken } from "@/apps/api/src/common/auth/tenant-switch-token"
import { SessionComposerService } from "@/apps/api/src/modules/iam/services/session-composer.service"
import { UserSessionService } from "@/apps/api/src/modules/iam/services/user-session.service"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"

const tenantRepository = new TenantRepository()
const sessionComposerService = new SessionComposerService()
const userSessionService = new UserSessionService()

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.replace(":", "")
  const token = requestUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = verifyTenantSwitchToken(token)

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const tenantContext = resolveTenantFromHost(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  )

  const isTenantSurface = tenantContext.kind === "tenant" && tenantContext.tenantSlug === payload.tenantSlug
  const isPlatformSurface = tenantContext.kind === "platform"

  if (!isTenantSurface && !isPlatformSurface) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const tenant = await tenantRepository.findBySlug(payload.tenantSlug)
  const session = await sessionComposerService.composeByUserId(payload.userId)

  if (!tenant || !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const membership = session.tenantMemberships.find(
    (item) => item.tenantId === tenant.id && item.status === "active"
  )

  if (!membership) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isPlatformSurface && membership.role !== "academy_admin") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const authSession = await userSessionService.createForUser(payload.userId)
  const currentOrigin = `${forwardedProto}://${forwardedHost ?? requestUrl.host}`
  const response = NextResponse.redirect(new URL(payload.redirectPath, currentOrigin))

  attachAuthSessionCookie(response, authSession.token)

  if (isPlatformSurface && membership.role === "academy_admin") {
    attachDashboardTenantCookie(response, tenant.id)
  }

  return response
}
