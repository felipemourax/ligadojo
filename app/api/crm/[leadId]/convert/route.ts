import { badRequest, conflict, notFound, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { CrmDashboardService } from "@/apps/api/src/modules/crm/services/crm-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const crmDashboardService = new CrmDashboardService()

export async function POST(
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
  if (!body || typeof body !== "object") {
    return badRequest("Informe os dados para cadastrar o aluno.")
  }

  const email = typeof body.email === "string" ? body.email : ""
  const modalityId = typeof body.modalityId === "string" ? body.modalityId : ""
  const birthDate = typeof body.birthDate === "string" ? body.birthDate : null
  const address = typeof body.address === "string" ? body.address : null
  const emergencyContact = typeof body.emergencyContact === "string" ? body.emergencyContact : null
  const notes = typeof body.notes === "string" ? body.notes : null
  const planId = typeof body.planId === "string" && body.planId ? body.planId : null

  if (!email.trim() || !modalityId.trim()) {
    return badRequest("Informe e-mail e modalidade para cadastrar o aluno.")
  }

  try {
    const result = await crmDashboardService.convertLeadToStudent({
      tenantId: access.tenant.id,
      leadId,
      email,
      modalityId,
      birthDate,
      address,
      emergencyContact,
      notes,
      planId,
    })

    if (!result.lead || !result.student) {
      return notFound("Não foi possível concluir a conversão do lead.")
    }

    return ok({
      lead: result.lead,
      student: result.student,
      message: "Lead convertido em aluno com sucesso.",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível converter o lead."
    if (message.includes("Já existe um aluno cadastrado")) {
      return conflict(message)
    }
    if (message.includes("Lead não encontrado")) {
      return notFound(message)
    }
    return badRequest(message)
  }
}
