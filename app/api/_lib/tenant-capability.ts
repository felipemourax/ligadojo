import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { getCapabilitiesForRoles, hasCapability, mergeCapabilities, type Capability } from "@/lib/capabilities"

const tenantRepository = new TenantRepository()

export async function requireTenantCapability(input: {
  tenantSlug: string
  capability: Capability
}) {
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

  const tenant = await tenantRepository.findBySlug(input.tenantSlug)

  if (!tenant) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "not_found",
          message: "Tenant não encontrado.",
        },
        { status: 404 }
      ),
    }
  }

  const membership = auth.session.tenantMemberships.find(
    (item) => item.tenantId === tenant.id && item.status === "active"
  )

  const userCapabilities = mergeCapabilities(
    getCapabilitiesForRoles(auth.session.systemRoles),
    membership ? getCapabilitiesForRoles([membership.role]) : []
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
    tenant,
    membership,
    userCapabilities,
  }
}
