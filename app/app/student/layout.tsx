import { redirect } from "next/navigation"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { routes } from "@/lib/routes"
import { getResolvedTenantBranding, getResolvedTenantSurfaceContext } from "@/lib/tenancy"
import { StudentAppShell } from "@/modules/app/ui/student-app-shell"

export default async function StudentAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tenantContext = await getResolvedTenantSurfaceContext()
  const branding = await getResolvedTenantBranding(tenantContext.tenant)
  const auth = await resolveAuthenticatedUser()

  if (!auth.user || !auth.session || !tenantContext.resolvedTenant) {
    redirect(routes.login)
  }

  const currentMembership =
    auth.session.tenantMemberships.find(
      (membership) =>
        membership.tenantId === tenantContext.resolvedTenant?.id &&
        membership.status === "active"
    ) ?? null

  if (!currentMembership) {
    redirect(routes.tenantApp)
  }

  if (currentMembership.role === "teacher") {
    redirect(routes.tenantAppTeacher)
  }

  if (currentMembership.role !== "student") {
    redirect(routes.tenantApp)
  }

  return (
    <StudentAppShell appName={branding.appName} userName={auth.user.name ?? auth.user.email}>
      {children}
    </StudentAppShell>
  )
}
