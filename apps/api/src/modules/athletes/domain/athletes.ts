import { formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"

export type AthleteKind = "student" | "teacher"
export type AthleteTitlePlacement = "gold" | "silver" | "bronze" | "champion" | "runner_up"

export interface AthleteTitleItem {
  id: string
  placement: AthleteTitlePlacement | null
  title: string
  competition: string
  year: number
}

export interface AthleteDirectoryItem {
  id: string
  kind: AthleteKind
  tenantId: string
  profileId: string
  name: string
  belt: string
  primaryActivityLabel: string
  activityLabels: string[]
  roleLabel: "Aluno" | "Professor"
  titles: AthleteTitleItem[]
}

export interface AthletesDashboardRecord {
  id: string
  kind: AthleteKind
  name: string
  belt: string
  primaryActivityLabel: string
  activityLabels: string[]
  roleLabel: "Aluno" | "Professor"
  titles: AthleteTitleItem[]
  totalTitles: number
}

export interface AthletesDashboardData {
  tenantId: string
  athletes: AthletesDashboardRecord[]
  stats: {
    totalAthletes: number
    totalTitles: number
    averageTitlesPerAthlete: number
  }
  topAthletes: Array<{
    athleteId: string
    name: string
    belt: string
    primaryActivityLabel: string
    totalTitles: number
  }>
  filters: {
    belts: string[]
    activities: string[]
  }
}

export interface RankingAcademySummary {
  id: string
  slug: string
  name: string
  city: string | null
  state: string | null
  logoUrl: string | null
  primaryColor: string | null
  modalityLabels: string[]
  totalAthletes: number
  totalTitles: number
}

export interface RankingAcademyProfile {
  id: string
  slug: string
  name: string
  city: string | null
  state: string | null
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
  primaryColor: string | null
  websiteUrl: string | null
  phone: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  modalityLabels: string[]
  totalAthletes: number
  totalTitles: number
  athletes: Array<{
    id: string
    name: string
    belt: string
    titles: AthleteTitleItem[]
  }>
}

export interface RankingDirectoryData {
  highlights: RankingAcademySummary[]
  results: RankingAcademySummary[]
  states: string[]
}

export interface AppProfileTitlesData {
  athleteId: string
  athleteName: string
  belt: string
  primaryActivityLabel: string
  titles: AthleteTitleItem[]
}

export function buildAthleteId(input: { kind: AthleteKind; profileId: string }) {
  return `${input.kind}:${input.profileId}`
}

export function parseAthleteId(value: string): { kind: AthleteKind; profileId: string } {
  const [kind, ...rest] = value.split(":")
  const profileId = rest.join(":").trim()

  if ((kind !== "student" && kind !== "teacher") || !profileId) {
    throw new Error("Atleta inválido.")
  }

  return {
    kind,
    profileId,
  }
}

export function normalizeActivityLabels(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  )
}

export function formatActivityLabel(value: string | null | undefined) {
  if (!value) {
    return "Atividade principal"
  }

  return formatActivityCategory(value)
}

export function normalizeUrl(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function athleteTitlePlacementToLabel(value: AthleteTitlePlacement) {
  switch (value) {
    case "gold":
      return "Ouro"
    case "silver":
      return "Prata"
    case "bronze":
      return "Bronze"
    case "champion":
      return "Campeão"
    case "runner_up":
      return "Vice-Campeão"
  }
}

export function athleteTitlePlacementToPersistence(value: AthleteTitlePlacement) {
  switch (value) {
    case "gold":
      return "GOLD"
    case "silver":
      return "SILVER"
    case "bronze":
      return "BRONZE"
    case "champion":
      return "CHAMPION"
    case "runner_up":
      return "RUNNER_UP"
  }
}

export function athleteTitlePlacementFromPersistence(value: string | null | undefined): AthleteTitlePlacement | null {
  switch (value) {
    case "GOLD":
      return "gold"
    case "SILVER":
      return "silver"
    case "BRONZE":
      return "bronze"
    case "CHAMPION":
      return "champion"
    case "RUNNER_UP":
      return "runner_up"
    default:
      return null
  }
}

export function inferAthleteTitlePlacementFromTitle(value: string | null | undefined): AthleteTitlePlacement | null {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) {
    return null
  }

  if (normalized === "ouro") return "gold"
  if (normalized === "prata") return "silver"
  if (normalized === "bronze") return "bronze"
  if (normalized === "campeão" || normalized === "campeao") return "champion"
  if (normalized === "vice-campeão" || normalized === "vice-campeao") return "runner_up"
  return null
}
