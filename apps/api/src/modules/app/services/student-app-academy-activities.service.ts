import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import type { StudentAppAcademyActivity } from "@/apps/api/src/modules/app/domain/student-app"
import { formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"
import { ModalityRepository } from "@/apps/api/src/modules/modalities/repositories/modality.repository"

export class StudentAppAcademyActivitiesService {
  constructor(private readonly modalityRepository = new ModalityRepository()) {}

  async listForTenant(tenantId: string): Promise<StudentAppAcademyActivity[]> {
    const [activeModalities, onboardingActivityCategories] = await Promise.all([
      prisma.modality.findMany({
        where: {
          tenantId,
          isActive: true,
          activityCategory: {
            not: null,
          },
        },
        select: {
          activityCategory: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      this.modalityRepository.listAvailableActivityCategories(tenantId),
    ])

    const activeCategories = Array.from(
      new Set(
        activeModalities
          .map((modality) => modality.activityCategory)
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      )
    )

    const categories = activeCategories.length > 0 ? activeCategories : onboardingActivityCategories

    return categories.map((value) => ({
      value,
      label: formatActivityCategory(value),
    }))
  }
}
