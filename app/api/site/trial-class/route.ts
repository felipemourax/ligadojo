import { headers } from "next/headers"
import { badRequest, created, notFound } from "@/app/api/_lib/http"
import { LeadService } from "@/apps/api/src/modules/crm/services/lead.service"
import { SitePublicService } from "@/apps/api/src/modules/site/services/site-public.service"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"

const leadService = new LeadService()
const sitePublicService = new SitePublicService()

export async function POST(request: Request) {
  const requestHeaders = await headers()
  const tenantContext = resolveTenantFromHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  )

  if (tenantContext.kind !== "tenant" || !tenantContext.tenantSlug) {
    return notFound("Tenant não encontrado para este host.")
  }

  const view = await sitePublicService.getPublishedByTenantSlug(tenantContext.tenantSlug)
  if (!view) {
    return notFound("Site não publicado para este tenant.")
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe os dados da aula experimental.")
  }

  const name = typeof body.name === "string" ? body.name : ""
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp : ""
  const email = typeof body.email === "string" ? body.email : null
  const modalityId =
    typeof body.modalityId === "string" && body.modalityId.trim() ? body.modalityId : null
  const notes = typeof body.notes === "string" ? body.notes : null
  const consent = body.consent === true

  if (!consent) {
    return badRequest("Você precisa aceitar o envio dos dados para solicitar a aula experimental.")
  }

  try {
    const lead = await leadService.create({
      tenantId: view.tenant.id,
      modalityId,
      name,
      email,
      phone: whatsapp,
      source: "website",
      interestLabel:
        view.modalities.find((item) => item.id === modalityId)?.name ??
        "Aula experimental",
      notes,
      sourceContext: `site:${view.site.config.templateId}:trial_class`,
      consentAcceptedAt: new Date().toISOString(),
    })

    return created({
      lead,
      message: "Aula experimental solicitada com sucesso.",
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível solicitar a aula experimental."
    )
  }
}
