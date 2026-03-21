import type { CreateAthleteTitleInput } from "@/apps/api/src/modules/athletes/contracts/create-athlete-title.input"
import type { AthleteTitlePlacement } from "@/apps/api/src/modules/athletes/domain/athletes"

const athleteTitlePlacements: AthleteTitlePlacement[] = [
  "gold",
  "silver",
  "bronze",
  "champion",
  "runner_up",
]

export function parseCreateAthleteTitleInput(value: unknown): CreateAthleteTitleInput {
  if (!value || typeof value !== "object") {
    throw new Error("Corpo da requisição inválido.")
  }

  const payload = value as Record<string, unknown>
  const placement = typeof payload.placement === "string" ? payload.placement.trim().toLowerCase() : ""
  const competition = typeof payload.competition === "string" ? payload.competition.trim() : ""
  const yearRaw = payload.year
  const year = typeof yearRaw === "number" ? yearRaw : Number(yearRaw)

  if (!athleteTitlePlacements.includes(placement as AthleteTitlePlacement)) {
    throw new Error("Selecione a colocação.")
  }

  if (!competition) {
    throw new Error("Informe a competição.")
  }

  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error("Informe um ano válido.")
  }

  return {
    placement: placement as AthleteTitlePlacement,
    competition,
    year,
  }
}
