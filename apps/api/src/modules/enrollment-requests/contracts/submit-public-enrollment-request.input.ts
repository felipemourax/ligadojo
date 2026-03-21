export type PublicEnrollmentRequestedRole = "student" | "teacher"

export type PublicEnrollmentTeacherRoleTitle =
  | "Professor"
  | "Instrutor chefe"
  | "Instrutor"
  | "Assistente"

export interface SubmitPublicEnrollmentRequestInput {
  email: string
  firstName: string
  lastName: string
  birthDate: string
  zipCode: string
  street: string
  city: string
  state: string
  requestedRole: PublicEnrollmentRequestedRole
  requestedActivityCategories: string[]
  requestedModalityIds: string[]
  teacherRoleTitle?: PublicEnrollmentTeacherRoleTitle
  teacherRank?: string
  cpf?: string
  whatsapp?: string
  emergencyContact?: string
  password?: string
}
