export type MarketingAiProvider = "gemini" | "openai"
export type MarketingAiCapability = "text" | "image"

export interface MarketingAiSettingsEntity {
  id: string
  tenantId: string
  enabled: boolean
  primaryTextProvider: MarketingAiProvider
  primaryTextModel: string
  fallbackTextProvider: MarketingAiProvider
  fallbackTextModel: string
  primaryImageProvider: MarketingAiProvider
  primaryImageModel: string
  fallbackImageProvider: MarketingAiProvider
  fallbackImageModel: string
  allowTextGeneration: boolean
  allowImageGeneration: boolean
  createdAt: string
  updatedAt: string
}

const imageModelFallbacks = {
  gemini: "gemini-2.5-flash-image",
  openai: "gpt-image-1.5",
} as const

export function createDefaultMarketingAiSettings(): Omit<
  MarketingAiSettingsEntity,
  "id" | "tenantId" | "createdAt" | "updatedAt"
> {
  return {
    enabled: true,
    primaryTextProvider: "gemini",
    primaryTextModel: "gemini-2.5-flash",
    fallbackTextProvider: "openai",
    fallbackTextModel: "gpt-5-mini",
    primaryImageProvider: "gemini",
    primaryImageModel: imageModelFallbacks.gemini,
    fallbackImageProvider: "openai",
    fallbackImageModel: imageModelFallbacks.openai,
    allowTextGeneration: true,
    allowImageGeneration: true,
  }
}

export function normalizeMarketingAiSettings(
  settings: MarketingAiSettingsEntity
): MarketingAiSettingsEntity {
  const primaryImageModel =
    settings.primaryImageModel === "gemini-2.0-flash-preview-image-generation"
      ? imageModelFallbacks.gemini
      : settings.primaryImageModel === "gpt-image-1"
        ? imageModelFallbacks.openai
        : settings.primaryImageModel

  const fallbackImageModel =
    settings.fallbackImageModel === "gemini-2.0-flash-preview-image-generation"
      ? imageModelFallbacks.gemini
      : settings.fallbackImageModel === "gpt-image-1"
        ? imageModelFallbacks.openai
        : settings.fallbackImageModel

  return {
    ...settings,
    primaryImageModel,
    fallbackImageModel,
  }
}

export interface MarketingTextGenerationRequest {
  prompt: string
  systemInstruction?: string
}

export interface MarketingTextGenerationResponse {
  provider: MarketingAiProvider
  model: string
  text: string
}

export interface MarketingImageGenerationRequest {
  prompt: string
  aspectRatio: "1:1" | "4:5" | "9:16"
  references?: MarketingImageReference[]
}

export interface MarketingImageGenerationResponse {
  provider: MarketingAiProvider
  model: string
  imageUrl: string
  mimeType: string
}

export interface MarketingLogoEnhancementRequest {
  prompt: string
  sourceImage: MarketingImageReference
}

export interface MarketingLogoEnhancementResponse {
  provider: MarketingAiProvider
  model: string
  imageUrl: string
  mimeType: string
}

export interface MarketingImageReference {
  name: string
  mimeType?: string | null
  imageUrl: string
  role: "logo" | "photo"
}
