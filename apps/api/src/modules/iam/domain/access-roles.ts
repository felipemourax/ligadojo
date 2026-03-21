export const systemAccessRoles = ["platform_admin"] as const
export type SystemAccessRole = (typeof systemAccessRoles)[number]

export const academyAccessRoles = ["academy_admin", "teacher", "student"] as const
export type AcademyAccessRole = (typeof academyAccessRoles)[number]
