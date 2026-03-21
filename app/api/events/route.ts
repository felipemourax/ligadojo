import { badRequest, created, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import {
  InvalidCreateEventInputError,
  parseCreateEventInput,
} from "@/apps/api/src/modules/events/contracts/create-event.parser"
import { EventDashboardService } from "@/apps/api/src/modules/events/services/event-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const eventDashboardService = new EventDashboardService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.EVENTS_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const dashboard = await eventDashboardService.getDashboardData(access.tenant.id)
  return ok({ dashboard })
}

export async function POST(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.EVENTS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const payload = await request.json().catch(() => null)
  if (!payload || typeof payload !== "object") {
    return badRequest("Informe um payload válido para criar o evento.")
  }

  try {
    const input = parseCreateEventInput(payload as Record<string, unknown>)
    const event = await eventDashboardService.createEvent({
      tenantId: access.tenant.id,
      ...input,
    })

    const dashboard = await eventDashboardService.getDashboardData(access.tenant.id)
    return created({ dashboard, message: "Evento criado com sucesso.", createdEventId: event.id })
  } catch (error) {
    if (error instanceof InvalidCreateEventInputError) {
      return badRequest(error.message)
    }

    return badRequest(error instanceof Error ? error.message : "Não foi possível criar o evento.")
  }
}
