import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import type {
  MarketingAssetEntity,
  MarketingBrandKitConfig,
} from "@/apps/api/src/modules/marketing/domain/marketing"
import { normalizeMarketingBrandKitConfig } from "@/apps/api/src/modules/marketing/domain/marketing-mappers"
import { MarketingBrandKitRepository } from "@/apps/api/src/modules/marketing/repositories/marketing-brand-kit.repository"
import { MarketingLogoEnhancementService } from "@/apps/api/src/modules/marketing/services/marketing-logo-enhancement.service"

const SYNCED_TENANT_LOGO_FLAG = "syncedFromTenantBranding"

interface TenantBrandingSnapshot {
  appName: string | null
  logoUrl: string | null
  primaryColor: string | null
  secondaryColor: string | null
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isSyncedTenantLogoAsset(asset: MarketingAssetEntity) {
  return asset.type === "logo" && asset.metadata?.[SYNCED_TENANT_LOGO_FLAG] === true
}

export class MarketingBrandKitService {
  constructor(
    private readonly repository = new MarketingBrandKitRepository(),
    private readonly logoEnhancementService = new MarketingLogoEnhancementService()
  ) {}

  async getForTenant(tenantId: string) {
    return this.syncFromTenantBranding({ tenantId })
  }

  async save(input: { tenantId: string; config: unknown }) {
    const normalized = normalizeMarketingBrandKitConfig(input.config)
    const enhancedAssets = await this.logoEnhancementService.enhanceAssets({
      tenantId: input.tenantId,
      assets: normalized.assets,
    })
    const merged = await this.mergeWithTenantBranding(input.tenantId, {
      ...normalized,
      assets: enhancedAssets,
    })

    return this.repository.save({
      tenantId: input.tenantId,
      config: merged,
    })
  }

  async syncFromTenantBranding(input: { tenantId: string }) {
    const existing = await this.repository.findByTenantId(input.tenantId)
    const merged = await this.mergeWithTenantBranding(
      input.tenantId,
      existing?.config ?? normalizeMarketingBrandKitConfig(null)
    )

    if (existing && JSON.stringify(existing.config) === JSON.stringify(merged)) {
      return existing
    }

    return this.repository.save({
      tenantId: input.tenantId,
      config: merged,
    })
  }

  private async mergeWithTenantBranding(tenantId: string, config: MarketingBrandKitConfig) {
    const branding = await this.readTenantBranding(tenantId)
    const syncedLogoAsset = config.assets.find(isSyncedTenantLogoAsset) ?? null
    const preservedAssets = config.assets.filter((asset) => !isSyncedTenantLogoAsset(asset))
    let selectedLogoAssetId = config.selectedLogoAssetId
    let assets = preservedAssets

    if (branding.logoUrl) {
      const logoAsset: MarketingAssetEntity = {
        id: syncedLogoAsset?.id ?? crypto.randomUUID(),
        tenantId,
        type: "logo",
        source: "brand_kit",
        name: branding.appName ? `Logo oficial - ${branding.appName}` : "Logo oficial da academia",
        fileUrl: branding.logoUrl,
        thumbnailUrl: branding.logoUrl,
        mimeType: syncedLogoAsset?.mimeType ?? null,
        metadata: {
          ...(isObject(syncedLogoAsset?.metadata) ? syncedLogoAsset.metadata : {}),
          [SYNCED_TENANT_LOGO_FLAG]: true,
        },
        createdAt: syncedLogoAsset?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      assets = [logoAsset, ...preservedAssets]
      selectedLogoAssetId = logoAsset.id
    } else if (syncedLogoAsset && selectedLogoAssetId === syncedLogoAsset.id) {
      selectedLogoAssetId = undefined
    }

    return {
      ...config,
      colors: {
        primary: branding.primaryColor ?? config.colors.primary,
        secondary: branding.secondaryColor ?? config.colors.secondary,
        accent: config.colors.accent ?? branding.primaryColor ?? config.colors.primary,
      },
      selectedLogoAssetId,
      assets,
    }
  }

  private async readTenantBranding(tenantId: string): Promise<TenantBrandingSnapshot> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        brandingJson: true,
        branding: {
          select: {
            appName: true,
            logoUrl: true,
            primaryColor: true,
            secondaryColor: true,
          },
        },
      },
    })

    const brandingJson =
      tenant?.brandingJson && isObject(tenant.brandingJson) ? tenant.brandingJson : null

    return {
      appName: readString(brandingJson?.appName) ?? readString(tenant?.branding?.appName),
      logoUrl: readString(brandingJson?.logoUrl) ?? readString(tenant?.branding?.logoUrl),
      primaryColor: readString(brandingJson?.primaryColor) ?? readString(tenant?.branding?.primaryColor),
      secondaryColor:
        readString(brandingJson?.secondaryColor) ?? readString(tenant?.branding?.secondaryColor),
    }
  }
}
