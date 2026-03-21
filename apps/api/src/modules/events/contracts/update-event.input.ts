import type { EventDashboardStatus, EventDashboardType } from "@/apps/api/src/modules/events/domain/event-dashboard"

export interface UpdateEventInputContract {
  name: string
  type: EventDashboardType
  date: string
  time: string
  modalityId: string | null
  location: string
  organizerName: string | null
  teacherProfileId: string | null
  capacity: number
  hasRegistrationFee: boolean
  registrationFeeAmount: number | null
  registrationFeeDueDays: number | null
  registrationsOpen: boolean
  notes: string | null
  status: EventDashboardStatus
}
