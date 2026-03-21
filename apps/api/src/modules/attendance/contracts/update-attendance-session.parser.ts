import type { UpdateAttendanceSessionInput } from "@/apps/api/src/modules/attendance/contracts/update-attendance-session.input"

export class InvalidUpdateAttendanceSessionInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidUpdateAttendanceSessionInputError"
  }
}

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
}

export function parseUpdateAttendanceSessionInput(
  body: Record<string, unknown>
): UpdateAttendanceSessionInput {
  const classGroupId = typeof body.classGroupId === "string" ? body.classGroupId.trim() : ""
  const sessionDate = typeof body.sessionDate === "string" ? body.sessionDate.trim() : ""
  const startTime = typeof body.startTime === "string" ? body.startTime.trim() : ""
  const endTime = typeof body.endTime === "string" ? body.endTime.trim() : ""
  const weekday =
    typeof body.weekday === "number"
      ? body.weekday
      : typeof body.weekday === "string"
        ? Number(body.weekday)
        : Number.NaN

  if (!classGroupId) {
    throw new InvalidUpdateAttendanceSessionInputError("Informe uma turma válida para registrar a presença.")
  }

  if (!sessionDate) {
    throw new InvalidUpdateAttendanceSessionInputError("Informe uma data válida para a chamada.")
  }

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    throw new InvalidUpdateAttendanceSessionInputError("Informe um dia da semana válido para a chamada.")
  }

  if (!startTime || !endTime) {
    throw new InvalidUpdateAttendanceSessionInputError("Informe horário inicial e final válidos para a chamada.")
  }

  const status = body.status === "cancelled" ? "cancelled" : "scheduled"

  return {
    classGroupId,
    sessionDate,
    weekday,
    startTime,
    endTime,
    status,
    confirmedStudentIds: parseStringArray(body.confirmedStudentIds),
    confirmedStudentNames: parseStringArray(body.confirmedStudentNames),
    presentStudentIds: parseStringArray(body.presentStudentIds),
    absentStudentIds: parseStringArray(body.absentStudentIds),
    justifiedStudentIds: parseStringArray(body.justifiedStudentIds),
    isFinalized: Boolean(body.isFinalized),
  }
}
