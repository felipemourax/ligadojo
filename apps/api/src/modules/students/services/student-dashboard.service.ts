import {
  MembershipStatus,
  Prisma,
  StudentActivityStatus,
  StudentProfileStatus,
  StudentModalityStatus,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  calculateAttendanceRate,
  resolveSessionAttendanceStatus,
} from "@/apps/api/src/modules/classes/domain/session-attendance"
import { FinanceStudentStateService } from "@/apps/api/src/modules/finance/services/finance-student-state.service"
import { FinancePlanTransitionService } from "@/apps/api/src/modules/finance/services/finance-plan-transition.service"
import { inferTrackBeltColorHex } from "@/apps/api/src/modules/graduations/domain/graduation-presets"
import {
  buildGraduationActivityCatalog,
  resolveGraduationCatalogLevels,
} from "@/apps/api/src/modules/graduations/domain/graduation-level-catalog"
import { ModalityRepository } from "@/apps/api/src/modules/modalities/repositories/modality.repository"
import type {
  StudentDashboardCollection,
  StudentDashboardRecord,
  StudentUpsertInput,
} from "@/apps/api/src/modules/students/domain/student-dashboard"

function toDateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null
}

function toDateTime(value: string | null | undefined, fallback: Date) {
  if (!value) {
    return fallback
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function toOptionalDateTime(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function normalizeString(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function formatAddress(user: {
  street: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}) {
  return [user.street, user.city, user.state, user.zipCode].filter(Boolean).join(" - ")
}

function sanitizeFinancialFields(
  role: "academy_admin" | "teacher" | "student" | "platform_admin",
  record: StudentDashboardRecord
): StudentDashboardRecord {
  if (role !== "teacher") {
    return record
  }

  return {
    ...record,
    planId: null,
    planName: null,
    planValueCents: null,
    paymentStatus: "pending",
    lastPayment: null,
    nextPayment: null,
  }
}

export class StudentDashboardService {
  constructor(
    private readonly financeStudentStateService = new FinanceStudentStateService(),
    private readonly financePlanTransitionService = new FinancePlanTransitionService(),
    private readonly modalityRepository = new ModalityRepository()
  ) {}

  async listForTenant(tenantId: string): Promise<StudentDashboardCollection> {
    const [students, modalities, plans, classGroups, sessions, graduationTracks, activityCategories] = await Promise.all([
      prisma.studentProfile.findMany({
        where: { tenantId },
        include: {
          user: true,
          membership: true,
          activities: {
            include: {
              graduations: {
                orderBy: { graduatedAt: "desc" },
              },
            },
            orderBy: [{ createdAt: "asc" }],
          },
          modalities: {
            include: {
              modality: true,
            },
            orderBy: [{ createdAt: "asc" }],
          },
        },
        orderBy: [{ createdAt: "asc" }],
      }),
      prisma.modality.findMany({
        where: { tenantId, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.plan.findMany({
        where: { tenantId, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.classGroup.findMany({
        where: { tenantId, status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          modalityId: true,
          modalityName: true,
          currentStudents: true,
          maxStudents: true,
          modality: {
            select: {
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
      }),
      prisma.classSession.findMany({
        where: { tenantId },
        include: {
          classGroup: {
            select: {
              id: true,
              name: true,
              modalityId: true,
              modality: {
                select: {
                  activityCategory: true,
                },
              },
            },
          },
        },
        orderBy: { sessionDate: "desc" },
      }),
      prisma.graduationTrack.findMany({
        where: { tenantId, isActive: true },
        include: {
          levels: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
      this.modalityRepository.listAvailableActivityCategories(tenantId),
    ])

    const financialStateByUserId = await this.financeStudentStateService.listForUsers({
      tenantId,
      userIds: students.map((student) => student.userId),
    })
    const trackColorInput = graduationTracks.map((track) => ({
      modalityId: track.modalityId,
      levels: track.levels.map((level) => ({
        name: level.name,
        colorHex: level.colorHex,
      })),
    }))
    const graduationCatalog = buildGraduationActivityCatalog(
      graduationTracks.map((track) => ({
        modalityId: track.modalityId,
        modalityName: modalities.find((modality) => modality.id === track.modalityId)?.name ?? null,
        activityCategory:
          modalities.find((modality) => modality.id === track.modalityId)?.activityCategory ?? null,
        order: track.sortOrder,
        levels: track.levels.map((level) => ({
          name: level.name,
          colorHex: level.colorHex,
          stripes: level.stripes,
          order: level.sortOrder,
        })),
      }))
    )

    const records: StudentDashboardRecord[] = students.map((student) => {
      const financialState = financialStateByUserId.get(student.userId) ?? null

      return {
        id: student.id,
        linkedUserId: student.userId,
        membershipId: student.membershipId,
        name: student.user.name ?? student.user.email,
        email: student.user.email,
        phone: student.user.phone,
        avatar: null,
        status: student.status.toLowerCase() as StudentDashboardRecord["status"],
        birthDate: toDateOnly(student.user.birthDate),
        address: formatAddress(student.user),
        startDate:
          toDateOnly(
            [...student.activities.map((item) => item.startDate), ...student.modalities.map((item) => item.startDate)]
              .sort((a, b) => a.getTime() - b.getTime())[0]
          ) ?? toDateOnly(student.createdAt) ?? new Date().toISOString().slice(0, 10),
        emergencyContact: student.emergencyContact ?? "",
        notes: student.notes ?? "",
        planId: financialState?.planId ?? null,
        planName: financialState?.planName ?? null,
        planValueCents: financialState?.planValueCents ?? null,
        paymentStatus: financialState?.paymentStatus ?? "pending",
        lastPayment: financialState?.lastPayment ?? null,
        nextPayment: financialState?.nextPayment ?? null,
        practiceAssignments: student.activities.flatMap<StudentDashboardRecord["practiceAssignments"][number]>((activity) => {
          const matchingClasses = classGroups.filter(
            (group) =>
              group.enrollments.some((enrollment) => enrollment.studentProfileId === student.id) &&
              group.modality?.activityCategory === activity.activityCategory
          )

          if (matchingClasses.length === 0) {
            return [{
              activityCategory: activity.activityCategory,
              classGroupId: null,
              classGroupName: null,
              modalityId: null,
              modalityName: null,
              belt: activity.belt,
              stripes: activity.stripes,
              startDate: activity.startDate.toISOString().slice(0, 10),
              notes: activity.notes ?? "",
            }]
          }

          return matchingClasses.map((group) => ({
            activityCategory: activity.activityCategory,
            classGroupId: group.id,
            classGroupName: group.name,
            modalityId: group.modalityId ?? null,
            modalityName: group.modalityName,
            belt: activity.belt,
            stripes: activity.stripes,
            startDate: activity.startDate.toISOString().slice(0, 10),
            notes: activity.notes ?? "",
          }))
        }),
        activities: student.activities.map((activity) => {
          const linkedModalityIds = student.modalities
            .filter((item) => item.studentActivityId === activity.id)
            .map((item) => item.modalityId)
          const activityClasses = classGroups.filter(
            (group) =>
              group.enrollments.some((enrollment) => enrollment.studentProfileId === student.id) &&
              (
                (activity.activityCategory != null &&
                  group.modality?.activityCategory === activity.activityCategory) ||
                (activity.activityCategory == null && group.modalityId != null && linkedModalityIds.includes(group.modalityId))
              )
          )
          const activitySessions = sessions.filter((session) => {
            if (resolveSessionAttendanceStatus(session, student.userId) === "unmarked") {
              return false
            }

            if (activity.activityCategory != null) {
              return session.classGroup.modality?.activityCategory === activity.activityCategory
            }

            return session.classGroup.modalityId != null && linkedModalityIds.includes(session.classGroup.modalityId)
          })
          const presentCount = activitySessions.filter((session) =>
            session.presentStudentIds.includes(student.userId)
          ).length
          const absentCount = activitySessions.filter((session) =>
            session.absentStudentIds.includes(student.userId)
          ).length
          const preferredModalityIds =
            linkedModalityIds.length > 0
              ? linkedModalityIds
              : student.modalities
                  .filter((item) => item.modality.activityCategory === activity.activityCategory)
                  .map((item) => item.modalityId)

          return {
            id: activity.id,
            activityCategory: activity.activityCategory,
            belt: activity.belt,
            beltColorHex: inferTrackBeltColorHex({
              beltName: activity.belt,
              preferredModalityIds,
              tracks: trackColorInput,
            }),
            stripes: activity.stripes,
            graduationLevels: resolveGraduationCatalogLevels({
              catalog: graduationCatalog,
              activityCategory: activity.activityCategory,
              preferredModalityIds,
            }).map((level) => ({
              name: level.name,
              colorHex: level.colorHex,
              stripes: level.stripes,
            })),
            startDate: activity.startDate.toISOString().slice(0, 10),
            status: activity.status.toLowerCase() as "active" | "inactive",
            notes: activity.notes ?? "",
            practicedModalities: student.modalities
              .filter((item) => item.studentActivityId === activity.id)
              .map((item) => item.modality.name),
            enrolledClasses: activityClasses.map((group) => group.name),
            attendanceRate: calculateAttendanceRate({
              presentCount,
              absentCount,
            }),
            totalClasses: presentCount + absentCount,
            attendanceHistory: activitySessions.slice(0, 8).flatMap((session) => {
              const status = resolveSessionAttendanceStatus(session, student.userId)

              if (status === "unmarked") {
                return []
              }

              return [{
                id: session.id,
                date: session.sessionDate.toISOString().slice(0, 10),
                className: session.classGroup.name,
                time: session.startTime,
                status,
              }]
            }),
            graduationHistory: activity.graduations.map((graduation) => ({
              id: graduation.id,
              date: graduation.graduatedAt.toISOString().slice(0, 10),
              from:
                graduation.fromBelt == null
                  ? null
                  : `${graduation.fromBelt}${graduation.fromStripes != null ? ` ${graduation.fromStripes} grau${graduation.fromStripes === 1 ? "" : "s"}` : ""}`,
              to: `${graduation.toBelt}${graduation.toStripes > 0 ? ` ${graduation.toStripes} grau${graduation.toStripes === 1 ? "" : "s"}` : ""}`,
              evaluator: graduation.evaluatorName,
              notes: graduation.notes ?? null,
            })),
          }
        }),
        modalities: student.modalities.map((studentModality) => {
          const linkedActivity =
            student.activities.find((activity) => activity.id === studentModality.studentActivityId) ?? null
          const modalityClasses = classGroups.filter(
            (group) =>
              group.modalityId === studentModality.modalityId &&
              group.enrollments.some((enrollment) => enrollment.studentProfileId === student.id)
          )
          const modalitySessions = sessions.filter(
            (session) =>
              session.classGroup.modalityId === studentModality.modalityId &&
              resolveSessionAttendanceStatus(session, student.userId) !== "unmarked"
          )

          const presentCount = modalitySessions.filter((session) =>
            session.presentStudentIds.includes(student.userId)
          ).length
          const absentCount = modalitySessions.filter((session) =>
            session.absentStudentIds.includes(student.userId)
          ).length
          const countedAttendance = presentCount + absentCount

          return {
            id: studentModality.id,
            studentActivityId: studentModality.studentActivityId,
            modalityId: studentModality.modalityId,
            modalityName: studentModality.modality.name,
            activityCategory: studentModality.modality.activityCategory,
            belt: linkedActivity?.belt ?? studentModality.belt,
            beltColorHex: inferTrackBeltColorHex({
              beltName: linkedActivity?.belt ?? studentModality.belt,
              preferredModalityIds: [studentModality.modalityId],
              tracks: trackColorInput,
            }),
            stripes: linkedActivity?.stripes ?? studentModality.stripes,
            startDate: (linkedActivity?.startDate ?? studentModality.startDate).toISOString().slice(0, 10),
            status: studentModality.status.toLowerCase() as "active" | "inactive",
            notes: linkedActivity?.notes ?? studentModality.notes ?? "",
            enrolledClasses: modalityClasses.map((group) => group.name),
            attendanceRate: calculateAttendanceRate({
              presentCount,
              absentCount,
            }),
            totalClasses: countedAttendance,
            attendanceHistory: modalitySessions.slice(0, 8).flatMap((session) => {
              const status = resolveSessionAttendanceStatus(session, student.userId)

              if (status === "unmarked") {
                return []
              }

              return [{
                id: session.id,
                date: session.sessionDate.toISOString().slice(0, 10),
                className: session.classGroup.name,
                time: session.startTime,
                status,
              }]
            }),
            graduationHistory: (linkedActivity?.graduations ?? []).map((graduation) => ({
              id: graduation.id,
              date: graduation.graduatedAt.toISOString().slice(0, 10),
              from:
                graduation.fromBelt == null
                  ? null
                  : `${graduation.fromBelt}${graduation.fromStripes != null ? ` ${graduation.fromStripes} grau${graduation.fromStripes === 1 ? "" : "s"}` : ""}`,
              to: `${graduation.toBelt}${graduation.toStripes > 0 ? ` ${graduation.toStripes} grau${graduation.toStripes === 1 ? "" : "s"}` : ""}`,
              evaluator: graduation.evaluatorName,
              notes: graduation.notes ?? null,
            })),
          }
        }),
      }
    })

    return {
      students: records,
      activityCategoryOptions: activityCategories,
      classOptions: classGroups.map((group) => ({
        id: group.id,
        name: group.name,
        activityCategory: group.modality?.activityCategory ?? null,
        modalityId: group.modalityId,
        modalityName: group.modalityName,
        currentStudents: group.currentStudents,
        maxStudents: group.maxStudents,
      })),
      modalityOptions: modalities.map((modality) => ({ id: modality.id, name: modality.name })),
      planOptions: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        amountCents: plan.amountCents,
      })),
    }
  }

  async findForTenant(tenantId: string, studentId: string) {
    const result = await this.listForTenant(tenantId)
    return result.students.find((student) => student.id === studentId) ?? null
  }

  async listForActor(input: {
    tenantId: string
    actorUserId?: string | null
    actorRole: "academy_admin" | "teacher" | "student" | "platform_admin"
  }): Promise<StudentDashboardCollection> {
    const result = await this.listForTenant(input.tenantId)

    if (input.actorRole !== "teacher" || !input.actorUserId) {
      return result
    }

    const scopedStudentIds = new Set(
      (
        await prisma.studentProfile.findMany({
          where: {
            tenantId: input.tenantId,
            status: "ACTIVE",
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
          },
          select: {
            id: true,
          },
        })
      ).map((student) => student.id)
    )

    return {
      ...result,
      students: result.students
        .filter((student) => scopedStudentIds.has(student.id))
        .map((student) => sanitizeFinancialFields(input.actorRole, student)),
      planOptions: [],
    }
  }

  async findForActor(input: {
    tenantId: string
    studentId: string
    actorUserId?: string | null
    actorRole: "academy_admin" | "teacher" | "student" | "platform_admin"
  }) {
    const result = await this.listForActor({
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
    })

    return result.students.find((student) => student.id === input.studentId) ?? null
  }

  async upsert(input: StudentUpsertInput) {
    const practiceAssignments = input.practiceAssignments ?? []
    const legacyModalities = input.modalities ?? []

    if (practiceAssignments.length === 0 && legacyModalities.length === 0) {
      throw new Error("Informe ao menos uma atividade principal para o aluno.")
    }

    const normalizedEmail = input.email.trim().toLowerCase()
    const currentDate = new Date()

    const result = await prisma.$transaction(async (tx) => {
      const requestedClassGroupIds = Array.from(
        new Set(
          practiceAssignments
            .map((item) => item.classGroupId)
            .filter((value): value is string => typeof value === "string" && value.length > 0)
        )
      )
      const selectedClassGroups = requestedClassGroupIds.length
        ? await tx.classGroup.findMany({
            where: {
              tenantId: input.tenantId,
              id: {
                in: requestedClassGroupIds,
              },
              status: "ACTIVE",
            },
            select: {
              id: true,
              name: true,
              modalityId: true,
              modalityName: true,
              currentStudents: true,
              maxStudents: true,
              modality: {
                select: {
                  activityCategory: true,
                },
              },
            },
          })
        : []

      if (selectedClassGroups.length !== requestedClassGroupIds.length) {
        throw new Error("Selecione turmas ativas válidas para o aluno.")
      }

      const selectedClassGroupsById = new Map(selectedClassGroups.map((item) => [item.id, item]))
      const normalizedAssignments =
        practiceAssignments.length > 0
          ? practiceAssignments.map((assignment) => {
              const classGroup = assignment.classGroupId
                ? selectedClassGroupsById.get(assignment.classGroupId)
                : null

              if (!assignment.activityCategory && !classGroup?.modality?.activityCategory) {
                throw new Error("Selecione uma atividade principal válida para o aluno.")
              }

              if (assignment.classGroupId && (!classGroup || !classGroup.modalityId)) {
                throw new Error("A turma selecionada precisa estar vinculada a uma modalidade ativa.")
              }

              if (
                assignment.activityCategory &&
                classGroup?.modality?.activityCategory &&
                assignment.activityCategory !== classGroup.modality.activityCategory
              ) {
                throw new Error("A turma selecionada não corresponde à atividade principal escolhida.")
              }

              return {
                activityCategory: assignment.activityCategory ?? classGroup?.modality?.activityCategory ?? null,
                classGroupId: classGroup?.id ?? null,
                classGroupName: classGroup?.name ?? null,
                modalityId: classGroup?.modalityId ?? null,
                modalityName: classGroup?.modalityName ?? null,
                belt: assignment.belt,
                stripes: assignment.stripes,
                startDate: assignment.startDate,
                notes: assignment.notes,
              }
            })
          : []

      const legacyModalityRecords = legacyModalities.length
        ? await tx.modality.findMany({
            where: {
              tenantId: input.tenantId,
              id: {
                in: legacyModalities.map((item) => item.modalityId),
              },
              isActive: true,
            },
            select: {
              id: true,
              name: true,
              activityCategory: true,
            },
          })
        : []
      const legacyModalitiesById = new Map(legacyModalityRecords.map((item) => [item.id, item]))

      const desiredAssignments = normalizedAssignments.length
        ? normalizedAssignments
        : legacyModalities.map((modality) => {
            const modalityRecord = legacyModalitiesById.get(modality.modalityId)

            return {
              activityCategory: modalityRecord?.activityCategory ?? null,
              classGroupId: null,
              classGroupName: null,
              modalityId: modality.modalityId,
              modalityName: modalityRecord?.name ?? null,
              belt: modality.belt,
              stripes: modality.stripes,
              startDate: modality.startDate,
              notes: modality.notes,
            }
          })

      const desiredActivities = desiredAssignments.filter((assignment) => assignment.activityCategory)
      if (desiredActivities.length === 0) {
        throw new Error("Informe ao menos uma atividade principal para o aluno.")
      }

      const duplicateActivityCategories = new Set<string>()
      const seenActivityCategories = new Set<string>()
      for (const assignment of desiredActivities) {
        const activityCategory = assignment.activityCategory as string
        if (seenActivityCategories.has(activityCategory)) {
          duplicateActivityCategories.add(activityCategory)
        }
        seenActivityCategories.add(activityCategory)
      }

      if (duplicateActivityCategories.size > 0) {
        throw new Error("Selecione cada atividade principal apenas uma vez no cadastro do aluno.")
      }

      let studentProfile = input.studentId
        ? await tx.studentProfile.findUnique({
            where: { id: input.studentId },
            include: {
              user: true,
              membership: true,
              activities: true,
            },
          })
        : null

      if (studentProfile && studentProfile.tenantId !== input.tenantId) {
        throw new Error("Aluno não encontrado para este tenant.")
      }

      const conflictingProfile = await tx.studentProfile.findFirst({
        where: {
          tenantId: input.tenantId,
          id: input.studentId ? { not: input.studentId } : undefined,
          user: {
            email: {
              equals: normalizedEmail,
              mode: "insensitive",
            },
          },
        },
        select: { id: true },
      })

      if (conflictingProfile) {
        throw new Error("Já existe um aluno cadastrado com este e-mail nesta academia.")
      }

      const user = studentProfile
        ? await tx.user.update({
            where: { id: studentProfile.userId },
            data: {
              email: normalizedEmail,
              name: input.name.trim(),
              phone: normalizeString(input.phone),
              birthDate: toOptionalDateTime(input.birthDate),
              street: normalizeString(input.address),
              emergencyContact: normalizeString(input.emergencyContact),
            },
          })
        : await tx.user.upsert({
            where: { email: normalizedEmail },
            update: {
              name: input.name.trim(),
              phone: normalizeString(input.phone),
              birthDate: toOptionalDateTime(input.birthDate),
              street: normalizeString(input.address),
              emergencyContact: normalizeString(input.emergencyContact),
            },
            create: {
              email: normalizedEmail,
              name: input.name.trim(),
              phone: normalizeString(input.phone),
              birthDate: toOptionalDateTime(input.birthDate),
              street: normalizeString(input.address),
              emergencyContact: normalizeString(input.emergencyContact),
            },
          })

      const membership = await tx.academyMembership.upsert({
        where: {
          userId_tenantId: {
            userId: user.id,
            tenantId: input.tenantId,
          },
        },
        update: {
          role: "STUDENT",
          status: MembershipStatus.ACTIVE,
          acceptedAt: currentDate,
        },
        create: {
          userId: user.id,
          tenantId: input.tenantId,
          role: "STUDENT",
          status: MembershipStatus.ACTIVE,
          invitedByName: "Dashboard",
          acceptedAt: currentDate,
        },
      })

      studentProfile = studentProfile
        ? await tx.studentProfile.update({
            where: { id: studentProfile.id },
            data: {
              userId: user.id,
              membershipId: membership.id,
              emergencyContact: normalizeString(input.emergencyContact),
              notes: normalizeString(input.notes),
              status: StudentProfileStatus.ACTIVE,
            },
            include: {
              user: true,
              membership: true,
              activities: true,
            },
          })
        : await tx.studentProfile.create({
            data: {
              tenantId: input.tenantId,
              userId: user.id,
              membershipId: membership.id,
              emergencyContact: normalizeString(input.emergencyContact),
              notes: normalizeString(input.notes),
              status: StudentProfileStatus.ACTIVE,
            },
            include: {
              user: true,
              membership: true,
              activities: true,
            },
          })

      const existingActivities = await tx.studentActivity.findMany({
        where: {
          studentProfileId: studentProfile.id,
        },
      })

      const activityIdsToKeep: string[] = []
      const activityIdByCategory = new Map<string, string>()

      for (const assignment of desiredActivities) {
        const activityCategory = assignment.activityCategory as string
        const existing = existingActivities.find((item) => item.activityCategory === activityCategory)

        if (existing) {
          await tx.studentActivity.update({
            where: { id: existing.id },
            data: {
              belt: assignment.belt,
              stripes: assignment.stripes,
              startDate: toDateTime(assignment.startDate, currentDate),
              notes: normalizeString(assignment.notes),
              status: StudentActivityStatus.ACTIVE,
            },
          })
          activityIdsToKeep.push(existing.id)
          activityIdByCategory.set(activityCategory, existing.id)
        } else {
          const createdActivity = await tx.studentActivity.create({
            data: {
              studentProfileId: studentProfile.id,
              activityCategory,
              belt: assignment.belt,
              stripes: assignment.stripes,
              startDate: toDateTime(assignment.startDate, currentDate),
              notes: normalizeString(assignment.notes),
              status: StudentActivityStatus.ACTIVE,
            },
          })

          activityIdsToKeep.push(createdActivity.id)
          activityIdByCategory.set(activityCategory, createdActivity.id)
        }
      }

      const activitiesToInactivate = existingActivities.filter((item) => !activityIdsToKeep.includes(item.id))
      if (activitiesToInactivate.length > 0) {
        await tx.studentActivity.updateMany({
          where: {
            id: {
              in: activitiesToInactivate.map((item) => item.id),
            },
          },
          data: {
            status: StudentActivityStatus.INACTIVE,
          },
        })
      }

      const desiredModalityLinks = desiredAssignments.filter(
        (assignment): assignment is typeof assignment & { modalityId: string; activityCategory: string } =>
          typeof assignment.modalityId === "string" &&
          assignment.modalityId.length > 0 &&
          typeof assignment.activityCategory === "string" &&
          assignment.activityCategory.length > 0
      )

      const existingModalities = await tx.studentModality.findMany({
        where: {
          studentProfileId: studentProfile.id,
        },
      })

      const desiredModalityIdSet = new Set(desiredModalityLinks.map((item) => item.modalityId))

      await tx.studentModality.updateMany({
        where: {
          studentProfileId: studentProfile.id,
          modalityId: {
            notIn: Array.from(desiredModalityIdSet),
          },
          status: StudentModalityStatus.ACTIVE,
        },
        data: {
          status: StudentModalityStatus.INACTIVE,
        },
      })

      for (const assignment of desiredModalityLinks) {
        const existing = existingModalities.find((item) => item.modalityId === assignment.modalityId)
        const studentActivityId = activityIdByCategory.get(assignment.activityCategory)

        if (!studentActivityId) {
          throw new Error("Não foi possível vincular a modalidade à atividade principal do aluno.")
        }

        if (existing) {
          await tx.studentModality.update({
            where: { id: existing.id },
            data: {
              studentActivityId,
              belt: assignment.belt,
              stripes: assignment.stripes,
              startDate: toDateTime(assignment.startDate, currentDate),
              notes: normalizeString(assignment.notes),
              graduationEligibleOverride: null,
              status: StudentModalityStatus.ACTIVE,
            },
          })
        } else {
          await tx.studentModality.create({
            data: {
              studentProfileId: studentProfile.id,
              studentActivityId,
              modalityId: assignment.modalityId,
              belt: assignment.belt,
              stripes: assignment.stripes,
              startDate: toDateTime(assignment.startDate, currentDate),
              notes: normalizeString(assignment.notes),
              status: StudentModalityStatus.ACTIVE,
            },
          })
        }
      }

      const existingEnrollments = await tx.classGroupEnrollment.findMany({
        where: {
          studentProfileId: studentProfile.id,
          classGroup: {
            tenantId: input.tenantId,
          },
        },
        select: {
          classGroupId: true,
          status: true,
        },
      })

      const desiredClassGroupIds = desiredAssignments
        .map((item) => item.classGroupId)
        .filter((value): value is string => Boolean(value))

      const desiredClassGroupIdSet = new Set(desiredClassGroupIds)
      const touchedClassGroupIds = new Set(desiredClassGroupIds)
      const selectedClassesById = new Map(selectedClassGroups.map((item) => [item.id, item]))

      for (const classGroupId of desiredClassGroupIds) {
        const classGroup = selectedClassesById.get(classGroupId)
        const existing = existingEnrollments.find((item) => item.classGroupId === classGroupId)

        if (
          classGroup &&
          existing?.status !== "ACTIVE" &&
          classGroup.currentStudents >= classGroup.maxStudents
        ) {
          throw new Error(`A turma "${classGroup.name}" atingiu o limite máximo de alunos.`)
        }
      }

      for (const classGroupId of desiredClassGroupIds) {
        const existing = existingEnrollments.find((item) => item.classGroupId === classGroupId)

        if (existing) {
          await tx.classGroupEnrollment.updateMany({
            where: {
              classGroupId,
              studentProfileId: studentProfile.id,
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
              classGroupId,
              studentProfileId: studentProfile.id,
              status: "ACTIVE",
            },
          })
        }
      }

      const enrollmentsToDeactivate = existingEnrollments.filter(
        (item) => item.status === "ACTIVE" && !desiredClassGroupIdSet.has(item.classGroupId)
      )

      for (const enrollment of enrollmentsToDeactivate) {
        touchedClassGroupIds.add(enrollment.classGroupId)
        await tx.classGroupEnrollment.updateMany({
          where: {
            classGroupId: enrollment.classGroupId,
            studentProfileId: studentProfile.id,
            status: "ACTIVE",
          },
          data: {
            status: "INACTIVE",
            leftAt: new Date(),
          },
        })
      }

      await this.syncClassCurrentStudentsTx(tx, Array.from(touchedClassGroupIds))

      if (input.planId) {
        const activePlan = await tx.plan.findFirst({
          where: {
            id: input.planId,
            tenantId: input.tenantId,
            isActive: true,
          },
          select: { id: true },
        })

        if (!activePlan) {
          throw new Error("Selecione um plano ativo para o aluno.")
        }
      }

      return {
        studentId: studentProfile.id,
        userId: user.id,
      }
    })

    if (input.planId) {
      await this.financePlanTransitionService.assignPlanFromAdmin({
        tenantId: input.tenantId,
        userId: result.userId,
        planId: input.planId,
        markAsPaid: input.markPlanAsPaid === true,
      })
    }

    return result.studentId
  }

  private async syncClassCurrentStudentsTx(
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

  async updateStatus(input: {
    tenantId: string
    studentId: string
    status: StudentDashboardRecord["status"]
  }) {
    return prisma.$transaction(async (tx) => {
      const studentProfile = await tx.studentProfile.findUnique({
        where: { id: input.studentId },
      })

      if (!studentProfile || studentProfile.tenantId !== input.tenantId) {
        throw new Error("Aluno não encontrado para este tenant.")
      }

      const nextProfileStatus =
        input.status === "active"
          ? StudentProfileStatus.ACTIVE
          : input.status === "inactive"
            ? StudentProfileStatus.INACTIVE
            : StudentProfileStatus.SUSPENDED

      await tx.studentProfile.update({
        where: { id: studentProfile.id },
        data: {
          status: nextProfileStatus,
        },
      })

      if (studentProfile.membershipId) {
        await tx.academyMembership.update({
          where: { id: studentProfile.membershipId },
          data: {
            status:
              input.status === "active"
                ? MembershipStatus.ACTIVE
                : input.status === "inactive"
                  ? MembershipStatus.REVOKED
                  : MembershipStatus.SUSPENDED,
          },
        })
      }

      return studentProfile.id
    })
  }

}
