import type { EventDashboardData } from "@/apps/api/src/modules/events/domain/event-dashboard"
import { fetchJson } from "@/lib/api/client"

export async function getEventsDashboard() {
  return fetchJson<{ dashboard: EventDashboardData }>("/api/events")
}

export async function createEvent(input: {
  name: string
  type: string
  date: string
  time: string
  modalityId?: string | null
  location: string
  organizerName?: string | null
  teacherProfileId?: string | null
  capacity: number
  hasRegistrationFee?: boolean
  registrationFeeAmount?: number | null
  registrationFeeDueDays?: number | null
  notes?: string | null
}) {
  return fetchJson<{ dashboard: EventDashboardData; message: string; createdEventId: string }>("/api/events", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateEvent(
  eventId: string,
  input: {
    name: string
    type: string
    date: string
    time: string
    modalityId?: string | null
    location: string
    organizerName?: string | null
    teacherProfileId?: string | null
    capacity: number
    hasRegistrationFee?: boolean
    registrationFeeAmount?: number | null
    registrationFeeDueDays?: number | null
    registrationsOpen?: boolean
    notes?: string | null
    status: "scheduled" | "completed" | "cancelled"
  }
) {
  return fetchJson<{ dashboard: EventDashboardData; message: string }>(`/api/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function deleteEvent(eventId: string) {
  return fetchJson<{ dashboard: EventDashboardData; message: string }>(`/api/events/${eventId}`, {
    method: "DELETE",
  })
}

export async function addEventParticipant(eventId: string, userId: string) {
  return fetchJson<{ dashboard: EventDashboardData; message: string }>(`/api/events/${eventId}/participants`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  })
}

export async function removeEventParticipant(eventId: string, participantId: string) {
  return fetchJson<{ dashboard: EventDashboardData; message: string }>(
    `/api/events/${eventId}/participants?participantId=${encodeURIComponent(participantId)}`,
    {
      method: "DELETE",
    }
  )
}

export async function updateEventParticipantStatus(
  eventId: string,
  participantId: string,
  status: "invited" | "confirmed" | "maybe" | "declined"
) {
  return fetchJson<{ dashboard: EventDashboardData; message: string }>(`/api/events/${eventId}/participants`, {
    method: "PATCH",
    body: JSON.stringify({ participantId, status }),
  })
}

export async function confirmEventParticipantPayment(
  eventId: string,
  participantId: string,
  paymentMethod: "PIX" | "CARD" | "BOLETO" | "CASH"
) {
  return fetchJson<{ dashboard: EventDashboardData; message: string }>(`/api/events/${eventId}/participants`, {
    method: "PATCH",
    body: JSON.stringify({ participantId, paymentMethod }),
  })
}

export async function updateEventRegistrationsState(eventId: string, registrationsOpen: boolean) {
  return fetchJson<{ dashboard: EventDashboardData; message: string }>(`/api/events/${eventId}/participants`, {
    method: "PATCH",
    body: JSON.stringify({ registrationsOpen }),
  })
}
