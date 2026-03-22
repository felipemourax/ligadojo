import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
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
      appName: "LigaDojo",
      shortName: "LigaDojo",
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
    shortName: tenant.tenantName ?? "LigaDojo",
    themeColor: tenantPalette[colorIndex],
    backgroundColor: "#0f172a",
    logoUrl: null,
    bannerUrl: null,
  }
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null
}

export async function getResolvedTenantBranding(tenant: TenantContext): Promise<TenantBranding> {
  if (tenant.kind !== "tenant" || !tenant.tenantSlug) {
    return getTenantBranding(tenant)
  }

  const tenantResolution = tenant.isCustomDomain
    ? await prisma.tenantDomain.findUnique({
        where: { domain: tenant.host },
        include: {
          tenant: {
            include: {
              branding: true,
            },
          },
        },
      })
    : null
  const tenantRecord =
    tenantResolution?.tenant ??
    (await prisma.tenant.findUnique({
      where: { slug: tenant.tenantSlug },
      include: {
        branding: true,
      },
    }))

  if (!tenantRecord) {
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
    tenantSlug: tenantRecord.slug,
    tenantName: tenantRecord.displayName,
    isCustomDomain: Boolean(tenantResolution ?? tenant.isCustomDomain),
  })
  const brandingJson =
    tenantRecord.brandingJson && typeof tenantRecord.brandingJson === "object" && !Array.isArray(tenantRecord.brandingJson)
      ? (tenantRecord.brandingJson as Record<string, unknown>)
      : null

  return {
    appName: readString(brandingJson?.appName) ?? tenantRecord.branding?.appName ?? fallback.appName,
    shortName: tenantRecord.displayName ?? fallback.shortName,
    themeColor: readString(brandingJson?.primaryColor) ?? tenantRecord.branding?.primaryColor ?? fallback.themeColor,
    backgroundColor:
      readString(brandingJson?.secondaryColor) ?? tenantRecord.branding?.secondaryColor ?? fallback.backgroundColor,
    logoUrl: readString(brandingJson?.logoUrl) ?? tenantRecord.branding?.logoUrl ?? null,
    bannerUrl: readString(brandingJson?.bannerUrl) ?? tenantRecord.branding?.bannerUrl ?? null,
  }
}
