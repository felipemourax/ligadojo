import type { SystemAccessRole } from "@/apps/api/src/modules/iam/domain/access-roles"

export interface UserEntity {
  id: string
  email: string
  cpfNormalized?: string
  phone?: string
  name?: string
  status: "active" | "blocked"
  systemRoles: SystemAccessRole[]
}
