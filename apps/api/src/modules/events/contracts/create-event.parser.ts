import type { EventDashboardType } from "@/apps/api/src/modules/events/domain/event-dashboard"
import type { CreateEventInputContract } from "@/apps/api/src/modules/events/contracts/create-event.input"

const validEventTypes = new Set<EventDashboardType>([
  "competition",
  "seminar",
  "graduation_exam",
  "workshop",
  "festival",
  "special_class",
])

export class InvalidCreateEventInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidCreateEventInputError"
  }
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

export function parseCreateEventInput(
  body: Record<string, unknown>
): CreateEventInputContract {
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const type = typeof body.type === "string" ? body.type : ""
  const date = typeof body.date === "string" ? body.date.trim() : ""
  const time = typeof body.time === "string" ? body.time.trim() : ""
  const location = typeof body.location === "string" ? body.location.trim() : ""
  const capacity =
    typeof body.capacity === "number" ? body.capacity : Number(body.capacity ?? NaN)
  const hasRegistrationFee = body.hasRegistrationFee === true
  const registrationsOpen =
    typeof body.registrationsOpen === "boolean" ? body.registrationsOpen : true
  const registrationFeeAmount =
    typeof body.registrationFeeAmount === "number"
      ? body.registrationFeeAmount
      : body.registrationFeeAmount != null
        ? Number(body.registrationFeeAmount)
        : null
  const registrationFeeDueDays =
    typeof body.registrationFeeDueDays === "number"
      ? body.registrationFeeDueDays
      : body.registrationFeeDueDays != null
        ? Number(body.registrationFeeDueDays)
        : null

  if (!name || !date || !time || !location || !Number.isFinite(capacity) || capacity <= 0) {
    throw new InvalidCreateEventInputError(
      "Informe nome, data, horário, local e capacidade válida."
    )
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new InvalidCreateEventInputError("Informe uma data válida para o evento.")
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new InvalidCreateEventInputError("Informe um horário válido para o evento.")
  }

  if (!validEventTypes.has(type as EventDashboardType)) {
    throw new InvalidCreateEventInputError("Tipo de evento inválido.")
  }

  if (hasRegistrationFee) {
    if (
      registrationFeeAmount == null ||
      !Number.isFinite(registrationFeeAmount) ||
      registrationFeeAmount <= 0
    ) {
      throw new InvalidCreateEventInputError("Informe um valor de taxa maior que zero.")
    }

    if (
      registrationFeeDueDays != null &&
      (!Number.isFinite(registrationFeeDueDays) || registrationFeeDueDays < 0)
    ) {
      throw new InvalidCreateEventInputError(
        "O prazo de vencimento da taxa não pode ser negativo."
      )
    }
  }

  return {
    name,
    type: type as EventDashboardType,
    date,
    time,
    modalityId: normalizeOptionalString(body.modalityId),
    location,
    organizerName: normalizeOptionalString(body.organizerName),
    teacherProfileId: normalizeOptionalString(body.teacherProfileId),
    capacity,
    hasRegistrationFee,
    registrationFeeAmount: hasRegistrationFee ? registrationFeeAmount : null,
    registrationFeeDueDays: hasRegistrationFee ? registrationFeeDueDays : null,
    registrationsOpen,
    notes: normalizeOptionalString(body.notes),
  }
}
