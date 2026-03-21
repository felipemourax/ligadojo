export type TeacherRoleValue = "head_instructor" | "instructor" | "assistant"
export type TeacherStatusValue = "active" | "pending" | "inactive"
export type TeacherAccessStatusValue =
  | "no_access"
  | "invited"
  | "pending_approval"
  | "active"
  | "rejected"
  | "revoked"
  | "suspended"
export type TeacherProfileCompletenessValue = "pending_payment_details" | "complete"
export type TeacherAvailableAction =
  | "approve"
  | "reject"
  | "copy_invite"
  | "edit"
  | "deactivate"
  | "complete_profile"

export interface TeacherScheduleEntry {
  day: string
  classes: string[]
}

export interface TeacherPermissions {
  manageStudents: boolean
  manageGraduations: boolean
  manageAttendance: boolean
  viewFinancials: boolean
  manageClasses: boolean
  manageTechniques: boolean
  manageEvents: boolean
}

export interface TeacherCompensation {
  type: "fixed" | "per_class" | "percentage"
  value: number
  bonus: string
}

export interface TeacherGraduationCatalogItem {
  activityCategory: string | null
  modalityIds: string[]
  modalityNames: string[]
  levels: Array<{
    name: string
    colorHex: string
    stripes: number
  }>
}

export interface TeacherDashboardRecord {
  id: string
  linkedUserId: string | null
  name: string
  email: string | null
  phone: string | null
  belt: string
  beltColorHex: string | null
  degree: string
  modalities: string[]
  status: TeacherStatusValue
  accessStatus: TeacherAccessStatusValue
  profileCompleteness: TeacherProfileCompletenessValue
  availableActions: TeacherAvailableAction[]
  role: TeacherRoleValue
  roleTitle: string | null
  avatar: string | null
  startDate: string
  birthDate: string
  address: string
  students: number
  totalClasses: number
  monthlyClasses: number
  specializations: string[]
  schedule: TeacherScheduleEntry[]
  permissions: TeacherPermissions
  compensation: TeacherCompensation
  attendanceSnapshot: {
    present: number
    absent: number
    confirmed: number
  }
  reviewRequestId: string | null
  reviewRequestedAt: string | null
}
