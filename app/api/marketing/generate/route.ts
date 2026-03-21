import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { MarketingGenerationService } from "@/apps/api/src/modules/marketing/services/marketing-generation.service"
import { capabilities } from "@/lib/capabilities"

const marketingGenerationService = new MarketingGenerationService()

export async function POST(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.MARKETING_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object" || !("input" in body)) {
    return badRequest("Informe um payload valido para criar o conteudo.")
  }

  try {
    const result = await marketingGenerationService.generate({
      tenantId: access.tenant.id,
      generationInput: body.input,
    })

    return ok({
      generation: result,
      message: "Conteudo criado com sucesso.",
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Nao foi possivel criar o conteudo."
    )
  }
}
