import type {
  AcademyRole,
  EnrollmentRequest,
  EnrollmentRequestStatus,
} from "@prisma/client"
import type { EnrollmentRequestEntity } from "@/apps/api/src/modules/enrollment-requests/domain/enrollment-request"

function mapEnrollmentRequestStatus(
  status: EnrollmentRequestStatus
): EnrollmentRequestEntity["status"] {
  return status.toLowerCase() as EnrollmentRequestEntity["status"]
}

function mapRequestedRole(role: AcademyRole): EnrollmentRequestEntity["requestedRole"] {
  return role.toLowerCase() as EnrollmentRequestEntity["requestedRole"]
}

export function toEnrollmentRequestEntity(
  enrollmentRequest: EnrollmentRequest,
  options?: {
    userName?: string
    userEmail?: string
  }
): EnrollmentRequestEntity {
  return {
    id: enrollmentRequest.id,
    tenantId: enrollmentRequest.tenantId,
    userId: enrollmentRequest.userId,
    requestedRole: mapRequestedRole(enrollmentRequest.requestedRole),
    teacherRoleTitle: enrollmentRequest.teacherRoleTitle ?? undefined,
    requestedActivityCategories: enrollmentRequest.requestedActivityCategories,
    requestedModalityIds: enrollmentRequest.requestedModalityIds,
    userName: options?.userName,
    userEmail: options?.userEmail,
    status: mapEnrollmentRequestStatus(enrollmentRequest.status),
    createdAt: enrollmentRequest.createdAt.toISOString(),
    reviewedAt: enrollmentRequest.reviewedAt?.toISOString(),
  }
}
