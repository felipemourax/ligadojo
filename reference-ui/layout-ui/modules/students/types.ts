// Types for Students Module
export interface Student {
  id: string
  name: string
  email: string
  phone?: string
  birthDate?: string
  belt?: Belt
  stripes?: number
  startDate: string
  status: StudentStatus
  plan?: Plan
  avatarUrl?: string
  emergencyContact?: EmergencyContact
  medicalInfo?: MedicalInfo
  address?: Address
  createdAt: string
  updatedAt: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface MedicalInfo {
  bloodType?: string
  allergies?: string
  conditions?: string
  medications?: string
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export type StudentStatus = "active" | "inactive" | "suspended" | "trial"

export interface Belt {
  id: string
  name: string
  color: string
  order: number
}

export interface Plan {
  id: string
  name: string
  price: number
  frequency: "monthly" | "quarterly" | "semiannual" | "annual"
}

export interface StudentFilters {
  search?: string
  status?: StudentStatus
  beltId?: string
  planId?: string
  classId?: string
}
