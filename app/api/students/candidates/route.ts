import { ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { StudentCandidateService } from "@/apps/api/src/modules/students/services/student-candidate.service"
import { capabilities } from "@/lib/capabilities"

const studentCandidateService = new StudentCandidateService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.STUDENTS_READ,
  })

  if (!access.ok) {
    return access.response
  }

  return ok(
    await studentCandidateService.listForActor({
      tenantId: access.tenant.id,
      actorUserId: access.auth.user?.id,
      actorRole: access.membership.role,
    })
  )
}
