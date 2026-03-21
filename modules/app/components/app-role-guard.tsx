"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentSession } from "@/hooks/use-current-session"
import { roles } from "@/lib/access-control"
import { routes } from "@/lib/routes"

interface AppRoleGuardProps {
  requiredRole: "teacher" | "student"
  children: React.ReactNode
}

export function AppRoleGuard({ requiredRole, children }: AppRoleGuardProps) {
  const router = useRouter()
  const { session, isLoading } = useCurrentSession()
  const currentRole = session?.currentMembership?.role ?? null

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (requiredRole === "teacher" && currentRole === roles.STUDENT) {
      router.replace(routes.tenantAppStudent)
      return
    }

    if (requiredRole === "student" && currentRole === roles.TEACHER) {
      router.replace(routes.tenantAppTeacher)
      return
    }
  }, [currentRole, isLoading, requiredRole, router])

  if (isLoading) {
    return <section className="text-sm text-muted-foreground">Carregando app...</section>
  }

  if (requiredRole === "teacher" && currentRole !== roles.TEACHER) {
    return null
  }

  if (requiredRole === "student" && currentRole !== roles.STUDENT) {
    return null
  }

  return <>{children}</>
}
