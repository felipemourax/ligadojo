import { routes } from "@/lib/routes"
import { roles } from "@/lib/access-control"

export type AppRouteRole = "teacher" | "student"

export function resolveAppRouteRole(pathname: string | null | undefined): AppRouteRole | null {
  if (!pathname) {
    return null
  }

  if (pathname === routes.tenantAppTeacher || pathname.startsWith(`${routes.tenantAppTeacher}/`)) {
    return "teacher"
  }

  if (pathname === routes.tenantAppStudent || pathname.startsWith(`${routes.tenantAppStudent}/`)) {
    return "student"
  }

  return null
}

export function getTenantAppHomeRouteByRole(role: AppRouteRole) {
  return role === "teacher" ? routes.tenantAppTeacher : routes.tenantAppStudent
}

export function getTenantAppHomeRouteBySystemRole(role: string) {
  if (role === roles.TEACHER) {
    return routes.tenantAppTeacher
  }

  return routes.tenantAppStudent
}
