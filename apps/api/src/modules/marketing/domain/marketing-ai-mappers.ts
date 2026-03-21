import type { MarketingAiProvider as PrismaMarketingAiProvider, MarketingAiSettings } from "@prisma/client"
import type { MarketingAiProvider, MarketingAiSettingsEntity } from "@/apps/api/src/modules/marketing/domain/marketing-ai"

function fromPrismaProvider(provider: PrismaMarketingAiProvider): MarketingAiProvider {
  return provider === "OPENAI" ? "openai" : "gemini"
}

function toPrismaProvider(provider: MarketingAiProvider): PrismaMarketingAiProvider {
  return provider === "openai" ? "OPENAI" : "GEMINI"
}

export function toMarketingAiSettingsEntity(settings: MarketingAiSettings): MarketingAiSettingsEntity {
  return {
    id: settings.id,
    tenantId: settings.tenantId,
    enabled: settings.enabled,
    primaryTextProvider: fromPrismaProvider(settings.primaryTextProvider),
    primaryTextModel: settings.primaryTextModel,
    fallbackTextProvider: fromPrismaProvider(settings.fallbackTextProvider),
    fallbackTextModel: settings.fallbackTextModel,
    primaryImageProvider: fromPrismaProvider(settings.primaryImageProvider),
    primaryImageModel: settings.primaryImageModel,
    fallbackImageProvider: fromPrismaProvider(settings.fallbackImageProvider),
    fallbackImageModel: settings.fallbackImageModel,
    allowTextGeneration: settings.allowTextGeneration,
    allowImageGeneration: settings.allowImageGeneration,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  }
}

export function toMarketingAiSettingsPersistence(input: Omit<
  MarketingAiSettingsEntity,
  "id" | "tenantId" | "createdAt" | "updatedAt"
>) {
  return {
    enabled: input.enabled,
    primaryTextProvider: toPrismaProvider(input.primaryTextProvider),
    primaryTextModel: input.primaryTextModel,
    fallbackTextProvider: toPrismaProvider(input.fallbackTextProvider),
    fallbackTextModel: input.fallbackTextModel,
    primaryImageProvider: toPrismaProvider(input.primaryImageProvider),
    primaryImageModel: input.primaryImageModel,
    fallbackImageProvider: toPrismaProvider(input.fallbackImageProvider),
    fallbackImageModel: input.fallbackImageModel,
    allowTextGeneration: input.allowTextGeneration,
    allowImageGeneration: input.allowImageGeneration,
  }
}
