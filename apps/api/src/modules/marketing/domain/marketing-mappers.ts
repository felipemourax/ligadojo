import type {
  MarketingAsset,
  MarketingAssetSource as PrismaMarketingAssetSource,
  MarketingAssetType as PrismaMarketingAssetType,
  MarketingBrandKit,
  Prisma,
} from "@prisma/client"
import {
  createDefaultMarketingBrandKitConfig,
  marketingAssetSources,
  marketingAssetTypes,
  type MarketingAssetEntity,
  type MarketingBrandKitConfig,
  type MarketingBrandKitEntity,
} from "@/apps/api/src/modules/marketing/domain/marketing"

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeAssetType(value: unknown): MarketingAssetEntity["type"] {
  return marketingAssetTypes.includes(value as MarketingAssetEntity["type"])
    ? (value as MarketingAssetEntity["type"])
    : "general_photo"
}

function normalizeAssetSource(value: unknown): MarketingAssetEntity["source"] {
  return marketingAssetSources.includes(value as MarketingAssetEntity["source"])
    ? (value as MarketingAssetEntity["source"])
    : "brand_kit"
}

function toPrismaAssetType(value: MarketingAssetEntity["type"]): PrismaMarketingAssetType {
  switch (value) {
    case "logo":
      return "LOGO"
    case "academy_photo":
      return "ACADEMY_PHOTO"
    case "space_photo":
      return "SPACE_PHOTO"
    case "team_photo":
      return "TEAM_PHOTO"
    case "professor_photo":
      return "PROFESSOR_PHOTO"
    case "general_photo":
    default:
      return "GENERAL_PHOTO"
  }
}

function toPrismaAssetSource(value: MarketingAssetEntity["source"]): PrismaMarketingAssetSource {
  switch (value) {
    case "manual_upload":
      return "MANUAL_UPLOAD"
    case "camera":
      return "CAMERA"
    case "generated":
      return "GENERATED"
    case "brand_kit":
    default:
      return "BRAND_KIT"
  }
}

function fromPrismaAssetType(value: PrismaMarketingAssetType): MarketingAssetEntity["type"] {
  switch (value) {
    case "LOGO":
      return "logo"
    case "ACADEMY_PHOTO":
      return "academy_photo"
    case "SPACE_PHOTO":
      return "space_photo"
    case "TEAM_PHOTO":
      return "team_photo"
    case "PROFESSOR_PHOTO":
      return "professor_photo"
    case "GENERAL_PHOTO":
    default:
      return "general_photo"
  }
}

function fromPrismaAssetSource(value: PrismaMarketingAssetSource): MarketingAssetEntity["source"] {
  switch (value) {
    case "MANUAL_UPLOAD":
      return "manual_upload"
    case "CAMERA":
      return "camera"
    case "GENERATED":
      return "generated"
    case "BRAND_KIT":
    default:
      return "brand_kit"
  }
}

export function normalizeMarketingAsset(input: unknown): MarketingAssetEntity | null {
  if (!isObject(input) || typeof input.name !== "string" || typeof input.fileUrl !== "string") {
    return null
  }

  return {
    id: typeof input.id === "string" ? input.id : crypto.randomUUID(),
    tenantId: typeof input.tenantId === "string" ? input.tenantId : "",
    type: normalizeAssetType(input.type),
    source: normalizeAssetSource(input.source),
    name: input.name.trim() || "Arquivo",
    fileUrl: input.fileUrl,
    thumbnailUrl: typeof input.thumbnailUrl === "string" ? input.thumbnailUrl : null,
    mimeType: typeof input.mimeType === "string" ? input.mimeType : null,
    metadata: isObject(input.metadata) ? input.metadata : null,
    createdAt: typeof input.createdAt === "string" ? input.createdAt : new Date().toISOString(),
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : new Date().toISOString(),
  }
}

