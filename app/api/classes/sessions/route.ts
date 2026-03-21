import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import {
  InvalidUpdateAttendanceSessionInputError,
  parseUpdateAttendanceSessionInput,
} from "@/apps/api/src/modules/attendance/contracts/update-attendance-session.parser"
import { AttendanceDashboardService } from "@/apps/api/src/modules/attendance/services/attendance-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const attendanceDashboardService = new AttendanceDashboardService()

export async function PUT(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.ATTENDANCE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  if (!access.auth.user) {
    return badRequest("Usuário autenticado não encontrado para atualizar a aula.")
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload válido para atualizar a aula.")
  }

  try {
    const session = await attendanceDashboardService.updateSession({
      tenantId: access.tenant.id,
      sessionId: "new",
      payload: parseUpdateAttendanceSessionInput(body as Record<string, unknown>),
    })

    return ok({
      session,
      message: "Aula atualizada com sucesso.",
    })
  } catch (error) {
    if (error instanceof InvalidUpdateAttendanceSessionInputError) {
      return badRequest(error.message)
    }

    return badRequest(error instanceof Error ? error.message : "Não foi possível atualizar a aula.")
  }
}
