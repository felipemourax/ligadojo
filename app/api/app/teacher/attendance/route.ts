import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { TeacherAppAttendanceService } from "@/apps/api/src/modules/app/services/teacher-app-attendance.service"
import { TeacherAppAttendanceMutationService } from "@/apps/api/src/modules/app/services/teacher-app-attendance-mutation.service"

const service = new TeacherAppAttendanceService()
const mutationService = new TeacherAppAttendanceMutationService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response
  const userId = access.auth.user!.id
  const data = await service.getData({ tenantId: access.tenant.id, userId })
  return ok({ data })
}

export async function PUT(request: Request) {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload válido para registrar a presença.")
  }

  try {
    const payload = body as Record<string, unknown>
    await mutationService.saveAttendance({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      classGroupId: String(payload.classGroupId ?? ""),
      sessionDate: String(payload.sessionDate ?? ""),
      weekday: Number(payload.weekday ?? 0),
      startTime: String(payload.startTime ?? ""),
      endTime: String(payload.endTime ?? ""),
      confirmedStudentIds: Array.isArray(payload.confirmedStudentIds) ? payload.confirmedStudentIds as string[] : [],
      confirmedStudentNames: Array.isArray(payload.confirmedStudentNames) ? payload.confirmedStudentNames as string[] : [],
      presentStudentIds: Array.isArray(payload.presentStudentIds) ? payload.presentStudentIds as string[] : [],
      absentStudentIds: Array.isArray(payload.absentStudentIds) ? payload.absentStudentIds as string[] : [],
      justifiedStudentIds: Array.isArray(payload.justifiedStudentIds) ? payload.justifiedStudentIds as string[] : [],
      isFinalized: Boolean(payload.isFinalized),
    })

    const data = await service.getData({ tenantId: access.tenant.id, userId: access.auth.user!.id })
    return ok({ data, message: "Presença atualizada com sucesso." })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível registrar a presença.")
  }
}
