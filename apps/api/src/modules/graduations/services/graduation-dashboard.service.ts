import {
  AcademyRole,
  GraduationExamStatus,
  GraduationProgression,
  GraduationTrackBranch,
  StudentActivityStatus,
  StudentProfileStatus,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import {
  calculateAttendanceRate,
  resolveSessionAttendanceStatus,
} from "@/apps/api/src/modules/classes/domain/session-attendance"
import type {
  GraduationDashboardData,
  GraduationExamInput,
  GraduationTrackInput,
} from "@/apps/api/src/modules/graduations/domain/graduation-dashboard"
import type { RegisterStudentGraduationInput } from "@/apps/api/src/modules/graduations/contracts/register-student-graduation.input"
import {
  buildGraduationTrackBootstraps,
  inferTrackBeltColorHex,
} from "@/apps/api/src/modules/graduations/domain/graduation-presets"
import { formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"

function monthsBetween(startDate: Date, endDate = new Date()) {
  const years = endDate.getFullYear() - startDate.getFullYear()
  const months = endDate.getMonth() - startDate.getMonth()
  const value = years * 12 + months
  return value < 0 ? 0 : value
}

function toDateParts(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  const hours = String(value.getHours()).padStart(2, "0")
  const minutes = String(value.getMinutes()).padStart(2, "0")
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  }
}

function mapBranch(value: GraduationTrackBranch) {
  return value.toLowerCase() as "kids" | "adult" | "mixed"
}

function mapProgression(value: GraduationProgression) {
  return value.toLowerCase() as "belt" | "skill_level"
}

function mapExamStatus(value: GraduationExamStatus) {
  return value.toLowerCase() as "scheduled" | "in_progress" | "completed" | "cancelled"
}

function mapAcademyRole(value: AcademyRole) {
  return value.toLowerCase() as "academy_admin" | "teacher" | "student"
}

function formatEligibleOverrideActorDisplayName(input: {
  actorName: string | null
  actorRole: AcademyRole
}) {
  const trimmedName = input.actorName?.trim() ?? ""

  if (input.actorRole === AcademyRole.ACADEMY_ADMIN) {
    return trimmedName ? `${trimmedName} (Admin Academia)` : "Admin Academia"
  }

  if (input.actorRole === AcademyRole.TEACHER) {
    return trimmedName || "Professor"
  }

  return trimmedName || "Usuário"
}

function normalizeHexColor(value: string) {
  const hex = value.trim()
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.toUpperCase() : "#CBD5E1"
}

function normalizeOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toDateTime(value: string | null | undefined, fallback: Date) {
  if (!value) {
    return fallback
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function buildTrackDedupKey(input: {
  modalityId: string | null
  name: string
  branch: GraduationTrackBranch
  progression: GraduationProgression
}) {
  return [
    input.modalityId ?? "no-modality",
    input.name.trim().toLowerCase(),
    input.branch,
    input.progression,
  ].join("::")
}

async function syncStudentActivityCurrentState(
  tx: Pick<typeof prisma, "studentActivity" | "studentGraduation" | "studentModality">,
  studentActivityId: string
) {
  const latestGraduation = await tx.studentGraduation.findFirst({
    where: {
      studentActivityId,
    },
    orderBy: [{ graduatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      toBelt: true,
      toStripes: true,
    },
  })

  if (!latestGraduation) {
    return null
  }

  await tx.studentActivity.update({
    where: { id: studentActivityId },
    data: {
      belt: latestGraduation.toBelt,
      stripes: latestGraduation.toStripes,
    },
  })

  await tx.studentModality.updateMany({
    where: {
      studentActivityId,
    },
    data: {
      belt: latestGraduation.toBelt,
      stripes: latestGraduation.toStripes,
    },
  })

  return latestGraduation
}

export class GraduationDashboardService {
  async ensureDefaultsForTenant(tenantId: string) {
    await prisma.$transaction(async (tx) => {
      const existingTracks = await tx.graduationTrack.findMany({
        where: { tenantId },
        select: {
          modalityId: true,
          name: true,
          branch: true,
          progression: true,
        },
      })

      const existingKeys = new Set(
        existingTracks.map((track) =>
          buildTrackDedupKey({
            modalityId: track.modalityId,
            name: track.name,
            branch: track.branch,
            progression: track.progression,
          })
        )
      )

      const modalities = await tx.modality.findMany({
        where: { tenantId, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          ageGroups: true,
        },
      })

      const bootstraps = buildGraduationTrackBootstraps(modalities).filter(
        (track) =>
          !existingKeys.has(
            buildTrackDedupKey({
              modalityId: track.modalityId,
              name: track.name,
              branch: track.branch,
              progression: track.progression,
            })
          )
      )

      if (bootstraps.length === 0) {
        return
      }

      for (const track of bootstraps) {
        await tx.graduationTrack.create({
          data: {
            tenantId,
            modalityId: track.modalityId,
            name: track.name,
            branch: track.branch,
            progression: track.progression,
            sortOrder: track.sortOrder,
            isDefault: track.isDefault,
            levels: {
              create: track.levels.map((level, index) => ({
                name: level.name,
                colorHex: level.colorHex,
                stripes: level.stripes,
                minTimeMonths: level.minTimeMonths,
                sortOrder: index,
              })),
            },
          },
        })
      }
    })
  }

  async getDashboardData(tenantId: string): Promise<GraduationDashboardData> {
    await this.ensureDefaultsForTenant(tenantId)

    const [tracks, exams, students, sessions, teachers] = await Promise.all([
      prisma.graduationTrack.findMany({
        where: { tenantId, isActive: true },
        include: {
          modality: {
            select: { id: true, name: true },
          },
          levels: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.graduationExam.findMany({
        where: { tenantId },
        include: {
          track: {
            select: { id: true, name: true },
          },
          modality: {
            select: { id: true, name: true },
          },
          candidates: {
            include: {
              studentActivity: {
                include: {
                  studentProfile: {
                    include: {
                      user: {
                        select: {
                          name: true,
                          email: true,
                        },
                      },
                    },
                  },
                  modalities: {
                    where: {
                      status: "ACTIVE",
                    },
                    include: {
                      modality: {
                        select: {
                          id: true,
                          name: true,
                          activityCategory: true,
                        },
                      },
                    },
                    orderBy: [{ createdAt: "asc" }],
                  },
                },
              },
            },
            orderBy: [{ createdAt: "asc" }],
          },
        },
        orderBy: [{ examDate: "asc" }, { createdAt: "desc" }],
      }),
      prisma.studentProfile.findMany({
        where: {
          tenantId,
          status: {
            in: [StudentProfileStatus.ACTIVE, StudentProfileStatus.SUSPENDED],
          },
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          activities: {
            where: {
              status: StudentActivityStatus.ACTIVE,
            },
            include: {
              modalities: {
                where: {
                  status: "ACTIVE",
                },
                include: {
                  modality: {
                    select: {
                      id: true,
                      name: true,
                      activityCategory: true,
                    },
                  },
                },
                orderBy: [{ createdAt: "asc" }],
              },
              graduations: {
                orderBy: [{ graduatedAt: "desc" }],
              },
              eligibilityOverrideAudits: {
                where: {
                  eligibleOverrideValue: true,
                },
                orderBy: [{ createdAt: "asc" }],
              },
            },
            orderBy: [{ createdAt: "asc" }],
          },
        },
        orderBy: [{ createdAt: "asc" }],
      }),
      prisma.classSession.findMany({
        where: { tenantId },
        include: {
          classGroup: {
            select: {
              modalityId: true,
              modality: {
                select: {
                  activityCategory: true,
                },
              },
            },
          },
        },
        orderBy: [{ sessionDate: "desc" }],
      }),
      prisma.teacherProfile.findMany({
        where: { tenantId, status: "ACTIVE" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
        },
      }),
    ])

    const trackColorIndex = tracks.map((track) => ({
      modalityId: track.modalityId,
      levels: track.levels.map((level) => ({
        name: level.name,
        colorHex: level.colorHex,
      })),
    }))

    const eligibleStudents = students.flatMap((student) =>
      student.activities.map((studentActivity) => {
        const linkedModalities = studentActivity.modalities
        const preferredModalityIds = linkedModalities.map((item) => item.modalityId)
        const activitySessions = sessions.filter((session) => {
          if (resolveSessionAttendanceStatus(session, student.userId) === "unmarked") {
            return false
          }

          if (studentActivity.activityCategory != null) {
            return session.classGroup.modality?.activityCategory === studentActivity.activityCategory
          }

          return (
            session.classGroup.modalityId != null &&
            preferredModalityIds.includes(session.classGroup.modalityId)
          )
        })
        const presentCount = activitySessions.filter((session) =>
          session.presentStudentIds.includes(student.userId)
        ).length
        const absentCount = activitySessions.filter((session) =>
          session.absentStudentIds.includes(student.userId)
        ).length
        const attendanceRate = calculateAttendanceRate({
          presentCount,
          absentCount,
        })
        const attendanceEligible = attendanceRate >= 80
        const manualOverride = studentActivity.graduationEligibleOverride
        const eligible = manualOverride ?? attendanceEligible
        const track = tracks.find(
          (item) => item.modalityId != null && preferredModalityIds.includes(item.modalityId)
        ) ?? null
        const seenActors = new Set<string>()
        const manualEligibleOverrideActors = studentActivity.eligibilityOverrideAudits
          .map((audit) => {
            const dedupKey = [audit.actorUserId ?? "no-user", audit.actorRole, audit.actorName ?? ""].join("::")
            if (seenActors.has(dedupKey)) {
              return null
            }

            seenActors.add(dedupKey)

            return {
              actorUserId: audit.actorUserId,
              actorName: audit.actorName,
              actorRole: mapAcademyRole(audit.actorRole),
              displayName: formatEligibleOverrideActorDisplayName({
                actorName: audit.actorName,
                actorRole: audit.actorRole,
              }),
            }
          })
          .filter((actor): actor is NonNullable<typeof actor> => Boolean(actor))

        return {
          studentActivityId: studentActivity.id,
          studentId: student.id,
          studentName: student.user.name ?? student.user.email,
          activityCategory: studentActivity.activityCategory,
          activityLabel: studentActivity.activityCategory
            ? formatActivityCategory(studentActivity.activityCategory)
            : "Atividade principal",
          modalityId: track?.modalityId ?? linkedModalities[0]?.modalityId ?? null,
          modalityName: track?.modality?.name ?? linkedModalities[0]?.modality.name ?? null,
          trackId: track?.id ?? null,
          trackName: track?.name ?? null,
          currentBelt: studentActivity.belt,
          currentStripes: studentActivity.stripes,
          beltColorHex: inferTrackBeltColorHex({
            beltName: studentActivity.belt,
            tracks: trackColorIndex,
            preferredModalityIds,
          }),
          attendanceRate,
          attendanceEligible,
          manualEligibleOverride: manualOverride,
          manualEligibleOverrideActors,
          eligible,
          monthsAtCurrentBelt: monthsBetween(studentActivity.startDate),
        }
      })
    )

    const history = students
      .flatMap((student) =>
        student.activities.flatMap((studentActivity) =>
          studentActivity.graduations.map((graduation) => ({
            id: graduation.id,
            studentId: student.id,
            studentName: student.user.name ?? student.user.email,
            activityCategory: studentActivity.activityCategory,
            activityLabel: studentActivity.activityCategory
              ? formatActivityCategory(studentActivity.activityCategory)
              : "Atividade principal",
            modalityId: studentActivity.modalities[0]?.modalityId ?? null,
            modalityName: studentActivity.modalities[0]?.modality.name ?? null,
            fromBelt: graduation.fromBelt,
            toBelt: graduation.toBelt,
            toStripes: graduation.toStripes,
            beltColorHex: inferTrackBeltColorHex({
              beltName: graduation.toBelt,
              tracks: trackColorIndex,
              preferredModalityIds: studentActivity.modalities.map((item) => item.modalityId),
            }),
            date: toDateParts(graduation.graduatedAt).date,
            evaluatorName: graduation.evaluatorName,
          }))
        )
      )
      .sort((left, right) => right.date.localeCompare(left.date))

    const studentDirectory = students.flatMap((student) =>
      student.activities.map((studentActivity) => ({
        studentActivityId: studentActivity.id,
        studentId: student.id,
        studentName: student.user.name ?? student.user.email,
        activityCategory: studentActivity.activityCategory,
        activityLabel: studentActivity.activityCategory
          ? formatActivityCategory(studentActivity.activityCategory)
          : "Atividade principal",
        modalityId: studentActivity.modalities[0]?.modalityId ?? null,
        modalityName: studentActivity.modalities[0]?.modality.name ?? null,
        currentBelt: studentActivity.belt,
        currentStripes: studentActivity.stripes,
        beltColorHex: inferTrackBeltColorHex({
          beltName: studentActivity.belt,
          tracks: trackColorIndex,
          preferredModalityIds: studentActivity.modalities.map((item) => item.modalityId),
        }),
      }))
    )

    const currentYear = new Date().getFullYear()
    const yearGraduations = history.filter(
      (item) => new Date(item.date).getFullYear() === currentYear
    ).length
    const scheduledExams = exams.filter((exam) => exam.status === GraduationExamStatus.SCHEDULED).length
    const completedHistory = history.length

    return {
      metrics: {
        yearGraduations,
        scheduledExams,
        eligibleStudents: eligibleStudents.filter((student) => student.eligible).length,
        approvalRate:
          completedHistory === 0
            ? 0
            : Math.round((completedHistory / Math.max(completedHistory, completedHistory)) * 100),
      },
      exams: exams.map((exam) => {
        const dateParts = toDateParts(exam.examDate)
        return {
          id: exam.id,
          title: exam.title,
          date: dateParts.date,
          time: dateParts.time,
          trackId: exam.trackId,
          trackName: exam.track.name,
          modalityId: exam.modalityId,
          modalityName: exam.modality?.name ?? null,
          location: exam.location,
          evaluatorName: exam.evaluatorName,
          evaluatorNames: exam.evaluatorNames,
          allTracks: exam.allTracks,
          allEvaluators: exam.allEvaluators,
          trackIds: exam.trackIds,
          status: mapExamStatus(exam.status),
          candidateCount: exam.candidates.length,
          candidates: exam.candidates.map((candidate) => ({
            id: candidate.id,
            studentActivityId: candidate.studentActivityId,
            studentName:
              candidate.studentActivity.studentProfile.user.name ??
              candidate.studentActivity.studentProfile.user.email,
            activityCategory: candidate.studentActivity.activityCategory,
            activityLabel: candidate.studentActivity.activityCategory
              ? formatActivityCategory(candidate.studentActivity.activityCategory)
              : "Atividade principal",
            fromBelt: candidate.fromBelt,
            fromStripes: candidate.fromStripes ?? 0,
            toBelt: candidate.toBelt,
            toStripes: candidate.toStripes,
            attendanceRate: candidate.attendanceRate,
            techniquesScore: candidate.techniquesScore,
            behavior: candidate.behavior,
            fromBeltColorHex: inferTrackBeltColorHex({
              beltName: candidate.fromBelt,
              tracks: trackColorIndex,
              preferredModalityIds: candidate.studentActivity.modalities.map((item) => item.modalityId),
            }),
            toBeltColorHex: inferTrackBeltColorHex({
              beltName: candidate.toBelt,
              tracks: trackColorIndex,
              preferredModalityIds: candidate.studentActivity.modalities.map((item) => item.modalityId),
            }),
          })),
        }
      }),
      eligibleStudents,
      studentDirectory,
      history,
      tracks: tracks.map((track) => ({
        id: track.id,
        modalityId: track.modalityId,
        modalityName: track.modality?.name ?? null,
        name: track.name,
        branch: mapBranch(track.branch),
        progression: mapProgression(track.progression),
        isDefault: track.isDefault,
        order: track.sortOrder,
        levels: track.levels.map((level) => ({
          id: level.id,
          name: level.name,
          colorHex: level.colorHex,
          stripes: level.stripes,
          minTimeMonths: level.minTimeMonths,
          order: level.sortOrder,
        })),
      })),
      modalities: tracks
        .map((track) => track.modality)
        .filter((item): item is { id: string; name: string } => Boolean(item))
        .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index),
      teachers,
    }
  }

  async createExam(input: GraduationExamInput & { tenantId: string }) {
    const examDate = new Date(`${input.date}T${input.time || "00:00"}:00`)
    if (Number.isNaN(examDate.getTime())) {
      throw new Error("Data ou horário do exame inválido.")
    }

    await this.ensureDefaultsForTenant(input.tenantId)

    const normalizedTrackIds = [...new Set(input.trackIds.filter(Boolean))]
    if (!input.allTracks && normalizedTrackIds.length === 0) {
      throw new Error("Selecione ao menos uma trilha ou marque todos.")
    }

    const tracks = await prisma.graduationTrack.findMany({
      where: {
        tenantId: input.tenantId,
        isActive: true,
        ...(input.allTracks ? {} : { id: { in: normalizedTrackIds } }),
      },
      select: {
        id: true,
        modalityId: true,
        name: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })

    if (tracks.length === 0) {
      throw new Error("Nenhuma trilha válida foi encontrada para este exame.")
    }

    const primaryTrack = tracks[0]
    const evaluatorNames = [...new Set(input.evaluatorNames.filter((name) => name.trim().length > 0))]

    await prisma.graduationExam.create({
      data: {
        tenantId: input.tenantId,
        trackId: primaryTrack.id,
        modalityId: input.modalityId ?? primaryTrack.modalityId,
        title: input.title.trim(),
        examDate,
        location: input.location?.trim() || null,
        evaluatorName: evaluatorNames[0] ?? null,
        evaluatorNames,
        trackIds: tracks.map((track) => track.id),
        allTracks: input.allTracks,
        allEvaluators: input.allEvaluators,
        notes: input.notes?.trim() || null,
        status: GraduationExamStatus.SCHEDULED,
      },
    })

    return this.getDashboardData(input.tenantId)
  }

  async addCandidateToExam(input: {
    tenantId: string
    examId: string
    studentActivityId: string
  }) {
    const exam = await prisma.graduationExam.findFirst({
      where: {
        id: input.examId,
        tenantId: input.tenantId,
      },
      include: {
        track: {
          include: {
            levels: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            },
          },
        },
      },
    })

    if (!exam) {
      throw new Error("Exame não encontrado.")
    }

    const studentActivity = await prisma.studentActivity.findFirst({
      where: {
        id: input.studentActivityId,
        studentProfile: { tenantId: input.tenantId },
      },
      include: {
        studentProfile: {
          include: {
            user: true,
          },
        },
        modalities: {
          where: {
            status: "ACTIVE",
          },
          include: {
            modality: true,
          },
          orderBy: [{ createdAt: "asc" }],
        },
      },
    })

    if (!studentActivity) {
      throw new Error("Atividade do aluno não encontrada.")
    }

    const preferredModalityIds = studentActivity.modalities.map((item) => item.modalityId)
    const compatibleModalityIds = preferredModalityIds.length > 0
      ? preferredModalityIds
      : (
          await prisma.modality.findMany({
            where: {
              tenantId: input.tenantId,
              isActive: true,
              activityCategory: studentActivity.activityCategory,
            },
            select: {
              id: true,
            },
          })
        ).map((item) => item.id)

    const allowedTrackIds = exam.allTracks ? null : exam.trackIds
    if (allowedTrackIds && allowedTrackIds.length > 0) {
      const matchingTrack = await prisma.graduationTrack.findFirst({
        where: {
          id: { in: allowedTrackIds },
          modalityId: compatibleModalityIds.length > 0 ? { in: compatibleModalityIds } : undefined,
          tenantId: input.tenantId,
        },
        include: {
          levels: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      })

      if (!matchingTrack) {
        throw new Error("Este aluno não é compatível com as trilhas desse exame.")
      }

      const currentIndex = matchingTrack.levels.findIndex(
        (level) => level.name.trim().toLowerCase() === studentActivity.belt.trim().toLowerCase()
      )
      const nextLevel = currentIndex >= 0 ? matchingTrack.levels[currentIndex + 1] ?? null : null
      await this.upsertExamCandidate({
        examId: exam.id,
        studentActivityId: studentActivity.id,
        fromBelt: studentActivity.belt,
        fromStripes: studentActivity.stripes,
        toBelt: nextLevel?.name ?? null,
        toStripes: 0,
        attendanceRate: this.computeAttendanceRateForStudentActivity(input.tenantId, studentActivity.id),
      })
      return this.getDashboardData(input.tenantId)
    }

    const allTracks = await prisma.graduationTrack.findMany({
      where: {
        tenantId: input.tenantId,
        modalityId: compatibleModalityIds.length > 0 ? { in: compatibleModalityIds } : undefined,
        isActive: true,
      },
      include: {
        levels: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })

    const matchingTrack = allTracks[0] ?? null
    const currentIndex = matchingTrack
      ? matchingTrack.levels.findIndex(
          (level) => level.name.trim().toLowerCase() === studentActivity.belt.trim().toLowerCase()
        )
      : -1
    const nextLevel = matchingTrack && currentIndex >= 0 ? matchingTrack.levels[currentIndex + 1] ?? null : null

    await this.upsertExamCandidate({
      examId: exam.id,
      studentActivityId: studentActivity.id,
      fromBelt: studentActivity.belt,
      fromStripes: studentActivity.stripes,
      toBelt: nextLevel?.name ?? null,
      toStripes: 0,
      attendanceRate: this.computeAttendanceRateForStudentActivity(input.tenantId, studentActivity.id),
    })

    return this.getDashboardData(input.tenantId)
  }

  async removeCandidateFromExam(input: {
    tenantId: string
    examId: string
    studentActivityId: string
  }) {
    const exam = await prisma.graduationExam.findFirst({
      where: {
        id: input.examId,
        tenantId: input.tenantId,
      },
      select: { id: true },
    })

    if (!exam) {
      throw new Error("Exame não encontrado.")
    }

    await prisma.graduationExamCandidate.deleteMany({
      where: {
        examId: input.examId,
        studentActivityId: input.studentActivityId,
      },
    })

    return this.getDashboardData(input.tenantId)
  }

  async updateExamStatus(input: {
    tenantId: string
    examId: string
    status: "in_progress" | "completed" | "cancelled"
  }) {
    const exam = await prisma.graduationExam.findFirst({
      where: {
        id: input.examId,
        tenantId: input.tenantId,
      },
      include: {
        candidates: true,
      },
    })

    if (!exam) {
      throw new Error("Exame não encontrado.")
    }

    const nextStatus =
      input.status === "in_progress"
        ? GraduationExamStatus.IN_PROGRESS
        : input.status === "cancelled"
          ? GraduationExamStatus.CANCELLED
          : GraduationExamStatus.COMPLETED

    if (nextStatus === GraduationExamStatus.COMPLETED) {
      await prisma.$transaction(async (tx) => {
        for (const candidate of exam.candidates) {
          if (!candidate.toBelt) {
            continue
          }

          const studentActivity = await tx.studentActivity.findUnique({
            where: { id: candidate.studentActivityId },
            select: {
              id: true,
              belt: true,
              stripes: true,
            },
          })

          if (!studentActivity) {
            continue
          }

          await tx.studentGraduation.create({
            data: {
              studentActivityId: candidate.studentActivityId,
              fromBelt: candidate.fromBelt ?? studentActivity.belt,
              fromStripes: candidate.fromStripes ?? studentActivity.stripes,
              toBelt: candidate.toBelt,
              toStripes: candidate.toStripes,
              evaluatorName: exam.evaluatorName ?? "Exame de graduação",
              graduatedAt: exam.examDate,
              notes: exam.title,
            },
          })

          await tx.studentActivity.update({
            where: { id: candidate.studentActivityId },
            data: {
              belt: candidate.toBelt,
              stripes: candidate.toStripes,
              graduationEligibleOverride: false,
            },
          })

          await tx.studentModality.updateMany({
            where: {
              studentActivityId: candidate.studentActivityId,
            },
            data: {
              belt: candidate.toBelt,
              stripes: candidate.toStripes,
              graduationEligibleOverride: false,
            },
          })
        }

        await tx.graduationExam.update({
          where: { id: exam.id },
          data: {
            status: nextStatus,
          },
        })
      })
    } else {
      await prisma.graduationExam.update({
        where: { id: exam.id },
        data: {
          status: nextStatus,
        },
      })
    }

    return this.getDashboardData(input.tenantId)
  }

  private async upsertExamCandidate(input: {
    examId: string
    studentActivityId: string
    fromBelt: string | null
    fromStripes: number
    toBelt: string | null
    toStripes: number
    attendanceRate: Promise<number>
  }) {
    await prisma.graduationExamCandidate.upsert({
      where: {
        examId_studentActivityId: {
          examId: input.examId,
          studentActivityId: input.studentActivityId,
        },
      },
      update: {
        fromBelt: input.fromBelt,
        fromStripes: input.fromStripes,
        toBelt: input.toBelt,
        toStripes: input.toStripes,
        attendanceRate: await input.attendanceRate,
      },
      create: {
        examId: input.examId,
        studentActivityId: input.studentActivityId,
        fromBelt: input.fromBelt,
        fromStripes: input.fromStripes,
        toBelt: input.toBelt,
        toStripes: input.toStripes,
        attendanceRate: await input.attendanceRate,
        behavior: "Pendente",
      },
    })
  }

  private async computeAttendanceRateForStudentActivity(tenantId: string, studentActivityId: string) {
    const studentActivity = await prisma.studentActivity.findUnique({
      where: { id: studentActivityId },
      include: {
        studentProfile: {
          include: {
            user: true,
          },
        },
        modalities: {
          where: {
            status: "ACTIVE",
          },
          include: {
            modality: {
              select: {
                activityCategory: true,
              },
            },
          },
        },
      },
    })

    if (!studentActivity) {
      return 0
    }

    const sessions = await prisma.classSession.findMany({
      where: {
        tenantId,
        classGroup: {
          modality: studentActivity.activityCategory
            ? {
                activityCategory: studentActivity.activityCategory,
              }
            : undefined,
          modalityId:
            studentActivity.activityCategory == null && studentActivity.modalities.length > 0
              ? {
                  in: studentActivity.modalities.map((item) => item.modalityId),
                }
              : undefined,
        },
      },
      include: {
        classGroup: {
          select: {
            modalityId: true,
            modality: {
              select: {
                activityCategory: true,
              },
            },
          },
        },
      },
    })

    const relevant = sessions.filter(
      (session) => resolveSessionAttendanceStatus(session, studentActivity.studentProfile.userId) !== "unmarked"
    )

    const present = relevant.filter((session) =>
      session.presentStudentIds.includes(studentActivity.studentProfile.userId)
    ).length
    const absent = relevant.filter((session) =>
      session.absentStudentIds.includes(studentActivity.studentProfile.userId)
    ).length

    if (present + absent === 0) {
      return 0
    }

    return calculateAttendanceRate({
      presentCount: present,
      absentCount: absent,
    })
  }

  async updateEligibilityOverride(input: {
    tenantId: string
    studentActivityId: string
    eligibleOverride: boolean | null
    actor?: {
      userId: string
      name: string | null
      role: "academy_admin" | "teacher" | "student"
    }
  }) {
    const studentActivity = await prisma.studentActivity.findFirst({
      where: {
        id: input.studentActivityId,
        studentProfile: {
          tenantId: input.tenantId,
        },
      },
      select: { id: true },
    })

    if (!studentActivity) {
      throw new Error("Atividade do aluno não encontrada para este tenant.")
    }

    await prisma.$transaction(async (tx) => {
      await tx.studentActivity.update({
        where: { id: input.studentActivityId },
        data: {
          graduationEligibleOverride: input.eligibleOverride,
        },
      })

      await tx.studentModality.updateMany({
        where: {
          studentActivityId: input.studentActivityId,
        },
        data: {
          graduationEligibleOverride: input.eligibleOverride,
        },
      })

      if (input.eligibleOverride === true && input.actor) {
        await tx.graduationEligibilityOverrideAudit.create({
          data: {
            tenantId: input.tenantId,
            studentActivityId: input.studentActivityId,
            actorUserId: input.actor.userId,
            actorName: input.actor.name?.trim() || null,
            actorRole: input.actor.role.toUpperCase() as AcademyRole,
            eligibleOverrideValue: true,
          },
        })
      }
    })

    return this.getDashboardData(input.tenantId)
  }

  async replaceTracks(input: { tenantId: string; tracks: GraduationTrackInput[] }) {
    await this.ensureDefaultsForTenant(input.tenantId)

    const existingTracks = await prisma.graduationTrack.findMany({
      where: { tenantId: input.tenantId },
      select: { id: true },
    })

    const keepTrackIds = new Set(
      input.tracks
        .map((track) => track.id)
        .filter((trackId): trackId is string => typeof trackId === "string" && trackId.length > 0)
    )

    await prisma.$transaction(async (tx) => {
      for (const [trackIndex, track] of input.tracks.entries()) {
        const trackData = {
          tenantId: input.tenantId,
          modalityId: track.modalityId ?? null,
          name: track.name.trim(),
          branch: track.branch.toUpperCase() as GraduationTrackBranch,
          progression: track.progression.toUpperCase() as GraduationProgression,
          sortOrder: trackIndex,
          isDefault: false,
          isActive: true,
        }

        if (track.id) {
          await tx.graduationTrack.updateMany({
            where: { id: track.id, tenantId: input.tenantId },
            data: trackData,
          })
          await tx.graduationLevel.deleteMany({
            where: { trackId: track.id },
          })
          await tx.graduationLevel.createMany({
            data: track.levels.map((level, levelIndex) => ({
              trackId: track.id as string,
              name: level.name.trim(),
              colorHex: normalizeHexColor(level.colorHex),
              stripes: Math.max(0, Number(level.stripes) || 0),
              minTimeMonths:
                typeof level.minTimeMonths === "number" && Number.isFinite(level.minTimeMonths)
                  ? Math.max(0, level.minTimeMonths)
                  : null,
              sortOrder: levelIndex,
            })),
          })
          continue
        }

        await tx.graduationTrack.create({
          data: {
            ...trackData,
            levels: {
              create: track.levels.map((level, levelIndex) => ({
                name: level.name.trim(),
                colorHex: normalizeHexColor(level.colorHex),
                stripes: Math.max(0, Number(level.stripes) || 0),
                minTimeMonths:
                  typeof level.minTimeMonths === "number" && Number.isFinite(level.minTimeMonths)
                    ? Math.max(0, level.minTimeMonths)
                    : null,
                sortOrder: levelIndex,
              })),
            },
          },
        })
      }

      const removeTrackIds = existingTracks
        .map((track) => track.id)
        .filter((trackId) => !keepTrackIds.has(trackId))

      if (removeTrackIds.length > 0) {
        await tx.graduationTrack.deleteMany({
          where: {
            tenantId: input.tenantId,
            id: { in: removeTrackIds },
          },
        })
      }
    })

    return this.getDashboardData(input.tenantId)
  }

  async registerStudentGraduation(input: {
    tenantId: string
    studentId: string
    payload: RegisterStudentGraduationInput
  }) {
    const graduatedAt = toDateTime(input.payload.graduatedAt, new Date())

    return prisma.$transaction(async (tx) => {
      const studentProfile = await tx.studentProfile.findUnique({
        where: { id: input.studentId },
      })

      if (!studentProfile || studentProfile.tenantId !== input.tenantId) {
        throw new Error("Aluno não encontrado para este tenant.")
      }

      const studentActivity = await tx.studentActivity.findUnique({
        where: { id: input.payload.studentActivityId },
        include: {
          graduations: {
            orderBy: [{ graduatedAt: "desc" }, { createdAt: "desc" }],
            take: 1,
          },
        },
      })

      if (!studentActivity || studentActivity.studentProfileId !== input.studentId) {
        throw new Error("Atividade do aluno não encontrada.")
      }

      const latestExistingGraduation = studentActivity.graduations[0] ?? null
      const shouldUpdateCurrentBelt =
        latestExistingGraduation == null || graduatedAt.getTime() >= latestExistingGraduation.graduatedAt.getTime()

      await tx.studentGraduation.create({
        data: {
          studentActivityId: studentActivity.id,
          fromBelt: studentActivity.belt,
          fromStripes: studentActivity.stripes,
          toBelt: input.payload.toBelt,
          toStripes: input.payload.toStripes,
          evaluatorName: input.payload.evaluatorName,
          graduatedAt,
          notes: normalizeOptionalString(input.payload.notes),
        },
      })

      if (shouldUpdateCurrentBelt) {
        await tx.studentActivity.update({
          where: { id: studentActivity.id },
          data: {
            belt: input.payload.toBelt,
            stripes: input.payload.toStripes,
          },
        })

        await tx.studentModality.updateMany({
          where: {
            studentActivityId: studentActivity.id,
          },
          data: {
            belt: input.payload.toBelt,
            stripes: input.payload.toStripes,
          },
        })
      }

      return studentProfile.id
    })
  }

  async updateStudentGraduation(input: {
    tenantId: string
    studentId: string
    graduationId: string
    payload: RegisterStudentGraduationInput
  }) {
    const graduatedAt = toDateTime(input.payload.graduatedAt, new Date())

    return prisma.$transaction(async (tx) => {
      const studentProfile = await tx.studentProfile.findUnique({
        where: { id: input.studentId },
      })

      if (!studentProfile || studentProfile.tenantId !== input.tenantId) {
        throw new Error("Aluno não encontrado para este tenant.")
      }

      const existingGraduation = await tx.studentGraduation.findUnique({
        where: { id: input.graduationId },
        include: {
          studentActivity: {
            select: {
              id: true,
              studentProfileId: true,
            },
          },
        },
      })

      if (
        !existingGraduation ||
        existingGraduation.studentActivity.studentProfileId !== input.studentId
      ) {
        throw new Error("Graduação não encontrada para este aluno.")
      }

      const nextStudentActivity = await tx.studentActivity.findUnique({
        where: { id: input.payload.studentActivityId },
        select: {
          id: true,
          studentProfileId: true,
        },
      })

      if (!nextStudentActivity || nextStudentActivity.studentProfileId !== input.studentId) {
        throw new Error("Atividade do aluno não encontrada.")
      }

      await tx.studentGraduation.update({
        where: { id: input.graduationId },
        data: {
          studentActivityId: nextStudentActivity.id,
          toBelt: input.payload.toBelt,
          toStripes: input.payload.toStripes,
          evaluatorName: input.payload.evaluatorName,
          graduatedAt,
          notes: normalizeOptionalString(input.payload.notes),
        },
      })

      const affectedActivityIds = new Set([
        existingGraduation.studentActivity.id,
        nextStudentActivity.id,
      ])

      for (const studentActivityId of affectedActivityIds) {
        const latestGraduation = await syncStudentActivityCurrentState(tx, studentActivityId)

        if (
          !latestGraduation &&
          studentActivityId === existingGraduation.studentActivity.id &&
          existingGraduation.studentActivity.id !== nextStudentActivity.id
        ) {
          const fallbackBelt = existingGraduation.fromBelt ?? "Branca"
          const fallbackStripes = existingGraduation.fromStripes ?? 0

          await tx.studentActivity.update({
            where: { id: studentActivityId },
            data: {
              belt: fallbackBelt,
              stripes: fallbackStripes,
            },
          })

          await tx.studentModality.updateMany({
            where: {
              studentActivityId,
            },
            data: {
              belt: fallbackBelt,
              stripes: fallbackStripes,
            },
          })
        }
      }

      return studentProfile.id
    })
  }
}
