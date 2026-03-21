import type { ActivateStudentPlanInput } from "@/apps/api/src/modules/app/contracts/activate-student-plan.input"

export class InvalidActivateStudentPlanInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidActivateStudentPlanInputError"
  }
}

export function parseActivateStudentPlanInput(
  body: Record<string, unknown>
): ActivateStudentPlanInput {
  if (typeof body.planId !== "string" || body.planId.trim().length === 0) {
    throw new InvalidActivateStudentPlanInputError("Selecione um plano válido para ativação.")
  }

  return {
    planId: body.planId.trim(),
  }
}
