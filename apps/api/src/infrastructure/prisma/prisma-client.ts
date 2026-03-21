import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

function createPrismaClient() {
  const datasourceUrl = process.env.DATABASE_URL

  if (!datasourceUrl) {
    throw new Error("DATABASE_URL não configurada para inicializar o Prisma Client.")
  }

  const adapter = new PrismaPg({ connectionString: datasourceUrl })

  return new PrismaClient({
    adapter,
    log: ["warn", "error"],
  })
}

type PrismaClientInstance = ReturnType<typeof createPrismaClient>

declare global {
  // eslint-disable-next-line no-var
  var __dojoPrisma__: PrismaClientInstance | undefined
}

export const prisma =
  globalThis.__dojoPrisma__ ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__dojoPrisma__ = prisma
}
