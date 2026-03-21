import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"

export class TenantResolutionService {
  constructor(private readonly tenantRepository = new TenantRepository()) {}

  async resolveFromHost(host: string) {
    const resolvedHost = resolveTenantFromHost(host)

    if (resolvedHost.kind === "platform" || resolvedHost.kind === "unknown") {
      return {
        kind: resolvedHost.kind,
        host: resolvedHost.host,
        tenant: null,
        domain: null,
      }
    }

    if (resolvedHost.isCustomDomain) {
      const mappedTenant = await this.tenantRepository.findByDomain(resolvedHost.host)

      return {
        kind: resolvedHost.kind,
        host: resolvedHost.host,
        tenant: mappedTenant?.tenant ?? null,
        domain: mappedTenant?.domain ?? null,
      }
    }

    const tenant = await this.tenantRepository.findBySlug(resolvedHost.tenantSlug ?? "")

    return {
      kind: resolvedHost.kind,
      host: resolvedHost.host,
      tenant,
      domain: null,
    }
  }
}
