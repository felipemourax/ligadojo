import type {
  MarketingImageGenerationRequest,
  MarketingImageGenerationResponse,
  MarketingAiProvider,
  MarketingLogoEnhancementRequest,
  MarketingLogoEnhancementResponse,
  MarketingTextGenerationRequest,
  MarketingTextGenerationResponse,
} from "@/apps/api/src/modules/marketing/domain/marketing-ai"
import { normalizeMarketingAiSettings } from "@/apps/api/src/modules/marketing/domain/marketing-ai"
import { MarketingAiSettingsRepository } from "@/apps/api/src/modules/marketing/repositories/marketing-ai-settings.repository"
import { GeminiMarketingProvider } from "@/apps/api/src/modules/marketing/services/providers/gemini-marketing-provider"
import { OpenAiMarketingProvider } from "@/apps/api/src/modules/marketing/services/providers/openai-marketing-provider"

export class MarketingAiOrchestratorService {
  private readonly providers = {
    gemini: new GeminiMarketingProvider(),
    openai: new OpenAiMarketingProvider(),
  } as const

  constructor(private readonly settingsRepository = new MarketingAiSettingsRepository()) {}

  async generateText(input: {
    tenantId: string
    request: MarketingTextGenerationRequest
  }): Promise<MarketingTextGenerationResponse> {
    const settings = normalizeMarketingAiSettings(
      await this.settingsRepository.ensureForTenant(input.tenantId)
    )
    if (!settings.enabled || !settings.allowTextGeneration) {
      throw new Error("Geracao de texto desabilitada para este tenant.")
    }

    const attempts: Array<{ provider: MarketingAiProvider; model: string }> = [
      { provider: settings.primaryTextProvider, model: settings.primaryTextModel },
      { provider: settings.fallbackTextProvider, model: settings.fallbackTextModel },
    ]

    let lastError: Error | null = null

    for (const attempt of attempts) {
      try {
        return await this.providers[attempt.provider].generateText({
          model: attempt.model,
          request: input.request,
        })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Falha desconhecida no provider.")
      }
    }

    throw lastError ?? new Error("Nenhum provider conseguiu gerar texto.")
  }

  async generateImage(input: {
    tenantId: string
    request: MarketingImageGenerationRequest
  }): Promise<MarketingImageGenerationResponse> {
    const settings = normalizeMarketingAiSettings(
      await this.settingsRepository.ensureForTenant(input.tenantId)
    )
    if (!settings.enabled || !settings.allowImageGeneration) {
      throw new Error("Geracao de imagem desabilitada para este tenant.")
    }

    const attempts: Array<{ provider: MarketingAiProvider; model: string }> = [
      { provider: settings.primaryImageProvider, model: settings.primaryImageModel },
      { provider: settings.fallbackImageProvider, model: settings.fallbackImageModel },
    ]

    let lastError: Error | null = null

    for (const attempt of attempts) {
      try {
        return await this.providers[attempt.provider].generateImage({
          model: attempt.model,
          request: input.request,
        })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Falha desconhecida no provider.")
      }
    }

    throw lastError ?? new Error("Nenhum provider conseguiu gerar imagem.")
  }

  async enhanceLogo(input: {
    tenantId: string
    request: MarketingLogoEnhancementRequest
  }): Promise<MarketingLogoEnhancementResponse> {
    const settings = normalizeMarketingAiSettings(
      await this.settingsRepository.ensureForTenant(input.tenantId)
    )
    if (!settings.enabled || !settings.allowImageGeneration) {
      throw new Error("Tratamento de logotipo desabilitado para este tenant.")
    }

    const attempts: Array<{ provider: MarketingAiProvider; model: string }> = [
      { provider: settings.primaryImageProvider, model: settings.primaryImageModel },
      { provider: settings.fallbackImageProvider, model: settings.fallbackImageModel },
    ]

    let lastError: Error | null = null

    for (const attempt of attempts) {
      try {
        return await this.providers[attempt.provider].enhanceLogo({
          model: attempt.model,
          request: input.request,
        })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Falha desconhecida no provider.")
      }
    }

    throw lastError ?? new Error("Nenhum provider conseguiu tratar o logotipo.")
  }
}
