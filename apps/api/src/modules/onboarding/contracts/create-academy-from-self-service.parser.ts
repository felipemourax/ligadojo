import {
  activityCategoryOptions,
  type ActivityCategoryValue,
} from "@/apps/api/src/modules/modalities/domain/modality"
import type { CreateAcademyFromSelfServiceInput } from "@/apps/api/src/modules/onboarding/contracts/create-academy-from-self-service.input"

const supportedActivityCategories = new Set<ActivityCategoryValue>(
  activityCategoryOptions.map((option) => option.value)
)

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalizePhoneDigits(value?: string) {
  return value?.replace(/\D/g, "") ?? ""
}

function normalizeActivityCategories(raw: unknown, legacyPrimaryModality: unknown) {
  const source = Array.isArray(raw)
    ? raw
    : typeof legacyPrimaryModality === "string" && legacyPrimaryModality.trim()
      ? [legacyPrimaryModality]
      : []

  return Array.from(
    new Set(
      source
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim().toLowerCase())
        .filter((value): value is ActivityCategoryValue => supportedActivityCategories.has(value as ActivityCategoryValue))
    )
  )
}

export class InvalidCreateAcademyFromSelfServiceInputError extends Error {
  constructor(
    public readonly code: "invalid_payload" | "invalid_activity_categories",
    message: string
  ) {
    super(message)
    this.name = "InvalidCreateAcademyFromSelfServiceInputError"
  }
}

export function parseCreateAcademyFromSelfServiceInput(
  body: Record<string, unknown>
): CreateAcademyFromSelfServiceInput {
  const academyName = typeof body.academyName === "string" ? body.academyName.trim() : ""
  const ownerName = typeof body.ownerName === "string" ? body.ownerName.trim() : ""
  const ownerEmail = typeof body.ownerEmail === "string" ? body.ownerEmail.trim().toLowerCase() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const ownerPhone = typeof body.ownerPhone === "string" ? body.ownerPhone.trim() : undefined
  const ownerPhoneDigits = normalizePhoneDigits(ownerPhone)
  const rawActivityCategoryValues = Array.isArray(body.activityCategories)
    ? body.activityCategories
    : typeof body.primaryModality === "string" && body.primaryModality.trim()
      ? [body.primaryModality]
      : []
  const activityCategories = normalizeActivityCategories(body.activityCategories, body.primaryModality)

  const hasUnsupportedActivityCategory =
    rawActivityCategoryValues
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
      .some((value) => !supportedActivityCategories.has(value as ActivityCategoryValue))

  if (hasUnsupportedActivityCategory) {
    throw new InvalidCreateAcademyFromSelfServiceInputError(
      "invalid_activity_categories",
      "A modalidade informada nao e suportada pelo onboarding da academia."
    )
  }

  if (
    !academyName ||
    !ownerName ||
    !isValidEmail(ownerEmail) ||
    password.length < 8 ||
    ownerPhoneDigits.length < 10 ||
    activityCategories.length === 0
  ) {
    throw new InvalidCreateAcademyFromSelfServiceInputError(
      "invalid_payload",
      "Campos obrigatórios: academyName, ownerName, ownerPhone válido, ao menos uma modalidade, ownerEmail válido e password com 8+ caracteres."
    )
  }

  return {
    academyName,
    ownerName,
    ownerEmail,
    ownerPhone,
    activityCategories,
    password,
  }
}
