import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  toMarketingGenerationCreatePersistence,
  toMarketingGenerationEntity,
  toMarketingUsageLedgerCreatePersistence,
} from "@/apps/api/src/modules/marketing/domain/marketing-generation-mappers"
import type {
  MarketingGenerationEntity,
  MarketingGenerationInput,
  MarketingGenerationResult,
} from "@/apps/api/src/modules/marketing/domain/marketing"

export class MarketingGenerationRepository {
  async listByTenantId(tenantId: string) {
    const generations = await prisma.marketingGeneration.findMany({
      where: { tenantId },
      orderBy: [{ createdAt: "desc" }],
      take: 20,
    })

    return generations.map(toMarketingGenerationEntity)
  }

  async findById(input: { tenantId: string; generationId: string }): Promise<MarketingGenerationEntity | null> {
    const generation = await prisma.marketingGeneration.findFirst({
      where: {
        id: input.generationId,
        tenantId: input.tenantId,
      },
    })

    return generation ? toMarketingGenerationEntity(generation) : null
  }

  async create(input: {
    tenantId: string
    brandKitId?: string | null
    templateId?: string | null
    generationInput: MarketingGenerationInput
    generationResult: MarketingGenerationResult
  }) {
    const generation = await prisma.$transaction(async (tx) => {
      const created = await tx.marketingGeneration.create({
        data: toMarketingGenerationCreatePersistence(input),
      })

      await tx.marketingUsageLedger.create({
        data: toMarketingUsageLedgerCreatePersistence({
          tenantId: input.tenantId,
          brandKitId: input.brandKitId,
          eventType: "caption_generation",
          units: 1,
          metadata: {
            contentType: input.generationInput.contentType,
            objective: input.generationInput.objective,
            templateId: input.templateId ?? null,
          },
        }),
      })

      if (input.templateId) {
        await tx.marketingUsageLedger.create({
          data: toMarketingUsageLedgerCreatePersistence({
            tenantId: input.tenantId,
            brandKitId: input.brandKitId,
            eventType: "template_render",
            units: 1,
            metadata: {
              templateId: input.templateId,
            },
          }),
        })
      }

      if (input.generationInput.selectedAssetIds.length > 0) {
        await tx.marketingUsageLedger.create({
          data: toMarketingUsageLedgerCreatePersistence({
            tenantId: input.tenantId,
            brandKitId: input.brandKitId,
            eventType: "asset_processing",
            units: input.generationInput.selectedAssetIds.length,
            metadata: {
              selectedAssetIds: input.generationInput.selectedAssetIds,
              uploadSource: input.generationInput.uploadSource,
            },
          }),
        })
      }

      return created
    })

    return toMarketingGenerationEntity(generation)
  }

  async attachGeneratedImage(input: {
    tenantId: string
    generationId: string
    brandKitId?: string | null
    imageUrl: string
    provider: string
    estimatedCostUsd?: string
  }) {
    const generation = await prisma.$transaction(async (tx) => {
      const existing = await tx.marketingGeneration.findFirst({
        where: {
          id: input.generationId,
          tenantId: input.tenantId,
        },
      })

      if (!existing) {
        throw new Error("Peca de marketing nao encontrada.")
      }

      const currentResult =
        typeof existing.resultCaption === "string" && existing.resultCaption.length > 0
          ? (JSON.parse(existing.resultCaption) as Record<string, unknown>)
          : {}

      const updated = await tx.marketingGeneration.update({
        where: { id: existing.id },
        data: {
          resultCaption: JSON.stringify({
            ...currentResult,
            imageUrl: input.imageUrl,
          }),
          resultImageUrl: input.imageUrl,
          provider: input.provider,
          costEstimateUsd: input.estimatedCostUsd ?? existing.costEstimateUsd,
        },
      })

      await tx.marketingUsageLedger.create({
        data: toMarketingUsageLedgerCreatePersistence({
          tenantId: input.tenantId,
          brandKitId: input.brandKitId,
          eventType: "image_generation",
          units: 1,
          metadata: {
            generationId: input.generationId,
            provider: input.provider,
          },
        }),
      })

      return updated
    })

    return toMarketingGenerationEntity(generation)
  }
}
