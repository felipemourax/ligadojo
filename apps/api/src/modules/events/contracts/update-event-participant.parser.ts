import type { UpdateEventParticipantInput } from "@/apps/api/src/modules/events/contracts/update-event-participant.input"

const validParticipantStatuses = new Set(["invited", "confirmed", "maybe", "declined"])
const validPaymentMethods = new Set(["PIX", "CARD", "BOLETO", "CASH"])

export class InvalidUpdateEventParticipantInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidUpdateEventParticipantInputError"
  }
}

export function parseUpdateEventParticipantInput(
  body: Record<string, unknown>
): UpdateEventParticipantInput {
  if (typeof body.registrationsOpen === "boolean") {
    return {
      mode: "registrations_state",
      registrationsOpen: body.registrationsOpen,
    }
  }

  const participantId =
    typeof body.participantId === "string" ? body.participantId.trim() : ""
  const paymentMethod =
    typeof body.paymentMethod === "string" ? body.paymentMethod.trim().toUpperCase() : ""

  if (participantId && validPaymentMethods.has(paymentMethod)) {
    return {
      mode: "payment_confirmation",
      participantId,
      paymentMethod: paymentMethod as "PIX" | "CARD" | "BOLETO" | "CASH",
    }
  }

  const status = typeof body.status === "string" ? body.status.trim() : ""

  if (!participantId || !validParticipantStatuses.has(status)) {
    throw new InvalidUpdateEventParticipantInputError(
      "Informe participante e status válidos."
    )
  }

  return {
    mode: "participant_status",
    participantId,
    status: status as "invited" | "confirmed" | "maybe" | "declined",
  }
}
