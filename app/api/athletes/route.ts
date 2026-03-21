import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { AthletesDashboardService } from "@/apps/api/src/modules/athletes/services/athletes-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const service = new AthletesDashboardService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.ATHLETES_READ,
  })

  if (!access.ok) {
    return access.response
  }

  return ok(await service.getData({ tenantId: access.tenant.id }))
}

export async function POST() {
  return badRequest("Use a rota do atleta para adicionar títulos.")
}
