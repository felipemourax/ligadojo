export type GraduationExamStatusValue = "scheduled" | "in_progress" | "completed" | "cancelled"
export type GraduationTrackBranchValue = "kids" | "adult" | "mixed"
export type GraduationProgressionValue = "belt" | "skill_level"

export interface GraduationLevelRecord {
  id: string
  name: string
  colorHex: string
  stripes: number
  minTimeMonths: number | null
  order: number
}

export interface GraduationTrackRecord {
  id: string
  modalityId: string | null
  modalityName: string | null
  name: string
  branch: GraduationTrackBranchValue
  progression: GraduationProgressionValue
  isDefault: boolean
  order: number
  levels: GraduationLevelRecord[]
}

export interface GraduationExamRecord {
  id: string
  title: string
  date: string
  time: string
  trackId: string
  trackName: string
  modalityId: string | null
  modalityName: string | null
  location: string | null
  evaluatorName: string | null
  evaluatorNames: string[]
  allTracks: boolean
  allEvaluators: boolean
  trackIds: string[]
  status: GraduationExamStatusValue
  candidateCount: number
  candidates: Array<{
    id: string
    studentActivityId: string
    studentName: string
    activityCategory: string | null
    activityLabel: string
    fromBelt: string | null
    fromStripes: number
    toBelt: string | null
    toStripes: number
    attendanceRate: number
    techniquesScore: number | null
    behavior: string | null
    fromBeltColorHex: string | null
    toBeltColorHex: string | null
  }>
}

export interface GraduationEligibleStudentRecord {
  studentActivityId: string
  studentId: string
  studentName: string
  activityCategory: string | null
  activityLabel: string
  modalityId: string | null
  modalityName: string | null
  trackId: string | null
  trackName: string | null
  currentBelt: string
  currentStripes: number
  beltColorHex: string | null
  attendanceRate: number
  attendanceEligible: boolean
  manualEligibleOverride: boolean | null
  manualEligibleOverrideActors: Array<{
    actorUserId: string | null
    actorName: string | null
    actorRole: "academy_admin" | "teacher" | "student"
    displayName: string
  }>
  eligible: boolean
  monthsAtCurrentBelt: number
}

export interface GraduationHistoryRecord {
  id: string
  studentId: string
  studentName: string
  activityCategory: string | null
  activityLabel: string
  modalityId: string | null
  modalityName: string | null
  fromBelt: string | null
  toBelt: string
  toStripes: number
  beltColorHex: string | null
  date: string
  evaluatorName: string
}

export interface GraduationDashboardData {
  metrics: {
    yearGraduations: number
    scheduledExams: number
    eligibleStudents: number
    approvalRate: number
  }
  exams: GraduationExamRecord[]
  eligibleStudents: GraduationEligibleStudentRecord[]
  studentDirectory: Array<{
    studentActivityId: string
    studentId: string
    studentName: string
    activityCategory: string | null
    activityLabel: string
    modalityId: string | null
    modalityName: string | null
    currentBelt: string
    currentStripes: number
    beltColorHex: string | null
  }>
  history: GraduationHistoryRecord[]
  tracks: GraduationTrackRecord[]
  modalities: Array<{ id: string; name: string }>
  teachers: Array<{ id: string; name: string }>
}

export interface GraduationTrackLevelInput {
  id?: string
  name: string
  colorHex: string
  stripes: number
  minTimeMonths?: number | null
}

export interface GraduationTrackInput {
  id?: string
  modalityId?: string | null
  name: string
  branch: GraduationTrackBranchValue
  progression: GraduationProgressionValue
  levels: GraduationTrackLevelInput[]
}

export interface GraduationExamInput {
  title: string
  trackIds: string[]
  allTracks: boolean
  modalityId?: string | null
  date: string
  time: string
  location?: string | null
  evaluatorNames: string[]
  allEvaluators: boolean
  notes?: string | null
}
