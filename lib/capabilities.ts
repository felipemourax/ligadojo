import { roles, type Role } from "@/lib/access-control"

export const capabilities = {
  PLATFORM_MANAGE: "platform.manage",
  DASHBOARD_VIEW: "dashboard.view",
  STUDENTS_READ: "students.read",
  STUDENTS_MANAGE: "students.manage",
  TEACHERS_READ: "teachers.read",
  TEACHERS_MANAGE: "teachers.manage",
  MODALITIES_READ: "modalities.read",
  MODALITIES_MANAGE: "modalities.manage",
  PLANS_READ: "plans.read",
  PLANS_MANAGE: "plans.manage",
  CLASSES_READ: "classes.read",
  CLASSES_MANAGE: "classes.manage",
  ATTENDANCE_READ: "attendance.read",
  ATTENDANCE_MANAGE: "attendance.manage",
  GRADUATIONS_READ: "graduations.read",
  GRADUATIONS_MANAGE: "graduations.manage",
  FINANCE_READ: "finance.read",
  FINANCE_MANAGE: "finance.manage",
  CRM_READ: "crm.read",
  CRM_MANAGE: "crm.manage",
  EVENTS_READ: "events.read",
  EVENTS_MANAGE: "events.manage",
  ATHLETES_READ: "athletes.read",
  ATHLETES_MANAGE: "athletes.manage",
  SITE_READ: "site.read",
  SITE_MANAGE: "site.manage",
  MARKETING_READ: "marketing.read",
  MARKETING_MANAGE: "marketing.manage",
  TECHNIQUES_READ: "techniques.read",
  TECHNIQUES_MANAGE: "techniques.manage",
  APP_ACCESS: "app.access",
  TENANT_SWITCH: "tenant.switch",
  ONBOARDING_MANAGE: "onboarding.manage",
  MEMBERSHIPS_MANAGE: "memberships.manage",
  ENROLLMENT_REVIEW: "enrollment.review",
  ENROLLMENT_SUBMIT: "enrollment.submit",
} as const

export type Capability = (typeof capabilities)[keyof typeof capabilities]

const allCapabilities = Object.values(capabilities) as Capability[]

const roleCapabilities: Record<Role, Capability[]> = {
  [roles.PLATFORM_ADMIN]: allCapabilities,
  [roles.ACADEMY_ADMIN]: [
    capabilities.DASHBOARD_VIEW,
    capabilities.STUDENTS_READ,
    capabilities.STUDENTS_MANAGE,
    capabilities.TEACHERS_READ,
    capabilities.TEACHERS_MANAGE,
    capabilities.MODALITIES_READ,
    capabilities.MODALITIES_MANAGE,
    capabilities.PLANS_READ,
    capabilities.PLANS_MANAGE,
    capabilities.CLASSES_READ,
    capabilities.CLASSES_MANAGE,
    capabilities.ATTENDANCE_READ,
    capabilities.ATTENDANCE_MANAGE,
    capabilities.GRADUATIONS_READ,
    capabilities.GRADUATIONS_MANAGE,
    capabilities.FINANCE_READ,
    capabilities.FINANCE_MANAGE,
    capabilities.CRM_READ,
    capabilities.CRM_MANAGE,
    capabilities.EVENTS_READ,
    capabilities.EVENTS_MANAGE,
    capabilities.ATHLETES_READ,
    capabilities.ATHLETES_MANAGE,
    capabilities.SITE_READ,
    capabilities.SITE_MANAGE,
    capabilities.MARKETING_READ,
    capabilities.MARKETING_MANAGE,
    capabilities.TECHNIQUES_READ,
    capabilities.TECHNIQUES_MANAGE,
    capabilities.APP_ACCESS,
    capabilities.TENANT_SWITCH,
    capabilities.ONBOARDING_MANAGE,
    capabilities.MEMBERSHIPS_MANAGE,
    capabilities.ENROLLMENT_REVIEW,
  ],
  [roles.TEACHER]: [
    capabilities.APP_ACCESS,
    capabilities.TENANT_SWITCH,
  ],
  [roles.STUDENT]: [
    capabilities.APP_ACCESS,
    capabilities.ENROLLMENT_SUBMIT,
    capabilities.TENANT_SWITCH,
  ],
}

export function getCapabilitiesForRole(role: Role): Capability[] {
  return roleCapabilities[role] ?? []
}

export function getCapabilitiesForRoles(userRoles: Role[]) {
  return mergeCapabilities(...userRoles.map((role) => getCapabilitiesForRole(role)))
}

export function mergeCapabilities(...values: Array<Capability[] | undefined | null>) {
  return [...new Set(values.flatMap((value) => value ?? []))]
}

export function hasCapability(userCapabilities: Capability[], requiredCapability: Capability) {
  return userCapabilities.includes(requiredCapability)
}
