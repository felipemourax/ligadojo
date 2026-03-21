import type { StudentAppProgressData } from "@/apps/api/src/modules/app/domain/student-app"
import { formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"
import { StudentDashboardService } from "@/apps/api/src/modules/students/services/student-dashboard.service"

export class StudentAppProgressService {
  constructor(private readonly studentDashboardService = new StudentDashboardService()) {}

  async getData(input: { tenantId: string; userId: string }): Promise<StudentAppProgressData> {
    const dashboard = await this.studentDashboardService.listForTenant(input.tenantId)
    const student = dashboard.students.find((item) => item.linkedUserId === input.userId)

    if (!student) {
      throw new Error("Aluno não encontrado para este tenant.")
    }

    return {
      role: "student",
      studentId: student.id,
      activities: student.activities.map((activity) => ({
        id: activity.id,
        activityCategory: activity.activityCategory,
        activityLabel: activity.activityCategory
          ? formatActivityCategory(activity.activityCategory)
          : "Atividade principal",
        belt: activity.belt,
        stripes: activity.stripes,
        attendanceRate: activity.attendanceRate,
        practicedModalities: activity.practicedModalities,
        enrolledClasses: activity.enrolledClasses,
        graduationHistory: activity.graduationHistory,
      })),
    }
  }
}
