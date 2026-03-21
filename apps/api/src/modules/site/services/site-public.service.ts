import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import type { PublicTenantSiteView } from "@/apps/api/src/modules/site/domain/site"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { TenantSiteRepository } from "@/apps/api/src/modules/site/repositories/tenant-site.repository"

export class SitePublicService {
  constructor(
    private readonly siteRepository = new TenantSiteRepository(),
    private readonly tenantRepository = new TenantRepository()
  ) {}

  async getPublishedByTenantSlug(tenantSlug: string): Promise<PublicTenantSiteView | null> {
    const tenant = await this.tenantRepository.findBySlug(tenantSlug)
    if (!tenant) {
      return null
    }

    const site = await this.siteRepository.ensureForTenant(tenant.id)
    if (site.status !== "published") {
      return null
    }

    const [profile, location, branding, modalities, plans, teachers] = await Promise.all([
      prisma.tenantProfile.findUnique({ where: { tenantId: tenant.id } }),
      prisma.tenantLocation.findUnique({ where: { tenantId: tenant.id } }),
      prisma.tenantBranding.findUnique({ where: { tenantId: tenant.id } }),
      prisma.modality.findMany({
        where: { tenantId: tenant.id, isActive: true },
        orderBy: [{ activityCategory: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.plan.findMany({
        where: { tenantId: tenant.id, isActive: true },
        include: { modalities: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.teacherProfile.findMany({
        where: { tenantId: tenant.id, status: "ACTIVE" },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    ])

    return {
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        displayName: tenant.displayName,
      },
      site,
      profile: {
        phone: profile?.phone,
        contactEmail: profile?.contactEmail,
        website: profile?.website,
      },
      location: {
        street: location?.street,
        number: location?.number,
        city: location?.city,
        state: location?.state,
        country: location?.country,
      },
      branding: {
        logoUrl: branding?.logoUrl ?? null,
        primaryColor: branding?.primaryColor ?? null,
        secondaryColor: branding?.secondaryColor ?? null,
      },
      modalities: modalities.map((modality) => ({
        id: modality.id,
        activityCategory: modality.activityCategory,
        name: modality.name,
        ageGroups: modality.ageGroups.map((item) => item.toLowerCase()),
      })),
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        amountCents: plan.amountCents,
        billingCycle: plan.billingCycle.toLowerCase(),
        includedModalityIds: plan.modalities.map((item) => item.modalityId),
      })),
      teachers: teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        roleTitle: teacher.roleTitle,
        rank: teacher.rank,
      })),
    }
  }
}
