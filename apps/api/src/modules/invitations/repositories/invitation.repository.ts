import { AcademyRole, InvitationStatus } from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { toInvitationEntity } from "@/apps/api/src/modules/invitations/domain/invitation-mappers"

function toPrismaInvitationRole(role: "academy_admin" | "teacher" | "student"): AcademyRole {
  switch (role) {
    case "academy_admin":
      return AcademyRole.ACADEMY_ADMIN
    case "teacher":
      return AcademyRole.TEACHER
    case "student":
      return AcademyRole.STUDENT
  }
}

function toPrismaInvitationStatus(
  status: "pending" | "accepted" | "expired" | "revoked"
): InvitationStatus {
  switch (status) {
    case "pending":
      return InvitationStatus.PENDING
    case "accepted":
      return InvitationStatus.ACCEPTED
    case "expired":
      return InvitationStatus.EXPIRED
    case "revoked":
      return InvitationStatus.REVOKED
  }
}

export class InvitationRepository {
  async findPendingByTenantEmailRole(input: {
    tenantId: string
    email: string
    role: "academy_admin" | "teacher" | "student"
  }) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        tenantId: input.tenantId,
        email: input.email,
        role: toPrismaInvitationRole(input.role),
        status: InvitationStatus.PENDING,
      },
      orderBy: [{ createdAt: "desc" }],
    })

    return invitation ? toInvitationEntity(invitation) : null
  }

  async findById(id: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    })

    return invitation ? toInvitationEntity(invitation) : null
  }

  async findByToken(token: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    })

    return invitation ? toInvitationEntity(invitation) : null
  }

  async listByTenant(tenantId: string) {
    const invitations = await prisma.invitation.findMany({
      where: { tenantId },
      orderBy: [{ createdAt: "desc" }],
    })

    return invitations.map(toInvitationEntity)
  }

  async create(input: {
    tenantId: string
    email: string
    role: "academy_admin" | "teacher" | "student"
    token: string
    invitedByName: string
    expiresAt: Date
  }) {
    const invitation = await prisma.invitation.create({
      data: {
        tenantId: input.tenantId,
        email: input.email,
        role: toPrismaInvitationRole(input.role),
        token: input.token,
        invitedByName: input.invitedByName,
        expiresAt: input.expiresAt,
      },
    })

    return toInvitationEntity(invitation)
  }

  async updateStatus(input: {
    invitationId: string
    status: "pending" | "accepted" | "expired" | "revoked"
    acceptedByUserId?: string
  }) {
    const invitation = await prisma.invitation.update({
      where: { id: input.invitationId },
      data: {
        status: toPrismaInvitationStatus(input.status),
        acceptedById: input.acceptedByUserId,
      },
    })

    return toInvitationEntity(invitation)
  }
}
