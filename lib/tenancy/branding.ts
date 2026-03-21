import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import type { TenantContext } from "@/lib/tenancy/types"

export interface TenantBranding {
  appName: string
  shortName: string
  themeColor: string
  backgroundColor: string
  logoUrl: string | null
  bannerUrl: string | null
}

const tenantPalette = [
  "#16a34a",
  "#2563eb",
  "#dc2626",
  "#d97706",
  "#0891b2",
]

function hashString(value: string): number {
  return value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

export function getTenantBranding(tenant: TenantContext): TenantBranding {
  if (tenant.kind !== "tenant" || !tenant.tenantSlug) {
    return {
      appName: "Dojo",
      shortName: "Dojo",
      themeColor: "#1a1a2e",
      backgroundColor: "#0f172a",
      logoUrl: null,
      bannerUrl: null,
    }
  }

  const colorIndex = hashString(tenant.tenantSlug) % tenantPalette.length
  const appName = tenant.tenantName ? `${tenant.tenantName} App` : "Dojo App"

  return {
    appName,
    shortName: tenant.tenantName ?? "Dojo",
    themeColor: tenantPalette[colorIndex],
    backgroundColor: "#0f172a",
    logoUrl: null,
    bannerUrl: null,
  }
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null
}

const tenantRepository = new TenantRepository()

export async function getResolvedTenantBranding(tenant: TenantContext): Promise<TenantBranding> {
  if (tenant.kind !== "tenant" || !tenant.tenantSlug) {
    return getTenantBranding(tenant)
  }

  const tenantResolution = tenant.isCustomDomain
    ? await tenantRepository.findByDomain(tenant.host)
    : null
  const tenantEntity = tenantResolution?.tenant ?? (await tenantRepository.findBySlug(tenant.tenantSlug))

  if (!tenantEntity) {
    return getTenantBranding({
      kind: "unknown",
      host: tenant.host,
      tenantSlug: null,
      tenantName: null,
      isCustomDomain: false,
    })
  }

  const fallback = getTenantBranding({
    kind: "tenant",
    host: tenant.host,
    tenantSlug: tenantEntity.slug,
    tenantName: tenantEntity.displayName,
    isCustomDomain: Boolean(tenantResolution?.domain ?? tenant.isCustomDomain),
  })
  const brandingJson =
    tenantEntity?.brandingJson && typeof tenantEntity.brandingJson === "object" && !Array.isArray(tenantEntity.brandingJson)
      ? (tenantEntity.brandingJson as Record<string, unknown>)
      : null

  return {
    appName: readString(brandingJson?.appName) ?? fallback.appName,
    shortName: tenantEntity.displayName ?? fallback.shortName,
    themeColor: readString(brandingJson?.primaryColor) ?? fallback.themeColor,
    backgroundColor: readString(brandingJson?.secondaryColor) ?? fallback.backgroundColor,
    logoUrl: readString(brandingJson?.logoUrl),
    bannerUrl: readString(brandingJson?.bannerUrl),
  }
}
