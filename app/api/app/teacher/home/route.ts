import { ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { TeacherAppHomeService } from "@/apps/api/src/modules/app/services/teacher-app-home.service"

const service = new TeacherAppHomeService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response
  const userId = access.auth.user!.id
  const data = await service.getData({ tenantId: access.tenant.id, userId })
  return ok({ data })
}
