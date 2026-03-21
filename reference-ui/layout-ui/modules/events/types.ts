// Types for Events Module
export interface Event {
  id: string
  name: string
  description?: string
  type: EventType
  startDate: string
  endDate?: string
  location?: string
  address?: string
  maxParticipants?: number
  registrationDeadline?: string
  price?: number
  status: EventStatus
  coverImage?: string
  modalities?: string[]
  categories?: EventCategory[]
  participants?: EventParticipant[]
  createdAt: string
  updatedAt: string
}

export type EventType = 
  | "competition" 
  | "seminar" 
  | "graduation" 
  | "workshop" 
  | "social" 
  | "internal_competition"
  | "other"

export type EventStatus = "draft" | "published" | "registration_open" | "registration_closed" | "in_progress" | "completed" | "cancelled"

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
  paymentStatus: "pending" | "paid" | "refunded"
  result?: EventResult
}

export type ParticipantStatus = "registered" | "confirmed" | "checked_in" | "withdrawn" | "disqualified"

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
