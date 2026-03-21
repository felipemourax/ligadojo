import {
  normalizeMarketingAiSettings,
  type MarketingAiSettingsEntity,
} from "@/apps/api/src/modules/marketing/domain/marketing-ai"
import { MarketingAiSettingsRepository } from "@/apps/api/src/modules/marketing/repositories/marketing-ai-settings.repository"

export class MarketingAiSettingsService {
  constructor(private readonly repository = new MarketingAiSettingsRepository()) {}

  async getForTenant(tenantId: string) {
    const settings = await this.repository.ensureForTenant(tenantId)
    const normalized = normalizeMarketingAiSettings(settings)

    if (
      normalized.primaryImageModel !== settings.primaryImageModel ||
      normalized.fallbackImageModel !== settings.fallbackImageModel
    ) {
      return this.repository.save({
        tenantId,
        settings: {
          enabled: normalized.enabled,
          primaryTextProvider: normalized.primaryTextProvider,
          primaryTextModel: normalized.primaryTextModel,
          fallbackTextProvider: normalized.fallbackTextProvider,
          fallbackTextModel: normalized.fallbackTextModel,
          primaryImageProvider: normalized.primaryImageProvider,
          primaryImageModel: normalized.primaryImageModel,
          fallbackImageProvider: normalized.fallbackImageProvider,
          fallbackImageModel: normalized.fallbackImageModel,
          allowTextGeneration: normalized.allowTextGeneration,
          allowImageGeneration: normalized.allowImageGeneration,
        },
      })
    }

    return normalized
  }

  async save(input: {
    tenantId: string
    settings: Omit<MarketingAiSettingsEntity, "id" | "tenantId" | "createdAt" | "updatedAt">
  }) {
    const normalized = normalizeMarketingAiSettings({
      id: "",
      tenantId: input.tenantId,
      createdAt: "",
      updatedAt: "",
      ...input.settings,
    })

    return this.repository.save({
      tenantId: input.tenantId,
      settings: {
        enabled: normalized.enabled,
        primaryTextProvider: normalized.primaryTextProvider,
        primaryTextModel: normalized.primaryTextModel,
        fallbackTextProvider: normalized.fallbackTextProvider,
        fallbackTextModel: normalized.fallbackTextModel,
        primaryImageProvider: normalized.primaryImageProvider,
        primaryImageModel: normalized.primaryImageModel,
        fallbackImageProvider: normalized.fallbackImageProvider,
        fallbackImageModel: normalized.fallbackImageModel,
        allowTextGeneration: normalized.allowTextGeneration,
        allowImageGeneration: normalized.allowImageGeneration,
      },
    })
  }
}
