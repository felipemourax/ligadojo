import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { toUserEntity } from "@/apps/api/src/modules/iam/domain/user-mappers"
import type { SystemAccessRole } from "@/apps/api/src/modules/iam/domain/access-roles"

export class UserRepository {
  async findById(id: string, systemRoles: SystemAccessRole[] = []) {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    return user ? toUserEntity(user, systemRoles) : null
  }

  async findByEmail(email: string, systemRoles: SystemAccessRole[] = []) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    return user ? toUserEntity(user, systemRoles) : null
  }

  async findOrCreateByEmail(
    input: {
      email: string
      cpfNormalized?: string
      name?: string
      phone?: string
      firstName?: string
      lastName?: string
      birthDate?: Date
      zipCode?: string
      street?: string
      city?: string
      state?: string
      emergencyContact?: string
    },
    systemRoles: SystemAccessRole[] = []
  ) {
    const user = await prisma.user.upsert({
      where: { email: input.email },
      update: {
        cpfNormalized: input.cpfNormalized,
        name: input.name,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
        birthDate: input.birthDate,
        zipCode: input.zipCode,
        street: input.street,
        city: input.city,
        state: input.state,
        emergencyContact: input.emergencyContact,
      },
      create: {
        email: input.email,
        cpfNormalized: input.cpfNormalized,
        name: input.name,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
        birthDate: input.birthDate,
        zipCode: input.zipCode,
        street: input.street,
        city: input.city,
        state: input.state,
        emergencyContact: input.emergencyContact,
      },
    })

    return toUserEntity(user, systemRoles)
  }

  async updateEmail(userId: string, email: string, systemRoles: SystemAccessRole[] = []) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { email },
    })

    return toUserEntity(user, systemRoles)
  }
}
