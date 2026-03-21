"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentRole } from "@/hooks/use-current-role"
import { useCurrentSession } from "@/hooks/use-current-session"
import { useCurrentTenantSlug } from "@/hooks/use-current-tenant-slug"
import { capabilities, hasCapability, type Capability } from "@/lib/capabilities"
import { moduleRegistry } from "@/lib/module-registry"
import { routes } from "@/lib/routes"
import { canAccessSurface, getDefaultRouteForRole } from "@/lib/surface-access"
import type { AppSurface } from "@/lib/module-types"
import type { Role } from "@/lib/access-control"

interface SurfaceGuardProps {
  surface: AppSurface
  children: React.ReactNode
}

export function SurfaceGuard({ surface, children }: SurfaceGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentRole = useCurrentRole()
  const { session, isLoading } = useCurrentSession()
  const tenantSlug = useCurrentTenantSlug()
  const hasTenantMembership = Boolean(session?.currentMembership)
  const requiresDashboardContext = surface === "dashboard"
  const requiresAppContext = surface === "app"
  const hasDashboardContext = hasTenantMembership
  const hasAppContext = Boolean(tenantSlug) && hasTenantMembership
  const lacksRequiredSurfaceContext =
    (requiresDashboardContext && !hasDashboardContext) || (requiresAppContext && !hasAppContext)
  const currentTenantCapabilities = (session?.currentTenantCapabilities ?? []) as Capability[]
  const allowed = canAccessSurface(currentRole, surface) && !lacksRequiredSurfaceContext
  const dashboardFallbackRoute = resolveDashboardFallbackRoute(currentTenantCapabilities, currentRole)
  const lacksDashboardRouteAccess =
    surface === "dashboard" &&
    Boolean(session) &&
    hasTenantMembership &&
    !canAccessDashboardRoute(pathname, currentTenantCapabilities)

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login")
      return
    }

    if (!isLoading && session && lacksRequiredSurfaceContext) {
      router.replace(resolveMissingSurfaceContextRoute(surface, Boolean(tenantSlug)))
      return
    }

    if (!isLoading && session && !allowed) {
      router.replace(resolveDeniedSurfaceRoute(surface, currentRole, Boolean(tenantSlug)))
      return
    }

    if (!isLoading && lacksDashboardRouteAccess) {
      router.replace(dashboardFallbackRoute)
    }
  }, [
    allowed,
    currentRole,
    dashboardFallbackRoute,
    isLoading,
    lacksRequiredSurfaceContext,
    lacksDashboardRouteAccess,
    router,
    session,
    surface,
    tenantSlug,
  ])

  if (isLoading) {
    return <SurfaceLoadingState surface={surface} />
  }

  if (!session) {
    return null
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Acesso redirecionado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta superfície não é compatível com o role atual. O redirecionamento padrão está sendo
            aplicado.
          </p>
        </div>
      </div>
    )
  }

  if (lacksDashboardRouteAccess) {
    return null
  }

  return <>{children}</>
}

function resolveMissingSurfaceContextRoute(surface: AppSurface, hasTenantSlug: boolean) {
  if ((surface === "dashboard" || surface === "app") && !hasTenantSlug) {
    return routes.platformAccess
  }

  return routes.login
}

function resolveDeniedSurfaceRoute(surface: AppSurface, currentRole: Role, hasTenantSlug: boolean) {
  if ((surface === "dashboard" || surface === "app") && !hasTenantSlug) {
    return routes.platformAccess
  }

  return getDefaultRouteForRole(currentRole)
}

function resolveDashboardFallbackRoute(userCapabilities: Capability[], currentRole: Role) {
  if (hasCapability(userCapabilities, capabilities.DASHBOARD_VIEW)) {
    return routes.dashboard
  }

  if (currentRole === "academy_admin") {
    return routes.dashboardSettingsPayments
  }

  return getDefaultRouteForRole(currentRole)
}

function canAccessDashboardRoute(pathname: string, userCapabilities: Capability[]) {
  if (pathname === routes.dashboard || pathname.startsWith(`${routes.dashboard}/`)) {
    if (pathname.startsWith(routes.dashboardSettings)) {
      return hasCapability(userCapabilities, capabilities.ONBOARDING_MANAGE)
    }

    const matchedModule = [...moduleRegistry]
      .filter((module) => module.surface.includes("dashboard"))
      .sort((left, right) => right.path.length - left.path.length)
      .find((module) => pathname === module.path || pathname.startsWith(`${module.path}/`))

    if (!matchedModule) {
      return true
    }

    return matchedModule.requiredCapabilities.every((capability) =>
      hasCapability(userCapabilities, capability)
    )
  }

  return true
}

function SurfaceLoadingState({ surface }: { surface: AppSurface }) {
  if (surface === "dashboard") {
    return (
      <div className="min-h-screen bg-background">
        <div className="hidden h-screen w-[260px] border-r border-border bg-card md:fixed md:block">
          <div className="flex h-16 items-center gap-3 border-b border-border px-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-11 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="md:ml-[260px]">
          <div className="sticky top-0 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 md:hidden">
            <Skeleton className="h-8 w-28 rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>

          <div className="space-y-6 px-4 py-5 md:px-6 md:py-6">
            <div className="space-y-3">
              <Skeleton className="h-8 w-52 rounded-xl" />
              <Skeleton className="h-4 w-72 max-w-full rounded-lg" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-border bg-card p-5">
                  <Skeleton className="h-4 w-24 rounded-lg" />
                  <Skeleton className="mt-4 h-8 w-28 rounded-xl" />
                  <Skeleton className="mt-3 h-3 w-32 rounded-lg" />
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
              <div className="rounded-3xl border border-border bg-card p-5">
                <Skeleton className="h-5 w-40 rounded-lg" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-2xl" />
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <Skeleton className="h-5 w-36 rounded-lg" />
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (surface === "app") {
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-32 rounded-xl" />
              <Skeleton className="h-4 w-56 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-40 rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8">
        <Skeleton className="h-6 w-40 rounded-xl" />
        <Skeleton className="mt-3 h-4 w-64 rounded-lg" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
