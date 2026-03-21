export type StudentDashboardStatusValue = "active" | "inactive" | "suspended"
export type StudentPaymentStatusValue = "paid" | "pending" | "overdue"
export type AttendanceEntryStatusValue = "present" | "absent" | "justified"

export interface StudentAttendanceEntry {
  id: string
  date: string
  className: string
  time: string
  status: AttendanceEntryStatusValue
}

export interface StudentGraduationEntry {
  id: string
  date: string
  from: string | null
  to: string
  evaluator: string
  notes?: string | null
}

export interface StudentActivitySnapshot {
  id: string
  activityCategory: string | null
  belt: string
  beltColorHex: string | null
  stripes: number
  graduationLevels: Array<{
    name: string
    colorHex: string
    stripes: number
  }>
  startDate: string
  status: "active" | "inactive"
  notes: string
  practicedModalities: string[]
  enrolledClasses: string[]
  attendanceRate: number
  totalClasses: number
  attendanceHistory: StudentAttendanceEntry[]
  graduationHistory: StudentGraduationEntry[]
}

export interface StudentModalitySnapshot {
  id: string
  studentActivityId: string | null
  modalityId: string
  modalityName: string
  activityCategory: string | null
  belt: string
  beltColorHex: string | null
  stripes: number
  startDate: string
  status: "active" | "inactive"
  notes: string
  enrolledClasses: string[]
  attendanceRate: number
  totalClasses: number
  attendanceHistory: StudentAttendanceEntry[]
  graduationHistory: StudentGraduationEntry[]
}

export interface StudentDashboardRecord {
  id: string
  linkedUserId: string
  membershipId: string | null
  name: string
  email: string
  phone: string | null
  avatar: string | null
  status: StudentDashboardStatusValue
  birthDate: string | null
  address: string
  startDate: string
  emergencyContact: string
  notes: string
  planId: string | null
  planName: string | null
  planValueCents: number | null
  paymentStatus: StudentPaymentStatusValue
  lastPayment: string | null
  nextPayment: string | null
  practiceAssignments: StudentPracticeAssignmentSnapshot[]
  activities: StudentActivitySnapshot[]
  modalities: StudentModalitySnapshot[]
}

export interface StudentPracticeAssignmentSnapshot {
  activityCategory: string | null
  classGroupId: string | null
  classGroupName: string | null
  modalityId: string | null
  modalityName: string | null
  belt: string
  stripes: number
  startDate: string
  notes: string
}

export interface StudentDashboardCollection {
  students: StudentDashboardRecord[]
  activityCategoryOptions: string[]
  classOptions: Array<{
    id: string
    name: string
    activityCategory: string | null
    modalityId: string | null
    modalityName: string
    currentStudents: number
    maxStudents: number
  }>
  modalityOptions: Array<{
    id: string
    name: string
  }>
  planOptions: Array<{
    id: string
    name: string
    amountCents: number
  }>
}

export interface StudentUpsertInput {
  tenantId: string
  studentId?: string
  name: string
  email: string
  phone?: string | null
  birthDate?: string | null
  address?: string | null
  emergencyContact?: string | null
  notes?: string | null
  planId?: string | null
  markPlanAsPaid?: boolean
  practiceAssignments?: Array<{
    activityCategory?: string | null
    classGroupId?: string | null
    belt: string
    stripes: number
    startDate: string
    notes?: string | null
  }>
  modalities?: Array<{
    modalityId: string
    belt: string
    stripes: number
    startDate: string
    notes?: string | null
  }>
}
