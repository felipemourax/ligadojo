export const activityCategoryOptions = [
  { value: "jiu-jitsu", label: "Jiu Jitsu" },
  { value: "muay-thai", label: "Muay Thai" },
  { value: "judo", label: "Judô" },
  { value: "karate", label: "Karatê" },
  { value: "taekwondo", label: "Taekwondo" },
  { value: "boxe", label: "Boxe" },
  { value: "mma", label: "MMA" },
  { value: "outras", label: "Outras" },
] as const

export type AgeGroupValue = "kids" | "juvenile" | "adult" | "mixed"
export type ActivityCategoryValue = (typeof activityCategoryOptions)[number]["value"]

export function formatActivityCategory(value?: string | null) {
  return activityCategoryOptions.find((option) => option.value === value)?.label ?? "Outras"
}

export interface ModalityEntity {
  id: string
  tenantId: string
  activityCategory: ActivityCategoryValue | null
  name: string
  ageGroups: AgeGroupValue[]
  defaultDurationMinutes: number
  defaultCapacity: number
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ModalityInput {
  id?: string
  activityCategory: ActivityCategoryValue
  name: string
  ageGroups: AgeGroupValue[]
  defaultDurationMinutes: number
  defaultCapacity: number
}
