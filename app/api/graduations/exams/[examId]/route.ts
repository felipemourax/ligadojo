import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { parseUpdateGraduationExamStatusInput } from "@/apps/api/src/modules/graduations/contracts/update-graduation-exam-status.parser"
import { GraduationDashboardService } from "@/apps/api/src/modules/graduations/services/graduation-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const graduationDashboardService = new GraduationDashboardService()

export async function PATCH(
  req: Request,
  context: { params: Promise<{ examId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.GRADUATIONS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { examId } = await context.params

  try {
    const input = parseUpdateGraduationExamStatusInput(await req.json().catch(() => null))
    const dashboard = await graduationDashboardService.updateExamStatus({
      tenantId: access.tenant.id,
      examId,
      status: input.status,
    })

    return ok({ dashboard, message: "Status do exame atualizado." })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível atualizar o exame.")
  }
}
