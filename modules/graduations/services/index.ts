import { fetchJson } from "@/lib/api/client"
import type {
  GraduationDashboardData,
  GraduationTrackInput,
} from "@/apps/api/src/modules/graduations/domain/graduation-dashboard"

export function fetchGraduationDashboard() {
  return fetchJson<{ dashboard: GraduationDashboardData }>("/api/graduations")
}

export function createGraduationExam(payload: {
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
}) {
  return fetchJson<{ dashboard: GraduationDashboardData; message: string }>("/api/graduations/exams", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function addGraduationExamCandidate(examId: string, payload: { studentActivityId: string }) {
  return fetchJson<{ dashboard: GraduationDashboardData; message: string }>(
    `/api/graduations/exams/${examId}/candidates`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export function removeGraduationExamCandidate(examId: string, studentActivityId: string) {
  return fetchJson<{ dashboard: GraduationDashboardData; message: string }>(
    `/api/graduations/exams/${examId}/candidates/${studentActivityId}`,
    {
      method: "DELETE",
    }
  )
}

export function updateGraduationExamStatus(
  examId: string,
  status: "in_progress" | "completed" | "cancelled"
) {
  return fetchJson<{ dashboard: GraduationDashboardData; message: string }>(
    `/api/graduations/exams/${examId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  )
}

export function updateGraduationEligibility(
  studentActivityId: string,
  eligibleOverride: boolean | null
) {
  return fetchJson<{ dashboard: GraduationDashboardData; message: string }>(
    `/api/graduations/eligible/${studentActivityId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ eligibleOverride }),
    }
  )
}

export function replaceGraduationTracks(tracks: GraduationTrackInput[]) {
  return fetchJson<{ dashboard: GraduationDashboardData; message: string }>("/api/graduations", {
    method: "PUT",
    body: JSON.stringify({ tracks }),
  })
}
