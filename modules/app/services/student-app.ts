import type {
  StudentAppAttendanceData,
  StudentAppClassesData,
  StudentAppEventsData,
  StudentAppHomeData,
  StudentAppNavigationIndicatorsData,
  StudentAppPaymentsData,
  StudentAppPlansData,
  StudentAppProfileGraduationsData,
  StudentAppProfileTitlesData,
  StudentAppProgressData,
} from "@/apps/api/src/modules/app/domain/student-app"
import { fetchJson } from "@/lib/api/client"

export function fetchStudentAppHome() {
  return fetchJson<{ data: StudentAppHomeData }>("/api/app/student/home")
}

export function fetchStudentAppNavigationIndicators() {
  return fetchJson<{ data: StudentAppNavigationIndicatorsData }>("/api/app/student/navigation")
}

export function fetchStudentAppAttendance() {
  return fetchJson<{ data: StudentAppAttendanceData }>("/api/app/student/attendance")
}

export function fetchStudentAppClasses() {
  return fetchJson<{ data: StudentAppClassesData }>("/api/app/student/classes")
}

export function joinStudentAppClass(classId: string) {
  return fetchJson<{ data: StudentAppClassesData; message: string }>(`/api/app/student/classes/${classId}`, {
    method: "POST",
  })
}

export function leaveStudentAppClass(classId: string) {
  return fetchJson<{ data: StudentAppClassesData; message: string }>(`/api/app/student/classes/${classId}`, {
    method: "DELETE",
  })
}

export function fetchStudentAppProgress() {
  return fetchJson<{ data: StudentAppProgressData }>("/api/app/student/progress")
}

export function fetchStudentAppPayments() {
  return fetchJson<{ data: StudentAppPaymentsData }>("/api/app/student/payments")
}

export function fetchStudentAppEvents() {
  return fetchJson<{ data: StudentAppEventsData }>("/api/app/student/events")
}

export function enrollStudentAppEvent(
  eventId: string,
  initialStatus: "confirmed" | "maybe" | "declined"
) {
  return fetchJson<{ data: StudentAppEventsData; message: string }>("/api/app/student/events", {
    method: "POST",
    body: JSON.stringify({ eventId, initialStatus }),
  })
}

export function cancelStudentAppEvent(eventId: string) {
  return fetchJson<{ data: StudentAppEventsData; message: string }>(
    `/api/app/student/events/${eventId}`,
    {
      method: "DELETE",
    }
  )
}

export function updateStudentAppEventResponse(
  eventId: string,
  status: "confirmed" | "maybe" | "declined"
) {
  return fetchJson<{ data: StudentAppEventsData; message: string }>(
    `/api/app/student/events/${eventId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  )
}

export function applyStudentAppCoupon(code: string) {
  return fetchJson<{ data: StudentAppPaymentsData; message: string }>("/api/app/student/payments", {
    method: "POST",
    body: JSON.stringify({ code }),
  })
}

export function fetchStudentAppPlans() {
  return fetchJson<{ data: StudentAppPlansData }>("/api/app/student/plans")
}

export function activateStudentAppPlan(planId: string) {
  return fetchJson<{ data: StudentAppPlansData; message: string }>("/api/app/student/plans", {
    method: "POST",
    body: JSON.stringify({ planId }),
  })
}

export function fetchStudentAppProfileGraduations() {
  return fetchJson<{ data: StudentAppProfileGraduationsData }>("/api/app/student/profile/graduations")
}

export function createStudentAppProfileGraduation(payload: {
  studentActivityId: string
  toBelt: string
  toStripes: number
  graduatedAtMonth: string
  notes?: string | null
}) {
  return fetchJson<{ data: StudentAppProfileGraduationsData; message: string }>(
    "/api/app/student/profile/graduations",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export function updateStudentAppProfileGraduation(
  graduationId: string,
  payload: {
    studentActivityId: string
    toBelt: string
    toStripes: number
    graduatedAtMonth: string
    notes?: string | null
  }
) {
  return fetchJson<{ data: StudentAppProfileGraduationsData; message: string }>(
    `/api/app/student/profile/graduations/${graduationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  )
}

export function fetchStudentAppProfileTitles() {
  return fetchJson<{ data: StudentAppProfileTitlesData }>("/api/app/student/profile/titles")
}

export function createStudentAppProfileTitle(payload: {
  placement: "gold" | "silver" | "bronze" | "champion" | "runner_up"
  competition: string
  year: number
}) {
  return fetchJson<{ data: StudentAppProfileTitlesData; message: string }>(
    "/api/app/student/profile/titles",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export function removeStudentAppProfileTitle(titleId: string) {
  return fetchJson<{ data: StudentAppProfileTitlesData; message: string }>(
    `/api/app/student/profile/titles/${titleId}`,
    {
      method: "DELETE",
    }
  )
}
