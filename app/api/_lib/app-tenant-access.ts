import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"
import { roles } from "@/lib/access-control"

const tenantRepository = new TenantRepository()

export async function requireTenantAppAccess(input?: {
  role?: "teacher" | "student"
}) {
  const requestHeaders = await headers()
  const tenantContext = resolveTenantFromHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  )

  if (tenantContext.kind !== "tenant" || !tenantContext.tenantSlug) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "forbidden", message: "Tenant inválido para a superfície do app." },
        { status: 403 }
      ),
    }
  }

  const tenant = await tenantRepository.findBySlug(tenantContext.tenantSlug)
  const auth = await resolveAuthenticatedUser()

  if (!tenant || !auth.user || !auth.session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "unauthorized", message: "Sessão inválida." }, { status: 401 }),
    }
  }

  const membership =
    auth.session.tenantMemberships.find((item) => item.tenantId === tenant.id && item.status === "active") ?? null

  if (!membership || (membership.role !== roles.TEACHER && membership.role !== roles.STUDENT)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "forbidden", message: "Sem acesso à superfície do app para este tenant." },
        { status: 403 }
      ),
    }
  }

  if (input?.role && membership.role !== input.role) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "forbidden", message: "Perfil incompatível com esta rota do app." },
        { status: 403 }
      ),
    }
  }

  return {
    ok: true as const,
    tenant,
    auth,
    membership,
  }
}
