import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { StudentDashboardService } from "@/apps/api/src/modules/students/services/student-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const studentDashboardService = new StudentDashboardService()

export async function PATCH(
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
  const payload = await request.json().catch(() => null)
  const status = payload?.status

  if (!["active", "inactive", "suspended"].includes(status)) {
    return badRequest("Informe um status válido para o aluno.")
  }

  try {
    const updatedId = await studentDashboardService.updateStatus({
      tenantId: access.tenant.id,
      studentId,
      status,
    })

    return ok({
      student: await studentDashboardService.findForTenant(access.tenant.id, updatedId),
      message: "Status do aluno atualizado com sucesso.",
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível atualizar o status do aluno."
    )
  }
}
