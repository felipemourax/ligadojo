import type { RegisterStudentAppProfileGraduationInput } from "@/apps/api/src/modules/app/contracts/register-student-app-profile-graduation.input"

export function parseRegisterStudentAppProfileGraduationInput(
  payload: unknown
): RegisterStudentAppProfileGraduationInput {
  const body = payload as Record<string, unknown> | null

  const studentActivityId =
    typeof body?.studentActivityId === "string" ? body.studentActivityId.trim() : ""
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

  if (!studentActivityId || !toBelt || !graduatedAtMonth) {
    throw new Error("Informe a atividade, a faixa e a data da graduação.")
  }

  return {
    studentActivityId,
    toBelt,
    toStripes,
    graduatedAtMonth,
    notes,
  }
}
