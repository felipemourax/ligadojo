import { ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { MarketingAcademyActivitiesService } from "@/apps/api/src/modules/marketing/services/marketing-academy-activities.service"
import { capabilities } from "@/lib/capabilities"

const marketingAcademyActivitiesService = new MarketingAcademyActivitiesService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.MARKETING_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const result = await marketingAcademyActivitiesService.listForTenant(access.tenant.id)
  return ok(result)
}
