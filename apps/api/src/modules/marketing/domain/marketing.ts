export type MarketingAssetType =
  | "logo"
  | "academy_photo"
  | "space_photo"
  | "team_photo"
  | "professor_photo"
  | "general_photo"

export type MarketingAssetSource = "brand_kit" | "manual_upload" | "camera" | "generated"
export type MarketingGenerationStatus = "draft" | "processing" | "succeeded" | "failed"
export type MarketingUsageEventType =
  | "template_render"
  | "caption_generation"
  | "image_generation"
  | "asset_processing"

export interface MarketingAssetEntity {
  id: string
  tenantId: string
  type: MarketingAssetType
  source: MarketingAssetSource
  name: string
  fileUrl: string
  thumbnailUrl: string | null
  mimeType: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface MarketingBrandKitConfig {
  colors: {
    primary?: string
    secondary?: string
    accent?: string
  }
  typography: {
    headingFont?: string
    bodyFont?: string
  }
  selectedLogoAssetId?: string
  notes?: string
  assets: MarketingAssetEntity[]
}

export interface MarketingBrandKitEntity {
  id: string
  tenantId: string
  createdAt: string
  updatedAt: string
  config: MarketingBrandKitConfig
}

export interface MarketingAcademyActivity {
  value: string
  label: string
}

export interface MarketingGenerationInput {
  objective:
    | "attract"
    | "training"
    | "evolution"
    | "event"
    | "kids"
    | "trial"
  contentType: "post" | "story" | "carousel" | "reels"
  selectedTemplateId?: string
  selectedAssetIds: string[]
  uploadSource: "brand_kit" | "manual_upload" | "camera"
  activityCategory?: string
  promptNotes?: string
  tone?: string
  callToAction?: string
}

export interface MarketingGenerationResult {
  headline: string
  caption: string
  hashtags: string[]
  callToAction: string
  suggestedFormat: string
  imageUrl?: string | null
}

export interface MarketingGenerationEntity {
  id: string
  tenantId: string
  brandKitId: string | null
  templateId: string | null
  status: MarketingGenerationStatus
  createdAt: string
  updatedAt: string
  input: MarketingGenerationInput
  result: MarketingGenerationResult | null
}

export const marketingAssetTypes: MarketingAssetType[] = [
  "logo",
  "academy_photo",
  "space_photo",
  "team_photo",
  "professor_photo",
  "general_photo",
]

export const marketingAssetSources: MarketingAssetSource[] = [
  "brand_kit",
  "manual_upload",
  "camera",
  "generated",
]

export const defaultMarketingTypography = {
  headingFont: "Oswald",
  bodyFont: "Inter",
}

export function createDefaultMarketingBrandKitConfig(): MarketingBrandKitConfig {
  return {
    colors: {
      primary: "#111827",
      secondary: "#475569",
      accent: "#dc2626",
    },
    typography: { ...defaultMarketingTypography },
    selectedLogoAssetId: undefined,
    notes: "",
    assets: [],
  }
}
