import { ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import type {
  TeacherDashboardRecord,
  TeacherGraduationCatalogItem,
} from "@/apps/api/src/modules/teachers/domain/teacher-dashboard"
import { TeacherDashboardService } from "@/apps/api/src/modules/teachers/services/teacher-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const teacherDashboardService = new TeacherDashboardService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.TEACHERS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const [teachers, graduationCatalog] = await Promise.all([
    teacherDashboardService.listForTenant(access.tenant.id),
    teacherDashboardService.listGraduationCatalog(access.tenant.id),
  ])

  return ok<{ teachers: TeacherDashboardRecord[]; graduationCatalog: TeacherGraduationCatalogItem[] }>({
    teachers,
    graduationCatalog,
  })
}
