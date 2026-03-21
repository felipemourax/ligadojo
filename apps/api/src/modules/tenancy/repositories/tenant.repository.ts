import { type Prisma } from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  toTenantDomainEntity,
  toTenantEntity,
} from "@/apps/api/src/modules/tenancy/domain/tenant-mappers"

export class TenantRepository {
  async findBySlug(slug: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    })

    return tenant ? toTenantEntity(tenant) : null
  }

  async findById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    })

    return tenant ? toTenantEntity(tenant) : null
  }

  async findByDomain(domain: string) {
    const tenantDomain = await prisma.tenantDomain.findUnique({
      where: { domain },
      include: { tenant: true },
    })

    if (!tenantDomain) {
      return null
    }

    return {
      domain: toTenantDomainEntity(tenantDomain),
      tenant: toTenantEntity(tenantDomain.tenant),
    }
  }

  async listDomainsForTenant(tenantId: string) {
    const domains = await prisma.tenantDomain.findMany({
      where: { tenantId },
      orderBy: [{ isPrimary: "desc" }, { domain: "asc" }],
    })

    return domains.map(toTenantDomainEntity)
  }

  async updateTenantProfile(input: {
    tenantId: string
    legalName: string
    displayName: string
    brandingJson?: Record<string, unknown>
  }) {
    const tenant = await prisma.tenant.update({
      where: { id: input.tenantId },
      data: {
        legalName: input.legalName,
        displayName: input.displayName,
        brandingJson: input.brandingJson as Prisma.InputJsonValue | undefined,
      },
    })

    return toTenantEntity(tenant)
  }

  async searchPublic(query: string, take = 8) {
    const normalizedQuery = query.trim()

    const tenants = await prisma.tenant.findMany({
      where: {
        status: "ACTIVE",
        ...(normalizedQuery
          ? {
              OR: [
                { displayName: { contains: normalizedQuery, mode: "insensitive" } },
                { legalName: { contains: normalizedQuery, mode: "insensitive" } },
                {
                  slug: {
                    contains: normalizedQuery.toLowerCase().replace(/\s+/g, "-"),
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ displayName: "asc" }],
      take,
      select: {
        id: true,
        slug: true,
        displayName: true,
        brandingJson: true,
        branding: {
          select: {
            logoUrl: true,
          },
        },
        domains: {
          where: {
            isPrimary: true,
          },
          orderBy: [{ isPrimary: "desc" }, { domain: "asc" }],
          take: 1,
          select: {
            domain: true,
          },
        },
      },
    })

    return tenants.map((tenant) => {
      const brandingJson =
        tenant.brandingJson &&
        typeof tenant.brandingJson === "object" &&
        !Array.isArray(tenant.brandingJson)
          ? (tenant.brandingJson as Record<string, unknown>)
          : null
      const logoUrl =
        tenant.branding?.logoUrl ??
        (typeof brandingJson?.logoUrl === "string" ? brandingJson.logoUrl : null)

      return {
        id: tenant.id,
        slug: tenant.slug,
        displayName: tenant.displayName,
        logoUrl,
        primaryDomain: tenant.domains[0]?.domain ?? null,
      }
    })
  }
}
