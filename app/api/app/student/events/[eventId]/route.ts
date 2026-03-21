import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { StudentAppEventsService } from "@/apps/api/src/modules/app/services/student-app-events.service"

const service = new StudentAppEventsService()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  const { eventId } = await params
  const body = await request.json().catch(() => null)
  const status =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).status === "string"
      ? (body as Record<string, unknown>).status
      : ""

  if (
    !eventId ||
    (status !== "confirmed" && status !== "maybe" && status !== "declined")
  ) {
    return badRequest("Informe uma resposta válida para o evento.")
  }

  try {
    const result = await service.updateEnrollmentResponse({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      eventId,
      status,
    })

    return ok(result)
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível atualizar sua resposta."
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  const { eventId } = await params
  if (!eventId) {
    return badRequest("Informe um evento válido para cancelar a inscrição.")
  }

  try {
    const result = await service.cancelEnrollment({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      eventId,
    })

    return ok(result)
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível cancelar a inscrição."
    )
  }
}
