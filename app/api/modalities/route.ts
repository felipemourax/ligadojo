import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { ModalityService } from "@/apps/api/src/modules/modalities/services/modality.service"
import { capabilities } from "@/lib/capabilities"

const modalityService = new ModalityService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.MODALITIES_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const result = await modalityService.listForTenant(access.tenant.id)
  return ok(result)
}

export async function PUT(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.MODALITIES_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)

  if (!body || !Array.isArray(body.modalities)) {
    return badRequest("Informe uma lista válida de modalidades.")
  }

  try {
    const result = await modalityService.replaceForTenant({
      tenantId: access.tenant.id,
      modalities: body.modalities,
      activityCategories: body.activityCategories,
    })

    return ok({
      modalities: result.modalities,
      activityCategories: result.activityCategories,
      message: result.message ?? "Modalidades atualizadas com sucesso.",
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível salvar as modalidades."
    )
  }
}
