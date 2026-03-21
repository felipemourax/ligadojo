import type { AthleteTitlePlacement } from "@/apps/api/src/modules/athletes/domain/athletes"

export interface CreateAthleteTitleInput {
  placement: AthleteTitlePlacement
  competition: string
  year: number
}
