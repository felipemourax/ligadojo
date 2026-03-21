import type { MarketingAssetEntity } from "@/apps/api/src/modules/marketing/domain/marketing"
import { MarketingAiOrchestratorService } from "@/apps/api/src/modules/marketing/services/marketing-ai-orchestrator.service"

type LogoEnhancementStatus = "succeeded" | "failed" | "skipped_vector"

interface LogoEnhancementMetadata {
  status: LogoEnhancementStatus
  processedAt: string
  provider?: string
  reason?: string
  sourceMimeType?: string | null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readLogoEnhancementMetadata(
  metadata: MarketingAssetEntity["metadata"]
): LogoEnhancementMetadata | null {
  if (!isObject(metadata) || !isObject(metadata.logoEnhancement)) {
    return null
  }

  const value = metadata.logoEnhancement
  if (
    value.status !== "succeeded" &&
    value.status !== "failed" &&
    value.status !== "skipped_vector"
  ) {
    return null
  }

  return {
    status: value.status,
    processedAt: typeof value.processedAt === "string" ? value.processedAt : new Date().toISOString(),
    provider: typeof value.provider === "string" ? value.provider : undefined,
    reason: typeof value.reason === "string" ? value.reason : undefined,
    sourceMimeType: typeof value.sourceMimeType === "string" ? value.sourceMimeType : null,
  }
}

function withLogoEnhancementMetadata(
  asset: MarketingAssetEntity,
  metadata: LogoEnhancementMetadata,
  originalAsset?: Pick<MarketingAssetEntity, "fileUrl" | "thumbnailUrl" | "mimeType" | "name">
): MarketingAssetEntity {
  const currentMetadata = isObject(asset.metadata) ? asset.metadata : {}
  return {
    ...asset,
    metadata: {
      ...currentMetadata,
      originalAsset:
        "originalAsset" in currentMetadata
          ? currentMetadata.originalAsset
          : originalAsset ?? {
              fileUrl: asset.fileUrl,
              thumbnailUrl: asset.thumbnailUrl,
              mimeType: asset.mimeType,
              name: asset.name,
            },
      logoEnhancement: metadata,
    },
  }
}

function buildLogoEnhancementPrompt() {
  return [
    "Extract and refine the exact uploaded martial arts academy logo.",
    "Remove the background completely and isolate only the logo.",
    "Improve edge quality, anti-aliasing, sharpness, and readability.",
    "Preserve the exact colors, proportions, typography, wording, and icon shapes.",
    "It is strictly forbidden to alter, reinterpret, rebalance, recolor, replace, saturate, brighten, darken, or remap any brand color from the original logo.",
    "Every visible color in the output must match the original uploaded logo exactly.",
    "Do not redesign, simplify, stylize, add shadows, add glow, invent symbols, or change the brand.",
    "Return a clean centered logo asset ready to reuse in creative pieces.",
  ].join(" ")
}

export class MarketingLogoEnhancementService {
  constructor(private readonly aiOrchestrator = new MarketingAiOrchestratorService()) {}

  async enhanceAssets(input: { tenantId: string; assets: MarketingAssetEntity[] }) {
    return Promise.all(input.assets.map((asset) => this.enhanceAsset(input.tenantId, asset)))
  }

  private async enhanceAsset(tenantId: string, asset: MarketingAssetEntity): Promise<MarketingAssetEntity> {
    if (asset.type !== "logo") {
      return asset
    }

    const currentMetadata = readLogoEnhancementMetadata(asset.metadata)
    if (currentMetadata?.status === "succeeded" || currentMetadata?.status === "skipped_vector") {
      return asset
    }

    if (asset.mimeType?.includes("svg")) {
      return withLogoEnhancementMetadata(asset, {
        status: "skipped_vector",
        processedAt: new Date().toISOString(),
        reason: "vector_source_preserved",
        sourceMimeType: asset.mimeType,
      })
    }

    try {
      const originalAsset = {
        fileUrl: asset.fileUrl,
        thumbnailUrl: asset.thumbnailUrl,
        mimeType: asset.mimeType,
        name: asset.name,
      } as const

      const enhancedDataUrl = await this.aiOrchestrator.enhanceLogo({
        tenantId,
        request: {
          prompt: buildLogoEnhancementPrompt(),
          sourceImage: {
            name: asset.name,
            mimeType: asset.mimeType,
            imageUrl: asset.fileUrl,
            role: "logo",
          },
        },
      })

      return withLogoEnhancementMetadata(
        {
          ...asset,
          fileUrl: enhancedDataUrl.imageUrl,
          thumbnailUrl: enhancedDataUrl.imageUrl,
          mimeType: enhancedDataUrl.mimeType,
        },
        {
          status: "succeeded",
          processedAt: new Date().toISOString(),
          provider: enhancedDataUrl.provider,
          sourceMimeType: asset.mimeType,
          reason: undefined,
        },
        originalAsset
      )
    } catch (error) {
      return withLogoEnhancementMetadata(asset, {
        status: "failed",
        processedAt: new Date().toISOString(),
        reason: error instanceof Error ? error.message : "unknown_logo_processing_error",
        sourceMimeType: asset.mimeType,
      })
    }
  }
}
