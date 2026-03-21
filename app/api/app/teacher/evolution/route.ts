import { ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { TeacherAppEvolutionService } from "@/apps/api/src/modules/app/services/teacher-app-evolution.service"

const service = new TeacherAppEvolutionService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response
  const data = await service.getData({
    tenantId: access.tenant.id,
    userId: access.auth.user!.id,
  })
  return ok({ data })
}
