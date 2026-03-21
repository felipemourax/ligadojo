import type { UpdateGraduationEligibilityOverrideInput } from "@/apps/api/src/modules/graduations/contracts/update-graduation-eligibility-override.input"

export function parseUpdateGraduationEligibilityOverrideInput(
  payload: unknown
): UpdateGraduationEligibilityOverrideInput {
  if (!payload || typeof payload !== "object" || !("eligibleOverride" in payload)) {
    throw new Error("Informe o override de aptidão.")
  }

  const eligibleOverride =
    (payload as { eligibleOverride?: unknown }).eligibleOverride === null
      ? null
      : typeof (payload as { eligibleOverride?: unknown }).eligibleOverride === "boolean"
        ? (payload as { eligibleOverride: boolean }).eligibleOverride
        : undefined

  if (typeof eligibleOverride === "undefined") {
    throw new Error("Valor de aptidão inválido.")
  }

  return { eligibleOverride }
}
