import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import type { CreateAthleteTitleInput } from "@/apps/api/src/modules/athletes/contracts/create-athlete-title.input"
import {
  athleteTitlePlacementFromPersistence,
  athleteTitlePlacementToLabel,
  athleteTitlePlacementToPersistence,
  buildAthleteId,
  formatActivityLabel,
  inferAthleteTitlePlacementFromTitle,
  normalizeActivityLabels,
  parseAthleteId,
  type AppProfileTitlesData,
  type AthleteDirectoryItem,
  type AthleteTitleItem,
} from "@/apps/api/src/modules/athletes/domain/athletes"

function compareTitles(left: AthleteTitleItem, right: AthleteTitleItem) {
  if (left.year !== right.year) {
    return right.year - left.year
  }

  if (left.placement !== right.placement) {
    return (left.placement ?? "").localeCompare(right.placement ?? "", "pt-BR")
  }

  return left.competition.localeCompare(right.competition, "pt-BR")
}

export class AthleteDirectoryService {
  async listForTenant(tenantId: string): Promise<AthleteDirectoryItem[]> {
    const [students, teachers] = await Promise.all([
      prisma.studentProfile.findMany({
        where: {
          tenantId,
          status: "ACTIVE",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          activities: {
            where: {
              status: "ACTIVE",
            },
            orderBy: [{ createdAt: "asc" }],
          },
          athleteTitles: {
            orderBy: [{ year: "desc" }, { createdAt: "desc" }],
          },
        },
        orderBy: [{ createdAt: "asc" }],
      }),
      prisma.teacherProfile.findMany({
        where: {
          tenantId,
          status: "ACTIVE",
        },
        include: {
          modalities: {
            include: {
              modality: {
                select: {
                  name: true,
                  activityCategory: true,
                  isActive: true,
                },
              },
            },
          },
          graduations: {
            orderBy: [{ graduatedAt: "desc" }],
            select: {
              activityCategory: true,
            },
          },
          athleteTitles: {
            orderBy: [{ year: "desc" }, { createdAt: "desc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    ])

    const studentItems = students.map((student) => {
      const activityLabels = normalizeActivityLabels(
        student.activities.map((activity) => formatActivityLabel(activity.activityCategory))
      )
      const primaryActivity = activityLabels[0] ?? "Atividade principal"
      const titles = student.athleteTitles
        .map<AthleteTitleItem>((item) => ({
          id: item.id,
          placement: athleteTitlePlacementFromPersistence(item.placement) ?? inferAthleteTitlePlacementFromTitle(item.title),
          title: item.title,
          competition: item.competition,
          year: item.year,
        }))
        .sort(compareTitles)

      return {
        id: buildAthleteId({ kind: "student", profileId: student.id }),
        kind: "student" as const,
        tenantId,
        profileId: student.id,
        name: student.user?.name?.trim() || student.user?.email || "Aluno",
        belt: student.activities[0]?.belt ?? "Branca",
        primaryActivityLabel: primaryActivity,
        activityLabels,
        roleLabel: "Aluno" as const,
        titles,
      }
    })

    const teacherItems = teachers.map((teacher) => {
      const activityLabels = normalizeActivityLabels([
        ...teacher.modalities
          .filter((item) => item.modality.isActive)
          .map((item) =>
            item.modality.activityCategory
              ? formatActivityLabel(item.modality.activityCategory)
              : item.modality.name
          ),
        ...teacher.graduations.map((graduation) => formatActivityLabel(graduation.activityCategory)),
      ])
      const primaryActivity = activityLabels[0] ?? "Equipe técnica"
      const titles = teacher.athleteTitles
        .map<AthleteTitleItem>((item) => ({
          id: item.id,
          placement: athleteTitlePlacementFromPersistence(item.placement) ?? inferAthleteTitlePlacementFromTitle(item.title),
          title: item.title,
          competition: item.competition,
          year: item.year,
        }))
        .sort(compareTitles)

      return {
        id: buildAthleteId({ kind: "teacher", profileId: teacher.id }),
        kind: "teacher" as const,
        tenantId,
        profileId: teacher.id,
        name: teacher.name,
        belt: teacher.rank?.trim() || "Branca",
        primaryActivityLabel: primaryActivity,
        activityLabels,
        roleLabel: "Professor" as const,
        titles,
      }
    })

    return [...studentItems, ...teacherItems].sort((left, right) =>
      left.name.localeCompare(right.name, "pt-BR")
    )
  }

  async getStudentAppData(input: { tenantId: string; userId: string }): Promise<AppProfileTitlesData> {
    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    })

    if (!studentProfile) {
      throw new Error("Aluno não encontrado para este tenant.")
    }

    const athlete = (await this.listForTenant(input.tenantId)).find(
      (entry) => entry.kind === "student" && entry.profileId === studentProfile.id
    )

    if (!athlete) {
      throw new Error("Atleta não encontrado para este tenant.")
    }

    return this.toAppProfileData(athlete)
  }

  async getTeacherAppData(input: { tenantId: string; userId: string }): Promise<AppProfileTitlesData> {
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    })

    if (!teacherProfile) {
      throw new Error("Professor não encontrado para este tenant.")
    }

    const athlete = (await this.listForTenant(input.tenantId)).find(
      (entry) => entry.kind === "teacher" && entry.profileId === teacherProfile.id
    )

    if (!athlete) {
      throw new Error("Atleta não encontrado para este tenant.")
    }

    return this.toAppProfileData(athlete)
  }

  async addTitleToAthlete(input: {
    tenantId: string
    athleteId: string
    payload: CreateAthleteTitleInput
  }) {
    const athlete = await this.resolveAthlete(input.tenantId, input.athleteId)

    await prisma.athleteTitle.create({
      data:
        athlete.kind === "student"
          ? {
              tenantId: input.tenantId,
              studentProfileId: athlete.profileId,
              placement: athleteTitlePlacementToPersistence(input.payload.placement),
              title: athleteTitlePlacementToLabel(input.payload.placement),
              competition: input.payload.competition,
              year: input.payload.year,
            }
          : {
              tenantId: input.tenantId,
              teacherProfileId: athlete.profileId,
              placement: athleteTitlePlacementToPersistence(input.payload.placement),
              title: athleteTitlePlacementToLabel(input.payload.placement),
              competition: input.payload.competition,
              year: input.payload.year,
            },
    })
  }

  async removeTitleFromAthlete(input: {
    tenantId: string
    athleteId: string
    titleId: string
  }) {
    const athlete = await this.resolveAthlete(input.tenantId, input.athleteId)

    const title = await prisma.athleteTitle.findFirst({
      where:
        athlete.kind === "student"
          ? {
              id: input.titleId,
              tenantId: input.tenantId,
              studentProfileId: athlete.profileId,
            }
          : {
              id: input.titleId,
              tenantId: input.tenantId,
              teacherProfileId: athlete.profileId,
            },
      select: {
        id: true,
      },
    })

    if (!title) {
      throw new Error("Título não encontrado para este atleta.")
    }

    await prisma.athleteTitle.delete({
      where: {
        id: title.id,
      },
    })
  }

  async addTitleForStudentUser(input: {
    tenantId: string
    userId: string
    payload: CreateAthleteTitleInput
  }) {
    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    })

    if (!studentProfile) {
      throw new Error("Aluno não encontrado para este tenant.")
    }

    await this.addTitleToAthlete({
      tenantId: input.tenantId,
      athleteId: buildAthleteId({ kind: "student", profileId: studentProfile.id }),
      payload: input.payload,
    })

    return this.getStudentAppData({
      tenantId: input.tenantId,
      userId: input.userId,
    })
  }

  async removeTitleForStudentUser(input: {
    tenantId: string
    userId: string
    titleId: string
  }) {
    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    })

    if (!studentProfile) {
      throw new Error("Aluno não encontrado para este tenant.")
    }

    await this.removeTitleFromAthlete({
      tenantId: input.tenantId,
      athleteId: buildAthleteId({ kind: "student", profileId: studentProfile.id }),
      titleId: input.titleId,
    })

    return this.getStudentAppData({
      tenantId: input.tenantId,
      userId: input.userId,
    })
  }

