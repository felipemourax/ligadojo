export interface TenantEntity {
  id: string
  slug: string
  legalName: string
  displayName: string
  status: "active" | "suspended" | "archived"
  brandingJson?: unknown
}

export interface TenantDomainEntity {
  id: string
  tenantId: string
  domain: string
  isPrimary: boolean
  isVerified: boolean
}
