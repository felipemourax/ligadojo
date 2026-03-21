import { fetchJson } from "@/lib/api/client"
import type { TenantSiteEntity } from "@/apps/api/src/modules/site/domain/site"

interface SiteResponse {
  site: TenantSiteEntity
  message?: string
}

export async function fetchSite() {
  return fetchJson<TenantSiteEntity>("/api/site")
}

export async function saveSite(config: TenantSiteEntity["config"]) {
  return fetchJson<SiteResponse>("/api/site", {
    method: "PUT",
    body: JSON.stringify({ config }),
  })
}

export async function publishSite() {
  return fetchJson<SiteResponse>("/api/site/publish", {
    method: "POST",
  })
}

export async function unpublishSite() {
  return fetchJson<SiteResponse>("/api/site/unpublish", {
    method: "POST",
  })
}
