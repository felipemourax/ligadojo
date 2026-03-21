import { normalizeMarketingBrandKitConfig } from "@/apps/api/src/modules/marketing/domain/marketing-mappers"
import { MarketingBrandKitRepository } from "@/apps/api/src/modules/marketing/repositories/marketing-brand-kit.repository"
import { MarketingLogoEnhancementService } from "@/apps/api/src/modules/marketing/services/marketing-logo-enhancement.service"

export class MarketingBrandKitService {
  constructor(
    private readonly repository = new MarketingBrandKitRepository(),
    private readonly logoEnhancementService = new MarketingLogoEnhancementService()
  ) {}

  async getForTenant(tenantId: string) {
    return this.repository.ensureForTenant(tenantId)
  }

  async save(input: { tenantId: string; config: unknown }) {
    const normalized = normalizeMarketingBrandKitConfig(input.config)
    const enhancedAssets = await this.logoEnhancementService.enhanceAssets({
      tenantId: input.tenantId,
      assets: normalized.assets,
    })
    return this.repository.save({
      tenantId: input.tenantId,
      config: {
        ...normalized,
        assets: enhancedAssets,
      },
    })
  }
}
