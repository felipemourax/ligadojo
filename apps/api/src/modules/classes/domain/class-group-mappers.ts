import {
  ClassGroupStatus,
  ClassSessionStatus,
  ClassGroupEnrollmentStatus,
  StudentProfileStatus,
  type Modality,
  type ClassGroup,
  type ClassGroupEnrollment,
  type ClassSchedule,
  type ClassSession,
} from "@prisma/client"
import { toAgeGroupValue, toPrismaAgeGroup } from "@/apps/api/src/modules/modalities/domain/modality-mappers"
import type {
  ClassGroupEntity,
  ClassGroupStatusValue,
  ClassScheduleEntity,
  ClassSessionEntity,
  ClassSessionStatusValue,
} from "@/apps/api/src/modules/classes/domain/class-group"

export function toClassGroupStatusValue(value: ClassGroupStatus): ClassGroupStatusValue {
  switch (value) {
    case ClassGroupStatus.ACTIVE:
      return "active"
    case ClassGroupStatus.ARCHIVED:
      return "archived"
  }
}

export function toPrismaClassGroupStatus(value: ClassGroupStatusValue) {
  switch (value) {
    case "active":
      return ClassGroupStatus.ACTIVE
    case "archived":
      return ClassGroupStatus.ARCHIVED
  }
}

export function toClassSessionStatusValue(value: ClassSessionStatus): ClassSessionStatusValue {
  switch (value) {
    case ClassSessionStatus.SCHEDULED:
      return "scheduled"
    case ClassSessionStatus.CANCELLED:
      return "cancelled"
  }
}

export function toPrismaClassSessionStatus(value: ClassSessionStatusValue) {
  switch (value) {
    case "scheduled":
      return ClassSessionStatus.SCHEDULED
    case "cancelled":
      return ClassSessionStatus.CANCELLED
  }
}

export function toClassScheduleEntity(item: ClassSchedule): ClassScheduleEntity {
  return {
    id: item.id,
    weekday: item.weekday,
    startTime: item.startTime,
    endTime: item.endTime,
  }
}

export function toClassGroupEntity(
  item: ClassGroup & {
    schedules: ClassSchedule[]
    modality?: Modality | null
    enrollments?: Array<
      ClassGroupEnrollment & {
        studentProfile: {
          userId: string
          status: StudentProfileStatus
        }
      }
    >
  }
): ClassGroupEntity {
  const activeEnrollments =
    item.enrollments?.filter(
      (enrollment) =>
        enrollment.status === ClassGroupEnrollmentStatus.ACTIVE &&
        enrollment.studentProfile.status === StudentProfileStatus.ACTIVE
    ) ?? []

  return {
    id: item.id,
    tenantId: item.tenantId,
    modalityId: item.modalityId,
    activityCategory: item.modality?.activityCategory ?? null,
    teacherProfileId: item.teacherProfileId,
    enrolledStudentIds: activeEnrollments.map((enrollment) => enrollment.studentProfile.userId),
    name: item.name,
    modalityName: item.modalityName,
    teacherName: item.teacherName,
    ageGroups: item.ageGroups.map((value) => toAgeGroupValue(value)),
    beltRange: item.beltRange,
    maxStudents: item.maxStudents,
    currentStudents: activeEnrollments.length > 0 ? activeEnrollments.length : item.currentStudents,
    status: toClassGroupStatusValue(item.status),
    schedules: item.schedules
      .slice()
      .sort((left, right) => left.weekday - right.weekday || left.startTime.localeCompare(right.startTime))
      .map(toClassScheduleEntity),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

export function toClassSessionEntity(item: ClassSession): ClassSessionEntity {
  return {
    id: item.id,
    tenantId: item.tenantId,
    classGroupId: item.classGroupId,
    sessionDate: item.sessionDate.toISOString(),
    weekday: item.weekday,
    startTime: item.startTime,
    endTime: item.endTime,
    status: toClassSessionStatusValue(item.status),
    confirmedStudentIds: item.confirmedStudentIds,
    confirmedStudentNames: item.confirmedStudentNames,
    presentStudentIds: item.presentStudentIds,
    absentStudentIds: item.absentStudentIds,
    justifiedStudentIds: item.justifiedStudentIds,
    finalizedAt: item.finalizedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

export { toPrismaAgeGroup }
