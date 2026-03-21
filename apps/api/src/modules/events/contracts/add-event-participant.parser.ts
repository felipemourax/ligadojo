import type { AddEventParticipantInput } from "@/apps/api/src/modules/events/contracts/add-event-participant.input"

export class InvalidAddEventParticipantInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidAddEventParticipantInputError"
  }
}

export function parseAddEventParticipantInput(
  body: Record<string, unknown>
): AddEventParticipantInput {
  const userId = typeof body.userId === "string" ? body.userId.trim() : ""

  if (!userId) {
    throw new InvalidAddEventParticipantInputError("Informe o evento e o participante.")
  }

  return { userId }
}
