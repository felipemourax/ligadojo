export type TenantHostKind = "platform" | "tenant" | "unknown"

export interface TenantContext {
  kind: TenantHostKind
  host: string
  tenantSlug: string | null
  tenantName: string | null
  isCustomDomain: boolean
}
