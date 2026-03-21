// Roles do sistema
export const roles = {
  PLATFORM_ADMIN: "platform_admin",
  ACADEMY_ADMIN: "academy_admin",
  TEACHER: "teacher",
  STUDENT: "student",
} as const

export type Role = (typeof roles)[keyof typeof roles]

// Permissões por módulo
export const modulePermissions = {
  dashboard: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN, roles.TEACHER, roles.STUDENT],
  students: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN, roles.TEACHER],
  teachers: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  classes: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN, roles.TEACHER],
  attendance: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN, roles.TEACHER],
  graduations: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN, roles.TEACHER],
  finance: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  crm: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  events: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN, roles.TEACHER],
  techniques: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN, roles.TEACHER, roles.STUDENT],
} as const

// Helper para verificar permissão
export function hasPermission(userRole: Role, module: keyof typeof modulePermissions): boolean {
  return modulePermissions[module].includes(userRole)
}
