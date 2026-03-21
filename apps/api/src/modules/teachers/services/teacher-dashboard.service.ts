import {
  AcademyRole,
  EnrollmentRequestStatus,
  InvitationStatus,
  MembershipStatus,
  TeacherCompensationType,
  TeacherProfileCompleteness,
  TeacherProfileStatus,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { buildGraduationActivityCatalog } from "@/apps/api/src/modules/graduations/domain/graduation-level-catalog"
import { inferTrackBeltColorHex } from "@/apps/api/src/modules/graduations/domain/graduation-presets"
import { buildTeacherPermissions } from "@/apps/api/src/modules/teachers/domain/teacher-permissions"
import type {
  TeacherAvailableAction,
  TeacherCompensation,
  TeacherDashboardRecord,
  TeacherGraduationCatalogItem,
  TeacherProfileCompletenessValue,
  TeacherRoleValue,
  TeacherScheduleEntry,
  TeacherStatusValue,
  TeacherAccessStatusValue,
} from "@/apps/api/src/modules/teachers/domain/teacher-dashboard"
import type {
  AcademyMembership,
  ClassGroup,
  ClassSchedule,
  ClassSession,
  EnrollmentRequest,
  Invitation,
  TeacherProfile,
  TeacherModality,
  Modality,
  TeacherCompensation as PrismaTeacherCompensation,
  User,
} from "@prisma/client"

const weekDaysFull: string[] = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

function toDateKey(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? null
}

function normalizeRole(roleTitle: string | null | undefined, sortOrder: number): TeacherRoleValue {
  const normalized = roleTitle?.trim().toLowerCase()

  if (normalized?.includes("chefe")) {
    return "head_instructor"
  }

  if (normalized?.includes("assist")) {
    return "assistant"
  }

  if (normalized?.includes("instrutor") || normalized?.includes("professor")) {
    return "instructor"
  }

  if (sortOrder === 0) {
    return "head_instructor"
  }
  if (sortOrder <= 2) {
    return "instructor"
  }
  return "assistant"
}

function normalizeOperationalStatus(status: TeacherProfileStatus): TeacherStatusValue {
  if (status === TeacherProfileStatus.ACTIVE) {
    return "active"
  }

  if (status === TeacherProfileStatus.INVITED) {
    return "pending"
  }

  return "inactive"
}

function normalizeCompleteness(
  value: TeacherProfileCompleteness
): TeacherProfileCompletenessValue {
  return value === TeacherProfileCompleteness.COMPLETE
    ? "complete"
    : "pending_payment_details"
}

function fallbackCompensation(role: TeacherRoleValue): TeacherCompensation {
  if (role === "head_instructor") {
    return { type: "fixed", value: 5200, bonus: "R$ 100 por graduação" }
  }
  if (role === "assistant") {
    return { type: "per_class", value: 120, bonus: "Nenhum" }
  }
  return { type: "percentage", value: 12, bonus: "Bônus por metas" }
}

function mapCompensation(
  role: TeacherRoleValue,
  compensation: PrismaTeacherCompensation | null
): TeacherCompensation {
  if (!compensation) {
    return fallbackCompensation(role)
  }

  const type =
    compensation.type === TeacherCompensationType.FIXED
      ? "fixed"
      : compensation.type === TeacherCompensationType.PER_CLASS
        ? "per_class"
        : "percentage"

  const value =
    type === "fixed"
      ? Number((compensation.amountCents / 100).toFixed(2))
      : compensation.amountCents / 100

  return {
    type,
    value,
    bonus: compensation.bonusDescription ?? "Nenhum",
  }
}

function resolveAccessStatus(input: {
  membership: AcademyMembership | null
  enrollmentRequest: EnrollmentRequest | null
  invitation: Invitation | null
}): TeacherAccessStatusValue {
  if (input.membership?.status === MembershipStatus.ACTIVE) {
    return "active"
  }

  if (input.membership?.status === MembershipStatus.INVITED || input.invitation) {
    return "invited"
  }

  if (
    input.membership?.status === MembershipStatus.PENDING ||
    input.enrollmentRequest?.status === EnrollmentRequestStatus.PENDING
  ) {
    return "pending_approval"
  }

  if (input.membership?.status === MembershipStatus.REVOKED) {
    return "revoked"
  }

  if (input.membership?.status === MembershipStatus.SUSPENDED) {
    return "suspended"
  }

  if (input.enrollmentRequest?.status === EnrollmentRequestStatus.REJECTED) {
    return "rejected"
  }

  return "no_access"
}

function buildAvailableActions(input: {
  accessStatus: TeacherAccessStatusValue
  completeness: TeacherProfileCompletenessValue
}): TeacherAvailableAction[] {
  const actions: TeacherAvailableAction[] = ["edit"]

  if (input.accessStatus === "pending_approval") {
    actions.push("approve", "reject")
  }

  if (input.accessStatus === "invited") {
    actions.push("copy_invite")
  }

  if (input.accessStatus === "active") {
    actions.push("deactivate")
  }

  if (input.completeness === "pending_payment_details") {
    actions.push("complete_profile")
  }

  return actions
}

type TeacherListItem = TeacherProfile & {
  user: User | null
  membership: AcademyMembership | null
  classGroups: (ClassGroup & { schedules: ClassSchedule[]; sessions: ClassSession[] })[]
  modalities: (TeacherModality & { modality: Modality })[]
  compensation: PrismaTeacherCompensation | null
}

export class TeacherDashboardService {
  async countPendingApprovals(tenantId: string) {
    return prisma.enrollmentRequest.count({
      where: {
        tenantId,
        status: EnrollmentRequestStatus.PENDING,
        requestedRole: AcademyRole.TEACHER,
      },
    })
  }

  async listForTenant(tenantId: string) {
    const [teachers, graduationTracks] = await Promise.all([
      prisma.teacherProfile.findMany({
        where: { tenantId },
        include: {
          user: true,
          membership: true,
          compensation: true,
          modalities: {
            include: {
              modality: true,
            },
            orderBy: [{ createdAt: "asc" }],
          },
          classGroups: {
            include: {
              schedules: true,
              sessions: true,
            },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.graduationTrack.findMany({
        where: { tenantId, isActive: true },
        include: {
          levels: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
    ])

    const teacherUserIds = teachers
      .map((teacher) => teacher.userId)
      .filter((value): value is string => Boolean(value))
    const teacherEmails = teachers
      .map((teacher) => normalizeEmail(teacher.email))
      .filter((value): value is string => Boolean(value))

    const [memberships, enrollmentRequests, invitations] = await Promise.all([
      teacherUserIds.length > 0
        ? prisma.academyMembership.findMany({
            where: {
              tenantId,
              userId: {
                in: teacherUserIds,
              },
              role: AcademyRole.TEACHER,
            },
          })
        : Promise.resolve([]),
      teacherUserIds.length > 0
        ? prisma.enrollmentRequest.findMany({
            where: {
              tenantId,
              userId: {
                in: teacherUserIds,
              },
              requestedRole: AcademyRole.TEACHER,
            },
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          })
        : Promise.resolve([]),
      teacherEmails.length > 0
        ? prisma.invitation.findMany({
            where: {
              tenantId,
              role: AcademyRole.TEACHER,
              status: InvitationStatus.PENDING,
              email: {
                in: teacherEmails,
              },
            },
            orderBy: [{ createdAt: "desc" }],
          })
        : Promise.resolve([]),
    ])

    const membershipsByUserId = new Map<string, AcademyMembership>()
    for (const membership of memberships) {
      if (!membershipsByUserId.has(membership.userId)) {
        membershipsByUserId.set(membership.userId, membership)
      }
    }

    const latestRequestsByUserId = new Map<string, EnrollmentRequest>()
    for (const request of enrollmentRequests) {
      if (!latestRequestsByUserId.has(request.userId)) {
        latestRequestsByUserId.set(request.userId, request)
      }
    }

    const pendingInvitationsByEmail = new Map<string, Invitation>()
    for (const invitation of invitations) {
      const email = normalizeEmail(invitation.email)
      if (email && !pendingInvitationsByEmail.has(email)) {
        pendingInvitationsByEmail.set(email, invitation)
      }
    }

    return teachers.map((teacher) =>
      this.mapTeacher(
        teacher,
        teacher.userId ? membershipsByUserId.get(teacher.userId) ?? teacher.membership ?? null : null,
        teacher.userId ? latestRequestsByUserId.get(teacher.userId) ?? null : null,
        pendingInvitationsByEmail.get(normalizeEmail(teacher.email) ?? "") ?? null,
        graduationTracks.map((track) => ({
          modalityId: track.modalityId,
          levels: track.levels.map((level) => ({
            name: level.name,
            colorHex: level.colorHex,
          })),
        }))
      )
    )
  }

  async listGraduationCatalog(tenantId: string): Promise<TeacherGraduationCatalogItem[]> {
    const tracks = await prisma.graduationTrack.findMany({
      where: { tenantId, isActive: true },
      include: {
        modality: {
          select: {
            id: true,
            name: true,
            activityCategory: true,
          },
        },
        levels: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })

    return buildGraduationActivityCatalog(
      tracks.map((track) => ({
        modalityId: track.modalityId,
        modalityName: track.modality?.name ?? null,
        activityCategory: track.modality?.activityCategory ?? null,
        order: track.sortOrder,
        levels: track.levels.map((level) => ({
          name: level.name,
          colorHex: level.colorHex,
          stripes: level.stripes,
          order: level.sortOrder,
        })),
      }))
    )
  }

  private mapTeacher(
    teacher: TeacherListItem,
    membership: AcademyMembership | null,
    enrollmentRequest: EnrollmentRequest | null,
    pendingInvitation: Invitation | null,
    graduationTracks: Array<{
      modalityId: string | null
      levels: Array<{ name: string; colorHex: string }>
    }>
  ): TeacherDashboardRecord {
    const today = new Date()
    const last30Days = new Date(today)
    last30Days.setDate(today.getDate() - 30)

    const scheduleMap = new Map<string, string[]>()
    let totalStudents = 0
    let totalClasses = 0
    let monthlyClasses = 0
    const modalities = new Set<string>()

    for (const group of teacher.classGroups) {
      if (group.status !== "ACTIVE") {
        continue
      }

      totalStudents += group.currentStudents
      totalClasses += group.sessions.length
      monthlyClasses += group.sessions.filter((session) => session.sessionDate >= last30Days).length
      if (group.modalityName) {
        modalities.add(group.modalityName)
      }
      for (const schedule of group.schedules) {
        const dayLabel = weekDaysFull[schedule.weekday] ?? "Outro"
        const entry = `${schedule.startTime} - ${group.name}`
        if (!scheduleMap.has(dayLabel)) {
          scheduleMap.set(dayLabel, [])
        }
        scheduleMap.get(dayLabel)?.push(entry)
      }
    }

    for (const modalityLink of teacher.modalities) {
      if (modalityLink.modality.isActive) {
        modalities.add(modalityLink.modality.name)
      }
    }

    const todaySessions = teacher.classGroups.flatMap((group) =>
      group.sessions.filter((session) => toDateKey(session.sessionDate) === toDateKey(today))
    )

    if (modalities.size === 0 && teacher.specialty) {
      modalities.add(teacher.specialty)
    }

    const accessStatus = resolveAccessStatus({
      membership,
      enrollmentRequest,
      invitation: pendingInvitation,
    })
    const profileCompleteness = normalizeCompleteness(teacher.profileCompleteness)
    const role = normalizeRole(teacher.roleTitle, teacher.sortOrder)
    const reviewRequestId =
      accessStatus === "pending_approval" && enrollmentRequest?.status === EnrollmentRequestStatus.PENDING
        ? enrollmentRequest.id
        : null
    const reviewRequestedAt = reviewRequestId ? enrollmentRequest?.createdAt.toISOString() ?? null : null
    const invitationCreatedAt =
      accessStatus === "invited" ? pendingInvitation?.createdAt.toISOString() ?? null : null

    return {
      id: teacher.id,
      linkedUserId: teacher.userId ?? null,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      belt: teacher.rank ?? "Branca",
      beltColorHex: inferTrackBeltColorHex({
        beltName: teacher.rank,
        preferredModalityIds: teacher.modalities
          .filter((item) => item.modality.isActive)
          .map((item) => item.modalityId),
        tracks: graduationTracks,
      }),
      degree: teacher.rank ?? "Instrutor",
      modalities: Array.from(modalities),
      status: normalizeOperationalStatus(teacher.status),
      accessStatus,
      profileCompleteness,
      availableActions: buildAvailableActions({
        accessStatus,
        completeness: profileCompleteness,
      }),
      role,
      roleTitle: teacher.roleTitle ?? null,
      avatar: null,
      startDate: membership?.acceptedAt?.toISOString().slice(0, 10) ?? teacher.createdAt.toISOString().slice(0, 10),
      birthDate: teacher.user?.birthDate?.toISOString().slice(0, 10) ?? "",
      address:
        teacher.user?.city && teacher.user?.state
          ? `${teacher.user.city}, ${teacher.user.state}`
          : teacher.user?.street ?? "",
      students: totalStudents,
      totalClasses,
      monthlyClasses,
      specializations: teacher.specialty ? [teacher.specialty] : [],
      schedule: Array.from(scheduleMap.entries()).map<TeacherScheduleEntry>(
        ([day, classes]) => ({ day, classes })
      ),
      permissions: buildTeacherPermissions(role),
      compensation: mapCompensation(role, teacher.compensation),
      attendanceSnapshot: {
        present: todaySessions.reduce((acc, session) => acc + session.presentStudentIds.length, 0),
        absent: todaySessions.reduce((acc, session) => acc + session.absentStudentIds.length, 0),
        confirmed: todaySessions.reduce((acc, session) => acc + session.confirmedStudentIds.length, 0),
      },
      reviewRequestId,
      reviewRequestedAt: reviewRequestedAt ?? invitationCreatedAt,
    }
  }
}
