import { Prisma } from "@prisma/client"
import type {
  TeacherAppProfileData,
  TeacherAppProfileUpdateInput,
} from "@/apps/api/src/modules/app/domain/teacher-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"

function formatAddress(input: { street?: string | null; city?: string | null; state?: string | null }) {
  return [input.street, input.city, input.state].filter(Boolean).join(", ")
}

function parseAddress(address: string) {
  const [street = "", city = "", state = ""] = address
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  return { street, city, state }
}

function toIsoDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : ""
}

function parseIsoDate(value: string) {
  if (!value || value.length < 10) return null
  const parsed = new Date(`${value}T12:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

export class TeacherAppProfileService {
  private async requireTeacherProfile(input: { tenantId: string; userId: string }) {
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      include: {
        user: true,
        modalities: {
          include: {
            modality: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
        classGroups: {
          select: {
            id: true,
            currentStudents: true,
            status: true,
          },
        },
      },
    })

    if (!teacherProfile || !teacherProfile.user) {
      throw new Error("Professor não encontrado para este tenant.")
    }

    return {
      ...teacherProfile,
      user: teacherProfile.user,
    }
  }

  async getData(input: { tenantId: string; userId: string }): Promise<TeacherAppProfileData> {
    const teacherProfile = await this.requireTeacherProfile(input)
    const monthlyLimit = new Date()
    monthlyLimit.setDate(monthlyLimit.getDate() - 30)

    const monthlyClasses = await prisma.classSession.count({
      where: {
        tenantId: input.tenantId,
        classGroup: {
          teacherProfileId: teacherProfile.id,
        },
        sessionDate: {
          gte: monthlyLimit,
        },
      },
    })

    return {
      role: "teacher",
      teacherId: input.userId,
      profile: {
        name: teacherProfile.user.name ?? teacherProfile.name,
        email: teacherProfile.user.email,
        phone: teacherProfile.user.phone ?? teacherProfile.phone ?? "",
        address: formatAddress(teacherProfile.user),
        birthDate: toIsoDate(teacherProfile.user.birthDate),
        rank: teacherProfile.rank ?? "Professor",
        roleTitle: teacherProfile.roleTitle ?? "Professor",
        registry: teacherProfile.roleTitle ?? "Registro interno",
        bio: teacherProfile.specialty ?? "",
        modalities: teacherProfile.modalities
          .filter((item) => item.modality.isActive)
          .map((item) => ({
            id: item.modality.id,
            name: item.modality.name,
          })),
      },
      stats: {
        activeStudents: teacherProfile.classGroups
          .filter((item) => item.status === "ACTIVE")
          .reduce((total, item) => total + item.currentStudents, 0),
        activeClasses: teacherProfile.classGroups.filter((item) => item.status === "ACTIVE").length,
        monthlyClasses,
      },
      certifications: [],
    }
  }

  async updateData(input: {
    tenantId: string
    userId: string
    payload: TeacherAppProfileUpdateInput
  }): Promise<TeacherAppProfileData> {
    const teacherProfile = await this.requireTeacherProfile(input)
    const parsedAddress = parseAddress(input.payload.address)
    const birthDate = parseIsoDate(input.payload.birthDate)

    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id: teacherProfile.userId!,
          },
          data: {
            name: input.payload.name,
            email: input.payload.email,
            phone: input.payload.phone || null,
            birthDate,
            street: parsedAddress.street || null,
            city: parsedAddress.city || null,
            state: parsedAddress.state || null,
          },
        })

        await tx.teacherProfile.update({
          where: {
            id: teacherProfile.id,
          },
          data: {
            name: input.payload.name,
            email: input.payload.email,
            phone: input.payload.phone || null,
            roleTitle: input.payload.registry || null,
            specialty: input.payload.bio || null,
          },
        })

        await tx.classGroup.updateMany({
          where: {
            tenantId: input.tenantId,
            teacherProfileId: teacherProfile.id,
          },
          data: {
            teacherName: input.payload.name,
          },
        })
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Este e-mail já está em uso por outra conta.")
      }
      throw error
    }

    return this.getData({ tenantId: input.tenantId, userId: input.userId })
  }
}
