import type { StudentAppProfileTitlesData } from "@/apps/api/src/modules/app/domain/student-app"
import { parseAthleteId } from "@/apps/api/src/modules/athletes/domain/athletes"
import { AthleteDirectoryService } from "@/apps/api/src/modules/athletes/services/athlete-directory.service"

export class StudentAppProfileTitlesService {
  constructor(private readonly athleteDirectoryService = new AthleteDirectoryService()) {}

  async getData(input: { tenantId: string; userId: string }): Promise<StudentAppProfileTitlesData> {
    const data = await this.athleteDirectoryService.getStudentAppData(input)

    return {
      role: "student",
      studentId: parseAthleteId(data.athleteId).profileId,
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
    const data = await this.athleteDirectoryService.addTitleForStudentUser(input)
    return {
      role: "student" as const,
      studentId: parseAthleteId(data.athleteId).profileId,
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
    const data = await this.athleteDirectoryService.removeTitleForStudentUser(input)
    return {
      role: "student" as const,
      studentId: parseAthleteId(data.athleteId).profileId,
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
