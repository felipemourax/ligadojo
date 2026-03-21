import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"

export interface PasswordResetTokenEntity {
  id: string
  userId: string
  tokenHash: string
  expiresAt: string
  usedAt?: string
}

export class PasswordResetTokenRepository {
  async create(input: { userId: string; tokenHash: string; expiresAt: Date }) {
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: input.userId,
        usedAt: null,
      },
    })

    const token = await prisma.passwordResetToken.create({
      data: input,
    })

    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt.toISOString(),
      usedAt: token.usedAt ? token.usedAt.toISOString() : undefined,
    } satisfies PasswordResetTokenEntity
  }

  async findActiveByTokenHash(tokenHash: string) {
    const now = new Date()
    const token = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    })

    if (!token || token.usedAt || token.expiresAt <= now) {
      return null
    }

    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt.toISOString(),
      usedAt: undefined,
    } satisfies PasswordResetTokenEntity
  }

  async markUsed(id: string) {
    const token = await prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    })

    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt.toISOString(),
      usedAt: token.usedAt ? token.usedAt.toISOString() : undefined,
    } satisfies PasswordResetTokenEntity
  }
}
