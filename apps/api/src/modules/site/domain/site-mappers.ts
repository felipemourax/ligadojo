import type { Prisma, TenantSite } from "@prisma/client"
import {
  createDefaultTenantSiteConfig,
  type TenantSiteConfig,
  type TenantSiteEntity,
  type TenantSiteSectionConfig,
} from "@/apps/api/src/modules/site/domain/site"

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeSection(section: unknown, fallbackOrder: number): TenantSiteSectionConfig | null {
  if (!isObject(section) || typeof section.id !== "string") {
    return null
  }

  return {
    id: section.id as TenantSiteSectionConfig["id"],
    visible: section.visible !== false,
    sortOrder: typeof section.sortOrder === "number" ? section.sortOrder : fallbackOrder,
    content: isObject(section.content) ? section.content : {},
  }
}

export function normalizeTenantSiteConfig(input: unknown): TenantSiteConfig {
  const defaults = createDefaultTenantSiteConfig()

  if (!isObject(input)) {
    return defaults
  }

  const sections = Array.isArray(input.sections)
    ? input.sections
        .map((section, index) => normalizeSection(section, index))
        .filter((value): value is TenantSiteSectionConfig => value !== null)
        .sort((left, right) => left.sortOrder - right.sortOrder)
    : defaults.sections

  return {
    templateId:
      input.templateId === "modern" ||
      input.templateId === "competitive" ||
      input.templateId === "community" ||
      input.templateId === "traditional"
        ? input.templateId
        : defaults.templateId,
    seo: isObject(input.seo) ? input.seo : defaults.seo,
    theme: isObject(input.theme) ? input.theme : defaults.theme,
    sections: sections.length > 0 ? sections : defaults.sections,
  }
}

export function toTenantSiteEntity(site: TenantSite): TenantSiteEntity {
  return {
    id: site.id,
    tenantId: site.tenantId,
    status: site.status === "PUBLISHED" ? "published" : "draft",
    publishedAt: site.publishedAt?.toISOString() ?? null,
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
    config: normalizeTenantSiteConfig({
      templateId: site.templateId,
      seo: site.seoJson,
      theme: site.themeJson,
      sections: site.sectionsJson,
    }),
  }
}

export function toTenantSitePersistence(site: TenantSiteConfig): {
  templateId: string
  seoJson: Prisma.InputJsonValue
  themeJson: Prisma.InputJsonValue
  sectionsJson: Prisma.InputJsonValue
} {
  return {
    templateId: site.templateId,
    seoJson: site.seo as Prisma.InputJsonValue,
    themeJson: site.theme as Prisma.InputJsonValue,
    sectionsJson: site.sections as unknown as Prisma.InputJsonValue,
  }
}
