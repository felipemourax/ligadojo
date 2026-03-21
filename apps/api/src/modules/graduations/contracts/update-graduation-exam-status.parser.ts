import type { UpdateGraduationExamStatusInput } from "@/apps/api/src/modules/graduations/contracts/update-graduation-exam-status.input"

export function parseUpdateGraduationExamStatusInput(payload: unknown): UpdateGraduationExamStatusInput {
  const status = (payload as { status?: unknown } | null)?.status

  if (status !== "in_progress" && status !== "completed" && status !== "cancelled") {
    throw new Error("Status de exame inválido.")
  }

  return { status }
}
