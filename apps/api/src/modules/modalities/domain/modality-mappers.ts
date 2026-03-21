import { AgeGroup, type Modality } from "@prisma/client"
import type {
  ActivityCategoryValue,
  AgeGroupValue,
  ModalityEntity,
} from "@/apps/api/src/modules/modalities/domain/modality"

export function toAgeGroupValue(value: AgeGroup): AgeGroupValue {
  switch (value) {
    case AgeGroup.KIDS:
      return "kids"
    case AgeGroup.JUVENILE:
      return "juvenile"
    case AgeGroup.ADULT:
      return "adult"
    case AgeGroup.MIXED:
      return "mixed"
  }
}

export function toPrismaAgeGroup(value: AgeGroupValue) {
  switch (value) {
    case "kids":
      return AgeGroup.KIDS
    case "juvenile":
      return AgeGroup.JUVENILE
    case "adult":
      return AgeGroup.ADULT
    case "mixed":
      return AgeGroup.MIXED
  }
}

export function toModalityEntity(modality: Modality): ModalityEntity {
  return {
    id: modality.id,
    tenantId: modality.tenantId,
    activityCategory: modality.activityCategory as ActivityCategoryValue | null,
    name: modality.name,
    ageGroups: modality.ageGroups.map((item) => toAgeGroupValue(item)),
    defaultDurationMinutes: modality.defaultDurationMinutes,
    defaultCapacity: modality.defaultCapacity,
    sortOrder: modality.sortOrder,
    isActive: modality.isActive,
    createdAt: modality.createdAt.toISOString(),
    updatedAt: modality.updatedAt.toISOString(),
  }
}
