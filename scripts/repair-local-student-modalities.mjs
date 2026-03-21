import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const modalityPlan = {
  "maria@email.com": [
    { name: "Jiu-Jitsu", belt: "Roxa", stripes: 3, startDate: "2021-06-15T00:00:00.000Z" },
    { name: "Jiu-Jitsu Kids", belt: "Branca", stripes: 1, startDate: "2025-02-10T00:00:00.000Z" },
  ],
  "carlos@email.com": [
    { name: "Jiu-Jitsu", belt: "Azul", stripes: 2, startDate: "2023-03-10T00:00:00.000Z" },
  ],
  "ana@email.com": [
    { name: "Jiu-Jitsu", belt: "Marrom", stripes: 1, startDate: "2019-02-20T00:00:00.000Z" },
  ],
  "pedro@email.com": [
    { name: "Jiu-Jitsu", belt: "Azul", stripes: 0, startDate: "2023-08-15T00:00:00.000Z" },
  ],
  "joao.oliveira@email.com": [
    { name: "Jiu-Jitsu Kids", belt: "Branca", stripes: 4, startDate: "2023-09-01T00:00:00.000Z", status: "INACTIVE" },
  ],
  "aluna.larissa.costa@dojo-centro.local": [
    { name: "Jiu-Jitsu", belt: "Branca", stripes: 2, startDate: "2025-11-01T00:00:00.000Z" },
    { name: "No-Gi", belt: "Branca", stripes: 0, startDate: "2026-01-15T00:00:00.000Z" },
  ],
}

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "dojo-centro" },
    select: { id: true },
  })

  if (!tenant) {
    throw new Error("Tenant dojo-centro não encontrado.")
  }

  const profiles = await prisma.studentProfile.findMany({
    where: { tenantId: tenant.id },
    include: {
      user: { select: { email: true, name: true } },
      modalities: { select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const modalities = await prisma.modality.findMany({
    where: { tenantId: tenant.id, isActive: true },
    select: { id: true, name: true },
  })

  const modalityByName = new Map(modalities.map((item) => [item.name, item.id]))
  let created = 0

  for (const profile of profiles) {
    if (profile.modalities.length > 0) {
      continue
    }

    const plan = modalityPlan[profile.user.email] ?? []
    for (const entry of plan) {
      const modalityId = modalityByName.get(entry.name)
      if (!modalityId) {
        continue
      }

      await prisma.studentModality.create({
        data: {
          studentProfileId: profile.id,
          modalityId,
          belt: entry.belt,
          stripes: entry.stripes,
          startDate: new Date(entry.startDate),
          status: entry.status ?? "ACTIVE",
        },
      })
      created += 1
    }
  }

  console.log(JSON.stringify({ repairedProfiles: profiles.length, createdStudentModalities: created }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
