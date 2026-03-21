import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { AthletesDashboardService } from "@/apps/api/src/modules/athletes/services/athletes-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const service = new AthletesDashboardService()

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ athleteId: string; titleId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.ATHLETES_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  try {
    const { athleteId, titleId } = await context.params
    const data = await service.removeTitle({
      tenantId: access.tenant.id,
      athleteId,
      titleId,
    })

    return ok({
      data,
      message: "Título removido com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível remover o título.")
  }
}
