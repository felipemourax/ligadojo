export type EventDashboardStatus = "scheduled" | "completed" | "cancelled"
export type EventDashboardType =
  | "competition"
  | "seminar"
  | "graduation_exam"
  | "workshop"
  | "festival"
  | "special_class"

export type EventDashboardParticipantRole = "athlete" | "staff"
export type EventDashboardParticipantStatus =
  | "invited"
  | "confirmed"
  | "maybe"
  | "declined"
  | "payment_pending"

export interface EventDashboardParticipantRecord {
  id: string
  userId: string
  name: string
  role: EventDashboardParticipantRole
  modality: string
  status: EventDashboardParticipantStatus
  financeChargeId: string | null
  paymentStatus: "pending" | "paid" | "overdue" | "cancelled" | null
  canMarkAsPaid: boolean
}

export interface EventDashboardCandidateRecord {
  id: string
  userId: string
  name: string
  email: string | null
  role: EventDashboardParticipantRole
  modality: string
}

export interface EventDashboardEventRecord {
  id: string
  name: string
  type: EventDashboardType
  date: string
  time: string
  location: string
  notes: string | null
  organizer: string | null
  modalityId: string | null
  teacherProfileId: string | null
  status: EventDashboardStatus
  modality: string
  capacity: number
  registrationsOpen: boolean
  hasRegistrationFee: boolean
  registrationFeeAmount: number | null
  registrationFeeDueDays: number | null
  participants: EventDashboardParticipantRecord[]
}

export interface EventDashboardHistoryRecord {
  id: string
  name: string
  type: EventDashboardType
  date: string
  participants: number
  modality: string
}

export interface EventDashboardData {
  events: EventDashboardEventRecord[]
  pastEvents: EventDashboardHistoryRecord[]
  availableParticipants: EventDashboardCandidateRecord[]
  references: {
    modalities: Array<{ id: string; name: string }>
    teachers: Array<{ id: string; name: string }>
  }
}

export interface CreateEventInput {
  tenantId: string
  name: string
  type: EventDashboardType
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
}
