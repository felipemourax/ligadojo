// Types for Events Module
export interface Event {
  id: string
  name: string
  description?: string
  type: EventType
  startDate: string
  location?: string
  maxParticipants?: number
  price?: number
  status: EventStatus
  modalities?: string[]
  categories?: EventCategory[]
  participants?: EventParticipant[]
  createdAt: string
  updatedAt: string
}

export type EventType =
  | "competition"
  | "seminar"
  | "graduation_exam"
  | "workshop"
  | "festival"
  | "special_class"
  | "internal_competition"
  | "other"

export type EventStatus = "scheduled" | "completed" | "cancelled"

export interface EventCategory {
  id: string
  name: string
  ageRange?: { min: number; max: number }
  weightRange?: { min: number; max: number }
  belt?: string
  gender?: "male" | "female" | "mixed"
}

export interface EventParticipant {
  id: string
  eventId: string
  studentId: string
  categoryId?: string
  registrationDate: string
  status: ParticipantStatus
  paymentStatus: "pending" | "paid" | "overdue" | "cancelled" | null
  result?: EventResult
}

export type ParticipantStatus = "invited" | "confirmed" | "maybe" | "declined" | "payment_pending"

export interface EventResult {
  position?: number
  medal?: "gold" | "silver" | "bronze"
  points?: number
  notes?: string
}

export interface EventFilters {
  search?: string
  type?: EventType
  status?: EventStatus
  startDate?: string
  endDate?: string
  modalityId?: string
}
