import type { TeacherAppClassesData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { AttendanceRateService } from "@/apps/api/src/modules/classes/services/attendance-rate.service"
import { ClassGroupService } from "@/apps/api/src/modules/classes/services/class-group.service"

export class TeacherAppClassesService {
  constructor(
    private readonly classGroupService = new ClassGroupService(),
    private readonly attendanceRateService = new AttendanceRateService()
  ) {}

  async getData(input: { tenantId: string; userId: string }): Promise<TeacherAppClassesData> {
    const actorData = await this.classGroupService.listForActor({
      tenantId: input.tenantId,
      userId: input.userId,
      role: "teacher",
    })

    const activeClasses = actorData.classes.filter((classGroup) => classGroup.status === "active")
    const enrolledUserIds = Array.from(
      new Set(activeClasses.flatMap((classGroup) => classGroup.enrolledStudentIds))
    )

    const students = enrolledUserIds.length
      ? await prisma.studentProfile.findMany({
          where: {
            tenantId: input.tenantId,
            status: "ACTIVE",
            userId: {
              in: enrolledUserIds,
            },
          },
          include: {
            user: true,
            modalities: {
              where: {
                status: "ACTIVE",
                modality: {
                  isActive: true,
                },
              },
              include: {
                modality: true,
              },
            },
          },
        })
      : []

    const studentsByUserId = new Map(students.map((student) => [student.userId, student]))
    const attendanceRatesByUserId = await this.attendanceRateService.getRatesByUserIds({
      tenantId: input.tenantId,
      userIds: enrolledUserIds,
      classGroupIds: activeClasses.map((classGroup) => classGroup.id),
    })

    return {
      role: "teacher",
      teacherId: input.userId,
      classes: activeClasses
        .map((classGroup) => ({
          id: classGroup.id,
          classGroupId: classGroup.id,
          name: classGroup.name,
          dayLabel: classGroup.schedules
            .map((item) => ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"][item.weekday] ?? "Outro")
            .join(", "),
          startTime: classGroup.schedules[0]?.startTime ?? "--:--",
          endTime: classGroup.schedules[0]?.endTime ?? "--:--",
          teacherLabel: classGroup.teacherName,
          modalityLabel: classGroup.modalityName,
          studentCount: classGroup.currentStudents,
          students: classGroup.enrolledStudentIds.map((userId) => {
            const student = studentsByUserId.get(userId)
            const modality = student?.modalities.find((item) => item.modalityId === classGroup.modalityId)
            return {
              id: userId,
              name: student?.user.name ?? student?.user.email ?? "Aluno",
              belt: modality?.belt ?? "Branca",
              modalityName: modality?.modality.name ?? classGroup.modalityName,
              attendance: attendanceRatesByUserId.get(userId) ?? 0,
            }
          }),
        })),
    }
  }
}
