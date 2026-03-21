import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { toAcademyMembershipEntity } from "@/apps/api/src/modules/academy-memberships/domain/academy-membership-mappers"
import {
  toPrismaMembershipRole,
  toPrismaMembershipStatus,
} from "@/apps/api/src/modules/academy-memberships/domain/academy-membership-prisma"

export class AcademyMembershipRepository {
  async findByUserAndTenant(userId: string, tenantId: string) {
    const membership = await prisma.academyMembership.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
    })

    return membership ? toAcademyMembershipEntity(membership) : null
  }

  async listByUser(userId: string) {
    const memberships = await prisma.academyMembership.findMany({
      where: { userId },
      orderBy: [{ updatedAt: "desc" }],
    })

    return memberships.map(toAcademyMembershipEntity)
  }

  async listByTenant(tenantId: string) {
    const memberships = await prisma.academyMembership.findMany({
      where: { tenantId },
      orderBy: [{ createdAt: "desc" }],
    })

    return memberships.map(toAcademyMembershipEntity)
  }

  async findById(id: string) {
    const membership = await prisma.academyMembership.findUnique({
      where: { id },
    })

    return membership ? toAcademyMembershipEntity(membership) : null
  }

  async create(input: {
    userId: string
    tenantId: string
    role: "academy_admin" | "teacher" | "student"
    status?: "invited" | "pending" | "active" | "suspended" | "revoked"
    invitedByName?: string
    acceptedAt?: Date
  }) {
    const membership = await prisma.academyMembership.create({
      data: {
        userId: input.userId,
        tenantId: input.tenantId,
        role: toPrismaMembershipRole(input.role),
        status: toPrismaMembershipStatus(input.status ?? "pending"),
        invitedByName: input.invitedByName,
        acceptedAt: input.acceptedAt,
      },
    })

    return toAcademyMembershipEntity(membership)
  }

  async upsert(input: {
    userId: string
    tenantId: string
    role: "academy_admin" | "teacher" | "student"
    status: "invited" | "pending" | "active" | "suspended" | "revoked"
    invitedByName?: string
    acceptedAt?: Date | null
  }) {
    const membership = await prisma.academyMembership.upsert({
      where: {
        userId_tenantId: {
          userId: input.userId,
          tenantId: input.tenantId,
        },
      },
      create: {
        userId: input.userId,
        tenantId: input.tenantId,
        role: toPrismaMembershipRole(input.role),
        status: toPrismaMembershipStatus(input.status),
        invitedByName: input.invitedByName,
        acceptedAt: input.acceptedAt ?? null,
      },
      update: {
        role: toPrismaMembershipRole(input.role),
        status: toPrismaMembershipStatus(input.status),
        invitedByName: input.invitedByName,
        acceptedAt: input.acceptedAt ?? null,
      },
    })

    return toAcademyMembershipEntity(membership)
  }

  async updateStatus(input: {
    userId: string
    tenantId: string
    status: "invited" | "pending" | "active" | "suspended" | "revoked"
    acceptedAt?: Date | null
  }) {
    const membership = await prisma.academyMembership.update({
      where: {
        userId_tenantId: {
          userId: input.userId,
          tenantId: input.tenantId,
        },
      },
      data: {
        status: toPrismaMembershipStatus(input.status),
        acceptedAt: input.acceptedAt ?? undefined,
      },
    })

    return toAcademyMembershipEntity(membership)
  }
}
