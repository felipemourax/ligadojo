import type { ActivityCategoryValue } from "@/apps/api/src/modules/modalities/domain/modality"

export interface CreateAcademyFromSelfServiceInput {
  academyName: string
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
  activityCategories?: ActivityCategoryValue[]
  password: string
}
