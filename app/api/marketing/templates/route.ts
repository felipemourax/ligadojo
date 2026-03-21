import { ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { MarketingTemplatesService } from "@/apps/api/src/modules/marketing/services/marketing-templates.service"
import { capabilities } from "@/lib/capabilities"

const marketingTemplatesService = new MarketingTemplatesService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.MARKETING_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const result = await marketingTemplatesService.listForTenant(access.tenant.id)
  return ok(result)
}
