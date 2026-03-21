import { badRequest, created, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { parseStudentUpsertPayload } from "@/apps/api/src/modules/students/contracts/student-upsert.parser"
import { StudentDashboardService } from "@/apps/api/src/modules/students/services/student-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const studentDashboardService = new StudentDashboardService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.STUDENTS_READ,
  })

  if (!access.ok) {
    return access.response
  }

  return ok(
    await studentDashboardService.listForActor({
      tenantId: access.tenant.id,
      actorUserId: access.auth.user?.id,
      actorRole: access.membership.role,
    })
  )
}

export async function POST(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.STUDENTS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

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
    const studentId = await studentDashboardService.upsert({
      tenantId: access.tenant.id,
      ...body,
    })

    return created({
      student: await studentDashboardService.findForTenant(access.tenant.id, studentId),
      message: "Aluno cadastrado com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível cadastrar o aluno.")
  }
}
