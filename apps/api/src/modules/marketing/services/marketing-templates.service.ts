import { MarketingBrandKitRepository } from "@/apps/api/src/modules/marketing/repositories/marketing-brand-kit.repository"
import { buildMarketingTemplateViews } from "@/apps/api/src/modules/marketing/domain/marketing-templates"

export class MarketingTemplatesService {
  constructor(private readonly brandKitRepository = new MarketingBrandKitRepository()) {}

  async listForTenant(tenantId: string) {
    const brandKit = await this.brandKitRepository.ensureForTenant(tenantId)
    return buildMarketingTemplateViews({ brandKit })
  }
}
