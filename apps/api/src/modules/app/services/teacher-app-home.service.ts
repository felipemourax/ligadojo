import type { TeacherAppHomeData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { TeacherDashboardService } from "@/apps/api/src/modules/teachers/services/teacher-dashboard.service"

export class TeacherAppHomeService {
  constructor(private readonly teacherDashboardService = new TeacherDashboardService()) {}

  async getData(input: { tenantId: string; userId: string }): Promise<TeacherAppHomeData> {
    const teachers = await this.teacherDashboardService.listForTenant(input.tenantId)
    const teacher = teachers.find((item) => item.linkedUserId === input.userId)

    if (!teacher) {
      throw new Error("Professor não encontrado para este tenant.")
    }

    const upcomingClasses = teacher.schedule.slice(0, 4).map((entry, index) => ({
      id: `${teacher.id}:${entry.day}:${index}`,
      classGroupId: `${teacher.id}:${entry.day}:${index}`,
      name: entry.classes[0] ?? "Turma atribuída",
      dayLabel: entry.day,
      startTime: entry.classes[0]?.split(" - ")[0] ?? "--:--",
      endTime: "--:--",
      teacherLabel: teacher.name,
      modalityLabel: teacher.modalities[0] ?? "Modalidade",
      studentCount: teacher.students,
    }))

    return {
      role: "teacher",
      teacher: {
        id: teacher.id,
        name: teacher.name,
        roleTitle: teacher.roleTitle,
        modalities: teacher.modalities,
      },
      stats: [
        {
          title: "Turmas da semana",
          value: String(teacher.schedule.length),
          description: "Aulas vinculadas à sua agenda",
        },
        {
          title: "Alunos",
          value: String(teacher.students),
          description: "Base atual das suas turmas",
        },
        {
          title: "Presenças",
          value: String(teacher.attendanceSnapshot.present),
          description: "Confirmadas no recorte atual",
        },
      ],
      upcomingClasses,
    }
  }
}
