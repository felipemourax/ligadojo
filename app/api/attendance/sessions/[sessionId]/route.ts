import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import {
  InvalidUpdateAttendanceSessionInputError,
  parseUpdateAttendanceSessionInput,
} from "@/apps/api/src/modules/attendance/contracts/update-attendance-session.parser"
import { AttendanceDashboardService } from "@/apps/api/src/modules/attendance/services/attendance-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const attendanceDashboardService = new AttendanceDashboardService()

export async function PUT(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.ATTENDANCE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload válido para atualizar a chamada.")
  }

  const { sessionId } = await context.params

  try {
    const session = await attendanceDashboardService.updateSession({
      tenantId: access.tenant.id,
      sessionId: typeof sessionId === "string" && sessionId.trim().length > 0 ? sessionId.trim() : "new",
      payload: parseUpdateAttendanceSessionInput(body as Record<string, unknown>),
    })

    return ok({
      session,
      message: "Chamada atualizada com sucesso.",
    })
  } catch (error) {
    if (error instanceof InvalidUpdateAttendanceSessionInputError) {
      return badRequest(error.message)
    }

    return badRequest(error instanceof Error ? error.message : "Não foi possível atualizar a chamada.")
  }
}
