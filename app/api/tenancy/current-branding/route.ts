import { ok } from "@/app/api/_lib/http"
import { getResolvedTenantBranding, getTenantContext } from "@/lib/tenancy"

export async function GET() {
  const tenant = await getTenantContext()
  const branding = await getResolvedTenantBranding(tenant)

  return ok({
    tenant,
    branding,
  })
}
