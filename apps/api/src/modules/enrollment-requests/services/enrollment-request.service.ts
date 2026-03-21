import {
  TeacherProfileCompleteness,
  EnrollmentRequestStatus,
  TeacherProfileStatus,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { createPasswordHash } from "@/apps/api/src/common/auth/password-hasher"
import { toPrismaMembershipStatus } from "@/apps/api/src/modules/academy-memberships/domain/academy-membership-prisma"
import { toAcademyMembershipEntity } from "@/apps/api/src/modules/academy-memberships/domain/academy-membership-mappers"
import { toEnrollmentRequestEntity } from "@/apps/api/src/modules/enrollment-requests/domain/enrollment-request-mappers"
import type { SubmitPublicEnrollmentRequestInput } from "@/apps/api/src/modules/enrollment-requests/contracts/submit-public-enrollment-request.input"
import { EnrollmentRequestValidationError } from "@/apps/api/src/modules/enrollment-requests/contracts/submit-public-enrollment-request.parser"
import { EnrollmentRequestRepository } from "@/apps/api/src/modules/enrollment-requests/repositories/enrollment-request.repository"
import { AcademyMembershipRepository } from "@/apps/api/src/modules/academy-memberships/repositories/academy-membership.repository"
import { PasswordCredentialRepository } from "@/apps/api/src/modules/iam/repositories/password-credential.repository"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"
import { PasswordAuthService } from "@/apps/api/src/modules/iam/services/password-auth.service"
import { UserSessionService } from "@/apps/api/src/modules/iam/services/user-session.service"
import { InvitationRepository } from "@/apps/api/src/modules/invitations/repositories/invitation.repository"
import { StudentDashboardService } from "@/apps/api/src/modules/students/services/student-dashboard.service"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { TeacherProfileRegistrationService } from "@/apps/api/src/modules/teachers/services/teacher-profile-registration.service"

interface EnrollmentPublicErrorResponse {
  error: string
  message: string
  details?: Record<string, unknown>
}

interface SubmitPublicEnrollmentRequestErrorResult {
  ok: false
  status: 401 | 404 | 409
  body: EnrollmentPublicErrorResponse
}

interface SubmitPublicEnrollmentRequestSuccessResult {
  ok: true
  sessionToken: string
  body: {
    user: Awaited<ReturnType<UserRepository["findOrCreateByEmail"]>>
    requestedRole: "student" | "teacher" | "academy_admin"
    enrollmentRequest: Awaited<ReturnType<EnrollmentRequestRepository["findByTenantAndUser"]>> | null
    accessStatus: "active" | "pending_approval"
    setupAction?:
      | "login_existing_access"
      | "activated_existing_access"
      | "login_pending_access"
      | "activated_pending_access"
  }
}

export type SubmitPublicEnrollmentRequestResult =
  | SubmitPublicEnrollmentRequestSuccessResult
  | SubmitPublicEnrollmentRequestErrorResult

function parseBirthDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export class EnrollmentRequestService {
  constructor(
    private readonly enrollmentRequestRepository = new EnrollmentRequestRepository(),
    private readonly teacherProfileRegistrationService = new TeacherProfileRegistrationService(),
    private readonly tenantRepository = new TenantRepository(),
    private readonly userRepository = new UserRepository(),
    private readonly academyMembershipRepository = new AcademyMembershipRepository(),
    private readonly passwordCredentialRepository = new PasswordCredentialRepository(),
    private readonly passwordAuthService = new PasswordAuthService(),
    private readonly userSessionService = new UserSessionService(),
    private readonly invitationRepository = new InvitationRepository(),
    private readonly studentDashboardService = new StudentDashboardService()
  ) {}

  async listRequestsForTenant(tenantId: string) {
    return this.enrollmentRequestRepository.listByTenant(tenantId)
  }

  async submitRequest(input: {
    tenantId: string
    userId: string
    requestedRole?: "student" | "teacher" | "academy_admin"
    teacherRoleTitle?: string
    requestedActivityCategories?: string[]
    requestedModalityIds?: string[]
  }) {
    const existingRequest = await this.enrollmentRequestRepository.findByTenantAndUser(
      input.tenantId,
      input.userId
    )

    if (existingRequest) {
      if (existingRequest.status === "rejected" || existingRequest.status === "cancelled") {
        return this.enrollmentRequestRepository.reopen({
          requestId: existingRequest.id,
          requestedRole: input.requestedRole ?? "student",
          teacherRoleTitle: input.teacherRoleTitle,
          requestedActivityCategories: input.requestedActivityCategories,
          requestedModalityIds: input.requestedModalityIds,
        })
      }

      return existingRequest
    }

    return this.enrollmentRequestRepository.create({
      tenantId: input.tenantId,
      userId: input.userId,
      requestedRole: input.requestedRole ?? "student",
      teacherRoleTitle: input.teacherRoleTitle,
      requestedActivityCategories: input.requestedActivityCategories,
      requestedModalityIds: input.requestedModalityIds,
    })
  }

  async reviewRequest(input: {
    requestId: string
    status: "approved" | "rejected" | "cancelled"
  }) {
    return this.enrollmentRequestRepository.updateStatus({
      requestId: input.requestId,
      status: input.status,
      reviewedAt: new Date(),
    })
  }

  async approveAndActivateMembership(input: { requestId: string }) {
    return prisma.$transaction(async (tx) => {
      const enrollmentRequest = await tx.enrollmentRequest.findUnique({
        where: { id: input.requestId },
      })

      if (!enrollmentRequest) {
        return null
      }

      if (enrollmentRequest.status !== EnrollmentRequestStatus.PENDING) {
        const existingMembership = await tx.academyMembership.findUnique({
          where: {
            userId_tenantId: {
              userId: enrollmentRequest.userId,
              tenantId: enrollmentRequest.tenantId,
            },
          },
        })

        return {
          request: toEnrollmentRequestEntity(enrollmentRequest),
          membership: existingMembership ? toAcademyMembershipEntity(existingMembership) : null,
        }
      }

      const acceptedAt = new Date()

      const membership = await tx.academyMembership.upsert({
        where: {
          userId_tenantId: {
            userId: enrollmentRequest.userId,
            tenantId: enrollmentRequest.tenantId,
          },
        },
        create: {
          userId: enrollmentRequest.userId,
          tenantId: enrollmentRequest.tenantId,
          role: enrollmentRequest.requestedRole,
          status: toPrismaMembershipStatus("active"),
          acceptedAt,
        },
        update: {
          status: toPrismaMembershipStatus("active"),
          acceptedAt,
          role: enrollmentRequest.requestedRole,
        },
      })

      const approvedRequest = await tx.enrollmentRequest.update({
        where: { id: enrollmentRequest.id },
        data: {
          status: EnrollmentRequestStatus.APPROVED,
          reviewedAt: acceptedAt,
        },
      })

      if (enrollmentRequest.requestedRole === "TEACHER") {
        await this.teacherProfileRegistrationService.upsertFromUser({
          db: tx,
          tenantId: enrollmentRequest.tenantId,
          userId: enrollmentRequest.userId,
          membershipId: membership.id,
          requestedModalityIds: enrollmentRequest.requestedModalityIds,
          roleTitle: enrollmentRequest.teacherRoleTitle ?? null,
          status: TeacherProfileStatus.ACTIVE,
        })
      }

      return {
        request: toEnrollmentRequestEntity(approvedRequest),
        membership: toAcademyMembershipEntity(membership),
      }
    })
  }

  async rejectAndRevokeMembership(input: { requestId: string }) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.enrollmentRequest.update({
        where: { id: input.requestId },
        data: {
          status: EnrollmentRequestStatus.REJECTED,
          reviewedAt: new Date(),
        },
      })

      await tx.academyMembership.updateMany({
        where: {
          userId: request.userId,
          tenantId: request.tenantId,
          status: toPrismaMembershipStatus("pending"),
        },
        data: {
          status: toPrismaMembershipStatus("revoked"),
        },
      })

      if (request.requestedRole === "TEACHER") {
        const existingMembership = await tx.academyMembership.findUnique({
          where: {
            userId_tenantId: {
              userId: request.userId,
              tenantId: request.tenantId,
            },
          },
        })

        await this.teacherProfileRegistrationService.upsertFromUser({
          db: tx,
          tenantId: request.tenantId,
          userId: request.userId,
          membershipId: existingMembership?.id ?? null,
          requestedModalityIds: request.requestedModalityIds,
          roleTitle: request.teacherRoleTitle ?? null,
          status: TeacherProfileStatus.DRAFT,
        })
      }

      return toEnrollmentRequestEntity(request)
    })
  }

  async submitPublicRequest(input: {
    tenantSlug: string
    payload: SubmitPublicEnrollmentRequestInput
  }): Promise<SubmitPublicEnrollmentRequestResult> {
    const tenant = await this.tenantRepository.findBySlug(input.tenantSlug)

    if (!tenant) {
      return {
        ok: false,
        status: 404,
        body: {
          error: "not_found",
          message: "Tenant não encontrado.",
        },
      }
    }

    const birthDate = parseBirthDate(input.payload.birthDate)

    if (!birthDate) {
      throw new EnrollmentRequestValidationError("Campo obrigatório: birthDate.")
    }

    const pendingTeacherInvitation =
      input.payload.requestedRole === "teacher"
        ? await this.invitationRepository.findPendingByTenantEmailRole({
            tenantId: tenant.id,
            email: input.payload.email,
            role: "teacher",
          })
        : null

    const existingUser = await this.userRepository.findByEmail(input.payload.email)
    const existingMembership = existingUser
      ? await this.academyMembershipRepository.findByUserAndTenant(existingUser.id, tenant.id)
      : null
    const existingCredential = existingUser
      ? await this.passwordCredentialRepository.findByUserId(existingUser.id)
      : null

    if (pendingTeacherInvitation && !existingMembership) {
      return {
        ok: false,
        status: 409,
        body: {
          error: "conflict",
          message:
            "A academia já iniciou seu acesso. Aceite o convite para criar a senha e concluir a entrada.",
          details: {
            code: "invitation_pending",
            nextAction: "accept_invitation",
            acceptInvitationPath: `/aceitar-convite/${pendingTeacherInvitation.token}`,
            loginPath: "/login",
          },
        },
      }
    }

    const user = await this.userRepository.findOrCreateByEmail({
      email: input.payload.email,
      cpfNormalized: input.payload.cpf,
      name: `${input.payload.firstName} ${input.payload.lastName}`.trim(),
      phone: input.payload.whatsapp,
      firstName: input.payload.firstName,
      lastName: input.payload.lastName,
      birthDate,
      zipCode: input.payload.zipCode,
      street: input.payload.street,
      city: input.payload.city,
      state: input.payload.state,
      emergencyContact:
        input.payload.requestedRole === "student" ? input.payload.emergencyContact : undefined,
    })

    if (existingMembership?.status === "invited") {
      return {
        ok: false,
        status: 409,
        body: {
          error: "conflict",
          message:
            "A academia já iniciou seu acesso. Aceite o convite para criar a senha e concluir a entrada.",
          details: {
            code: "invitation_pending",
            accessState: "invited",
            nextAction: "accept_invitation",
            acceptInvitationPath: pendingTeacherInvitation
              ? `/aceitar-convite/${pendingTeacherInvitation.token}`
              : null,
            loginPath: "/login",
          },
        },
      }
    }

    if (existingMembership?.status === "active") {
      if (existingMembership.role === "teacher") {
        await this.teacherProfileRegistrationService.upsertFromUser({
          tenantId: tenant.id,
          userId: user.id,
          membershipId: existingMembership.id,
          requestedModalityIds: input.payload.requestedModalityIds,
          rank: input.payload.teacherRank,
          roleTitle: input.payload.teacherRoleTitle ?? null,
          status: TeacherProfileStatus.ACTIVE,
        })
      }

      if (existingCredential) {
        if (!input.payload.password || input.payload.password.length < 8) {
          return {
            ok: false,
            status: 409,
            body: {
              error: "conflict",
              message:
                "Seu acesso a esta academia já foi criado. Entre com sua conta ou redefina sua senha.",
              details: {
                code: "access_already_exists",
                accessState: "active",
                nextAction: "login_or_reset_password",
                loginPath: "/login",
                resetPasswordPath: `/recuperar-senha?email=${encodeURIComponent(input.payload.email)}`,
              },
            },
          }
        }

        const authenticatedUser = await this.passwordAuthService.authenticateByEmail({
          email: input.payload.email,
          password: input.payload.password,
        })

        if (!authenticatedUser) {
          return {
            ok: false,
            status: 409,
            body: {
              error: "conflict",
              message:
                "Seu acesso a esta academia já foi criado. Use sua senha atual para entrar ou redefina a senha.",
              details: {
                code: "access_already_exists",
                accessState: "active",
                nextAction: "login_or_reset_password",
                loginPath: "/login",
                resetPasswordPath: `/recuperar-senha?email=${encodeURIComponent(input.payload.email)}`,
              },
            },
          }
        }
      } else {
        if (!input.payload.password || input.payload.password.length < 8) {
          throw new EnrollmentRequestValidationError(
            "Defina uma senha com pelo menos 8 caracteres para ativar seu acesso."
          )
        }

        const credential = createPasswordHash(input.payload.password)
        await this.passwordCredentialRepository.upsert({
          userId: user.id,
          passwordHash: credential.passwordHash,
          passwordSalt: credential.passwordSalt,
        })
      }

      const authSession = await this.userSessionService.createForUser(user.id)

      return {
        ok: true,
        sessionToken: authSession.token,
        body: {
          user,
          requestedRole: existingMembership.role,
          enrollmentRequest: await this.enrollmentRequestRepository.findByTenantAndUser(
            tenant.id,
            user.id
          ),
          accessStatus: "active",
          setupAction: existingCredential
            ? "login_existing_access"
            : "activated_existing_access",
        },
      }
    }

    if (existingMembership?.status === "pending") {
      if (existingMembership.role === "teacher") {
        await this.teacherProfileRegistrationService.upsertFromUser({
          tenantId: tenant.id,
          userId: user.id,
          membershipId: existingMembership.id,
          requestedModalityIds: input.payload.requestedModalityIds,
          rank: input.payload.teacherRank,
          roleTitle: input.payload.teacherRoleTitle ?? null,
          status: TeacherProfileStatus.DRAFT,
          profileCompleteness: TeacherProfileCompleteness.PENDING_PAYMENT_DETAILS,
        })
      }

      if (existingCredential) {
        if (!input.payload.password || input.payload.password.length < 8) {
          return {
            ok: false,
            status: 409,
            body: {
              error: "conflict",
              message:
                "Seu acesso já está em análise pela academia. Entre com sua conta para acompanhar o status.",
              details: {
                code: "access_pending",
                accessState: "pending",
                nextAction: "login_or_reset_password",
                loginPath: "/login",
                resetPasswordPath: `/recuperar-senha?email=${encodeURIComponent(input.payload.email)}`,
              },
            },
          }
        }

        const authenticatedUser = await this.passwordAuthService.authenticateByEmail({
          email: input.payload.email,
          password: input.payload.password,
        })

        if (!authenticatedUser) {
          return {
            ok: false,
            status: 409,
            body: {
              error: "conflict",
              message:
                "Seu acesso já está em análise pela academia. Use sua senha atual para entrar ou redefina a senha.",
              details: {
                code: "access_pending",
                accessState: "pending",
                nextAction: "login_or_reset_password",
                loginPath: "/login",
                resetPasswordPath: `/recuperar-senha?email=${encodeURIComponent(input.payload.email)}`,
              },
            },
          }
        }
      } else if (input.payload.password && input.payload.password.length >= 8) {
        const credential = createPasswordHash(input.payload.password)
        await this.passwordCredentialRepository.upsert({
          userId: user.id,
          passwordHash: credential.passwordHash,
          passwordSalt: credential.passwordSalt,
        })
      } else {
        throw new EnrollmentRequestValidationError(
          "Defina uma senha com pelo menos 8 caracteres para continuar."
        )
      }

      const authSession = await this.userSessionService.createForUser(user.id)

      return {
        ok: true,
        sessionToken: authSession.token,
        body: {
          user,
          requestedRole: existingMembership.role,
          enrollmentRequest: await this.enrollmentRequestRepository.findByTenantAndUser(
            tenant.id,
            user.id
          ),
          accessStatus: "pending_approval",
          setupAction: existingCredential
            ? "login_pending_access"
            : "activated_pending_access",
        },
      }
    }

    if (existingUser && existingCredential) {
      if (!input.payload.password || input.payload.password.length < 8) {
        throw new EnrollmentRequestValidationError(
          "Informe a senha da conta existente para solicitar vínculo."
        )
      }

      const authenticatedUser = await this.passwordAuthService.authenticateByEmail({
        email: input.payload.email,
        password: input.payload.password,
      })

      if (!authenticatedUser) {
        return {
          ok: false,
          status: 401,
          body: {
            error: "unauthorized",
            message: "Senha inválida para a conta existente.",
          },
        }
      }
    } else if (!existingCredential) {
      if (!input.payload.password || input.payload.password.length < 8) {
        throw new EnrollmentRequestValidationError(
          "Defina uma senha com pelo menos 8 caracteres para continuar."
        )
      }

      const credential = createPasswordHash(input.payload.password)
      await this.passwordCredentialRepository.upsert({
        userId: user.id,
        passwordHash: credential.passwordHash,
        passwordSalt: credential.passwordSalt,
      })
    }

    const now = new Date()
    let enrollmentRequest = null
    let accessStatus: "active" | "pending_approval" =
      input.payload.requestedRole === "student" ? "active" : "pending_approval"

    if (input.payload.requestedRole === "student") {
      await this.academyMembershipRepository.upsert({
        userId: user.id,
        tenantId: tenant.id,
        role: "student",
        status: "active",
        acceptedAt: now,
      })

      enrollmentRequest = await this.submitRequest({
        tenantId: tenant.id,
        userId: user.id,
        requestedRole: "student",
        requestedActivityCategories: input.payload.requestedActivityCategories,
      })

      if (enrollmentRequest && enrollmentRequest.status === "pending") {
        enrollmentRequest = await this.enrollmentRequestRepository.updateStatus({
          requestId: enrollmentRequest.id,
          status: "approved",
          reviewedAt: now,
        })
      }

      await this.studentDashboardService.upsert({
        tenantId: tenant.id,
        name: `${input.payload.firstName} ${input.payload.lastName}`.trim(),
        email: input.payload.email,
        phone: input.payload.whatsapp ?? null,
        birthDate: input.payload.birthDate,
        address: input.payload.street,
        emergencyContact: input.payload.emergencyContact ?? null,
        planId: null,
        practiceAssignments: input.payload.requestedActivityCategories.map((activityCategory) => ({
          activityCategory,
          classGroupId: null,
          belt: "Branca",
          stripes: 0,
          startDate: now.toISOString().slice(0, 10),
        })),
      })

      accessStatus = "active"
    } else {
      const membership = await this.academyMembershipRepository.upsert({
        userId: user.id,
        tenantId: tenant.id,
        role: "teacher",
        status: "pending",
        acceptedAt: null,
      })

      enrollmentRequest = await this.submitRequest({
        tenantId: tenant.id,
        userId: user.id,
        requestedRole: "teacher",
        teacherRoleTitle: input.payload.teacherRoleTitle,
        requestedModalityIds: input.payload.requestedModalityIds,
      })

      await this.teacherProfileRegistrationService.upsertFromUser({
        tenantId: tenant.id,
        userId: user.id,
        membershipId: membership.id,
        requestedModalityIds: input.payload.requestedModalityIds,
        rank: input.payload.teacherRank,
        roleTitle: input.payload.teacherRoleTitle ?? null,
        status: TeacherProfileStatus.DRAFT,
        profileCompleteness: TeacherProfileCompleteness.PENDING_PAYMENT_DETAILS,
      })

      accessStatus = "pending_approval"
    }

    const authSession = await this.userSessionService.createForUser(user.id)

    return {
      ok: true,
      sessionToken: authSession.token,
      body: {
        user,
        requestedRole: input.payload.requestedRole,
        enrollmentRequest,
        accessStatus,
      },
    }
  }
}
