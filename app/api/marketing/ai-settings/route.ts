import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { MarketingAiSettingsService } from "@/apps/api/src/modules/marketing/services/marketing-ai-settings.service"
import { capabilities } from "@/lib/capabilities"

const marketingAiSettingsService = new MarketingAiSettingsService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.MARKETING_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const result = await marketingAiSettingsService.getForTenant(access.tenant.id)
  return ok(result)
}

export async function PUT(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.MARKETING_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object" || !("settings" in body)) {
    return badRequest("Informe uma configuracao valida de IA.")
  }

  try {
    const result = await marketingAiSettingsService.save({
      tenantId: access.tenant.id,
      settings: body.settings as never,
    })

    return ok({
      settings: result,
      message: "Configuracoes de IA atualizadas com sucesso.",
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Nao foi possivel salvar as configuracoes de IA."
    )
  }
}
