import { formatActivityCategory, type ActivityCategoryValue } from "@/apps/api/src/modules/modalities/domain/modality"
import type { AgeGroupValue } from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding"

export interface SeededModalityTemplate {
  activityCategory: ActivityCategoryValue
  name: string
  ageGroups: AgeGroupValue[]
  defaultDurationMinutes: number
  defaultCapacity: number
}

const modalityNamePresets: Record<ActivityCategoryValue, { kids: string; juvenile: string; adult: string }> = {
  "jiu-jitsu": {
    kids: "Jiu-Jitsu Kids",
    juvenile: "Jiu-Jitsu Juvenil",
    adult: "Jiu-Jitsu Adulto",
  },
  "muay-thai": {
    kids: "Muay Thai Kids",
    juvenile: "Muay Thai Juvenil",
    adult: "Muay Thai Adulto",
  },
  judo: {
    kids: "Judô Kids",
    juvenile: "Judô Juvenil",
    adult: "Judô Adulto",
  },
  karate: {
    kids: "Karatê Kids",
    juvenile: "Karatê Juvenil",
    adult: "Karatê Adulto",
  },
  taekwondo: {
    kids: "Taekwondo Kids",
    juvenile: "Taekwondo Juvenil",
    adult: "Taekwondo Adulto",
  },
  boxe: {
    kids: "Boxe Kids",
    juvenile: "Boxe Juvenil",
    adult: "Boxe Adulto",
  },
  mma: {
    kids: "MMA Kids",
    juvenile: "MMA Juvenil",
    adult: "MMA Adulto",
  },
  outras: {
    kids: "Turma Kids",
    juvenile: "Turma Juvenil",
    adult: "Turma Adulto",
  },
}

export function createSeededModalityTemplates(activityCategories: ActivityCategoryValue[]): SeededModalityTemplate[] {
  return activityCategories.flatMap((activityCategory) => {
    const preset = modalityNamePresets[activityCategory]
    const names = preset ?? {
      kids: `${formatActivityCategory(activityCategory)} Kids`,
      juvenile: `${formatActivityCategory(activityCategory)} Juvenil`,
      adult: `${formatActivityCategory(activityCategory)} Adulto`,
    }

    return [
      {
        activityCategory,
        name: names.kids,
        ageGroups: ["kids"],
        defaultDurationMinutes: 60,
        defaultCapacity: 20,
      },
      {
        activityCategory,
        name: names.juvenile,
        ageGroups: ["juvenile"],
        defaultDurationMinutes: 60,
        defaultCapacity: 20,
      },
      {
        activityCategory,
        name: names.adult,
        ageGroups: ["adult"],
        defaultDurationMinutes: 60,
        defaultCapacity: 20,
      },
    ]
  })
}
