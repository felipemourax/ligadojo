import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { parseCreateAthleteTitleInput } from "@/apps/api/src/modules/athletes/contracts/create-athlete-title.parser"
import { AthletesDashboardService } from "@/apps/api/src/modules/athletes/services/athletes-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const service = new AthletesDashboardService()

export async function POST(
  request: Request,
  context: { params: Promise<{ athleteId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.ATHLETES_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  try {
    const { athleteId } = await context.params
    const payload = parseCreateAthleteTitleInput(await request.json().catch(() => null))
    const data = await service.addTitle({
      tenantId: access.tenant.id,
      athleteId,
      payload,
    })

    return ok({
      data,
      message: "Título adicionado com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível adicionar o título.")
  }
}
