import { fetchJson } from "@/lib/api/client"
import type { StudentDashboardRecord } from "@/apps/api/src/modules/students/domain/student-dashboard"

export interface StudentUpsertPayload {
  name: string
  email: string
  phone?: string | null
  birthDate?: string | null
  address?: string | null
  emergencyContact?: string | null
  notes?: string | null
  planId?: string | null
  markPlanAsPaid?: boolean
  practiceAssignments: Array<{
    activityCategory?: string | null
    classGroupId?: string | null
    belt: string
    stripes: number
    startDate: string
    notes?: string | null
  }>
}

export function createStudent(payload: StudentUpsertPayload) {
  return fetchJson<{ student: StudentDashboardRecord | null; message: string }>("/api/students", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateStudent(studentId: string, payload: StudentUpsertPayload) {
  return fetchJson<{ student: StudentDashboardRecord | null; message: string }>(
    `/api/students/${studentId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  )
}

export function updateStudentStatus(
  studentId: string,
  status: "active" | "inactive" | "suspended"
) {
  return fetchJson<{ student: StudentDashboardRecord | null; message: string }>(
    `/api/students/${studentId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  )
}

export function createStudentGraduation(
  studentId: string,
  payload: {
    studentActivityId: string
    toBelt: string
    toStripes: number
    evaluatorName: string
    graduatedAt: string
    notes?: string | null
  }
) {
  return fetchJson<{ student: StudentDashboardRecord | null; message: string }>(
    `/api/graduations/students/${studentId}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}
