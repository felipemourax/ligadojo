import type {
  TeacherAppAgendaData,
  TeacherAppAttendanceData,
  TeacherAppClassesData,
  TeacherAppEventsData,
  TeacherAppEvolutionData,
  TeacherAppHomeData,
  TeacherAppProfileData,
  TeacherAppProfileGraduationsData,
  TeacherAppProfileTitlesData,
  TeacherAppProfileUpdateInput,
} from "@/apps/api/src/modules/app/domain/teacher-app"
import { fetchJson } from "@/lib/api/client"

export function fetchTeacherAppHome() {
  return fetchJson<{ data: TeacherAppHomeData }>("/api/app/teacher/home")
}

export function fetchTeacherAppAgenda() {
  return fetchJson<{ data: TeacherAppAgendaData }>("/api/app/teacher/agenda")
}

export function fetchTeacherAppAttendance() {
  return fetchJson<{ data: TeacherAppAttendanceData }>("/api/app/teacher/attendance")
}

export function saveTeacherAppAttendance(payload: {
  classGroupId: string
  sessionDate: string
  weekday: number
  startTime: string
  endTime: string
  confirmedStudentIds: string[]
  confirmedStudentNames: string[]
  presentStudentIds: string[]
  absentStudentIds: string[]
  justifiedStudentIds: string[]
  isFinalized: boolean
}) {
  return fetchJson<{ data: TeacherAppAttendanceData; message: string }>("/api/app/teacher/attendance", {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function fetchTeacherAppClasses() {
  return fetchJson<{ data: TeacherAppClassesData }>("/api/app/teacher/classes")
}

export function fetchTeacherAppEvolution() {
  return fetchJson<{ data: TeacherAppEvolutionData }>("/api/app/teacher/evolution")
}

export function markTeacherAppStudentAsEligible(studentActivityId: string) {
  return fetchJson<{ data: TeacherAppEvolutionData; message: string }>(
    `/api/app/teacher/evolution/eligible/${studentActivityId}`,
    {
      method: "POST",
    }
  )
}

export function addTeacherAppStudentToExam(examId: string, studentActivityId: string) {
  return fetchJson<{ data: TeacherAppEvolutionData; message: string }>(
    `/api/app/teacher/evolution/exams/${examId}/candidates`,
    {
      method: "POST",
      body: JSON.stringify({ studentActivityId }),
    }
  )
}

export function fetchTeacherAppEvents() {
  return fetchJson<{ data: TeacherAppEventsData }>("/api/app/teacher/events")
}

export function addTeacherAppEventParticipant(eventId: string, userId: string) {
  return fetchJson<{ data: TeacherAppEventsData; message: string }>(
    `/api/app/teacher/events/${eventId}/participants`,
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    }
  )
}

export function fetchTeacherAppProfile() {
  return fetchJson<{ data: TeacherAppProfileData }>("/api/app/teacher/profile")
}

export function saveTeacherAppProfile(payload: TeacherAppProfileUpdateInput) {
  return fetchJson<{ data: TeacherAppProfileData; message: string }>("/api/app/teacher/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function fetchTeacherAppProfileGraduations() {
  return fetchJson<{ data: TeacherAppProfileGraduationsData }>("/api/app/teacher/profile/graduations")
}

export function createTeacherAppProfileGraduation(payload: {
  activityCategory: string
  toBelt: string
  toStripes: number
  graduatedAtMonth: string
  notes?: string | null
}) {
  return fetchJson<{ data: TeacherAppProfileGraduationsData; message: string }>(
    "/api/app/teacher/profile/graduations",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export function updateTeacherAppProfileGraduation(
  graduationId: string,
  payload: {
    activityCategory: string
    toBelt: string
    toStripes: number
    graduatedAtMonth: string
    notes?: string | null
  }
) {
  return fetchJson<{ data: TeacherAppProfileGraduationsData; message: string }>(
    `/api/app/teacher/profile/graduations/${graduationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  )
}

export function fetchTeacherAppProfileTitles() {
  return fetchJson<{ data: TeacherAppProfileTitlesData }>("/api/app/teacher/profile/titles")
}

export function createTeacherAppProfileTitle(payload: {
  placement: "gold" | "silver" | "bronze" | "champion" | "runner_up"
  competition: string
  year: number
}) {
  return fetchJson<{ data: TeacherAppProfileTitlesData; message: string }>(
    "/api/app/teacher/profile/titles",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export function removeTeacherAppProfileTitle(titleId: string) {
  return fetchJson<{ data: TeacherAppProfileTitlesData; message: string }>(
    `/api/app/teacher/profile/titles/${titleId}`,
    {
      method: "DELETE",
    }
  )
}
