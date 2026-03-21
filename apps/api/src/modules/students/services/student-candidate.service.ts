import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { AttendanceRateService } from "@/apps/api/src/modules/classes/services/attendance-rate.service"

interface StudentCandidateServiceInput {
  tenantId: string
  actorUserId?: string | null
  actorRole: "academy_admin" | "teacher" | "student" | "platform_admin"
}

export class StudentCandidateService {
  constructor(private readonly attendanceRateService = new AttendanceRateService()) {}

  async listForActor(input: StudentCandidateServiceInput) {
    const students = await prisma.studentProfile.findMany({
      where: {
        tenantId: input.tenantId,
        status: "ACTIVE",
        ...(input.actorRole === "teacher" && input.actorUserId
          ? {
              modalities: {
                some: {
                  modality: {
                    teacherLinks: {
                      some: {
                        teacherProfile: {
                          tenantId: input.tenantId,
                          userId: input.actorUserId,
                        },
                      },
                    },
                  },
                },
              },
            }
          : {}),
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
      orderBy: [{ createdAt: "asc" }],
    })

    const attendanceRatesByUserId = await this.attendanceRateService.getRatesByUserIds({
      tenantId: input.tenantId,
      userIds: students.map((student) => student.userId),
    })

    return {
      students: students.map((student) => ({
        id: student.user.id,
        name: student.user.name ?? student.user.email,
        email: student.user.email,
        belt: student.modalities[0]?.belt ?? "Branca",
        modalityIds: student.modalities.map((modality) => modality.modalityId),
        modalities: student.modalities.map((modality) => ({
          modalityId: modality.modalityId,
          modalityName: modality.modality.name,
          belt: modality.belt,
        })),
        attendance: attendanceRatesByUserId.get(student.userId) ?? 0,
      })),
    }
  }
}
