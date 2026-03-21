import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  createDefaultTenantSiteConfig,
  type TenantSiteConfig,
} from "@/apps/api/src/modules/site/domain/site"
import {
  toTenantSiteEntity,
  toTenantSitePersistence,
} from "@/apps/api/src/modules/site/domain/site-mappers"

export class TenantSiteRepository {
  async findByTenantId(tenantId: string) {
    const site = await prisma.tenantSite.findUnique({
      where: { tenantId },
    })

    return site ? toTenantSiteEntity(site) : null
  }

  async ensureForTenant(tenantId: string) {
    const defaults = createDefaultTenantSiteConfig()
    const site = await prisma.tenantSite.upsert({
      where: { tenantId },
      update: {},
      create: {
        tenantId,
        ...toTenantSitePersistence(defaults),
      },
    })

    return toTenantSiteEntity(site)
  }

  async saveDraft(input: { tenantId: string; config: TenantSiteConfig }) {
    const existing = await prisma.tenantSite.findUnique({
      where: { tenantId: input.tenantId },
      select: {
        status: true,
        publishedAt: true,
      },
    })

    const site = await prisma.tenantSite.upsert({
      where: { tenantId: input.tenantId },
      update: {
        ...toTenantSitePersistence(input.config),
        status: existing?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        publishedAt: existing?.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : null,
      },
      create: {
        tenantId: input.tenantId,
        ...toTenantSitePersistence(input.config),
      },
    })

    return toTenantSiteEntity(site)
  }

  async publish(tenantId: string) {
    const ensured = await this.ensureForTenant(tenantId)

    const site = await prisma.tenantSite.update({
      where: { tenantId },
      data: {
        ...toTenantSitePersistence(ensured.config),
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    })

    return toTenantSiteEntity(site)
  }

  async unpublish(tenantId: string) {
    const site = await prisma.tenantSite.update({
      where: { tenantId },
      data: {
        status: "DRAFT",
      },
    })

    return toTenantSiteEntity(site)
  }
}
