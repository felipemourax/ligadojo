import { headers } from "next/headers"
import { TENANCY_HEADERS } from "@/lib/tenancy/config"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"
import type { TenantContext } from "@/lib/tenancy/types"

export async function getTenantContext(): Promise<TenantContext> {
  const requestHeaders = await headers()

  const kind = requestHeaders.get(TENANCY_HEADERS.kind)
  const host = requestHeaders.get(TENANCY_HEADERS.host)
  const tenantSlug = requestHeaders.get(TENANCY_HEADERS.slug)
  const tenantName = requestHeaders.get(TENANCY_HEADERS.name)
  const isCustomDomain = requestHeaders.get(TENANCY_HEADERS.customDomain) === "true"

  if (!kind || !host) {
    return resolveTenantFromHost(
      requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
    )
  }

  return {
    kind: kind as TenantContext["kind"],
    host,
    tenantSlug,
    tenantName,
    isCustomDomain,
  }
}
