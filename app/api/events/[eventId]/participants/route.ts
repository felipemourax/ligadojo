import { badRequest, created, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import {
  InvalidAddEventParticipantInputError,
  parseAddEventParticipantInput,
} from "@/apps/api/src/modules/events/contracts/add-event-participant.parser"
import {
  InvalidUpdateEventParticipantInputError,
  parseUpdateEventParticipantInput,
} from "@/apps/api/src/modules/events/contracts/update-event-participant.parser"
import { EventDashboardService } from "@/apps/api/src/modules/events/services/event-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const eventDashboardService = new EventDashboardService()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.EVENTS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { eventId } = await params
  const payload = await request.json().catch(() => null)

  if (!eventId || !payload || typeof payload !== "object") {
    return badRequest("Informe o evento e o participante.")
  }

  try {
    const input = parseAddEventParticipantInput(payload as Record<string, unknown>)

    await eventDashboardService.addParticipant({
      tenantId: access.tenant.id,
      eventId,
      userId: input.userId,
      source: "admin",
    })

    const dashboard = await eventDashboardService.getDashboardData(access.tenant.id)
    return created({ dashboard, message: "Participante adicionado com sucesso." })
  } catch (error) {
    if (error instanceof InvalidAddEventParticipantInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Não foi possível adicionar o participante."
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.EVENTS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { eventId } = await params
  const url = new URL(request.url)
  const participantId = url.searchParams.get("participantId") ?? ""

  if (!eventId || !participantId) {
    return badRequest("Informe o participante a remover.")
  }

  try {
    await eventDashboardService.removeParticipant({
      tenantId: access.tenant.id,
      eventId,
      participantId,
    })

    const dashboard = await eventDashboardService.getDashboardData(access.tenant.id)
    return ok({ dashboard, message: "Participante removido do evento." })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível remover o participante."
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.EVENTS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { eventId } = await params
  const payload = await request.json().catch(() => null)

  if (!eventId || !payload || typeof payload !== "object") {
    return badRequest("Informe participante e status válidos.")
  }

  try {
    const input = parseUpdateEventParticipantInput(payload as Record<string, unknown>)

    if (input.mode === "registrations_state") {
      await eventDashboardService.updateRegistrationsState({
        tenantId: access.tenant.id,
        eventId,
        registrationsOpen: input.registrationsOpen,
      })

      const dashboard = await eventDashboardService.getDashboardData(access.tenant.id)
      return ok({
        dashboard,
        message: input.registrationsOpen ? "Inscrições abertas." : "Inscrições fechadas.",
      })
    }

    if (input.mode === "payment_confirmation") {
      await eventDashboardService.confirmParticipantPayment({
        tenantId: access.tenant.id,
        eventId,
        participantId: input.participantId,
        paymentMethod: input.paymentMethod,
      })

      const dashboard = await eventDashboardService.getDashboardData(access.tenant.id)
      return ok({ dashboard, message: "Pagamento registrado e participante confirmado." })
    }

    await eventDashboardService.updateParticipantStatus({
      tenantId: access.tenant.id,
      eventId,
      participantId: input.participantId,
      status: input.status,
    })

    const dashboard = await eventDashboardService.getDashboardData(access.tenant.id)
    return ok({ dashboard, message: "Status do participante atualizado." })
  } catch (error) {
    if (error instanceof InvalidUpdateEventParticipantInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Não foi possível atualizar o status."
    )
  }
}
