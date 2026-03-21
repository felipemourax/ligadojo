import type { AddTeacherAppGraduationCandidateInput } from "@/apps/api/src/modules/app/contracts/add-teacher-app-graduation-candidate.input"

export class InvalidAddTeacherAppGraduationCandidateInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidAddTeacherAppGraduationCandidateInputError"
  }
}

export function parseAddTeacherAppGraduationCandidateInput(
  body: Record<string, unknown>
): AddTeacherAppGraduationCandidateInput {
  const studentActivityId =
    typeof body.studentActivityId === "string" ? body.studentActivityId.trim() : ""

  if (!studentActivityId) {
    throw new InvalidAddTeacherAppGraduationCandidateInputError(
      "Informe o aluno que deve ser incluído no exame."
    )
  }

  return { studentActivityId }
}
