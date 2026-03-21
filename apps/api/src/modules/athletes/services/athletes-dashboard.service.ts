import type { CreateAthleteTitleInput } from "@/apps/api/src/modules/athletes/contracts/create-athlete-title.input"
import type { AthletesDashboardData } from "@/apps/api/src/modules/athletes/domain/athletes"
import { AthleteDirectoryService } from "@/apps/api/src/modules/athletes/services/athlete-directory.service"

export class AthletesDashboardService {
  constructor(private readonly athleteDirectoryService = new AthleteDirectoryService()) {}

  async getData(input: { tenantId: string }): Promise<AthletesDashboardData> {
    const athletes = await this.athleteDirectoryService.listForTenant(input.tenantId)
    const totalTitles = athletes.reduce((sum, athlete) => sum + athlete.titles.length, 0)

    return {
      tenantId: input.tenantId,
      athletes: athletes.map((athlete) => ({
        id: athlete.id,
        kind: athlete.kind,
        name: athlete.name,
        belt: athlete.belt,
        primaryActivityLabel: athlete.primaryActivityLabel,
        activityLabels: athlete.activityLabels,
        roleLabel: athlete.roleLabel,
        titles: athlete.titles,
        totalTitles: athlete.titles.length,
      })),
      stats: {
        totalAthletes: athletes.length,
        totalTitles,
        averageTitlesPerAthlete:
          athletes.length > 0 ? Number((totalTitles / athletes.length).toFixed(1)) : 0,
      },
      topAthletes: [...athletes]
        .sort((left, right) => {
          if (left.titles.length !== right.titles.length) {
            return right.titles.length - left.titles.length
          }

          return left.name.localeCompare(right.name, "pt-BR")
        })
        .slice(0, 5)
        .map((athlete) => ({
          athleteId: athlete.id,
          name: athlete.name,
          belt: athlete.belt,
          primaryActivityLabel: athlete.primaryActivityLabel,
          totalTitles: athlete.titles.length,
        })),
      filters: {
        belts: Array.from(new Set(athletes.map((athlete) => athlete.belt))).sort((left, right) =>
          left.localeCompare(right, "pt-BR")
        ),
        activities: Array.from(
          new Set(athletes.flatMap((athlete) => athlete.activityLabels))
        ).sort((left, right) => left.localeCompare(right, "pt-BR")),
      },
    }
  }

  async addTitle(input: {
    tenantId: string
    athleteId: string
    payload: CreateAthleteTitleInput
  }) {
    await this.athleteDirectoryService.addTitleToAthlete(input)
    return this.getData({ tenantId: input.tenantId })
  }

  async removeTitle(input: {
    tenantId: string
    athleteId: string
    titleId: string
  }) {
    await this.athleteDirectoryService.removeTitleFromAthlete(input)
    return this.getData({ tenantId: input.tenantId })
  }
}
