import type { RegisterTeacherAppProfileGraduationInput } from "@/apps/api/src/modules/app/contracts/register-teacher-app-profile-graduation.input"

export function parseRegisterTeacherAppProfileGraduationInput(
  payload: unknown
): RegisterTeacherAppProfileGraduationInput {
  const body = payload as Record<string, unknown> | null

  const activityCategory =
    typeof body?.activityCategory === "string" ? body.activityCategory.trim() : ""
  const toBelt = typeof body?.toBelt === "string" ? body.toBelt.trim() : ""
  const toStripes =
    typeof body?.toStripes === "number"
      ? body.toStripes
      : typeof body?.toStripes === "string"
        ? Number(body.toStripes) || 0
        : 0
  const graduatedAtMonth =
    typeof body?.graduatedAtMonth === "string" ? body.graduatedAtMonth.trim() : ""
  const notes = typeof body?.notes === "string" ? body.notes : null

  if (!activityCategory || !toBelt || !graduatedAtMonth) {
    throw new Error("Informe a atividade, a faixa e a data da graduação.")
  }

  return {
    activityCategory,
    toBelt,
    toStripes,
    graduatedAtMonth,
    notes,
  }
}
