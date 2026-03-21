import { NextResponse } from "next/server"
import { attachDashboardTenantCookie } from "@/app/api/_lib/auth-session"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"

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
        message: "Informe o tenantSlug do dashboard.",
      },
      { status: 400 }
    )
  }

  const tenant = await tenantRepository.findBySlug(body.tenantSlug)

  if (!tenant) {
    return NextResponse.json(
      {
        error: "not_found",
        message: "Academia não encontrada.",
      },
      { status: 404 }
    )
  }

  const membership = auth.session.tenantMemberships.find(
    (item) => item.tenantId === tenant.id && item.status === "active" && item.role === "academy_admin"
  )

  if (!membership) {
    return NextResponse.json(
      {
        error: "forbidden",
        message: "Você não possui acesso administrativo a esta academia.",
      },
      { status: 403 }
    )
  }

  const response = NextResponse.json(
    {
      ok: true,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      redirectUrl: "/dashboard",
    },
    { status: 200 }
  )

  attachDashboardTenantCookie(response, tenant.id)

  return response
}
