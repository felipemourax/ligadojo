import { badRequest, created } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { parseRegisterStudentGraduationInput } from "@/apps/api/src/modules/graduations/contracts/register-student-graduation.parser"
import { GraduationDashboardService } from "@/apps/api/src/modules/graduations/services/graduation-dashboard.service"
import { StudentDashboardService } from "@/apps/api/src/modules/students/services/student-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const graduationDashboardService = new GraduationDashboardService()
const studentDashboardService = new StudentDashboardService()

export async function POST(
  request: Request,
  context: { params: Promise<{ studentId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.STUDENTS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { studentId } = await context.params

  try {
    const payload = parseRegisterStudentGraduationInput(await request.json().catch(() => null))

    const updatedId = await graduationDashboardService.registerStudentGraduation({
      tenantId: access.tenant.id,
      studentId,
      payload,
    })

    return created({
      student: await studentDashboardService.findForTenant(access.tenant.id, updatedId),
      message: "Graduação registrada com sucesso.",
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível registrar a graduação."
    )
  }
}
