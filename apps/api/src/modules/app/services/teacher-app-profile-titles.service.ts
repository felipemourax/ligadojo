import type { TeacherAppProfileTitlesData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { parseAthleteId } from "@/apps/api/src/modules/athletes/domain/athletes"
import { AthleteDirectoryService } from "@/apps/api/src/modules/athletes/services/athlete-directory.service"

export class TeacherAppProfileTitlesService {
  constructor(private readonly athleteDirectoryService = new AthleteDirectoryService()) {}

  async getData(input: { tenantId: string; userId: string }): Promise<TeacherAppProfileTitlesData> {
    const data = await this.athleteDirectoryService.getTeacherAppData(input)

    return {
      role: "teacher",
      teacherId: parseAthleteId(data.athleteId).profileId,
      athlete: {
        id: data.athleteId,
        name: data.athleteName,
        belt: data.belt,
        primaryActivityLabel: data.primaryActivityLabel,
      },
      titles: data.titles,
    }
  }

  async createTitle(input: {
    tenantId: string
    userId: string
    payload: {
      placement: "gold" | "silver" | "bronze" | "champion" | "runner_up"
      competition: string
      year: number
    }
  }) {
    const data = await this.athleteDirectoryService.addTitleForTeacherUser(input)
    return {
      role: "teacher" as const,
      teacherId: parseAthleteId(data.athleteId).profileId,
      athlete: {
        id: data.athleteId,
        name: data.athleteName,
        belt: data.belt,
        primaryActivityLabel: data.primaryActivityLabel,
      },
      titles: data.titles,
    }
  }

  async removeTitle(input: {
    tenantId: string
    userId: string
    titleId: string
  }) {
    const data = await this.athleteDirectoryService.removeTitleForTeacherUser(input)
    return {
      role: "teacher" as const,
      teacherId: parseAthleteId(data.athleteId).profileId,
      athlete: {
        id: data.athleteId,
        name: data.athleteName,
        belt: data.belt,
        primaryActivityLabel: data.primaryActivityLabel,
      },
      titles: data.titles,
    }
  }
}
