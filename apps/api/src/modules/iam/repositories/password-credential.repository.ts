import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"

export interface PasswordCredentialEntity {
  userId: string
  passwordHash: string
  passwordSalt: string
}

export class PasswordCredentialRepository {
  async findByUserId(userId: string): Promise<PasswordCredentialEntity | null> {
    const credential = await prisma.passwordCredential.findUnique({
      where: { userId },
    })

    if (!credential) {
      return null
    }

    return {
      userId: credential.userId,
      passwordHash: credential.passwordHash,
      passwordSalt: credential.passwordSalt,
    }
  }

  async upsert(input: PasswordCredentialEntity) {
    const credential = await prisma.passwordCredential.upsert({
      where: { userId: input.userId },
      update: {
        passwordHash: input.passwordHash,
        passwordSalt: input.passwordSalt,
      },
      create: input,
    })

    return {
      userId: credential.userId,
      passwordHash: credential.passwordHash,
      passwordSalt: credential.passwordSalt,
    }
  }
}
