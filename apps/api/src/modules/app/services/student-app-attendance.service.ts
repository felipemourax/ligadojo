import type { StudentAppAttendanceData } from "@/apps/api/src/modules/app/domain/student-app"
import { formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"
import { StudentDashboardService } from "@/apps/api/src/modules/students/services/student-dashboard.service"

export class StudentAppAttendanceService {
  constructor(private readonly studentDashboardService = new StudentDashboardService()) {}

  async getData(input: { tenantId: string; userId: string }): Promise<StudentAppAttendanceData> {
    const dashboard = await this.studentDashboardService.listForTenant(input.tenantId)
    const student = dashboard.students.find((item) => item.linkedUserId === input.userId)

    if (!student) {
      throw new Error("Aluno não encontrado para este tenant.")
    }

    return {
      role: "student",
      studentId: student.id,
      attendance: student.activities.flatMap((activity) =>
        activity.attendanceHistory.map((entry) => ({
          ...entry,
          activityLabel: activity.activityCategory
            ? formatActivityCategory(activity.activityCategory)
            : "Atividade principal",
        }))
      ),
    }
  }
}
