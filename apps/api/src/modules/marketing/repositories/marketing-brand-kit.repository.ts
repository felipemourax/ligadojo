import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { Prisma } from "@prisma/client"
import {
  createDefaultMarketingBrandKitConfig,
  type MarketingBrandKitConfig,
} from "@/apps/api/src/modules/marketing/domain/marketing"
import {
  normalizeMarketingBrandKitConfig,
  toMarketingAssetPersistence,
  toMarketingBrandKitEntity,
  toMarketingBrandKitPersistence,
} from "@/apps/api/src/modules/marketing/domain/marketing-mappers"

export class MarketingBrandKitRepository {
  async findByTenantId(tenantId: string) {
    const brandKit = await prisma.marketingBrandKit.findUnique({
      where: { tenantId },
      include: {
        assets: {
          orderBy: [{ createdAt: "desc" }],
        },
      },
    })

    return brandKit ? toMarketingBrandKitEntity(brandKit) : null
  }

  async ensureForTenant(tenantId: string) {
    const defaults = createDefaultMarketingBrandKitConfig()
    const existing = await this.findByTenantId(tenantId)
    if (existing) {
      return existing
    }

    try {
      const brandKit = await prisma.marketingBrandKit.create({
        data: {
          tenantId,
          ...toMarketingBrandKitPersistence(defaults),
        },
        include: {
          assets: {
            orderBy: [{ createdAt: "desc" }],
          },
        },
      })

      return toMarketingBrandKitEntity(brandKit)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const retry = await this.findByTenantId(tenantId)
        if (retry) {
          return retry
        }
      }

      throw error
    }
  }

  async save(input: { tenantId: string; config: MarketingBrandKitConfig }) {
    const normalized = normalizeMarketingBrandKitConfig(input.config)

    const brandKit = await prisma.$transaction(async (tx) => {
      const base = await tx.marketingBrandKit.upsert({
        where: { tenantId: input.tenantId },
        update: {
          ...toMarketingBrandKitPersistence(normalized),
        },
        create: {
          tenantId: input.tenantId,
          ...toMarketingBrandKitPersistence(normalized),
        },
      })

      await tx.marketingAsset.deleteMany({
        where: {
          tenantId: input.tenantId,
          brandKitId: base.id,
        },
      })

      if (normalized.assets.length > 0) {
        await tx.marketingAsset.createMany({
          data: normalized.assets.map((asset) => toMarketingAssetPersistence(input.tenantId, base.id, asset)),
        })
      }

      return tx.marketingBrandKit.findUniqueOrThrow({
        where: { tenantId: input.tenantId },
        include: {
          assets: {
            orderBy: [{ createdAt: "desc" }],
          },
        },
      })
    })

    return toMarketingBrandKitEntity(brandKit)
  }
}
