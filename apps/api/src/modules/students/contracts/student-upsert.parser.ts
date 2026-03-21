import type { StudentUpsertInput } from "@/apps/api/src/modules/students/domain/student-dashboard"

type StudentUpsertPayload = Omit<StudentUpsertInput, "tenantId" | "studentId">

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function parseStudentUpsertPayload(payload: unknown): StudentUpsertPayload {
  const body = payload as Record<string, unknown> | null

  return {
    name: normalizeText(body?.name),
    email: normalizeText(body?.email),
    phone: normalizeText(body?.phone) || null,
    birthDate: normalizeText(body?.birthDate) || null,
    address: normalizeText(body?.address) || null,
    emergencyContact: normalizeText(body?.emergencyContact) || null,
    notes: normalizeText(body?.notes) || null,
    planId: normalizeText(body?.planId) || null,
    markPlanAsPaid: body?.markPlanAsPaid === true,
    practiceAssignments: Array.isArray(body?.practiceAssignments)
      ? body.practiceAssignments
          .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
          .map((item) => ({
            activityCategory: normalizeText(item.activityCategory) || null,
            classGroupId: normalizeText(item.classGroupId) || null,
            belt: normalizeText(item.belt) || "Branca",
            stripes:
              typeof item.stripes === "number"
                ? item.stripes
                : typeof item.stripes === "string"
                  ? Number(item.stripes) || 0
                  : 0,
            startDate: normalizeText(item.startDate),
            notes: normalizeText(item.notes) || null,
          }))
      : [],
  }
}
