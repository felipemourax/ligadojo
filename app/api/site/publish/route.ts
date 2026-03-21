import { ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { SiteBuilderService } from "@/apps/api/src/modules/site/services/site-builder.service"
import { capabilities } from "@/lib/capabilities"

const siteBuilderService = new SiteBuilderService()

export async function POST() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.SITE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const result = await siteBuilderService.publish(access.tenant.id)
  return ok({
    site: result,
    message: "Site publicado com sucesso.",
  })
}
