export interface UpdateAttendanceSessionInput {
  classGroupId: string
  sessionDate: string
  weekday: number
  startTime: string
  endTime: string
  status: "scheduled" | "cancelled"
  confirmedStudentIds: string[]
  confirmedStudentNames: string[]
  presentStudentIds: string[]
  absentStudentIds: string[]
  justifiedStudentIds: string[]
  isFinalized: boolean
}
