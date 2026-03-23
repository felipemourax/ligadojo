import type {
  PlatformAcademyDetail,
  PlatformAcademyListItem,
  PlatformOverviewData,
} from "@/apps/api/src/modules/platform/domain/platform-admin"
import { fetchJson } from "@/lib/api/client"

export async function fetchPlatformOverview() {
  return fetchJson<PlatformOverviewData>("/api/platform/overview")
}

export async function fetchPlatformAcademies(input?: { query?: string; status?: string }) {
  const params = new URLSearchParams()

  if (input?.query) {
    params.set("query", input.query)
  }

  if (input?.status && input.status !== "all") {
    params.set("status", input.status)
  }

  const query = params.toString()
  return fetchJson<PlatformAcademyListItem[]>(`/api/platform/academies${query ? `?${query}` : ""}`)
}

export async function fetchPlatformAcademyDetail(slug: string) {
  return fetchJson<PlatformAcademyDetail>(`/api/platform/academies/${slug}`)
}

export async function updatePlatformAcademyStatus(
  slug: string,
  action: "approve" | "suspend" | "cancel"
) {
  return fetchJson<{ academy: PlatformAcademyDetail; message: string }>(
    `/api/platform/academies/${slug}`,
    {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }
  )
}
