import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { MarketingBrandKitService } from "@/apps/api/src/modules/marketing/services/marketing-brand-kit.service"
import { capabilities } from "@/lib/capabilities"

const marketingBrandKitService = new MarketingBrandKitService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.MARKETING_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const result = await marketingBrandKitService.getForTenant(access.tenant.id)
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
  if (!body || typeof body !== "object" || !("config" in body)) {
    return badRequest("Informe uma configuração válida de identidade visual.")
  }

  try {
    const result = await marketingBrandKitService.save({
      tenantId: access.tenant.id,
      config: body.config,
    })

    return ok({
      brandKit: result,
      message: "Identidade visual atualizada com sucesso.",
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível salvar a identidade visual."
    )
  }
}
