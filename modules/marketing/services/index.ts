import type {
  MarketingAcademyActivity,
  MarketingBrandKitEntity,
  MarketingGenerationEntity,
  MarketingGenerationInput,
} from "@/apps/api/src/modules/marketing/domain/marketing"
import type { MarketingAiSettingsEntity } from "@/apps/api/src/modules/marketing/domain/marketing-ai"
import type { MarketingTemplateView } from "@/apps/api/src/modules/marketing/domain/marketing-templates"
import { fetchJson } from "@/lib/api/client"

interface BrandKitResponse {
  brandKit: MarketingBrandKitEntity
  message?: string
}

interface GenerationResponse {
  generation: MarketingGenerationEntity
  message?: string
}

interface AiSettingsResponse {
  settings: MarketingAiSettingsEntity
  message?: string
}

export async function fetchMarketingBrandKit() {
  return fetchJson<MarketingBrandKitEntity>("/api/marketing/brand-kit")
}

export async function saveMarketingBrandKit(config: MarketingBrandKitEntity["config"]) {
  return fetchJson<BrandKitResponse>("/api/marketing/brand-kit", {
    method: "PUT",
    body: JSON.stringify({ config }),
  })
}

export async function fetchMarketingTemplates() {
  return fetchJson<MarketingTemplateView[]>("/api/marketing/templates")
}

export async function fetchMarketingHistory() {
  return fetchJson<MarketingGenerationEntity[]>("/api/marketing/history")
}

export async function fetchMarketingAcademyActivities() {
  return fetchJson<MarketingAcademyActivity[]>("/api/marketing/academy-activities")
}

export async function generateMarketingContent(input: MarketingGenerationInput) {
  return fetchJson<GenerationResponse>("/api/marketing/generate", {
    method: "POST",
    body: JSON.stringify({ input }),
  })
}

export async function generateMarketingImage(generationId: string) {
  return fetchJson<GenerationResponse>("/api/marketing/generate-image", {
    method: "POST",
    body: JSON.stringify({ generationId }),
  })
}

export async function fetchMarketingAiSettings() {
  return fetchJson<MarketingAiSettingsEntity>("/api/marketing/ai-settings")
}

export async function saveMarketingAiSettings(
  settings: Omit<MarketingAiSettingsEntity, "id" | "tenantId" | "createdAt" | "updatedAt">
) {
  return fetchJson<AiSettingsResponse>("/api/marketing/ai-settings", {
    method: "PUT",
    body: JSON.stringify({ settings }),
  })
}
