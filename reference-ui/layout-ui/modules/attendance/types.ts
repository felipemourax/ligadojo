// Types for Attendance Module
export interface AttendanceRecord {
  id: string
  studentId: string
  classId: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: AttendanceStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused"

export interface AttendanceSession {
  id: string
  classId: string
  date: string
  teacherId: string
  startTime: string
  endTime?: string
  records: AttendanceRecord[]
  notes?: string
  status: SessionStatus
}

export type SessionStatus = "scheduled" | "in_progress" | "completed" | "cancelled"

export interface AttendanceStats {
  totalClasses: number
  attended: number
  absences: number
  lateArrivals: number
  excused: number
  attendanceRate: number
}

export interface AttendanceFilters {
  studentId?: string
  classId?: string
  startDate?: string
  endDate?: string
  status?: AttendanceStatus
}
