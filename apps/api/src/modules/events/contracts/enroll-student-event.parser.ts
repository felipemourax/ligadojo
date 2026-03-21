import type { EnrollStudentEventInput } from "@/apps/api/src/modules/events/contracts/enroll-student-event.input"

export class InvalidEnrollStudentEventInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidEnrollStudentEventInputError"
  }
}

export function parseEnrollStudentEventInput(
  body: Record<string, unknown>
): EnrollStudentEventInput {
  const eventId = typeof body.eventId === "string" ? body.eventId.trim() : ""
  const initialStatus =
    typeof body.initialStatus === "string" ? body.initialStatus.trim() : ""

  if (!eventId) {
    throw new InvalidEnrollStudentEventInputError(
      "Informe um evento válido para realizar a inscrição."
    )
  }

  if (
    initialStatus !== "confirmed" &&
    initialStatus !== "maybe" &&
    initialStatus !== "declined"
  ) {
    throw new InvalidEnrollStudentEventInputError(
      "Informe uma resposta inicial válida para a inscrição."
    )
  }

  return {
    eventId,
    initialStatus,
  }
}
