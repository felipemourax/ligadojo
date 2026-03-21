import { LoginPageClient } from "@/components/auth/login-page-client"
import { UnknownAcademySurface } from "@/components/tenant/unknown-academy-surface"
import { getResolvedTenantBranding, getResolvedTenantSurfaceContext } from "@/lib/tenancy"

export default async function LoginPage() {
  const tenantContext = await getResolvedTenantSurfaceContext()
  const tenant = tenantContext.tenant
  const branding = await getResolvedTenantBranding(tenant)

  if (tenantContext.invalidTenantHost) {
    return (
      <UnknownAcademySurface
        attemptedHost={tenantContext.request.host}
        suggestedQuery={tenantContext.suggestedQuery}
      />
    )
  }

  return (
    <LoginPageClient
      tenant={{
        kind: tenant.kind,
        tenantName: tenant.tenantName ?? null,
      }}
      branding={branding}
    />
  )
}
