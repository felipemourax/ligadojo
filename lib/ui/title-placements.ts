import type { AthleteTitlePlacement } from "@/apps/api/src/modules/athletes/domain/athletes"

export const athleteTitlePlacementOptions: Array<{
  value: AthleteTitlePlacement
  label: string
  description: string
}> = [
  { value: "gold", label: "Ouro", description: "1º lugar" },
  { value: "silver", label: "Prata", description: "2º lugar" },
  { value: "bronze", label: "Bronze", description: "3º lugar" },
  { value: "champion", label: "Campeão", description: "Campeão" },
  { value: "runner_up", label: "Vice-Campeão", description: "Vice-campeão" },
]

export function resolveAthleteTitlePlacementStyle(placement: AthleteTitlePlacement | null | undefined) {
  switch (placement) {
    case "gold":
    case "champion":
      return {
        iconClassName: "text-yellow-500",
        badgeClassName: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
      }
    case "silver":
    case "runner_up":
      return {
        iconClassName: "text-slate-400",
        badgeClassName: "border-slate-400/30 bg-slate-400/10 text-slate-600",
      }
    case "bronze":
      return {
        iconClassName: "text-amber-600",
        badgeClassName: "border-amber-600/30 bg-amber-600/10 text-amber-700",
      }
    default:
      return {
        iconClassName: "text-primary",
        badgeClassName: "border-primary/30 bg-primary/10 text-primary",
      }
  }
}
