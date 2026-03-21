import type { TeacherAppAgendaData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { TeacherDashboardService } from "@/apps/api/src/modules/teachers/services/teacher-dashboard.service"

export class TeacherAppAgendaService {
  constructor(private readonly teacherDashboardService = new TeacherDashboardService()) {}

  async getData(input: { tenantId: string; userId: string }): Promise<TeacherAppAgendaData> {
    const teachers = await this.teacherDashboardService.listForTenant(input.tenantId)
    const teacher = teachers.find((item) => item.linkedUserId === input.userId)

    if (!teacher) {
      throw new Error("Professor não encontrado para este tenant.")
    }

    return {
      role: "teacher",
      teacherId: teacher.id,
      schedule: teacher.schedule.map((entry) => ({
        day: entry.day,
        classes: entry.classes.sort((left, right) => left.localeCompare(right)),
      })),
    }
  }
}
