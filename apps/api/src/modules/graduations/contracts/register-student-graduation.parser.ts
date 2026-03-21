import type { RegisterStudentGraduationInput } from "@/apps/api/src/modules/graduations/contracts/register-student-graduation.input"

export function parseRegisterStudentGraduationInput(
  payload: unknown
): RegisterStudentGraduationInput {
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
  const evaluatorName =
    typeof body?.evaluatorName === "string" ? body.evaluatorName.trim() : ""
  const graduatedAt =
    typeof body?.graduatedAt === "string" ? body.graduatedAt.trim() : ""
  const notes = typeof body?.notes === "string" ? body.notes : null

  if (!studentActivityId || !toBelt || !evaluatorName || !graduatedAt) {
    throw new Error("Informe a atividade, a faixa, o avaliador e a data da graduação.")
  }

  return {
    studentActivityId,
    toBelt,
    toStripes,
    evaluatorName,
    graduatedAt,
    notes,
  }
}
