import type { AgeGroupValue } from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding"

export type ClassGroupStatusValue = "active" | "archived"
export type ClassSessionStatusValue = "scheduled" | "cancelled"

export interface ClassScheduleEntity {
  id: string
  weekday: number
  startTime: string
  endTime: string
}

export interface ClassGroupEntity {
  id: string
  tenantId: string
  modalityId: string | null
  activityCategory: string | null
  teacherProfileId: string | null
  enrolledStudentIds: string[]
  name: string
  modalityName: string
  teacherName: string
  ageGroups: AgeGroupValue[]
  beltRange: string
  maxStudents: number
  currentStudents: number
  status: ClassGroupStatusValue
  schedules: ClassScheduleEntity[]
  createdAt: string
  updatedAt: string
}

export interface ClassSessionEntity {
  id: string
  tenantId: string
  classGroupId: string
  sessionDate: string
  weekday: number
  startTime: string
  endTime: string
  status: ClassSessionStatusValue
  confirmedStudentIds: string[]
  confirmedStudentNames: string[]
  presentStudentIds: string[]
  absentStudentIds: string[]
  justifiedStudentIds: string[]
  finalizedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ClassGroupInput {
  id?: string
  modalityId?: string | null
  activityCategory?: string | null
  teacherProfileId?: string | null
  name: string
  modalityName: string
  teacherName: string
  ageGroups: AgeGroupValue[]
  beltRange: string
  maxStudents: number
  currentStudents?: number
  schedules: Array<{
    weekday: number
    startTime: string
    endTime: string
  }>
  status?: ClassGroupStatusValue
}

export interface ClassSessionInput {
  classGroupId: string
  sessionDate: string
  weekday: number
  startTime: string
  endTime: string
  status: ClassSessionStatusValue
  confirmedStudentIds: string[]
  confirmedStudentNames: string[]
  presentStudentIds?: string[]
  absentStudentIds?: string[]
  justifiedStudentIds?: string[]
  isFinalized?: boolean
}
