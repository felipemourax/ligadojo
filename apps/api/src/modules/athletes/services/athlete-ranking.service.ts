import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  normalizeUrl,
  type RankingAcademyProfile,
  type RankingAcademySummary,
  type RankingDirectoryData,
} from "@/apps/api/src/modules/athletes/domain/athletes"
import { AthleteDirectoryService } from "@/apps/api/src/modules/athletes/services/athlete-directory.service"

const modalityFilterMap: Record<string, string[]> = {
  "jiu-jitsu": ["jiu-jitsu", "Jiu Jitsu", "Jiu-Jitsu"],
  "no-gi": ["no-gi", "No-Gi"],
  "muay-thai": ["muay-thai", "Muay Thai"],
  boxe: ["boxe", "Boxe"],
  mma: ["mma", "MMA"],
  wrestling: ["wrestling", "Wrestling"],
  judo: ["judo", "Judô", "Judo"],
  karate: ["karate", "Karatê", "Karate"],
}

function matchesModality(labels: string[], modality: string | null) {
  if (!modality || modality === "all") {
    return true
  }

  const acceptedValues = modalityFilterMap[modality] ?? [modality]
  const normalizedLabels = labels.map((label) => label.toLowerCase())

  return acceptedValues.some((value) => normalizedLabels.includes(value.toLowerCase()))
}

export class AthleteRankingService {
  constructor(private readonly athleteDirectoryService = new AthleteDirectoryService()) {}

  async listAcademies(input: {
    search?: string | null
    state?: string | null
    modality?: string | null
  }): Promise<RankingDirectoryData> {
    const tenants = await prisma.tenant.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        profile: true,
        location: true,
        branding: true,
        modalities: {
          where: {
            isActive: true,
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ displayName: "asc" }],
    })

    const tenantAthletes = await Promise.all(
      tenants.map(async (tenant) => ({
        tenant,
        athletes: await this.athleteDirectoryService.listForTenant(tenant.id),
      }))
    )

    const allStates = Array.from(
      new Set(
        tenantAthletes
          .map((entry) => entry.tenant.location?.state?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((left, right) => left.localeCompare(right, "pt-BR"))

    const normalizedSearch = input.search?.trim().toLowerCase() ?? ""
    const normalizedState = input.state?.trim().toUpperCase() ?? ""

    const results = tenantAthletes
      .map<RankingAcademySummary>((entry) => ({
        id: entry.tenant.id,
        slug: entry.tenant.slug,
        name: entry.tenant.displayName,
        city: entry.tenant.location?.city ?? null,
        state: entry.tenant.location?.state ?? null,
        logoUrl: entry.tenant.branding?.logoUrl ?? null,
        primaryColor: entry.tenant.branding?.primaryColor ?? null,
        modalityLabels: Array.from(
          new Set(entry.tenant.modalities.map((modality) => modality.name))
        ),
        totalAthletes: entry.athletes.length,
        totalTitles: entry.athletes.reduce((sum, athlete) => sum + athlete.titles.length, 0),
      }))
      .filter((academy, index) => {
        const entry = tenantAthletes[index]

        if (normalizedState && academy.state?.toUpperCase() !== normalizedState) {
          return false
        }

        if (!matchesModality(academy.modalityLabels, input.modality ?? null)) {
          return false
        }

        if (!normalizedSearch) {
          return true
        }

        const matchesAcademy = academy.name.toLowerCase().includes(normalizedSearch)
        if (matchesAcademy) {
          return true
        }

        return entry.athletes.some((athlete) => athlete.name.toLowerCase().includes(normalizedSearch))
      })
      .sort((left, right) => {
        if (left.totalTitles !== right.totalTitles) {
          return right.totalTitles - left.totalTitles
        }

        return left.name.localeCompare(right.name, "pt-BR")
      })

    return {
      highlights: results.slice(0, 6),
      results,
      states: allStates,
    }
  }

  async getAcademyProfile(academySlug: string): Promise<RankingAcademyProfile | null> {
    const tenant = await prisma.tenant.findFirst({
      where: {
        slug: academySlug,
        status: "ACTIVE",
      },
      include: {
        profile: true,
        location: true,
        branding: true,
        modalities: {
          where: {
            isActive: true,
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
    })

    if (!tenant) {
      return null
    }

    const athletes = await this.athleteDirectoryService.listForTenant(tenant.id)
    const titledAthletes = athletes
      .filter((athlete) => athlete.titles.length > 0)
      .sort((left, right) => {
        if (left.titles.length !== right.titles.length) {
          return right.titles.length - left.titles.length
        }

        return left.name.localeCompare(right.name, "pt-BR")
      })

    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.displayName,
      city: tenant.location?.city ?? null,
      state: tenant.location?.state ?? null,
      description: tenant.profile?.description ?? null,
      logoUrl: tenant.branding?.logoUrl ?? null,
      bannerUrl: tenant.branding?.bannerUrl ?? null,
      primaryColor: tenant.branding?.primaryColor ?? null,
      websiteUrl: normalizeUrl(tenant.profile?.website ?? null),
      phone: tenant.profile?.phone ?? null,
      instagramUrl: null,
      facebookUrl: null,
      modalityLabels: Array.from(new Set(tenant.modalities.map((modality) => modality.name))),
      totalAthletes: athletes.length,
      totalTitles: athletes.reduce((sum, athlete) => sum + athlete.titles.length, 0),
      athletes: titledAthletes.map((athlete) => ({
        id: athlete.id,
        name: athlete.name,
        belt: athlete.belt,
        titles: athlete.titles,
      })),
    }
  }
}
