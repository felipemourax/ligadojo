import { headers } from "next/headers"
import { badRequest, ok } from "@/app/api/_lib/http"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"

const tenantRepository = new TenantRepository()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")?.trim() ?? ""
  const limitValue = Number(searchParams.get("limit") ?? "8")
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 12) : 8
  const requestHeaders = await headers()
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost"

  if (query.length > 80) {
    return badRequest("Use um termo de busca menor.")
  }

  const academies = await tenantRepository.searchPublic(query, limit)

  return ok({
    host,
    academies,
  })
}
