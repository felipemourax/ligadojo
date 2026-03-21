export type UpdateEventParticipantInput =
  | {
      mode: "registrations_state"
      registrationsOpen: boolean
    }
  | {
      mode: "participant_status"
      participantId: string
      status: "invited" | "confirmed" | "maybe" | "declined"
    }
  | {
      mode: "payment_confirmation"
      participantId: string
      paymentMethod: "PIX" | "CARD" | "BOLETO" | "CASH"
    }
