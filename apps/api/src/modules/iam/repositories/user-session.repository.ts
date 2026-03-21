import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"

export interface UserSessionEntity {
  id: string
  userId: string
  sessionTokenHash: string
  expiresAt: string
}

export class UserSessionRepository {
  async create(input: { userId: string; sessionTokenHash: string; expiresAt: Date }) {
    const session = await prisma.userSession.create({
      data: input,
    })

    return {
      id: session.id,
      userId: session.userId,
      sessionTokenHash: session.sessionTokenHash,
      expiresAt: session.expiresAt.toISOString(),
    } satisfies UserSessionEntity
  }

  async findByTokenHash(sessionTokenHash: string) {
    const now = new Date()
    const session = await prisma.userSession.findUnique({
      where: { sessionTokenHash },
    })

    if (!session || session.expiresAt <= now) {
      return null
    }

    return {
      id: session.id,
      userId: session.userId,
      sessionTokenHash: session.sessionTokenHash,
      expiresAt: session.expiresAt.toISOString(),
    } satisfies UserSessionEntity
  }

  async deleteByTokenHash(sessionTokenHash: string) {
    await prisma.userSession.deleteMany({
      where: { sessionTokenHash },
    })
  }
}
