// Types for Teachers Module
export interface Teacher {
  id: string
  name: string
  email: string
  phone?: string
  cpf?: string
  birthDate?: string
  belt?: string
  beltColor?: string
  avatarUrl?: string
  bio?: string
  specialties?: string[]
  certifications?: Certification[]
  modalities: string[]
  classes?: string[]
  schedule?: TeacherSchedule[]
  salary?: TeacherSalary
  status: TeacherStatus
  hireDate: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  createdAt: string
  updatedAt: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  documentUrl?: string
}

export interface TeacherSchedule {
  dayOfWeek: number
  startTime: string
  endTime: string
  classId?: string
}

export interface TeacherSalary {
  type: SalaryType
  baseAmount: number
  perClassAmount?: number
  commission?: number
}

export type SalaryType = "fixed" | "per_class" | "mixed"

export type TeacherStatus = "active" | "inactive" | "vacation" | "leave"

export interface TeacherFilters {
  search?: string
  status?: TeacherStatus
  modalityId?: string
}
