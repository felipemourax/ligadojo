import type { Tenant, TenantDomain, TenantStatus } from "@prisma/client"
import type { TenantDomainEntity, TenantEntity } from "@/apps/api/src/modules/tenancy/domain/tenant"

function mapTenantStatus(status: TenantStatus): TenantEntity["status"] {
  return status.toLowerCase() as TenantEntity["status"]
}

export function toTenantEntity(tenant: Tenant): TenantEntity {
  return {
    id: tenant.id,
    slug: tenant.slug,
    legalName: tenant.legalName,
    displayName: tenant.displayName,
    status: mapTenantStatus(tenant.status),
    brandingJson: tenant.brandingJson ?? undefined,
  }
}

export function toTenantDomainEntity(domain: TenantDomain): TenantDomainEntity {
  return {
    id: domain.id,
    tenantId: domain.tenantId,
    domain: domain.domain,
    isPrimary: domain.isPrimary,
    isVerified: domain.isVerified,
  }
}
