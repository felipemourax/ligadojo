import { ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { StudentAppNavigationIndicatorsService } from "@/apps/api/src/modules/app/services/student-app-navigation-indicators.service"

const service = new StudentAppNavigationIndicatorsService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  const data = await service.getData({
    tenantId: access.tenant.id,
    userId: access.auth.user!.id,
  })

  return ok({ data })
}
