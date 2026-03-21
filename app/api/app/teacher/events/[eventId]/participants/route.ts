import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import {
  InvalidAddEventParticipantInputError,
  parseAddEventParticipantInput,
} from "@/apps/api/src/modules/events/contracts/add-event-participant.parser"
import { TeacherAppEventsService } from "@/apps/api/src/modules/app/services/teacher-app-events.service"

const service = new TeacherAppEventsService()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response

  const { eventId } = await params
  const payload = await request.json().catch(() => null)

  if (!eventId || !payload || typeof payload !== "object") {
    return badRequest("Informe um evento e um participante válidos.")
  }

  try {
    const input = parseAddEventParticipantInput(payload as Record<string, unknown>)
    const result = await service.addParticipant({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      eventId,
      participantUserId: input.userId,
    })

    return ok(result)
  } catch (error) {
    if (error instanceof InvalidAddEventParticipantInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Não foi possível adicionar o participante."
    )
  }
}
