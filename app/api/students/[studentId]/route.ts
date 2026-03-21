import { badRequest, notFound, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { parseStudentUpsertPayload } from "@/apps/api/src/modules/students/contracts/student-upsert.parser"
import { StudentDashboardService } from "@/apps/api/src/modules/students/services/student-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const studentDashboardService = new StudentDashboardService()

export async function GET(
  _request: Request,
  context: { params: Promise<{ studentId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.STUDENTS_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const { studentId } = await context.params
  const student = await studentDashboardService.findForActor({
    tenantId: access.tenant.id,
    studentId,
    actorUserId: access.auth.user?.id,
    actorRole: access.membership.role,
  })
  if (!student) {
    return notFound("Aluno não encontrado.")
  }

  return ok({ student })
}

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
  if (!payload || typeof payload !== "object") {
    return badRequest("Corpo da requisição inválido.")
  }

  const body = parseStudentUpsertPayload(payload)
  const practiceAssignments = body.practiceAssignments ?? []
  if (!body.name.trim() || !body.email.trim()) {
    return badRequest("Informe nome e e-mail do aluno.")
  }

  if (
    practiceAssignments.length === 0 ||
    practiceAssignments.some((item) => !item.activityCategory)
  ) {
    return badRequest("Informe ao menos uma atividade principal válida para o aluno.")
  }

  try {
    const updatedId = await studentDashboardService.upsert({
      tenantId: access.tenant.id,
      studentId,
      ...body,
    })

    return ok({
      student: await studentDashboardService.findForTenant(access.tenant.id, updatedId),
      message: "Aluno atualizado com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível atualizar o aluno.")
  }
}
