// Types for Classes Module
export interface Class {
  id: string
  name: string
  description?: string
  modalityId: string
  modality?: Modality
  teacherId: string
  teacher?: Teacher
  schedule: Schedule[]
  maxStudents?: number
  currentStudents?: number
  level?: ClassLevel
  status: ClassStatus
  location?: string
  createdAt: string
  updatedAt: string
}

export interface Modality {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  phone?: string
  belt?: string
  avatarUrl?: string
  bio?: string
  specialties?: string[]
}

export interface Schedule {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type ClassLevel = "beginner" | "intermediate" | "advanced" | "all"

export type ClassStatus = "active" | "inactive" | "cancelled"

export interface ClassFilters {
  search?: string
  modalityId?: string
  teacherId?: string
  level?: ClassLevel
  dayOfWeek?: DayOfWeek
  status?: ClassStatus
}
