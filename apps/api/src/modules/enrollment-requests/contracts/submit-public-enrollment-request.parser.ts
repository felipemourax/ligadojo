import type {
  PublicEnrollmentRequestedRole,
  PublicEnrollmentTeacherRoleTitle,
  SubmitPublicEnrollmentRequestInput,
} from "@/apps/api/src/modules/enrollment-requests/contracts/submit-public-enrollment-request.input"

export class EnrollmentRequestValidationError extends Error {}

function normalizeRequiredText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeEmail(value: unknown) {
  return normalizeRequiredText(value).toLowerCase()
}

function normalizeDigits(value: unknown) {
  if (typeof value !== "string") {
    return undefined
  }

  const digits = value.replace(/\D/g, "")
  return digits.length > 0 ? digits : undefined
}

function parseRequestedRole(value: unknown): PublicEnrollmentRequestedRole {
  return value === "teacher" ? "teacher" : "student"
}

function parseTeacherRoleTitle(value: unknown): PublicEnrollmentTeacherRoleTitle | undefined {
  return value === "Professor" ||
    value === "Instrutor chefe" ||
    value === "Instrutor" ||
    value === "Assistente"
    ? value
    : undefined
}

function parseBirthDate(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null
  }

  const normalized = value.trim()
  const date = new Date(`${normalized}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : normalized
}

export function parseSubmitPublicEnrollmentRequestInput(
  payload: unknown
): SubmitPublicEnrollmentRequestInput {
  const body = payload as Record<string, unknown> | null

  const email = normalizeEmail(body?.email)
  if (!email) {
    throw new EnrollmentRequestValidationError("Campo obrigatório: email.")
  }

  const firstName = normalizeRequiredText(body?.firstName)
  if (!firstName) {
    throw new EnrollmentRequestValidationError("Campo obrigatório: firstName.")
  }

  const lastName = normalizeRequiredText(body?.lastName)
  if (!lastName) {
    throw new EnrollmentRequestValidationError("Campo obrigatório: lastName.")
  }

  const birthDate = parseBirthDate(body?.birthDate)
  if (!birthDate) {
    throw new EnrollmentRequestValidationError("Campo obrigatório: birthDate.")
  }

  const zipCode = normalizeDigits(body?.zipCode)
  if (!zipCode || zipCode.length !== 8) {
    throw new EnrollmentRequestValidationError("Campo obrigatório: zipCode.")
  }

  const street = normalizeRequiredText(body?.street)
  if (!street) {
    throw new EnrollmentRequestValidationError("Campo obrigatório: street.")
  }

  const city = normalizeRequiredText(body?.city)
  if (!city) {
    throw new EnrollmentRequestValidationError("Campo obrigatório: city.")
  }

  const state = normalizeRequiredText(body?.state)
  if (!state) {
    throw new EnrollmentRequestValidationError("Campo obrigatório: state.")
  }

  const requestedModalityIds = Array.isArray(body?.requestedModalityIds)
    ? body.requestedModalityIds.filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0
      )
    : []
  const requestedActivityCategories = Array.isArray(body?.requestedActivityCategories)
    ? body.requestedActivityCategories.filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0
      )
    : []

  const requestedRole = parseRequestedRole(body?.requestedRole)
  const teacherRoleTitle = parseTeacherRoleTitle(body?.teacherRoleTitle)
  const teacherRank = normalizeOptionalText(body?.teacherRank)

  if (requestedRole === "teacher" && requestedModalityIds.length === 0) {
    throw new EnrollmentRequestValidationError("Selecione pelo menos uma modalidade da academia.")
  }

  if (requestedRole === "student" && requestedActivityCategories.length === 0) {
    throw new EnrollmentRequestValidationError("Selecione pelo menos uma atividade principal da academia.")
  }

  if (requestedRole === "teacher" && (!teacherRoleTitle || !teacherRank)) {
    throw new EnrollmentRequestValidationError(
      "Professor precisa informar a função, a faixa e selecionar pelo menos uma modalidade."
    )
  }

  const cpf = normalizeDigits(body?.cpf)
  const normalizedCpf = cpf && cpf.length === 11 ? cpf : undefined

  return {
    email,
    firstName,
    lastName,
    birthDate,
    zipCode,
    street,
    city,
    state,
    requestedRole,
    requestedActivityCategories,
    requestedModalityIds,
    teacherRoleTitle,
    teacherRank,
    cpf: normalizedCpf,
    whatsapp: normalizeDigits(body?.whatsapp),
    emergencyContact: normalizeOptionalText(body?.emergencyContact),
    password: typeof body?.password === "string" ? body.password : undefined,
  }
}
