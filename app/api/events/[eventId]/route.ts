import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import {
  InvalidUpdateEventInputError,
  parseUpdateEventInput,
} from "@/apps/api/src/modules/events/contracts/update-event.parser"
import { EventDashboardService } from "@/apps/api/src/modules/events/services/event-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const eventDashboardService = new EventDashboardService()

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
    return badRequest("Informe um evento válido para atualização.")
  }

  try {
    const input = parseUpdateEventInput(payload as Record<string, unknown>)
    await eventDashboardService.updateEvent({
      tenantId: access.tenant.id,
      eventId,
      ...input,
    })

    const dashboard = await eventDashboardService.getDashboardData(access.tenant.id)
    return ok({ dashboard, message: "Evento atualizado com sucesso." })
  } catch (error) {
    if (error instanceof InvalidUpdateEventInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Não foi possível atualizar o evento."
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.EVENTS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { eventId } = await params

  if (!eventId) {
    return badRequest("Informe um evento válido para exclusão.")
  }

  try {
    await eventDashboardService.deleteEvent({
      tenantId: access.tenant.id,
      eventId,
    })

    const dashboard = await eventDashboardService.getDashboardData(access.tenant.id)
    return ok({ dashboard, message: "Evento excluído com sucesso." })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível excluir o evento."
    )
  }
}
