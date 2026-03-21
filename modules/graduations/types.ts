// Types for Graduations Module
export interface Belt {
  id: string
  name: string
  color: string
  hexColor: string
  order: number
  modalityId: string
  minMonths?: number
  requirements?: Requirement[]
}

export interface Stripe {
  id: string
  number: number
  beltId: string
  minMonths?: number
}

export interface Requirement {
  id: string
  beltId: string
  description: string
  category: RequirementCategory
  order: number
}

export type RequirementCategory = "technique" | "attendance" | "competition" | "knowledge" | "behavior"

export interface GraduationEvent {
  id: string
  name: string
  date: string
  location?: string
  modalityId: string
  description?: string
  status: GraduationEventStatus
  promotions: Promotion[]
  createdAt: string
}

export type GraduationEventStatus = "scheduled" | "in_progress" | "completed" | "cancelled"

export interface Promotion {
  id: string
  studentId: string
  graduationEventId: string
  fromBeltId: string
  toBeltId: string
  fromStripes: number
  toStripes: number
  promotionType: PromotionType
  evaluatorId?: string
  notes?: string
  date: string
}

export type PromotionType = "belt" | "stripe"

export interface StudentGraduationHistory {
  studentId: string
  currentBelt: Belt
  currentStripes: number
  history: Promotion[]
  nextBelt?: Belt
  eligibleForPromotion: boolean
  attendanceRate: number
  monthsAtCurrentBelt: number
}
