import { badRequest, created, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { CrmDashboardService } from "@/apps/api/src/modules/crm/services/crm-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const crmDashboardService = new CrmDashboardService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.CRM_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const result = await crmDashboardService.getDashboard(access.tenant.id)
  return ok(result)
}

export async function POST(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.CRM_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um lead válido.")
  }

  const name = typeof body.name === "string" ? body.name : ""
  const email = typeof body.email === "string" ? body.email : null
  const phone = typeof body.phone === "string" ? body.phone : ""
  const modalityId = typeof body.modalityId === "string" && body.modalityId ? body.modalityId : null
  const source = typeof body.source === "string" ? body.source : "Site"
  const notes = typeof body.notes === "string" ? body.notes : null

  try {
    const lead = await crmDashboardService.createLead({
      tenantId: access.tenant.id,
      name,
      email,
      phone,
      modalityId,
      source,
      notes,
    })

    return created({
      lead,
      message: "Lead cadastrado com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível cadastrar o lead.")
  }
}
