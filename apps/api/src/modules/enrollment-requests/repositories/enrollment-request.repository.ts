import { AcademyRole, EnrollmentRequestStatus } from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { toEnrollmentRequestEntity } from "@/apps/api/src/modules/enrollment-requests/domain/enrollment-request-mappers"

function toPrismaEnrollmentRequestStatus(
  status: "pending" | "approved" | "rejected" | "cancelled"
): EnrollmentRequestStatus {
  switch (status) {
    case "pending":
      return EnrollmentRequestStatus.PENDING
    case "approved":
      return EnrollmentRequestStatus.APPROVED
    case "rejected":
      return EnrollmentRequestStatus.REJECTED
    case "cancelled":
      return EnrollmentRequestStatus.CANCELLED
  }
}

function toPrismaRequestedRole(
  role: "student" | "teacher" | "academy_admin"
): AcademyRole {
  switch (role) {
    case "student":
      return AcademyRole.STUDENT
    case "teacher":
      return AcademyRole.TEACHER
    case "academy_admin":
      return AcademyRole.ACADEMY_ADMIN
  }
}

export class EnrollmentRequestRepository {
  async findById(id: string) {
    const request = await prisma.enrollmentRequest.findUnique({
      where: { id },
    })

    return request ? toEnrollmentRequestEntity(request) : null
  }

  async findByTenantAndUser(tenantId: string, userId: string) {
    const request = await prisma.enrollmentRequest.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    })

    return request ? toEnrollmentRequestEntity(request) : null
  }

  async listByTenant(tenantId: string) {
    const requests = await prisma.enrollmentRequest.findMany({
      where: { tenantId },
      include: {
        user: true,
      },
      orderBy: [{ createdAt: "desc" }],
    })

    return requests.map((request) =>
      toEnrollmentRequestEntity(request, {
        userName: request.user.name ?? request.user.email,
        userEmail: request.user.email,
      })
    )
  }

  async create(input: {
    tenantId: string
    userId: string
    requestedRole: "student" | "teacher" | "academy_admin"
    teacherRoleTitle?: string
    requestedActivityCategories?: string[]
    requestedModalityIds?: string[]
  }) {
    const request = await prisma.enrollmentRequest.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        requestedRole: toPrismaRequestedRole(input.requestedRole),
        teacherRoleTitle: input.teacherRoleTitle,
        requestedActivityCategories: input.requestedActivityCategories ?? [],
        requestedModalityIds: input.requestedModalityIds ?? [],
      },
    })

    return toEnrollmentRequestEntity(request)
  }

  async updateStatus(input: {
    requestId: string
    status: "pending" | "approved" | "rejected" | "cancelled"
    reviewedAt?: Date
  }) {
    const request = await prisma.enrollmentRequest.update({
      where: { id: input.requestId },
      data: {
        status: toPrismaEnrollmentRequestStatus(input.status),
        reviewedAt: input.reviewedAt ?? null,
      },
    })

    return toEnrollmentRequestEntity(request)
  }

  async reopen(input: {
    requestId: string
    requestedRole: "student" | "teacher" | "academy_admin"
    teacherRoleTitle?: string
    requestedActivityCategories?: string[]
    requestedModalityIds?: string[]
  }) {
    const request = await prisma.enrollmentRequest.update({
      where: { id: input.requestId },
      data: {
        requestedRole: toPrismaRequestedRole(input.requestedRole),
        teacherRoleTitle: input.teacherRoleTitle,
        requestedActivityCategories: input.requestedActivityCategories ?? [],
        requestedModalityIds: input.requestedModalityIds ?? [],
        status: EnrollmentRequestStatus.PENDING,
        reviewedAt: null,
      },
    })

    return toEnrollmentRequestEntity(request)
  }
}
