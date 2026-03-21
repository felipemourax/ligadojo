import { badRequest, created } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { parseAddGraduationExamCandidateInput } from "@/apps/api/src/modules/graduations/contracts/add-graduation-exam-candidate.parser"
import { GraduationDashboardService } from "@/apps/api/src/modules/graduations/services/graduation-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const graduationDashboardService = new GraduationDashboardService()

export async function POST(
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
    const input = parseAddGraduationExamCandidateInput(await req.json().catch(() => null))
    const dashboard = await graduationDashboardService.addCandidateToExam({
      tenantId: access.tenant.id,
      examId,
      studentActivityId: input.studentActivityId,
    })

    return created({ dashboard, message: "Aluno adicionado ao exame." })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível adicionar o aluno ao exame.")
  }
}
