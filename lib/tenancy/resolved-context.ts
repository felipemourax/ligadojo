import { cache } from "react"
import type {
  TenantDomainEntity,
  TenantEntity,
} from "@/apps/api/src/modules/tenancy/domain/tenant"
import { TenantResolutionService } from "@/apps/api/src/modules/tenancy/services/tenant-resolution.service"
import { getTenantContext } from "@/lib/tenancy/get-tenant-context"
import type { TenantContext } from "@/lib/tenancy/types"

const tenantResolutionService = new TenantResolutionService()

export interface ResolvedTenantSurfaceContext {
  request: TenantContext
  tenant: TenantContext
  resolvedTenant: TenantEntity | null
  resolvedDomain: TenantDomainEntity | null
  invalidTenantHost: boolean
  suggestedQuery: string
}

function toSearchQuery(value: string | null) {
  if (!value) {
    return ""
  }

  const withoutLocalSuffix = value.replace(/\.localhost$/i, "")
  return withoutLocalSuffix.replace(/[.-]+/g, " ").trim()
}

export const getResolvedTenantSurfaceContext = cache(
  async (): Promise<ResolvedTenantSurfaceContext> => {
    const request = await getTenantContext()

    if (request.kind !== "tenant") {
      return {
        request,
        tenant: request,
        resolvedTenant: null,
        resolvedDomain: null,
        invalidTenantHost: false,
        suggestedQuery: "",
      }
    }

    const resolution = await tenantResolutionService.resolveFromHost(request.host)

    if (!resolution.tenant) {
      return {
        request,
        tenant: {
          kind: "unknown",
          host: request.host,
          tenantSlug: null,
          tenantName: null,
          isCustomDomain: false,
        },
        resolvedTenant: null,
        resolvedDomain: null,
        invalidTenantHost: true,
        suggestedQuery: toSearchQuery(request.host),
      }
    }

    return {
      request,
      tenant: {
        kind: "tenant",
        host: request.host,
        tenantSlug: resolution.tenant.slug,
        tenantName: resolution.tenant.displayName,
        isCustomDomain: Boolean(resolution.domain),
      },
      resolvedTenant: resolution.tenant,
      resolvedDomain: resolution.domain,
      invalidTenantHost: false,
      suggestedQuery: "",
    }
  }
)
