import { SurfaceGuard } from "@/components/guards"
import { UnknownAcademySurface } from "@/components/tenant/unknown-academy-surface"
import { CurrentSessionProvider } from "@/hooks/use-current-session"
import { getResolvedTenantSurfaceContext } from "@/lib/tenancy"

export default async function TenantAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tenantContext = await getResolvedTenantSurfaceContext()

  if (tenantContext.invalidTenantHost) {
    return (
      <UnknownAcademySurface
        attemptedHost={tenantContext.request.host}
        suggestedQuery={tenantContext.suggestedQuery}
      />
    )
  }

  return (
    <CurrentSessionProvider>
      <SurfaceGuard surface="app">
        {children}
      </SurfaceGuard>
    </CurrentSessionProvider>
  )
}
