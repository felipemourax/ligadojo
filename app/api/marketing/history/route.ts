import { ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { MarketingGenerationService } from "@/apps/api/src/modules/marketing/services/marketing-generation.service"
import { capabilities } from "@/lib/capabilities"

const marketingGenerationService = new MarketingGenerationService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.MARKETING_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const result = await marketingGenerationService.listForTenant(access.tenant.id)
  return ok(result)
}
