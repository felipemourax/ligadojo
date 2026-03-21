import type { User, UserStatus } from "@prisma/client"
import type { UserEntity } from "@/apps/api/src/modules/iam/domain/user"

function mapUserStatus(status: UserStatus): UserEntity["status"] {
  return status.toLowerCase() as UserEntity["status"]
}

export function toUserEntity(user: User, systemRoles: UserEntity["systemRoles"]): UserEntity {
  return {
    id: user.id,
    email: user.email,
    cpfNormalized: user.cpfNormalized ?? undefined,
    phone: user.phone ?? undefined,
    name: user.name ?? undefined,
    status: mapUserStatus(user.status),
    systemRoles,
  }
}
