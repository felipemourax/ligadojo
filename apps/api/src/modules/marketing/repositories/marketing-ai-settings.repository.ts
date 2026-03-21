import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  createDefaultMarketingAiSettings,
  type MarketingAiSettingsEntity,
} from "@/apps/api/src/modules/marketing/domain/marketing-ai"
import {
  toMarketingAiSettingsEntity,
  toMarketingAiSettingsPersistence,
} from "@/apps/api/src/modules/marketing/domain/marketing-ai-mappers"

export class MarketingAiSettingsRepository {
  async findByTenantId(tenantId: string) {
    const settings = await prisma.marketingAiSettings.findUnique({
      where: { tenantId },
    })

    return settings ? toMarketingAiSettingsEntity(settings) : null
  }

  async ensureForTenant(tenantId: string) {
    const existing = await this.findByTenantId(tenantId)
    if (existing) {
      return existing
    }

    const created = await prisma.marketingAiSettings.create({
      data: {
        tenantId,
        ...toMarketingAiSettingsPersistence(createDefaultMarketingAiSettings()),
      },
    })

    return toMarketingAiSettingsEntity(created)
  }

  async save(input: {
    tenantId: string
    settings: Omit<MarketingAiSettingsEntity, "id" | "tenantId" | "createdAt" | "updatedAt">
  }) {
    const saved = await prisma.marketingAiSettings.upsert({
      where: { tenantId: input.tenantId },
      update: {
        ...toMarketingAiSettingsPersistence(input.settings),
      },
      create: {
        tenantId: input.tenantId,
        ...toMarketingAiSettingsPersistence(input.settings),
      },
    })

    return toMarketingAiSettingsEntity(saved)
  }
}
