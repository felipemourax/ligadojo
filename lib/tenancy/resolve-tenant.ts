import { PLATFORM_HOSTS, RESERVED_SUBDOMAINS } from "@/lib/tenancy/config"
import type { TenantContext } from "@/lib/tenancy/types"

function normalizeHost(rawHost: string | null | undefined): string {
  if (!rawHost) {
    return "localhost"
  }

  return rawHost.split(":")[0].trim().toLowerCase()
}

function formatTenantName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function resolveTenantFromHost(rawHost: string | null | undefined): TenantContext {
  const host = normalizeHost(rawHost)

  if (PLATFORM_HOSTS.has(host)) {
    return {
      kind: "platform",
      host,
      tenantSlug: null,
      tenantName: null,
      isCustomDomain: false,
    }
  }

  const segments = host.split(".").filter(Boolean)

  if (host.endsWith(".localhost") && segments.length >= 2) {
    const subdomain = segments[0]

    if (!RESERVED_SUBDOMAINS.has(subdomain)) {
      return {
        kind: "tenant",
        host,
        tenantSlug: subdomain,
        tenantName: formatTenantName(subdomain),
        isCustomDomain: false,
      }
    }
  }

  if (segments.length >= 3) {
    const subdomain = segments[0]

    if (!RESERVED_SUBDOMAINS.has(subdomain)) {
      return {
        kind: "tenant",
        host,
        tenantSlug: subdomain,
        tenantName: formatTenantName(subdomain),
        isCustomDomain: false,
      }
    }
  }

  if (segments.length >= 2 && !host.endsWith(".localhost")) {
    return {
      kind: "tenant",
      host,
      tenantSlug: segments[0],
      tenantName: formatTenantName(segments[0]),
      isCustomDomain: true,
    }
  }

  return {
    kind: "unknown",
    host,
    tenantSlug: null,
    tenantName: null,
    isCustomDomain: false,
  }
}
