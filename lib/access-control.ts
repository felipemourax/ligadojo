export const roles = {
  PLATFORM_ADMIN: "platform_admin",
  ACADEMY_ADMIN: "academy_admin",
  TEACHER: "teacher",
  STUDENT: "student",
} as const

export type Role = (typeof roles)[keyof typeof roles]
