import { badRequest, notFound, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { CrmDashboardService } from "@/apps/api/src/modules/crm/services/crm-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const crmDashboardService = new CrmDashboardService()

export async function PATCH(
  request: Request,
  context: { params: Promise<{ leadId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.CRM_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { leadId } = await context.params
  const body = await request.json().catch(() => null)
  const status = typeof body?.status === "string" ? body.status : ""

  if (
    ![
      "new",
      "contacted",
      "trial_scheduled",
      "trial_completed",
      "negotiating",
      "converted",
      "lost",
    ].includes(status)
  ) {
    return badRequest("Informe um status válido para o lead.")
  }

  const lead = await crmDashboardService.updateLeadStatus({
    tenantId: access.tenant.id,
    leadId,
    status: status as
      | "new"
      | "contacted"
      | "trial_scheduled"
      | "trial_completed"
      | "negotiating"
      | "converted"
      | "lost",
  })

  if (!lead) {
    return notFound("Lead não encontrado para este tenant.")
  }

  return ok({
    lead,
    message: "Status do lead atualizado com sucesso.",
  })
}
