import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import {
  InvalidEnrollStudentEventInputError,
  parseEnrollStudentEventInput,
} from "@/apps/api/src/modules/events/contracts/enroll-student-event.parser"
import { StudentAppEventsService } from "@/apps/api/src/modules/app/services/student-app-events.service"

const service = new StudentAppEventsService()

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
    return badRequest("Informe um payload válido para realizar a inscrição.")
  }

  try {
    const result = await service.enroll({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      ...parseEnrollStudentEventInput(body as Record<string, unknown>),
    })

    return ok(result)
  } catch (error) {
    if (error instanceof InvalidEnrollStudentEventInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Não foi possível realizar a inscrição."
    )
  }
}
