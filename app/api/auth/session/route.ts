import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { attachAuthSessionCookie, attachDashboardTenantCookie, clearDashboardTenantCookie } from "@/app/api/_lib/auth-session"
import { PasswordAuthService } from "@/apps/api/src/modules/iam/services/password-auth.service"
import { SessionComposerService } from "@/apps/api/src/modules/iam/services/session-composer.service"
import { UserSessionService } from "@/apps/api/src/modules/iam/services/user-session.service"
import { resolvePreferredDashboardMembership } from "@/lib/auth/dashboard-tenant"
import { AUTH_SESSION_COOKIE } from "@/lib/auth/session"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"

const passwordAuthService = new PasswordAuthService()
const sessionComposerService = new SessionComposerService()
const userSessionService = new UserSessionService()
const tenantRepository = new TenantRepository()

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  const body = await request.json()
  const requestHeaders = await headers()

  if (!isValidEmail(body?.email) || typeof body?.password !== "string") {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Informe email e senha válidos.",
      },
      { status: 400 }
    )
  }

  const user = await passwordAuthService.authenticateByEmail({
    email: body.email,
    password: body.password,
  })

  if (!user) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Credenciais inválidas.",
      },
      { status: 401 }
    )
  }

  const session = await sessionComposerService.composeByUserId(user.id)

  if (!session) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Sessão inválida.",
      },
      { status: 401 }
    )
  }

  const tenantContext = resolveTenantFromHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  )

  let currentTenantMembership = null

  if (tenantContext.kind === "tenant" && tenantContext.tenantSlug) {
    const tenant = await tenantRepository.findBySlug(tenantContext.tenantSlug)

    if (!tenant) {
      return NextResponse.json(
        {
          error: "not_found",
          message: "Academia não encontrada.",
        },
        { status: 404 }
      )
    }

    currentTenantMembership =
      session.tenantMemberships.find(
        (membership) =>
          membership.tenantId === tenant.id &&
          membership.status !== "revoked" &&
          membership.status !== "suspended"
      ) ?? null

    if (!currentTenantMembership) {
      return NextResponse.json(
        {
          error: "forbidden",
          message: "Esta conta não possui acesso a esta academia.",
        },
        { status: 403 }
      )
    }
  } else if (session.systemRoles.length === 0 && session.tenantMemberships.length === 0) {
    return NextResponse.json(
      {
        error: "forbidden",
        message: "Sua conta ainda não possui vínculo com nenhuma academia.",
      },
      { status: 403 }
    )
  }

  const authSession = await userSessionService.createForUser(user.id)
  const preferredDashboardMembership =
    currentTenantMembership?.role === "academy_admin"
      ? currentTenantMembership
      : resolvePreferredDashboardMembership(session.tenantMemberships)

  const response = NextResponse.json(
    {
      ok: true,
      session,
      currentTenantMembership,
    },
    { status: 200 }
  )

  attachAuthSessionCookie(response, authSession.token)

  if (preferredDashboardMembership?.role === "academy_admin") {
    attachDashboardTenantCookie(response, preferredDashboardMembership.tenantId)
  }

  return response
}

export async function DELETE(request: Request) {
  const currentToken = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${AUTH_SESSION_COOKIE}=`))
    ?.split("=")[1]

  if (currentToken) {
    await userSessionService.destroy(currentToken)
  }

  const response = NextResponse.json({ ok: true }, { status: 200 })
  clearDashboardTenantCookie(response)
  response.cookies.set(AUTH_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}
