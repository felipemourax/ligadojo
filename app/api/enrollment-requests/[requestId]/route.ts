import { NextResponse } from "next/server"
import { requireTenantCapability } from "@/app/api/_lib/tenant-capability"
import { EnrollmentRequestRepository } from "@/apps/api/src/modules/enrollment-requests/repositories/enrollment-request.repository"
import { EnrollmentRequestService } from "@/apps/api/src/modules/enrollment-requests/services/enrollment-request.service"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { capabilities } from "@/lib/capabilities"

const enrollmentRequestRepository = new EnrollmentRequestRepository()
const enrollmentRequestService = new EnrollmentRequestService()
const tenantRepository = new TenantRepository()

export async function PATCH(
  request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await context.params
  const body = await request.json()

  if (!body?.action || !["approve", "reject"].includes(body.action)) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Campo action deve ser 'approve' ou 'reject'.",
      },
      { status: 400 }
    )
  }

  const enrollmentRequest = await enrollmentRequestRepository.findById(requestId)

  if (!enrollmentRequest) {
    return NextResponse.json(
      {
        error: "not_found",
        message: "Solicitação de vínculo não encontrada.",
      },
      { status: 404 }
    )
  }

  const tenant = await tenantRepository.findById(enrollmentRequest.tenantId)

  if (!tenant) {
    return NextResponse.json(
      {
        error: "not_found",
        message: "Tenant não encontrado.",
      },
      { status: 404 }
    )
  }

  const access = await requireTenantCapability({
    tenantSlug: tenant.slug,
    capability: capabilities.ENROLLMENT_REVIEW,
  })

  if (!access.ok) {
    return access.response
  }

  if (body.action === "approve") {
    const result = await enrollmentRequestService.approveAndActivateMembership({
      requestId,
    })

    if (!result) {
      return NextResponse.json(
        {
          error: "not_found",
          message: "Solicitação de vínculo não encontrada.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json(result, { status: 200 })
  }

  const result = await enrollmentRequestService.rejectAndRevokeMembership({ requestId })
  return NextResponse.json(result, { status: 200 })
}
