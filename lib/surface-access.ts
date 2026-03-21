import { roles, type Role } from "@/lib/access-control"
import { routes } from "@/lib/routes"
import type { AppSurface } from "@/lib/module-types"

export const surfaceRolePolicy: Record<AppSurface, Role[]> = {
  platform: [roles.PLATFORM_ADMIN],
  dashboard: [roles.ACADEMY_ADMIN],
  app: [roles.TEACHER, roles.STUDENT],
}

export function canAccessSurface(userRole: Role, surface: AppSurface): boolean {
  return surfaceRolePolicy[surface].includes(userRole)
}

export function getDefaultRouteForRole(userRole: Role): string {
  switch (userRole) {
    case roles.PLATFORM_ADMIN:
      return routes.platform
    case roles.ACADEMY_ADMIN:
      return routes.dashboard
    case roles.TEACHER:
      return routes.tenantAppTeacher
    case roles.STUDENT:
      return routes.tenantAppStudent
    default:
      return routes.login
  }
}

export function getFallbackRouteForSurface(surface: AppSurface): string {
  switch (surface) {
    case "platform":
      return routes.platform
    case "dashboard":
      return routes.dashboard
    case "app":
      return routes.tenantApp
  }
}
