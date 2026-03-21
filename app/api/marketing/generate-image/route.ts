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
  const generationId = body && typeof body === "object" && "generationId" in body ? body.generationId : null

  if (typeof generationId !== "string" || generationId.length === 0) {
    return badRequest("Informe uma peca valida para gerar a imagem.")
  }

  try {
    const generation = await marketingGenerationService.generateImage({
      tenantId: access.tenant.id,
      generationId,
    })

    return ok({
      generation,
      message: "Imagem gerada com sucesso.",
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Nao foi possivel gerar a imagem."
    )
  }
}
