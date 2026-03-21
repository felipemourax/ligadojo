import { headers } from "next/headers"
import { ok } from "@/app/api/_lib/http"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { EnrollmentRequestRepository } from "@/apps/api/src/modules/enrollment-requests/repositories/enrollment-request.repository"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"

const tenantRepository = new TenantRepository()
const enrollmentRequestRepository = new EnrollmentRequestRepository()

export async function GET() {
  const requestHeaders = await headers()
  const tenantContext = resolveTenantFromHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  )

  if (tenantContext.kind !== "tenant" || !tenantContext.tenantSlug) {
    return ok({
      tenant: null,
      user: null,
      membership: null,
      enrollmentRequest: null,
      accessState: "no_link",
    })
  }

  const tenant = await tenantRepository.findBySlug(tenantContext.tenantSlug)

  if (!tenant) {
    return ok({
      tenant: null,
      user: null,
      membership: null,
      enrollmentRequest: null,
      accessState: "no_link",
    })
  }

  const auth = await resolveAuthenticatedUser()

  if (!auth.user || !auth.session) {
    return ok({
      tenant,
      user: null,
      membership: null,
      enrollmentRequest: null,
      accessState: "unauthenticated",
    })
  }

  const membership =
    auth.session.tenantMemberships.find((item) => item.tenantId === tenant.id) ?? null
  const enrollmentRequest = await enrollmentRequestRepository.findByTenantAndUser(
    tenant.id,
    auth.user.id
  )

  const accessState = membership
    ? membership.status === "active"
      ? "active"
      : membership.status === "invited"
        ? "invited"
      : membership.status === "pending"
        ? "pending"
        : membership.status === "revoked"
          ? "revoked"
          : "suspended"
    : enrollmentRequest?.status === "pending"
      ? "pending"
      : enrollmentRequest?.status === "rejected"
        ? "rejected"
        : "no_link"

  return ok({
    tenant,
    user: auth.user,
    membership,
    enrollmentRequest,
    accessState,
  })
}
