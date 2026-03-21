export interface TenantRequestContext {
  tenantId: string | null
  tenantSlug: string | null
  tenantHost: string
  isCustomDomain: boolean
}

export function createTenantRequestContext(
  input: TenantRequestContext
): TenantRequestContext {
  return input
}
