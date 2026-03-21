import { ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { StudentAppProgressService } from "@/apps/api/src/modules/app/services/student-app-progress.service"

const service = new StudentAppProgressService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response
  const userId = access.auth.user!.id
  const data = await service.getData({ tenantId: access.tenant.id, userId })
  return ok({ data })
}
