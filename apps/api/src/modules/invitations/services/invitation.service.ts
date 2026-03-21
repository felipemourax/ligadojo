import { randomUUID } from "node:crypto"
import { InvitationStatus, TeacherProfileStatus } from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { toPrismaMembershipStatus } from "@/apps/api/src/modules/academy-memberships/domain/academy-membership-prisma"
import { toAcademyMembershipEntity } from "@/apps/api/src/modules/academy-memberships/domain/academy-membership-mappers"
import { toInvitationEntity } from "@/apps/api/src/modules/invitations/domain/invitation-mappers"
import { InvitationRepository } from "@/apps/api/src/modules/invitations/repositories/invitation.repository"
import { TeacherProfileRegistrationService } from "@/apps/api/src/modules/teachers/services/teacher-profile-registration.service"

function normalizeInvitationEmail(email: string) {
  return email.trim().toLowerCase()
}

export class InvitationService {
  constructor(
    private readonly invitationRepository = new InvitationRepository(),
    private readonly teacherProfileRegistrationService = new TeacherProfileRegistrationService()
  ) {}

  async listInvitationsForTenant(tenantId: string) {
    return this.invitationRepository.listByTenant(tenantId)
  }

  async createInvitation(input: {
    tenantId: string
    email: string
    role: "academy_admin" | "teacher" | "student"
    invitedByName: string
    expiresInDays?: number
  }) {
    const normalizedEmail = normalizeInvitationEmail(input.email)
    const existing = await this.invitationRepository.findPendingByTenantEmailRole({
      tenantId: input.tenantId,
      email: normalizedEmail,
      role: input.role,
    })

    if (existing) {
      return existing
    }

    const expiresInDays = input.expiresInDays ?? 7
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    return this.invitationRepository.create({
      tenantId: input.tenantId,
      email: normalizedEmail,
      role: input.role,
      token: randomUUID(),
      invitedByName: input.invitedByName,
      expiresAt,
    })
  }

  async acceptInvitation(token: string, acceptedByUserId: string) {
    const invitation = await this.invitationRepository.findByToken(token)

    if (!invitation) {
      return null
    }

    if (invitation.status !== "pending") {
      return invitation
    }

    return this.invitationRepository.updateStatus({
      invitationId: invitation.id,
      status: "accepted",
      acceptedByUserId,
    })
  }

  async acceptInvitationAndActivateMembership(input: {
    token: string
    acceptedByUserId: string
  }) {
    return prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.findUnique({
        where: { token: input.token },
      })

      if (!invitation) {
        return null
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        const existingMembership = await tx.academyMembership.findUnique({
          where: {
            userId_tenantId: {
              userId: input.acceptedByUserId,
              tenantId: invitation.tenantId,
            },
          },
        })

        return {
          invitation: toInvitationEntity(invitation),
          membership: existingMembership ? toAcademyMembershipEntity(existingMembership) : null,
        }
      }

      const acceptedAt = new Date()

      const membership = await tx.academyMembership.upsert({
        where: {
          userId_tenantId: {
            userId: input.acceptedByUserId,
            tenantId: invitation.tenantId,
          },
        },
        create: {
          userId: input.acceptedByUserId,
          tenantId: invitation.tenantId,
          role: invitation.role,
          status: toPrismaMembershipStatus("active"),
          invitedByName: invitation.invitedByName,
          acceptedAt,
        },
        update: {
          role: invitation.role,
          status: toPrismaMembershipStatus("active"),
          invitedByName: invitation.invitedByName,
          acceptedAt,
        },
      })

      const acceptedInvitation = await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedById: input.acceptedByUserId,
        },
      })

      if (invitation.role === "TEACHER") {
        await this.teacherProfileRegistrationService.upsertFromUser({
          db: tx,
          tenantId: invitation.tenantId,
          userId: input.acceptedByUserId,
          membershipId: membership.id,
          status: TeacherProfileStatus.ACTIVE,
        })
      }

      return {
        invitation: toInvitationEntity(acceptedInvitation),
        membership: toAcademyMembershipEntity(membership),
      }
    })
  }
}
