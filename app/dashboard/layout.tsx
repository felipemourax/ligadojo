import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { UnknownAcademySurface } from "@/components/tenant/unknown-academy-surface"
import { SurfaceGuard } from "@/components/guards"
import { ContentFrame } from "@/components/layout/content-frame"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { MobileHeader } from "@/components/layout/mobile-header"
import { AcademySetupGate } from "@/components/onboarding/academy-setup-gate"
import { CurrentSessionProvider } from "@/hooks/use-current-session"
import { roles } from "@/lib/access-control"
import { AUTH_DASHBOARD_TENANT_COOKIE } from "@/lib/auth/session"
import { resolvePreferredDashboardMembership } from "@/lib/auth/dashboard-tenant"
import { routes } from "@/lib/routes"
import { getResolvedTenantSurfaceContext } from "@/lib/tenancy"
import { TeacherPendingApprovalsProvider } from "@/modules/teachers/hooks/use-teacher-pending-approvals"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tenantContext = await getResolvedTenantSurfaceContext()
  const auth = await resolveAuthenticatedUser()

  if (tenantContext.invalidTenantHost) {
    return (
      <UnknownAcademySurface
        attemptedHost={tenantContext.request.host}
        suggestedQuery={tenantContext.suggestedQuery}
      />
    )
  }

  if (!auth.user || !auth.session) {
    redirect(routes.login)
  }

  const cookieStore = await cookies()
  const preferredDashboardTenantId = cookieStore.get(AUTH_DASHBOARD_TENANT_COOKIE)?.value ?? null

  const currentMembership =
    tenantContext.resolvedTenant
      ? auth.session.tenantMemberships.find(
          (membership) =>
            membership.tenantId === tenantContext.resolvedTenant?.id && membership.status === "active"
        ) ?? null
      : resolvePreferredDashboardMembership(auth.session.tenantMemberships, preferredDashboardTenantId)

  if (!currentMembership || currentMembership.status !== "active") {
    redirect(tenantContext.resolvedTenant ? routes.login : routes.platformAccess)
  }

  if (currentMembership.role === roles.TEACHER) {
    redirect(tenantContext.resolvedTenant ? routes.tenantAppTeacher : routes.platformAccess)
  }

  if (currentMembership.role === roles.STUDENT) {
    redirect(tenantContext.resolvedTenant ? routes.tenantAppStudent : routes.platformAccess)
  }

  if (currentMembership.role !== roles.ACADEMY_ADMIN) {
    redirect(tenantContext.resolvedTenant ? routes.login : routes.platformAccess)
  }

  return (
    <CurrentSessionProvider>
      <TeacherPendingApprovalsProvider>
        <SurfaceGuard surface="dashboard">
          <div className="flex min-h-screen bg-background">
            <DesktopSidebar />
            <AcademySetupGate />

            <div className="flex-1 flex flex-col min-w-0">
              <MobileHeader />

              <main className="flex-1 pb-20 md:pb-0">
                <ContentFrame size="dashboard" className="px-4 py-4 md:px-6 md:py-6 lg:px-8 xl:px-10">
                  {children}
                </ContentFrame>
              </main>

              <MobileNav />
            </div>
          </div>
        </SurfaceGuard>
      </TeacherPendingApprovalsProvider>
    </CurrentSessionProvider>
  )
}
