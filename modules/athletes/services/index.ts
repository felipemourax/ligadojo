import type {
  AthletesDashboardData,
  RankingAcademyProfile,
  RankingDirectoryData,
} from "@/apps/api/src/modules/athletes/domain/athletes"
import { fetchJson } from "@/lib/api/client"

export function fetchAthletesDashboard() {
  return fetchJson<AthletesDashboardData>("/api/athletes")
}

export function addAthleteTitle(athleteId: string, payload: {
  placement: "gold" | "silver" | "bronze" | "champion" | "runner_up"
  competition: string
  year: number
}) {
  return fetchJson<{ data: AthletesDashboardData; message: string }>(
    `/api/athletes/${encodeURIComponent(athleteId)}/titles`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export function removeAthleteTitle(athleteId: string, titleId: string) {
  return fetchJson<{ data: AthletesDashboardData; message: string }>(
    `/api/athletes/${encodeURIComponent(athleteId)}/titles/${titleId}`,
    {
      method: "DELETE",
    }
  )
}

export function fetchRankingDirectory(params: {
  search?: string
  state?: string
  modality?: string
} = {}) {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set("search", params.search)
  if (params.state) searchParams.set("state", params.state)
  if (params.modality) searchParams.set("modality", params.modality)

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<{ data: RankingDirectoryData }>(`/api/ranking${suffix}`)
}

export function fetchRankingAcademyProfile(academySlug: string) {
  return fetchJson<{ data: RankingAcademyProfile }>(
    `/api/ranking/academies/${encodeURIComponent(academySlug)}`
  )
}
