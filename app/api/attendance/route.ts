import { ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { AttendanceDashboardService } from "@/apps/api/src/modules/attendance/services/attendance-dashboard.service"
import type { AttendanceDashboardData } from "@/apps/api/src/modules/attendance/domain/attendance-dashboard"
import { capabilities } from "@/lib/capabilities"

const attendanceDashboardService = new AttendanceDashboardService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.ATTENDANCE_READ,
  })

  if (!access.ok) {
    return access.response
  }

  return ok<AttendanceDashboardData>(
    await attendanceDashboardService.getDashboardData(access.tenant.id)
  )
}
