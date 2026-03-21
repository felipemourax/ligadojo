import type { AddGraduationExamCandidateInput } from "@/apps/api/src/modules/graduations/contracts/add-graduation-exam-candidate.input"

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function parseAddGraduationExamCandidateInput(payload: unknown): AddGraduationExamCandidateInput {
  const studentActivityId = normalizeText((payload as { studentActivityId?: unknown } | null)?.studentActivityId)

  if (!studentActivityId) {
    throw new Error("Informe o aluno/atividade para adicionar ao exame.")
  }

  return { studentActivityId }
}
