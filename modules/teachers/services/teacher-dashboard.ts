import { fetchJson } from "@/lib/api/client"
import type {
  TeacherDashboardRecord,
  TeacherGraduationCatalogItem,
} from "@/apps/api/src/modules/teachers/domain/teacher-dashboard"

interface TeacherRecordsResponse {
  teachers: TeacherDashboardRecord[]
  graduationCatalog: TeacherGraduationCatalogItem[]
}

interface TeacherPendingApprovalsResponse {
  count: number
}

interface TeacherFormPayload {
  name: string
  email?: string | null
  cpf?: string | null
  phone?: string | null
  rank?: string | null
  roleTitle?: string | null
  requestedModalityIds?: string[]
  compensationType?: "fixed" | "per_class" | "percentage" | null
  compensationValue?: string | number | null
  bonus?: string | null
  specialty?: string | null
}

interface TeacherMutationResponse {
  teacher: {
    id: string
    name: string
    email: string | null
    specialty: string | null
    status: string
  }
  accessInvitation?: {
    id: string
    email: string
    token: string
    status: string
  } | null
}

interface TeacherEnrollmentReviewResponse {
  request: {
    id: string
    status: string
  }
}

export async function fetchTeacherDashboardRecords(signal?: AbortSignal) {
  return fetchJson<TeacherRecordsResponse>("/api/teachers/records", { signal })
}

export async function fetchTeacherPendingApprovalsCount(signal?: AbortSignal) {
  return fetchJson<TeacherPendingApprovalsResponse>("/api/teachers/pending-approvals", { signal })
}

export async function createTeacher(payload: TeacherFormPayload) {
  return fetchJson<TeacherMutationResponse>("/api/teachers", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateTeacher(teacherId: string, payload: TeacherFormPayload) {
  return fetchJson<TeacherMutationResponse>(`/api/teachers/${teacherId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function reviewTeacherEnrollmentRequest(
  requestId: string,
  action: "approve" | "reject"
) {
  return fetchJson<TeacherEnrollmentReviewResponse>(`/api/enrollment-requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  })
}
