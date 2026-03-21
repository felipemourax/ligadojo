import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { TeacherAppEvolutionService } from "@/apps/api/src/modules/app/services/teacher-app-evolution.service"

const service = new TeacherAppEvolutionService()

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ studentActivityId: string }> }
) {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response

  const { studentActivityId } = await params

  if (!studentActivityId) {
    return badRequest("Informe a atividade do aluno para marcar aptidão.")
  }

  try {
    const result = await service.markStudentAsEligible({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      studentActivityId,
    })

    return ok(result)
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível marcar o aluno como apto."
    )
  }
}
