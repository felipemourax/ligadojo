import { ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { TeacherAppEventsService } from "@/apps/api/src/modules/app/services/teacher-app-events.service"

const service = new TeacherAppEventsService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response
  const data = await service.getData({
    tenantId: access.tenant.id,
    userId: access.auth.user!.id,
  })
  return ok({ data })
}
