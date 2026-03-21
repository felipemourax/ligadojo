import { redirect } from "next/navigation"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { PlatformAccessSelector } from "@/components/auth/platform-access-selector"
import { CurrentSessionProvider } from "@/hooks/use-current-session"
import { roles } from "@/lib/access-control"
import { resolveSingleAccessRedirect } from "@/lib/auth/platform-access-routing"
import { routes } from "@/lib/routes"
import { getResolvedTenantSurfaceContext } from "@/lib/tenancy"

export default async function PlatformAccessPage() {
  const tenantContext = await getResolvedTenantSurfaceContext()
  const auth = await resolveAuthenticatedUser()

  if (tenantContext.tenant.kind === "tenant") {
    redirect(routes.tenantApp)
  }

  if (!auth.session) {
    redirect(routes.login)
  }

  if (auth.session.systemRoles.includes(roles.PLATFORM_ADMIN)) {
    redirect(routes.platform)
  }

  const singleAccessRedirect = resolveSingleAccessRedirect(auth.session.tenantMemberships)

  if (singleAccessRedirect) {
    redirect(singleAccessRedirect)
  }

  return (
    <CurrentSessionProvider>
      <PlatformAccessSelector />
    </CurrentSessionProvider>
  )
}
