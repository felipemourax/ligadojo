import { headers } from "next/headers"
import { ok, notFound } from "@/app/api/_lib/http"
import { TenantResolutionService } from "@/apps/api/src/modules/tenancy/services/tenant-resolution.service"

const tenantResolutionService = new TenantResolutionService()

export async function GET() {
  const requestHeaders = await headers()
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost"

  const resolution = await tenantResolutionService.resolveFromHost(host)

  if (resolution.kind === "tenant" && !resolution.tenant) {
    return notFound("Tenant não encontrado para o host informado.")
  }

  return ok(resolution)
}
