import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { SitePublicPage } from "@/modules/site"
import { SitePublicService } from "@/apps/api/src/modules/site/services/site-public.service"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"

const sitePublicService = new SitePublicService()

export default async function PublicTenantSitePage() {
  const requestHeaders = await headers()
  const tenantContext = resolveTenantFromHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  )

  if (tenantContext.kind !== "tenant" || !tenantContext.tenantSlug) {
    notFound()
  }

  const view = await sitePublicService.getPublishedByTenantSlug(tenantContext.tenantSlug)
  if (!view) {
    notFound()
  }

  return <SitePublicPage view={view} />
}