export function normalizeMarketingBrandKitConfig(input: unknown): MarketingBrandKitConfig {
  const defaults = createDefaultMarketingBrandKitConfig()
  if (!isObject(input)) {
    return defaults
  }

  const colors = isObject(input.colors) ? input.colors : {}
  const typography = isObject(input.typography) ? input.typography : {}
  const assets = Array.isArray(input.assets)
    ? input.assets
        .map((item) => normalizeMarketingAsset(item))
        .filter((value): value is MarketingAssetEntity => value !== null)
    : defaults.assets

  return {
    colors: {
      primary: typeof colors.primary === "string" ? colors.primary : defaults.colors.primary,
      secondary: typeof colors.secondary === "string" ? colors.secondary : defaults.colors.secondary,
      accent: typeof colors.accent === "string" ? colors.accent : defaults.colors.accent,
    },
    typography: {
      headingFont:
        typeof typography.headingFont === "string"
          ? typography.headingFont
          : defaults.typography.headingFont,
      bodyFont:
        typeof typography.bodyFont === "string" ? typography.bodyFont : defaults.typography.bodyFont,
    },
    selectedLogoAssetId:
      typeof input.selectedLogoAssetId === "string" ? input.selectedLogoAssetId : undefined,
    notes: typeof input.notes === "string" ? input.notes : defaults.notes,
    assets,
  }
}

export function toMarketingAssetEntity(asset: MarketingAsset): MarketingAssetEntity {
  return {
    id: asset.id,
    tenantId: asset.tenantId,
    type: fromPrismaAssetType(asset.type),
    source: fromPrismaAssetSource(asset.source),
    name: asset.name,
    fileUrl: asset.fileUrl,
    thumbnailUrl: asset.thumbnailUrl ?? null,
    mimeType: asset.mimeType ?? null,
    metadata: isObject(asset.metadataJson) ? asset.metadataJson : null,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  }
}

export function toMarketingBrandKitEntity(
  brandKit: MarketingBrandKit & { assets: MarketingAsset[] }
): MarketingBrandKitEntity {
  return {
    id: brandKit.id,
    tenantId: brandKit.tenantId,
    createdAt: brandKit.createdAt.toISOString(),
    updatedAt: brandKit.updatedAt.toISOString(),
    config: {
      colors: {
        primary: brandKit.primaryColor ?? undefined,
        secondary: brandKit.secondaryColor ?? undefined,
        accent: brandKit.accentColor ?? undefined,
      },
      typography: {
        headingFont: brandKit.headingFont ?? undefined,
        bodyFont: brandKit.bodyFont ?? undefined,
      },
      selectedLogoAssetId: brandKit.selectedLogoAssetId ?? undefined,
      notes: brandKit.notes ?? "",
      assets: brandKit.assets.map(toMarketingAssetEntity),
    },
  }
}

export function toMarketingBrandKitPersistence(config: MarketingBrandKitConfig) {
  return {
    primaryColor: config.colors.primary ?? null,
    secondaryColor: config.colors.secondary ?? null,
    accentColor: config.colors.accent ?? null,
    headingFont: config.typography.headingFont ?? null,
    bodyFont: config.typography.bodyFont ?? null,
    selectedLogoAssetId: config.selectedLogoAssetId ?? null,
    notes: config.notes ?? null,
  }
}

export function toMarketingAssetPersistence(
  tenantId: string,
  brandKitId: string,
  asset: MarketingAssetEntity
): Prisma.MarketingAssetUncheckedCreateInput {
  return {
    id: asset.id,
    tenantId,
    brandKitId,
    type: toPrismaAssetType(asset.type),
    source: toPrismaAssetSource(asset.source),
    name: asset.name,
    fileUrl: asset.fileUrl,
    thumbnailUrl: asset.thumbnailUrl ?? null,
    mimeType: asset.mimeType ?? null,
    metadataJson: (asset.metadata ?? null) as Prisma.InputJsonValue,
  }
}
