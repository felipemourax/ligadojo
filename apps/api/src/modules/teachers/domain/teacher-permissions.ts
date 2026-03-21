import type { TeacherPermissions, TeacherRoleValue } from "@/apps/api/src/modules/teachers/domain/teacher-dashboard"

export function buildTeacherPermissions(role: TeacherRoleValue): TeacherPermissions {
  return {
    manageStudents: true,
    manageGraduations: role === "head_instructor",
    manageAttendance: true,
    viewFinancials: role !== "assistant",
    manageClasses: role !== "assistant",
    manageTechniques: true,
    manageEvents: true,
  }
}
