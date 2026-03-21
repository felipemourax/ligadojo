import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import {
  InvalidAddTeacherAppGraduationCandidateInputError,
  parseAddTeacherAppGraduationCandidateInput,
} from "@/apps/api/src/modules/app/contracts/add-teacher-app-graduation-candidate.parser"
import { TeacherAppEvolutionService } from "@/apps/api/src/modules/app/services/teacher-app-evolution.service"

const service = new TeacherAppEvolutionService()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response

  const { examId } = await params
  const payload = await request.json().catch(() => null)

  if (!examId || !payload || typeof payload !== "object") {
    return badRequest("Informe um exame e um aluno válidos.")
  }

  try {
    const input = parseAddTeacherAppGraduationCandidateInput(
      payload as Record<string, unknown>
    )
    const result = await service.addStudentToScheduledExam({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      examId,
      studentActivityId: input.studentActivityId,
    })

    return ok(result)
  } catch (error) {
    if (error instanceof InvalidAddTeacherAppGraduationCandidateInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Não foi possível incluir o aluno no exame."
    )
  }
}
