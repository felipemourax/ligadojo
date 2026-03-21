import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { createTenantSwitchToken } from "@/apps/api/src/common/auth/tenant-switch-token"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { buildPlatformHost, buildTenantHost } from "@/lib/tenancy/url"

const tenantRepository = new TenantRepository()

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedUser()

  if (!auth.user || !auth.session) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Sessão inválida.",
      },
      { status: 401 }
    )
  }

  const body = await request.json()

  if (typeof body?.tenantSlug !== "string" || !body.tenantSlug) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Informe o tenantSlug de destino.",
      },
      { status: 400 }
    )
  }

  const membership = auth.session.tenantMemberships.find(
    (item) => item.tenantId && item.status === "active"
  )

  const targetTenant = await tenantRepository.findBySlug(body.tenantSlug)

  if (!targetTenant) {
    return NextResponse.json(
      {
        error: "not_found",
        message: "Tenant de destino não encontrado.",
      },
      { status: 404 }
    )
  }

  const targetMembership = auth.session.tenantMemberships.find(
    (item) => item.tenantId === targetTenant.id && item.status === "active"
  )

  if (!targetMembership) {
    return NextResponse.json(
      {
        error: "forbidden",
        message: "Você não possui membership ativo no tenant de destino.",
      },
      { status: 403 }
    )
  }

  const requestUrl = new URL(request.url)
  const currentHostname = request.headers.get("x-forwarded-host")?.split(":")[0] ?? requestUrl.hostname
  const currentPort =
    request.headers.get("x-forwarded-port") ??
    (requestUrl.port ? requestUrl.port : null)
  const redirectPath =
    typeof body?.redirectPath === "string" && body.redirectPath.startsWith("/")
      ? body.redirectPath
      : targetMembership.role === "academy_admin"
        ? "/dashboard"
        : "/app"

  const targetHost =
    targetMembership.role === "academy_admin" && redirectPath.startsWith("/dashboard")
      ? buildPlatformHost({
          currentHostname,
          currentPort,
        })
      : buildTenantHost({
          currentHostname,
          currentPort,
          tenantSlug: targetTenant.slug,
          preferredDomain:
            (await tenantRepository.listDomainsForTenant(targetTenant.id)).find((domain) => domain.isPrimary)
              ?.domain ?? null,
        })

  const token = createTenantSwitchToken({
    userId: auth.user.id,
    tenantSlug: targetTenant.slug,
    redirectPath,
  })

  return NextResponse.json({
    redirectUrl: `${requestUrl.protocol}//${targetHost}/auth/switch?token=${encodeURIComponent(token)}`,
    currentTenantMembershipRole: membership?.role ?? null,
    targetTenantMembershipRole: targetMembership.role,
  })
}
