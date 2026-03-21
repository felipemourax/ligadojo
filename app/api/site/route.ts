import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { SiteBuilderService } from "@/apps/api/src/modules/site/services/site-builder.service"
import { capabilities } from "@/lib/capabilities"

const siteBuilderService = new SiteBuilderService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.SITE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const result = await siteBuilderService.getForTenant(access.tenant.id)
  return ok(result)
}

export async function PUT(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.SITE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object" || !("config" in body)) {
    return badRequest("Informe uma configuração válida do site.")
  }

  try {
    const result = await siteBuilderService.saveDraft({
      tenantId: access.tenant.id,
      config: body.config,
    })

    return ok({
      site: result,
      message: "Configurações do site atualizadas com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível salvar o site.")
  }
}
