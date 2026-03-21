import { redirect } from "next/navigation"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { EnrollmentRequestRepository } from "@/apps/api/src/modules/enrollment-requests/repositories/enrollment-request.repository"
import { TeacherPendingApprovalModal } from "@/modules/app/components/teacher/teacher-pending-approval-modal"
import { TeacherAppShell } from "@/modules/app/ui/teacher-app-shell"
import { routes } from "@/lib/routes"
import { getResolvedTenantBranding, getResolvedTenantSurfaceContext } from "@/lib/tenancy"

const enrollmentRequestRepository = new EnrollmentRequestRepository()

export default async function TeacherAppLayout({
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
      (membership) => membership.tenantId === tenantContext.resolvedTenant?.id
    ) ?? null

  const pendingEnrollmentRequest = await enrollmentRequestRepository.findByTenantAndUser(
    tenantContext.resolvedTenant.id,
    auth.user.id
  )
  const isTeacherPendingApproval =
    currentMembership?.role === "teacher" &&
    (currentMembership.status === "pending" ||
      currentMembership.status === "invited" ||
      pendingEnrollmentRequest?.status === "pending")

  if (!currentMembership && !isTeacherPendingApproval) {
    redirect(routes.tenantApp)
  }

  if (isTeacherPendingApproval) {
    return (
      <TeacherAppShell appName={branding.appName} userName={auth.user.name ?? "Professor"}>
        <section className="px-4 py-6 text-sm text-muted-foreground">
          Aguardando aprovação do administrador da academia.
        </section>
        <TeacherPendingApprovalModal />
      </TeacherAppShell>
    )
  }

  if (currentMembership.role === "student") {
    redirect(routes.tenantAppStudent)
  }

  if (currentMembership.role !== "teacher") {
    redirect(routes.tenantApp)
  }

  return (
    <TeacherAppShell appName={branding.appName} userName={auth.user.name ?? "Professor"}>
      {children}
    </TeacherAppShell>
  )
}
