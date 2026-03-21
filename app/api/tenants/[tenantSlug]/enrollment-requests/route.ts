import { NextResponse } from "next/server"
import { attachAuthSessionCookie } from "@/app/api/_lib/auth-session"
import { requireTenantCapability } from "@/app/api/_lib/tenant-capability"
import { badRequest, created, notFound, ok } from "@/app/api/_lib/http"
import {
  EnrollmentRequestValidationError,
  parseSubmitPublicEnrollmentRequestInput,
} from "@/apps/api/src/modules/enrollment-requests/contracts/submit-public-enrollment-request.parser"
import { EnrollmentRequestService } from "@/apps/api/src/modules/enrollment-requests/services/enrollment-request.service"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { capabilities } from "@/lib/capabilities"

const tenantRepository = new TenantRepository()
const enrollmentRequestService = new EnrollmentRequestService()

export async function GET(
  _request: Request,
  context: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await context.params
  const access = await requireTenantCapability({
    tenantSlug,
    capability: capabilities.ENROLLMENT_REVIEW,
  })

  if (!access.ok) {
    return access.response
  }

  const tenant = await tenantRepository.findBySlug(tenantSlug)

  if (!tenant) {
    return notFound("Tenant não encontrado.")
  }

  const requests = await enrollmentRequestService.listRequestsForTenant(tenant.id)
  return ok(requests)
}

export async function POST(
  request: Request,
  context: { params: Promise<{ tenantSlug: string }> }
) {
  try {
    const { tenantSlug } = await context.params
    const payload = parseSubmitPublicEnrollmentRequestInput(await request.json().catch(() => null))
    const result = await enrollmentRequestService.submitPublicRequest({
      tenantSlug,
      payload,
    })

    if (!result.ok) {
      if (result.status === 404) {
        return notFound(result.body.message)
      }

      return NextResponse.json(result.body, { status: result.status })
    }

    const response = created(result.body)
    return attachAuthSessionCookie(response, result.sessionToken)
  } catch (error) {
    if (error instanceof EnrollmentRequestValidationError) {
      return badRequest(error.message)
    }

    return NextResponse.json(
      {
        error: "internal_error",
        message: "Não foi possível solicitar acesso à academia.",
      },
      { status: 500 }
    )
  }
}
