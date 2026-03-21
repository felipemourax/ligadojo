import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { PlanService } from "@/apps/api/src/modules/plans/services/plan.service"
import { capabilities } from "@/lib/capabilities"

const planService = new PlanService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.PLANS_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const plans = await planService.listForTenant(access.tenant.id)
  return ok(plans)
}

export async function PUT(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.PLANS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)

  if (!body || !Array.isArray(body.plans)) {
    return badRequest("Informe uma lista válida de planos.")
  }

  try {
    const result = await planService.replaceForTenant({
      tenantId: access.tenant.id,
      plans: body.plans,
    })

    return ok({
      ...result,
      message: result.message ?? "Planos atualizados com sucesso.",
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível salvar os planos."
    )
  }
}
