import type {
  ActivityCategoryValue,
  AgeGroupValue,
} from "@/apps/api/src/modules/modalities/domain/modality"

export interface ModalitiesDashboardDraft {
  clientId: string
  activityCategory?: ActivityCategoryValue | ""
  name: string
  ageGroups: AgeGroupValue[]
  defaultDurationMinutes: number
  defaultCapacity: number
}

export interface ModalitiesDashboardState {
  modalities: ModalitiesDashboardDraft[]
}
