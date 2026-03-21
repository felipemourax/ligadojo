import type {
  MarketingGeneration,
  MarketingGenerationStatus as PrismaMarketingGenerationStatus,
  MarketingUsageEventType as PrismaMarketingUsageEventType,
} from "@prisma/client"
import { Prisma } from "@prisma/client"
import type {
  MarketingGenerationEntity,
  MarketingGenerationInput,
  MarketingGenerationResult,
  MarketingUsageEventType,
} from "@/apps/api/src/modules/marketing/domain/marketing"

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeGenerationInput(input: unknown): MarketingGenerationInput {
  const value = isObject(input) ? input : {}
  const selectedAssetIds = Array.isArray(value.selectedAssetIds)
    ? value.selectedAssetIds.filter((item): item is string => typeof item === "string")
    : []

  return {
    objective:
      value.objective === "training" ||
      value.objective === "evolution" ||
      value.objective === "event" ||
      value.objective === "kids" ||
      value.objective === "trial" ||
      value.objective === "attract"
        ? value.objective
        : "attract",
    contentType:
      value.contentType === "story" ||
      value.contentType === "carousel" ||
      value.contentType === "reels" ||
      value.contentType === "post"
        ? value.contentType
        : "post",
    selectedTemplateId: typeof value.selectedTemplateId === "string" ? value.selectedTemplateId : undefined,
    selectedAssetIds,
    uploadSource:
      value.uploadSource === "manual_upload" || value.uploadSource === "camera" || value.uploadSource === "brand_kit"
        ? value.uploadSource
        : "brand_kit",
    activityCategory:
      typeof value.activityCategory === "string" && value.activityCategory.trim().length > 0
        ? value.activityCategory.trim()
        : undefined,
    promptNotes: typeof value.promptNotes === "string" ? value.promptNotes : undefined,
    tone: typeof value.tone === "string" ? value.tone : undefined,
    callToAction: typeof value.callToAction === "string" ? value.callToAction : undefined,
  }
}

function normalizeGenerationResult(input: unknown): MarketingGenerationResult | null {
  if (!isObject(input) || typeof input.caption !== "string" || typeof input.headline !== "string") {
    return null
  }

  return {
    headline: input.headline,
    caption: input.caption,
    hashtags: Array.isArray(input.hashtags)
      ? input.hashtags.filter((item): item is string => typeof item === "string")
      : [],
    callToAction: typeof input.callToAction === "string" ? input.callToAction : "",
    suggestedFormat: typeof input.suggestedFormat === "string" ? input.suggestedFormat : "post",
    imageUrl: typeof input.imageUrl === "string" ? input.imageUrl : null,
  }
}

function fromPrismaStatus(status: PrismaMarketingGenerationStatus) {
  switch (status) {
    case "PROCESSING":
      return "processing"
    case "SUCCEEDED":
      return "succeeded"
    case "FAILED":
      return "failed"
    case "DRAFT":
    default:
      return "draft"
  }
}

function toPrismaUsageEventType(eventType: MarketingUsageEventType): PrismaMarketingUsageEventType {
  switch (eventType) {
    case "caption_generation":
      return "CAPTION_GENERATION"
    case "image_generation":
      return "IMAGE_GENERATION"
    case "asset_processing":
      return "ASSET_PROCESSING"
    case "template_render":
    default:
      return "TEMPLATE_RENDER"
  }
}

export function toMarketingGenerationEntity(generation: MarketingGeneration): MarketingGenerationEntity {
  return {
    id: generation.id,
    tenantId: generation.tenantId,
    brandKitId: generation.brandKitId ?? null,
    templateId: generation.templateId ?? null,
    status: fromPrismaStatus(generation.status),
    createdAt: generation.createdAt.toISOString(),
    updatedAt: generation.updatedAt.toISOString(),
    input: normalizeGenerationInput(generation.promptInputJson),
    result: (() => {
      const normalized = normalizeGenerationResult(generation.resultCaption ? JSON.parse(generation.resultCaption) : null)
      if (!normalized) {
        return null
      }

      return {
        ...normalized,
        imageUrl: generation.resultImageUrl ?? normalized.imageUrl ?? null,
      }
    })(),
  }
}

export function toMarketingGenerationCreatePersistence(input: {
  tenantId: string
  brandKitId?: string | null
  templateId?: string | null
  generationInput: MarketingGenerationInput
  generationResult: MarketingGenerationResult
}): Prisma.MarketingGenerationUncheckedCreateInput {
  return {
    tenantId: input.tenantId,
    brandKitId: input.brandKitId ?? null,
    templateId: input.templateId ?? null,
    status: "SUCCEEDED",
    promptInputJson: input.generationInput as unknown as Prisma.InputJsonValue,
    resultCaption: JSON.stringify(input.generationResult),
    resultImageUrl: input.generationResult.imageUrl ?? null,
    usedAssetIdsJson: input.generationInput.selectedAssetIds as unknown as Prisma.InputJsonValue,
    provider: "internal-deterministic",
    costEstimateUsd: new Prisma.Decimal("0.0000"),
  }
}

export function toMarketingUsageLedgerCreatePersistence(input: {
  tenantId: string
  brandKitId?: string | null
  eventType: MarketingUsageEventType
  units: number
  metadata?: Record<string, unknown>
}): Prisma.MarketingUsageLedgerUncheckedCreateInput {
  const now = new Date()
  const periodKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`

  return {
    tenantId: input.tenantId,
    brandKitId: input.brandKitId ?? null,
    periodKey,
    eventType: toPrismaUsageEventType(input.eventType),
    units: input.units,
    estimatedCostUsd: new Prisma.Decimal("0.0000"),
    metadataJson: (input.metadata ?? null) as Prisma.InputJsonValue,
  }
}

export { normalizeGenerationInput, normalizeGenerationResult }
