export interface EnrollmentRequestEntity {
  id: string
  tenantId: string
  userId: string
  requestedRole: "student" | "teacher" | "academy_admin"
  teacherRoleTitle?: string
  requestedActivityCategories: string[]
  requestedModalityIds: string[]
  userName?: string
  userEmail?: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  createdAt: string
  reviewedAt?: string
}