  async addTitleForTeacherUser(input: {
    tenantId: string
    userId: string
    payload: CreateAthleteTitleInput
  }) {
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    })

    if (!teacherProfile) {
      throw new Error("Professor não encontrado para este tenant.")
    }

    await this.addTitleToAthlete({
      tenantId: input.tenantId,
      athleteId: buildAthleteId({ kind: "teacher", profileId: teacherProfile.id }),
      payload: input.payload,
    })

    return this.getTeacherAppData({
      tenantId: input.tenantId,
      userId: input.userId,
    })
  }

  async removeTitleForTeacherUser(input: {
    tenantId: string
    userId: string
    titleId: string
  }) {
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    })

    if (!teacherProfile) {
      throw new Error("Professor não encontrado para este tenant.")
    }

    await this.removeTitleFromAthlete({
      tenantId: input.tenantId,
      athleteId: buildAthleteId({ kind: "teacher", profileId: teacherProfile.id }),
      titleId: input.titleId,
    })

    return this.getTeacherAppData({
      tenantId: input.tenantId,
      userId: input.userId,
    })
  }

  private toAppProfileData(athlete: AthleteDirectoryItem): AppProfileTitlesData {
    return {
      athleteId: athlete.id,
      athleteName: athlete.name,
      belt: athlete.belt,
      primaryActivityLabel: athlete.primaryActivityLabel,
      titles: athlete.titles,
    }
  }

  private async resolveAthlete(tenantId: string, athleteId: string) {
    const { kind, profileId } = parseAthleteId(athleteId)

    if (kind === "student") {
      const student = await prisma.studentProfile.findFirst({
        where: {
          id: profileId,
          tenantId,
        },
        select: {
          id: true,
        },
      })

      if (!student) {
        throw new Error("Atleta não encontrado.")
      }

      return {
        kind,
        profileId: student.id,
      }
    }

    const teacher = await prisma.teacherProfile.findFirst({
      where: {
        id: profileId,
        tenantId,
      },
      select: {
        id: true,
      },
    })

    if (!teacher) {
      throw new Error("Atleta não encontrado.")
    }

    return {
      kind,
      profileId: teacher.id,
    }
  }
}
