import { redirect } from "next/navigation"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { SitePublicService } from "@/apps/api/src/modules/site/services/site-public.service"
import { UnknownAcademySurface } from "@/components/tenant/unknown-academy-surface"
import { PlatformLandingPage } from "@/modules/platform-site"
import { SitePublicPage } from "@/modules/site"
import { roles } from "@/lib/access-control"
import { routes } from "@/lib/routes"
import { getResolvedTenantSurfaceContext } from "@/lib/tenancy"

const sitePublicService = new SitePublicService()

export default async function Home() {
  const tenantContext = await getResolvedTenantSurfaceContext()
  const tenant = tenantContext.tenant

  if (tenant.kind === "tenant") {
    const auth = await resolveAuthenticatedUser()

    if (auth.session && tenantContext.resolvedTenant) {
      const adminMembership =
        auth.session.tenantMemberships.find(
          (membership) =>
            membership.tenantId === tenantContext.resolvedTenant?.id &&
            membership.role === "academy_admin" &&
            membership.status === "active"
        ) ?? null

      if (adminMembership) {
        redirect(routes.dashboard)
      }

      const appMembership =
        auth.session.tenantMemberships.find(
          (membership) =>
            membership.tenantId === tenantContext.resolvedTenant?.id &&
            (membership.role === "teacher" || membership.role === "student") &&
            membership.status === "active"
        ) ?? null

      if (appMembership?.role === "teacher") {
        redirect(routes.tenantAppTeacher)
      }

      if (appMembership?.role === "student") {
        redirect(routes.tenantAppStudent)
      }
    }

    const publishedSite =
      tenantContext.resolvedTenant != null
        ? await sitePublicService.getPublishedByTenantSlug(tenantContext.resolvedTenant.slug)
        : null

    if (publishedSite) {
      return <SitePublicPage view={publishedSite} />
    }

    redirect(routes.tenantApp)
  }

  if (tenantContext.invalidTenantHost) {
    return (
      <UnknownAcademySurface
        attemptedHost={tenantContext.request.host}
        suggestedQuery={tenantContext.suggestedQuery}
      />
    )
  }

  const auth = await resolveAuthenticatedUser()

  if (auth.session) {
    if (auth.session.systemRoles.includes(roles.PLATFORM_ADMIN)) {
      redirect(routes.platform)
    }

    redirect(routes.platformAccess)
  }

  return <PlatformLandingPage />
}
