import { ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { TeacherDashboardService } from "@/apps/api/src/modules/teachers/services/teacher-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const teacherDashboardService = new TeacherDashboardService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.ENROLLMENT_REVIEW,
  })

  if (!access.ok) {
    return access.response
  }

  const count = await teacherDashboardService.countPendingApprovals(access.tenant.id)

  return ok({
    count,
  })
}
