import { Prisma } from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  toClassGroupEntity,
  toClassSessionEntity,
  toPrismaAgeGroup,
  toPrismaClassGroupStatus,
  toPrismaClassSessionStatus,
} from "@/apps/api/src/modules/classes/domain/class-group-mappers"
import type {
  ClassGroupEntity,
  ClassGroupInput,
  ClassSessionEntity,
  ClassSessionInput,
} from "@/apps/api/src/modules/classes/domain/class-group"

function parseSessionDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return new Date(value)
  }

  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export class ClassGroupRepository {
  private classGroupInclude = {
    schedules: true,
    modality: true,
    enrollments: {
      include: {
        studentProfile: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    },
  } as const

  private async syncCurrentStudentsTx(
    tx: Prisma.TransactionClient,
    classGroupIds: string[]
  ) {
    if (classGroupIds.length === 0) {
      return
    }

    const activeCounts = await tx.classGroupEnrollment.groupBy({
      by: ["classGroupId"],
      where: {
        classGroupId: {
          in: classGroupIds,
        },
        status: "ACTIVE",
      },
      _count: {
        _all: true,
      },
    })

    const countsByClassGroupId = new Map(
      activeCounts.map((item) => [item.classGroupId, item._count._all])
    )

    for (const classGroupId of classGroupIds) {
      await tx.classGroup.update({
        where: { id: classGroupId },
        data: {
          currentStudents: countsByClassGroupId.get(classGroupId) ?? 0,
        },
      })
    }
  }

  private async ensureStudentModalityForClassTx(input: {
    tx: Prisma.TransactionClient
    tenantId: string
    classGroupId: string
    classModalityId: string
    classActivityCategory: string | null
    studentProfileId: string
  }) {
    const { tx, tenantId, classGroupId, classModalityId, classActivityCategory, studentProfileId } = input

    const studentProfile = await tx.studentProfile.findFirst({
      where: {
        id: studentProfileId,
        tenantId,
      },
      include: {
        activities: {
          where: {
            status: "ACTIVE",
          },
          orderBy: [{ createdAt: "asc" }],
        },
        modalities: {
          where: {
            modalityId: classModalityId,
          },
          orderBy: [{ createdAt: "asc" }],
        },
      },
    })

    if (!studentProfile) {
      throw new Error("Aluno não encontrado para esta academia.")
    }

    const matchingActivity =
      classActivityCategory == null
        ? null
        : studentProfile.activities.find(
            (activity) => activity.activityCategory === classActivityCategory
          ) ?? null
    const existingModality =
      studentProfile.modalities.find((modality) => modality.modalityId === classModalityId) ?? null

    if (!matchingActivity && !existingModality) {
      throw new Error("O aluno não possui a atividade principal necessária para participar desta turma.")
    }

    if (existingModality) {
      await tx.studentModality.update({
        where: { id: existingModality.id },
        data: {
          studentActivityId: matchingActivity?.id ?? existingModality.studentActivityId,
          belt: matchingActivity?.belt ?? existingModality.belt,
          stripes: matchingActivity?.stripes ?? existingModality.stripes,
          startDate: matchingActivity?.startDate ?? existingModality.startDate,
          notes: matchingActivity?.notes ?? existingModality.notes,
          status: "ACTIVE",
        },
      })
      return
    }

    if (!matchingActivity) {
      throw new Error("Não foi possível derivar a modalidade sem uma atividade principal compatível.")
    }

    await tx.studentModality.create({
      data: {
        studentProfileId,
        studentActivityId: matchingActivity.id,
        modalityId: classModalityId,
        belt: matchingActivity.belt,
        stripes: matchingActivity.stripes,
        startDate: matchingActivity.startDate,
        notes: matchingActivity.notes,
        status: "ACTIVE",
      },
    })
  }

  private async syncStudentModalityAfterEnrollmentChangeTx(input: {
    tx: Prisma.TransactionClient
    classGroupId: string
    classModalityId: string
    studentProfileId: string
  }) {
    const { tx, classGroupId, classModalityId, studentProfileId } = input

    const hasAnotherActiveEnrollment = await tx.classGroupEnrollment.findFirst({
      where: {
        studentProfileId,
        status: "ACTIVE",
        classGroup: {
          modalityId: classModalityId,
          id: {
            not: classGroupId,
          },
        },
      },
      select: {
        classGroupId: true,
      },
    })

    if (hasAnotherActiveEnrollment) {
      return
    }

    await tx.studentModality.updateMany({
      where: {
        studentProfileId,
        modalityId: classModalityId,
        status: "ACTIVE",
      },
      data: {
        status: "INACTIVE",
      },
    })
  }

  async findActiveModalityById(tenantId: string, modalityId: string) {
    return prisma.modality.findFirst({
      where: {
        id: modalityId,
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        activityCategory: true,
      },
    })
  }

  async findEligibleTeacherById(tenantId: string, teacherProfileId: string) {
    return prisma.teacherProfile.findFirst({
      where: {
        id: teacherProfileId,
        tenantId,
      },
      include: {
        membership: {
          select: {
            status: true,
          },
        },
        modalities: {
          include: {
            modality: {
              select: {
                id: true,
                isActive: true,
              },
            },
          },
        },
      },
    })
  }

  async listByTenantId(tenantId: string) {
    const [classes, sessions] = await Promise.all([
      prisma.classGroup.findMany({
        where: { tenantId },
        include: this.classGroupInclude,
        orderBy: [{ createdAt: "asc" }],
      }),
      prisma.classSession.findMany({
        where: { tenantId },
        orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
      }),
    ])

    return {
      classes: classes.map(toClassGroupEntity),
      sessions: sessions.map(toClassSessionEntity),
    }
  }

  async listByActor(input: {
    tenantId: string
    userId: string
    role: "academy_admin" | "teacher" | "student" | "platform_admin"
  }) {
    if (input.role !== "teacher") {
      return this.listByTenantId(input.tenantId)
    }

    const [classes, sessions] = await Promise.all([
      prisma.classGroup.findMany({
        where: {
          tenantId: input.tenantId,
          teacherProfile: {
            userId: input.userId,
          },
        },
        include: this.classGroupInclude,
        orderBy: [{ createdAt: "asc" }],
      }),
      prisma.classSession.findMany({
        where: {
          tenantId: input.tenantId,
          classGroup: {
            teacherProfile: {
              userId: input.userId,
            },
          },
        },
        orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
      }),
    ])

    return {
      classes: classes.map(toClassGroupEntity),
      sessions: sessions.map(toClassSessionEntity),
    }
  }

  async create(tenantId: string, input: ClassGroupInput) {
    const created = await prisma.classGroup.create({
      data: {
        tenantId,
        modalityId: input.modalityId ?? null,
        teacherProfileId: input.teacherProfileId ?? null,
        name: input.name,
        modalityName: input.modalityName,
        teacherName: input.teacherName,
        ageGroups: input.ageGroups.map((value) => toPrismaAgeGroup(value)),
        beltRange: input.beltRange,
        maxStudents: input.maxStudents,
        currentStudents: input.currentStudents ?? 0,
        status: toPrismaClassGroupStatus(input.status ?? "active"),
        schedules: {
          create: input.schedules.map((item) => ({
            weekday: item.weekday,
            startTime: item.startTime,
            endTime: item.endTime,
          })),
        },
      },
      include: this.classGroupInclude,
    })

    return toClassGroupEntity(created)
  }

  async update(classGroupId: string, tenantId: string, input: ClassGroupInput) {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.classSchedule.deleteMany({
        where: { classGroupId },
      })

      return tx.classGroup.update({
        where: { id: classGroupId, tenantId },
        data: {
          modalityId: input.modalityId ?? null,
          teacherProfileId: input.teacherProfileId ?? null,
          name: input.name,
          modalityName: input.modalityName,
          teacherName: input.teacherName,
          ageGroups: input.ageGroups.map((value) => toPrismaAgeGroup(value)),
          beltRange: input.beltRange,
          maxStudents: input.maxStudents,
          currentStudents: input.currentStudents ?? 0,
          status: toPrismaClassGroupStatus(input.status ?? "active"),
          schedules: {
            create: input.schedules.map((item) => ({
              weekday: item.weekday,
              startTime: item.startTime,
              endTime: item.endTime,
            })),
          },
        },
        include: this.classGroupInclude,
      })
    })

    return toClassGroupEntity(updated)
  }

  async remove(classGroupId: string, tenantId: string) {
    const historyCount = await prisma.classSession.count({
      where: { tenantId, classGroupId },
    })

    if (historyCount > 0) {
      const archived = await prisma.classGroup.update({
        where: { id: classGroupId, tenantId },
        data: { status: toPrismaClassGroupStatus("archived") },
        include: this.classGroupInclude,
      })

      return {
        mode: "archived" as const,
        classGroup: toClassGroupEntity(archived),
      }
    }

    await prisma.classGroup.delete({
      where: { id: classGroupId, tenantId },
    })

    return {
      mode: "deleted" as const,
    }
  }

  async upsertSession(tenantId: string, input: ClassSessionInput) {
    const sessionDate = parseSessionDateInput(input.sessionDate)

    const record = await prisma.classSession.upsert({
      where: {
        classGroupId_sessionDate: {
          classGroupId: input.classGroupId,
          sessionDate,
        },
      },
      update: {
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        status: toPrismaClassSessionStatus(input.status),
        confirmedStudentIds: input.confirmedStudentIds,
        confirmedStudentNames: input.confirmedStudentNames,
        presentStudentIds: input.presentStudentIds,
        absentStudentIds: input.absentStudentIds,
        justifiedStudentIds: input.justifiedStudentIds,
        finalizedAt: input.isFinalized ? new Date() : null,
      },
      create: {
        tenantId,
        classGroupId: input.classGroupId,
        sessionDate,
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        status: toPrismaClassSessionStatus(input.status),
        confirmedStudentIds: input.confirmedStudentIds,
        confirmedStudentNames: input.confirmedStudentNames,
        presentStudentIds: input.presentStudentIds ?? [],
        absentStudentIds: input.absentStudentIds ?? [],
        justifiedStudentIds: input.justifiedStudentIds ?? [],
        finalizedAt: input.isFinalized ? new Date() : null,
      },
    })

    return toClassSessionEntity(record)
  }

  async findSessionIdentityById(tenantId: string, sessionId: string) {
    const session = await prisma.classSession.findFirst({
      where: {
        id: sessionId,
        tenantId,
      },
      select: {
        id: true,
        classGroupId: true,
        sessionDate: true,
      },
    })

    if (!session) {
      return null
    }

    return {
      id: session.id,
      classGroupId: session.classGroupId,
      sessionDate: session.sessionDate.toISOString().slice(0, 10),
    }
  }

  async upsertSessionForActor(
    tenantId: string,
    userId: string,
    role: "academy_admin" | "teacher" | "student" | "platform_admin",
    input: ClassSessionInput
  ) {
    if (role === "teacher") {
      const classGroup = await prisma.classGroup.findFirst({
        where: {
          id: input.classGroupId,
          tenantId,
        },
        include: {
          teacherProfile: true,
        },
      })

      if (!classGroup || classGroup.teacherProfile?.userId !== userId) {
        throw new Error("Você só pode registrar presença nas suas próprias turmas.")
      }
    }

    return this.upsertSession(tenantId, input)
  }

  async replaceEnrollmentsByStudentUserIds(input: {
    tenantId: string
    classGroupId: string
    studentUserIds: string[]
  }) {
    return prisma.$transaction(async (tx) => {
      const classGroup = await tx.classGroup.findFirst({
        where: {
          id: input.classGroupId,
          tenantId: input.tenantId,
          status: "ACTIVE",
        },
        include: {
          modality: {
            select: {
              id: true,
              isActive: true,
              activityCategory: true,
            },
          },
        },
      })

      if (!classGroup) {
        throw new Error("Turma não encontrada para esta academia.")
      }

      if (!classGroup.modalityId || !classGroup.modality?.isActive) {
        throw new Error("A turma precisa estar vinculada a uma modalidade ativa.")
      }

      const requestedUserIds = Array.from(new Set(input.studentUserIds))
      if (requestedUserIds.length > classGroup.maxStudents) {
        throw new Error("A turma atingiu o limite máximo de alunos.")
      }

      const eligibleStudentsRaw = requestedUserIds.length
        ? await tx.studentProfile.findMany({
            where: {
              tenantId: input.tenantId,
              userId: {
                in: requestedUserIds,
              },
              status: "ACTIVE",
            },
            select: {
              id: true,
              userId: true,
              activities: {
                where: {
                  status: "ACTIVE",
                },
                select: {
                  id: true,
                  activityCategory: true,
                },
              },
              modalities: {
                where: {
                  modalityId: classGroup.modalityId,
                },
                select: {
                  id: true,
                  status: true,
                },
              },
            },
          })
        : []

      const eligibleStudents = requestedUserIds.length
        ? requestedUserIds.map((userId) => {
          const student =
              eligibleStudentsRaw.find((item) => item.userId === userId) ?? null

            if (!student) {
              return null
            }

            const hasMatchingActivity = classGroup.modality?.activityCategory
              ? student.activities.some(
                  (activity) => activity.activityCategory === classGroup.modality?.activityCategory
                )
              : false
            const hasLinkedModality = student.modalities.some(
              (modality) => modality.status === "ACTIVE"
            )

            return hasMatchingActivity || hasLinkedModality ? student : null
          })
        : []

      if (eligibleStudents.some((student) => student == null)) {
        throw new Error("Só é possível vincular alunos ativos com a atividade principal compatível com a turma.")
      }

      const eligibleByUserId = new Map(
        eligibleStudents
          .filter((student): student is NonNullable<typeof student> => Boolean(student))
          .map((student) => [student.userId, student])
      )
      const nextStudentProfileIds = requestedUserIds
        .map((userId) => eligibleByUserId.get(userId)?.id ?? null)
        .filter((value): value is string => Boolean(value))

      const existingEnrollments = await tx.classGroupEnrollment.findMany({
        where: {
          classGroupId: input.classGroupId,
        },
        select: {
          studentProfileId: true,
          status: true,
        },
      })

      const nextIds = new Set(nextStudentProfileIds)
      const existingIds = new Set(existingEnrollments.map((item) => item.studentProfileId))

      for (const studentProfileId of nextStudentProfileIds) {
        await this.ensureStudentModalityForClassTx({
          tx,
          tenantId: input.tenantId,
          classGroupId: input.classGroupId,
          classModalityId: classGroup.modalityId,
          classActivityCategory: classGroup.modality?.activityCategory ?? null,
          studentProfileId,
        })

        if (existingIds.has(studentProfileId)) {
          await tx.classGroupEnrollment.updateMany({
            where: {
              classGroupId: input.classGroupId,
              studentProfileId,
            },
            data: {
              status: "ACTIVE",
              leftAt: null,
            },
          })
          continue
        }

        await tx.classGroupEnrollment.create({
          data: {
            classGroupId: input.classGroupId,
            studentProfileId,
            status: "ACTIVE",
          },
        })
      }

      await tx.classGroupEnrollment.updateMany({
        where: {
          classGroupId: input.classGroupId,
          studentProfileId: {
            notIn: nextStudentProfileIds,
          },
          status: "ACTIVE",
        },
        data: {
          status: "INACTIVE",
          leftAt: new Date(),
        },
      })

      const removedStudentProfileIds = existingEnrollments
        .filter((item) => item.status === "ACTIVE" && !nextIds.has(item.studentProfileId))
        .map((item) => item.studentProfileId)

      for (const studentProfileId of removedStudentProfileIds) {
        await this.syncStudentModalityAfterEnrollmentChangeTx({
          tx,
          classGroupId: input.classGroupId,
          classModalityId: classGroup.modalityId,
          studentProfileId,
        })
      }

      await this.syncCurrentStudentsTx(tx, [input.classGroupId])

      const updated = await tx.classGroup.findUniqueOrThrow({
        where: {
          id: input.classGroupId,
        },
        include: this.classGroupInclude,
      })

      return toClassGroupEntity(updated)
    })
  }

  async teacherOwnsClass(input: {
    tenantId: string
    userId: string
    classGroupId: string
  }) {
    const classGroup = await prisma.classGroup.findFirst({
      where: {
        id: input.classGroupId,
        tenantId: input.tenantId,
        teacherProfile: {
          userId: input.userId,
        },
      },
      select: {
        id: true,
      },
    })

    return Boolean(classGroup)
  }

  async addStudentEnrollmentByUserId(input: {
    tenantId: string
    classGroupId: string
    userId: string
  }) {
    return this.setStudentEnrollmentStatusByUserId({
      ...input,
      status: "ACTIVE",
    })
  }

  async removeStudentEnrollmentByUserId(input: {
    tenantId: string
    classGroupId: string
    userId: string
  }) {
    return this.setStudentEnrollmentStatusByUserId({
      ...input,
      status: "INACTIVE",
    })
  }

  async findActiveEnrollmentUserIds(classGroupId: string, tenantId: string) {
    const enrollments = await prisma.classGroupEnrollment.findMany({
      where: {
        classGroupId,
        classGroup: {
          tenantId,
        },
        status: "ACTIVE",
        studentProfile: {
          status: "ACTIVE",
        },
      },
      include: {
        studentProfile: {
          select: {
            userId: true,
          },
        },
      },
    })

    return enrollments.map((item) => item.studentProfile.userId)
  }

  private async setStudentEnrollmentStatusByUserId(input: {
    tenantId: string
    classGroupId: string
    userId: string
    status: "ACTIVE" | "INACTIVE"
  }) {
    return prisma.$transaction(async (tx) => {
      const classGroup = await tx.classGroup.findFirst({
        where: {
          id: input.classGroupId,
          tenantId: input.tenantId,
          status: "ACTIVE",
        },
        include: {
          modality: {
            select: {
              id: true,
              isActive: true,
              activityCategory: true,
            },
          },
          enrollments: {
            where: {
              status: "ACTIVE",
            },
            select: {
              studentProfileId: true,
            },
          },
        },
      })

      if (!classGroup) {
        throw new Error("Turma não encontrada para esta academia.")
      }

      if (!classGroup.modalityId || !classGroup.modality?.isActive) {
        throw new Error("A turma precisa estar vinculada a uma modalidade ativa.")
      }

      const studentProfile = await tx.studentProfile.findFirst({
        where: {
          tenantId: input.tenantId,
          userId: input.userId,
          status: "ACTIVE",
        },
        select: {
          id: true,
          activities: {
            where: {
              status: "ACTIVE",
            },
            select: {
              id: true,
              activityCategory: true,
            },
          },
          modalities: {
            where: {
              modalityId: classGroup.modalityId,
            },
            select: {
              id: true,
              status: true,
            },
          },
        },
      })

      const hasMatchingActivity =
        classGroup.modality?.activityCategory != null &&
        studentProfile?.activities.some(
          (activity) => activity.activityCategory === classGroup.modality?.activityCategory
        )
      const hasLinkedModality = studentProfile?.modalities.some(
        (modality) => modality.status === "ACTIVE"
      )

      if (!studentProfile || (!hasMatchingActivity && !hasLinkedModality)) {
        throw new Error("O aluno não pode ser vinculado a esta turma.")
      }

      const existing = await tx.classGroupEnrollment.findUnique({
        where: {
          classGroupId_studentProfileId: {
            classGroupId: input.classGroupId,
            studentProfileId: studentProfile.id,
          },
        },
        select: {
          status: true,
        },
      })

      if (input.status === "ACTIVE") {
        await this.ensureStudentModalityForClassTx({
          tx,
          tenantId: input.tenantId,
          classGroupId: input.classGroupId,
          classModalityId: classGroup.modalityId,
          classActivityCategory: classGroup.modality?.activityCategory ?? null,
          studentProfileId: studentProfile.id,
        })

        const activeCount = classGroup.enrollments.length
        const isAlreadyActive = existing?.status === "ACTIVE"

        if (!isAlreadyActive && activeCount >= classGroup.maxStudents) {
          throw new Error("A turma atingiu o limite máximo de alunos.")
        }

        if (existing) {
          await tx.classGroupEnrollment.update({
            where: {
              classGroupId_studentProfileId: {
                classGroupId: input.classGroupId,
                studentProfileId: studentProfile.id,
              },
            },
            data: {
              status: "ACTIVE",
              joinedAt: new Date(),
              leftAt: null,
            },
          })
        } else {
          await tx.classGroupEnrollment.create({
            data: {
              classGroupId: input.classGroupId,
              studentProfileId: studentProfile.id,
              status: "ACTIVE",
            },
          })
        }
      } else if (existing?.status === "ACTIVE") {
        await tx.classGroupEnrollment.update({
          where: {
            classGroupId_studentProfileId: {
              classGroupId: input.classGroupId,
              studentProfileId: studentProfile.id,
            },
          },
          data: {
            status: "INACTIVE",
            leftAt: new Date(),
          },
        })

        await this.syncStudentModalityAfterEnrollmentChangeTx({
          tx,
          classGroupId: input.classGroupId,
          classModalityId: classGroup.modalityId,
          studentProfileId: studentProfile.id,
        })
      }

      await this.syncCurrentStudentsTx(tx, [input.classGroupId])

      const updated = await tx.classGroup.findUniqueOrThrow({
        where: {
          id: input.classGroupId,
        },
        include: this.classGroupInclude,
      })

      return toClassGroupEntity(updated)
    })
  }
}
