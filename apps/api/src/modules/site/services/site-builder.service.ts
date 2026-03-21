import type { TenantSiteConfig } from "@/apps/api/src/modules/site/domain/site"
import { normalizeTenantSiteConfig } from "@/apps/api/src/modules/site/domain/site-mappers"
import { TenantSiteRepository } from "@/apps/api/src/modules/site/repositories/tenant-site.repository"

export class SiteBuilderService {
  constructor(private readonly repository = new TenantSiteRepository()) {}

  async getForTenant(tenantId: string) {
    return this.repository.ensureForTenant(tenantId)
  }

  async saveDraft(input: { tenantId: string; config: unknown }) {
    const normalized = normalizeTenantSiteConfig(input.config)
    return this.repository.saveDraft({
      tenantId: input.tenantId,
      config: normalized,
    })
  }

  async publish(tenantId: string) {
    return this.repository.publish(tenantId)
  }

  async unpublish(tenantId: string) {
    return this.repository.unpublish(tenantId)
  }
}
