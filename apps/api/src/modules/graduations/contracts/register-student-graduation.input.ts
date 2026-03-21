export interface RegisterStudentGraduationInput {
  studentActivityId: string
  toBelt: string
  toStripes: number
  evaluatorName: string
  graduatedAt: string
  notes?: string | null
}
