import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { GraduationDashboardService } from "@/apps/api/src/modules/graduations/services/graduation-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const graduationDashboardService = new GraduationDashboardService()

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ examId: string; studentActivityId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.GRADUATIONS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { examId, studentActivityId } = await context.params

  try {
    const dashboard = await graduationDashboardService.removeCandidateFromExam({
      tenantId: access.tenant.id,
      examId,
      studentActivityId,
    })

    return ok({ dashboard, message: "Candidato removido do exame." })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível remover o candidato.")
  }
}
