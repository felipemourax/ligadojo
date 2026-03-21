import type {
  MarketingImageGenerationRequest,
  MarketingImageGenerationResponse,
  MarketingAiProvider,
  MarketingLogoEnhancementRequest,
  MarketingLogoEnhancementResponse,
  MarketingTextGenerationRequest,
  MarketingTextGenerationResponse,
} from "@/apps/api/src/modules/marketing/domain/marketing-ai"

export interface MarketingAiProviderClient {
  readonly provider: MarketingAiProvider
  generateText(input: {
    model: string
    request: MarketingTextGenerationRequest
  }): Promise<MarketingTextGenerationResponse>
  generateImage(input: {
    model: string
    request: MarketingImageGenerationRequest
  }): Promise<MarketingImageGenerationResponse>
  enhanceLogo(input: {
    model: string
    request: MarketingLogoEnhancementRequest
  }): Promise<MarketingLogoEnhancementResponse>
}
