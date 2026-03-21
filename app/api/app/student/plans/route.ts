import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import {
  InvalidActivateStudentPlanInputError,
  parseActivateStudentPlanInput,
} from "@/apps/api/src/modules/app/contracts/activate-student-plan.parser"
import { StudentAppPlansService } from "@/apps/api/src/modules/app/services/student-app-plans.service"

const service = new StudentAppPlansService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  const data = await service.getData({
    tenantId: access.tenant.id,
    userId: access.auth.user!.id,
  })

  return ok({ data })
}

export async function POST(request: Request) {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload válido para ativar o plano.")
  }

  try {
    const result = await service.activatePlan({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      ...parseActivateStudentPlanInput(body as Record<string, unknown>),
    })

    return ok({
      data: result.data,
      message: result.message,
    })
  } catch (error) {
    if (error instanceof InvalidActivateStudentPlanInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Não foi possível ativar o plano."
    )
  }
}
