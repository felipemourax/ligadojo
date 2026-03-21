import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"
import { ModalityRepository } from "@/apps/api/src/modules/modalities/repositories/modality.repository"
import { CadastroPageClient } from "@/components/auth/cadastro-page-client"
import { UnknownAcademySurface } from "@/components/tenant/unknown-academy-surface"
import { getResolvedTenantBranding, getResolvedTenantSurfaceContext } from "@/lib/tenancy"

const modalityRepository = new ModalityRepository()

function toAgeGroupValue(value: "KIDS" | "JUVENILE" | "ADULT" | "MIXED") {
  switch (value) {
    case "KIDS":
      return "kids" as const
    case "JUVENILE":
      return "juvenile" as const
    case "ADULT":
      return "adult" as const
    case "MIXED":
      return "mixed" as const
  }
}

export default async function CadastroPage() {
  const tenantContext = await getResolvedTenantSurfaceContext()
  const tenant = tenantContext.tenant
  const branding = await getResolvedTenantBranding(tenant)

  if (tenantContext.invalidTenantHost) {
    return (
      <UnknownAcademySurface
        attemptedHost={tenantContext.request.host}
        suggestedQuery={tenantContext.suggestedQuery}
      />
    )
  }

  let modalities: Array<{
    id: string
    name: string
    ageGroups: Array<"kids" | "juvenile" | "adult" | "mixed">
  }> = []
  let activityCategories: Array<{
    value: string
    label: string
  }> = []

  if (tenant.kind === "tenant" && tenantContext.resolvedTenant) {
    const [modalityRecords, availableActivityCategories] = await Promise.all([
      prisma.modality.findMany({
        where: {
          tenantId: tenantContext.resolvedTenant.id,
          isActive: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          activityCategory: true,
          ageGroups: true,
        },
      }),
      modalityRepository.listAvailableActivityCategories(tenantContext.resolvedTenant.id),
    ])

    modalities = modalityRecords.map((item) => ({
      id: item.id,
      name: item.name,
      ageGroups: item.ageGroups.map(toAgeGroupValue),
    }))

    const activeActivityCategories = Array.from(
      new Set(
        modalityRecords
          .map((item) => item.activityCategory)
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      )
    )

    const resolvedActivityCategories =
      activeActivityCategories.length > 0
        ? activeActivityCategories
        : availableActivityCategories

    activityCategories = resolvedActivityCategories.map((value) => ({
      value,
      label: formatActivityCategory(value),
    }))
  }

  return (
    <CadastroPageClient
      tenant={{
        kind: tenant.kind,
        tenantSlug: tenant.tenantSlug ?? null,
        tenantName: tenant.tenantName ?? null,
      }}
      branding={branding}
      modalities={modalities}
      activityCategories={activityCategories}
    />
  )
}
