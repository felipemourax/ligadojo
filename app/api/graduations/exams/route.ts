import { badRequest, created } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { parseCreateGraduationExamInput } from "@/apps/api/src/modules/graduations/contracts/create-graduation-exam.parser"
import { GraduationDashboardService } from "@/apps/api/src/modules/graduations/services/graduation-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const graduationDashboardService = new GraduationDashboardService()

export async function POST(req: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.GRADUATIONS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  try {
    const input = parseCreateGraduationExamInput(await req.json().catch(() => null))
    const dashboard = await graduationDashboardService.createExam({
      tenantId: access.tenant.id,
      ...input,
    })

    return created({ dashboard, message: "Exame agendado com sucesso." })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível agendar o exame.")
  }
}
