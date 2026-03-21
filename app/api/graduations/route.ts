import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { parseReplaceGraduationTracksInput } from "@/apps/api/src/modules/graduations/contracts/replace-graduation-tracks.parser"
import { GraduationDashboardService } from "@/apps/api/src/modules/graduations/services/graduation-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const graduationDashboardService = new GraduationDashboardService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.GRADUATIONS_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const dashboard = await graduationDashboardService.getDashboardData(access.tenant.id)
  return ok({ dashboard })
}

export async function PUT(req: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.GRADUATIONS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  try {
    const input = parseReplaceGraduationTracksInput(await req.json().catch(() => null))
    const dashboard = await graduationDashboardService.replaceTracks({
      tenantId: access.tenant.id,
      tracks: input.tracks,
    })
    return ok({ dashboard, message: "Sistema de faixas atualizado." })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível atualizar as trilhas.")
  }
}
