import { AcademyMembershipRepository } from "@/apps/api/src/modules/academy-memberships/repositories/academy-membership.repository"

export class AcademyMembershipService {
  constructor(
    private readonly academyMembershipRepository = new AcademyMembershipRepository()
  ) {}

  async getMembershipForTenant(userId: string, tenantId: string) {
    return this.academyMembershipRepository.findByUserAndTenant(userId, tenantId)
  }

  async listMembershipsForUser(userId: string) {
    return this.academyMembershipRepository.listByUser(userId)
  }

  async listMembershipsForTenant(tenantId: string) {
    return this.academyMembershipRepository.listByTenant(tenantId)
  }

  async createAcademyAdminMembership(input: {
    userId: string
    tenantId: string
    invitedByName?: string
  }) {
    return this.academyMembershipRepository.create({
      userId: input.userId,
      tenantId: input.tenantId,
      role: "academy_admin",
      status: "active",
      invitedByName: input.invitedByName,
      acceptedAt: new Date(),
    })
  }
}
