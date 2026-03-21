import type { ReplaceGraduationTracksInput } from "@/apps/api/src/modules/graduations/contracts/replace-graduation-tracks.input"
import type { GraduationTrackInput } from "@/apps/api/src/modules/graduations/domain/graduation-dashboard"

export function parseReplaceGraduationTracksInput(payload: unknown): ReplaceGraduationTracksInput {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { tracks?: unknown[] }).tracks)) {
    throw new Error("Lista de trilhas inválida.")
  }

  return {
    tracks: (payload as { tracks: GraduationTrackInput[] }).tracks,
  }
}
