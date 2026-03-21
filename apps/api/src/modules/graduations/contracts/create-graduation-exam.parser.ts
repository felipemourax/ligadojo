import type { CreateGraduationExamInput } from "@/apps/api/src/modules/graduations/contracts/create-graduation-exam.input"

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export function parseCreateGraduationExamInput(payload: unknown): CreateGraduationExamInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Corpo da requisição inválido.")
  }

  const body = payload as Record<string, unknown>
  const title = normalizeText(body.title)
  const date = normalizeText(body.date)
  const time = normalizeText(body.time)
  const trackIds = normalizeStringArray(body.trackIds)
  const evaluatorNames = normalizeStringArray(body.evaluatorNames)
  const allTracks = body.allTracks === true
  const allEvaluators = body.allEvaluators === true

  if (!title || !date || !time) {
    throw new Error("Informe título, data e horário do exame.")
  }

  if (!allTracks && trackIds.length === 0) {
    throw new Error("Selecione ao menos uma trilha ou marque todos.")
  }

  if (!allEvaluators && evaluatorNames.length === 0) {
    throw new Error("Selecione ao menos um avaliador ou marque todos.")
  }

  return {
    title,
    trackIds,
    allTracks,
    modalityId: normalizeText(body.modalityId),
    date,
    time,
    location: normalizeText(body.location),
    evaluatorNames,
    allEvaluators,
    notes: normalizeText(body.notes),
  }
}
