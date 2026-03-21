"use client"

import { usePathname } from "next/navigation"
import { roles, type Role } from "@/lib/access-control"
import { resolveAppRouteRole } from "@/lib/app-role-routing"
import { useCurrentSession } from "@/hooks/use-current-session"
import { useCurrentTenantSlug } from "@/hooks/use-current-tenant-slug"

export function useCurrentRole(): Role {
  const pathname = usePathname()
  const { session } = useCurrentSession()
  const tenantSlug = useCurrentTenantSlug()
  const activeAcademyAdminMembership = session?.memberships.find(
    (membership) => membership.role === roles.ACADEMY_ADMIN && membership.status === "active"
  )
  const activeStudentMembership = session?.memberships.find(
    (membership) => membership.role === roles.STUDENT && membership.status === "active"
  )
  const activeTeacherMembership = session?.memberships.find(
    (membership) => membership.role === roles.TEACHER && membership.status === "active"
  )

  if (pathname.startsWith("/platform")) {
    if (session?.systemRoles.includes(roles.PLATFORM_ADMIN)) {
      return roles.PLATFORM_ADMIN
    }

    if (activeAcademyAdminMembership) {
      return roles.ACADEMY_ADMIN
    }

    return roles.STUDENT
  }

  if (pathname.startsWith("/app")) {
    const appRouteRole = resolveAppRouteRole(pathname)

    if (appRouteRole === "teacher") {
      return roles.TEACHER
    }

    if (appRouteRole === "student") {
      return roles.STUDENT
    }

    return session?.currentMembership?.role ?? roles.STUDENT
  }

  if (tenantSlug && (pathname.startsWith("/dashboard") || pathname.startsWith("/app"))) {
    return session?.currentMembership?.role ?? roles.STUDENT
  }

  if (session?.currentMembership?.role) {
    return session.currentMembership.role
  }

  if (activeAcademyAdminMembership) {
    return roles.ACADEMY_ADMIN
  }

  if (activeTeacherMembership) {
    return roles.TEACHER
  }

  if (activeStudentMembership) {
    return roles.STUDENT
  }

  if (session?.systemRoles.includes(roles.PLATFORM_ADMIN)) {
    return roles.PLATFORM_ADMIN
  }

  return roles.STUDENT
}
