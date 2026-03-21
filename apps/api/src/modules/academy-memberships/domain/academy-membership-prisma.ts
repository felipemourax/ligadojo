import { AcademyRole, MembershipStatus } from "@prisma/client"
import type { AcademyMembershipEntity } from "@/apps/api/src/modules/academy-memberships/domain/academy-membership"

export function toPrismaMembershipRole(
  role: AcademyMembershipEntity["role"]
): AcademyRole {
  switch (role) {
    case "academy_admin":
      return AcademyRole.ACADEMY_ADMIN
    case "teacher":
      return AcademyRole.TEACHER
    case "student":
      return AcademyRole.STUDENT
  }
}

export function toPrismaMembershipStatus(
  status: AcademyMembershipEntity["status"]
): MembershipStatus {
  switch (status) {
    case "invited":
      return MembershipStatus.INVITED
    case "pending":
      return MembershipStatus.PENDING
    case "active":
      return MembershipStatus.ACTIVE
    case "suspended":
      return MembershipStatus.SUSPENDED
    case "revoked":
      return MembershipStatus.REVOKED
  }
}
