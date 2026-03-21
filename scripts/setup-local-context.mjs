import { randomBytes, scryptSync } from "node:crypto"
import { PrismaClient, AcademyRole, MembershipStatus, TeacherProfileStatus, SubscriptionStatus } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

const prisma = new PrismaClient({
  adapter,
})

function createPasswordHash(password) {
  const salt = randomBytes(16).toString("hex")
  const passwordHash = scryptSync(password, salt, 64).toString("hex")

  return {
    passwordHash,
    passwordSalt: salt,
  }
}

async function upsertModality({ tenantId, name, ageGroups, duration, capacity, sortOrder }) {
  const existing = await prisma.modality.findFirst({
    where: { tenantId, name },
  })

  if (existing) {
    return prisma.modality.update({
      where: { id: existing.id },
      data: {
        ageGroups,
        defaultDurationMinutes: duration,
        defaultCapacity: capacity,
        sortOrder,
        isActive: true,
      },
    })
  }

  return prisma.modality.create({
    data: {
      tenantId,
      name,
      ageGroups,
      defaultDurationMinutes: duration,
      defaultCapacity: capacity,
      sortOrder,
      isActive: true,
    },
  })
}

async function upsertPlan({
  tenantId,
  name,
  amountCents,
  billingCycle,
  sortOrder,
  modalityIds,
}) {
  const existing = await prisma.plan.findFirst({
    where: { tenantId, name },
  })

  const plan = existing
    ? await prisma.plan.update({
        where: { id: existing.id },
        data: {
          amountCents,
          billingCycle,
          sortOrder,
          isActive: true,
        },
      })
    : await prisma.plan.create({
        data: {
          tenantId,
          name,
          amountCents,
          billingCycle,
          classLimitKind: "UNLIMITED",
          sortOrder,
          isActive: true,
        },
      })

  await prisma.planModality.deleteMany({
    where: { planId: plan.id },
  })

  if (modalityIds.length > 0) {
    await prisma.planModality.createMany({
      data: modalityIds.map((modalityId) => ({
        planId: plan.id,
        modalityId,
      })),
      skipDuplicates: true,
    })
  }

  return plan
}

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "dojo-centro" },
  })

  if (!tenant) {
    throw new Error("Tenant dojo-centro não encontrado.")
  }

  const admin = await prisma.user.findUnique({
    where: { email: "joao@academia.com" },
  })

  if (!admin) {
    throw new Error("Usuário admin do tenant não encontrado.")
  }

  const jiuJitsu = await upsertModality({
    tenantId: tenant.id,
    name: "Jiu-Jitsu Adulto",
    ageGroups: ["ADULT"],
    duration: 60,
    capacity: 24,
    sortOrder: 0,
  })

  const noGi = await upsertModality({
    tenantId: tenant.id,
    name: "No-Gi",
    ageGroups: ["ADULT"],
    duration: 60,
    capacity: 22,
    sortOrder: 1,
  })

  const kids = await upsertModality({
    tenantId: tenant.id,
    name: "Jiu-Jitsu Kids",
    ageGroups: ["KIDS"],
    duration: 45,
    capacity: 18,
    sortOrder: 2,
  })

  const essentialPlan = await upsertPlan({
    tenantId: tenant.id,
    name: "Essencial",
    amountCents: 18900,
    billingCycle: "MONTHLY",
    sortOrder: 0,
    modalityIds: [jiuJitsu.id],
  })

  await upsertPlan({
    tenantId: tenant.id,
    name: "Performance",
    amountCents: 24900,
    billingCycle: "MONTHLY",
    sortOrder: 1,
    modalityIds: [jiuJitsu.id, noGi.id],
  })

  await upsertPlan({
    tenantId: tenant.id,
    name: "Kids",
    amountCents: 15900,
    billingCycle: "MONTHLY",
    sortOrder: 2,
    modalityIds: [kids.id],
  })

  const teacherUser = await prisma.user.upsert({
    where: { email: "prof.carlos.nunes@dojo-centro.local" },
    update: {
      name: "Carlos Nunes",
      phone: "71999990001",
      emergencyContact: "Recepção do Dojo",
    },
    create: {
      email: "prof.carlos.nunes@dojo-centro.local",
      name: "Carlos Nunes",
      phone: "71999990001",
      emergencyContact: "Recepção do Dojo",
    },
  })

  const studentUser = await prisma.user.upsert({
    where: { email: "aluna.larissa.costa@dojo-centro.local" },
    update: {
      name: "Larissa Costa",
      phone: "71999990002",
      street: "Rua São Salvador 90",
      city: "Salvador",
      state: "BA",
      emergencyContact: "Casa",
      birthDate: new Date("1998-08-12T00:00:00.000Z"),
    },
    create: {
      email: "aluna.larissa.costa@dojo-centro.local",
      name: "Larissa Costa",
      phone: "71999990002",
      street: "Rua São Salvador 90",
      city: "Salvador",
      state: "BA",
      emergencyContact: "Casa",
      birthDate: new Date("1998-08-12T00:00:00.000Z"),
    },
  })

  const teacherPassword = createPasswordHash("12345678")
  const studentPassword = createPasswordHash("12345678")

  await prisma.passwordCredential.upsert({
    where: { userId: teacherUser.id },
    update: teacherPassword,
    create: {
      userId: teacherUser.id,
      ...teacherPassword,
    },
  })

  await prisma.passwordCredential.upsert({
    where: { userId: studentUser.id },
    update: studentPassword,
    create: {
      userId: studentUser.id,
      ...studentPassword,
    },
  })

  const teacherMembership = await prisma.academyMembership.upsert({
    where: {
      userId_tenantId: {
        userId: teacherUser.id,
        tenantId: tenant.id,
      },
    },
    update: {
      role: AcademyRole.TEACHER,
      status: MembershipStatus.ACTIVE,
      invitedByName: admin.name ?? "Sistema",
      acceptedAt: new Date(),
    },
    create: {
      userId: teacherUser.id,
      tenantId: tenant.id,
      role: AcademyRole.TEACHER,
      status: MembershipStatus.ACTIVE,
      invitedByName: admin.name ?? "Sistema",
      acceptedAt: new Date(),
    },
  })

  const studentMembership = await prisma.academyMembership.upsert({
    where: {
      userId_tenantId: {
        userId: studentUser.id,
        tenantId: tenant.id,
      },
    },
    update: {
      role: AcademyRole.STUDENT,
      status: MembershipStatus.ACTIVE,
      invitedByName: admin.name ?? "Sistema",
      acceptedAt: new Date(),
    },
    create: {
      userId: studentUser.id,
      tenantId: tenant.id,
      role: AcademyRole.STUDENT,
      status: MembershipStatus.ACTIVE,
      invitedByName: admin.name ?? "Sistema",
      acceptedAt: new Date(),
    },
  })

  let teacherProfile = await prisma.teacherProfile.findFirst({
    where: {
      tenantId: tenant.id,
      userId: teacherUser.id,
    },
  })

  if (teacherProfile) {
    teacherProfile = await prisma.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: {
        membershipId: teacherMembership.id,
        name: teacherUser.name ?? "Carlos Nunes",
        email: teacherUser.email,
        phone: teacherUser.phone,
        rank: "Faixa Preta",
        roleTitle: "Professor",
        specialty: "Jiu-Jitsu e No-Gi",
        status: TeacherProfileStatus.ACTIVE,
      },
    })
  } else {
    teacherProfile = await prisma.teacherProfile.create({
      data: {
        tenantId: tenant.id,
        userId: teacherUser.id,
        membershipId: teacherMembership.id,
        name: teacherUser.name ?? "Carlos Nunes",
        email: teacherUser.email,
        phone: teacherUser.phone,
        rank: "Faixa Preta",
        roleTitle: "Professor",
        specialty: "Jiu-Jitsu e No-Gi",
        status: TeacherProfileStatus.ACTIVE,
      },
    })
  }

  await prisma.teacherModality.deleteMany({
    where: { teacherProfileId: teacherProfile.id },
  })

  await prisma.teacherModality.createMany({
    data: [
      { teacherProfileId: teacherProfile.id, modalityId: jiuJitsu.id },
      { teacherProfileId: teacherProfile.id, modalityId: noGi.id },
    ],
    skipDuplicates: true,
  })

  const studentProfile = await prisma.studentProfile.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: studentUser.id,
      },
    },
    update: {
      membershipId: studentMembership.id,
      emergencyContact: "Casa",
      notes: "Aluno criado para validação local do painel da academia.",
      status: "ACTIVE",
    },
    create: {
      tenantId: tenant.id,
      userId: studentUser.id,
      membershipId: studentMembership.id,
      emergencyContact: "Casa",
      notes: "Aluno criado para validação local do painel da academia.",
      status: "ACTIVE",
    },
  })

  await prisma.studentModality.deleteMany({
    where: { studentProfileId: studentProfile.id },
  })

  const studentJiuJitsu = await prisma.studentModality.create({
    data: {
      studentProfileId: studentProfile.id,
      modalityId: jiuJitsu.id,
      belt: "Branca",
      stripes: 2,
      startDate: new Date("2025-11-01T00:00:00.000Z"),
      notes: "Turma principal do aluno.",
      status: "ACTIVE",
    },
  })

  await prisma.studentModality.create({
    data: {
      studentProfileId: studentProfile.id,
      modalityId: noGi.id,
      belt: "Branca",
      stripes: 0,
      startDate: new Date("2026-01-15T00:00:00.000Z"),
      notes: "Modalidade secundária para validar múltiplas modalidades.",
      status: "ACTIVE",
    },
  })

  await prisma.studentGraduation.deleteMany({
    where: { studentModalityId: studentJiuJitsu.id },
  })

  await prisma.studentGraduation.create({
    data: {
      studentModalityId: studentJiuJitsu.id,
      fromBelt: "Branca",
      fromStripes: 1,
      toBelt: "Branca",
      toStripes: 2,
      evaluatorName: "Carlos Nunes",
      graduatedAt: new Date("2026-02-10T00:00:00.000Z"),
      notes: "Progressão inicial registrada para testes.",
    },
  })

  const classDefinitions = [
    {
      name: "Jiu-Jitsu Fundamentos",
      modalityId: jiuJitsu.id,
      modalityName: jiuJitsu.name,
      teacherName: teacherProfile.name,
      ageGroups: ["ADULT"],
      beltRange: "Branca a Azul",
      maxStudents: 24,
      schedules: [
        { weekday: 1, startTime: "19:00", endTime: "20:00" },
        { weekday: 3, startTime: "19:00", endTime: "20:00" },
      ],
    },
    {
      name: "No-Gi Competição",
      modalityId: noGi.id,
      modalityName: noGi.name,
      teacherName: teacherProfile.name,
      ageGroups: ["ADULT"],
      beltRange: "Todos os níveis",
      maxStudents: 20,
      schedules: [
        { weekday: 2, startTime: "20:00", endTime: "21:00" },
        { weekday: 4, startTime: "20:00", endTime: "21:00" },
      ],
    },
    {
      name: "Kids Iniciante",
      modalityId: kids.id,
      modalityName: kids.name,
      teacherName: "Professora Carla",
      ageGroups: ["KIDS"],
      beltRange: "Branca a Cinza",
      maxStudents: 18,
      schedules: [{ weekday: 6, startTime: "09:00", endTime: "09:45" }],
    },
  ]

  for (const definition of classDefinitions) {
    const existing = await prisma.classGroup.findFirst({
      where: {
        tenantId: tenant.id,
        name: definition.name,
      },
    })

    const classGroup = existing
      ? await prisma.classGroup.update({
          where: { id: existing.id },
          data: {
            modalityId: definition.modalityId,
            teacherProfileId:
              definition.teacherName === teacherProfile.name ? teacherProfile.id : null,
            modalityName: definition.modalityName,
            teacherName: definition.teacherName,
            ageGroups: definition.ageGroups,
            beltRange: definition.beltRange,
            maxStudents: definition.maxStudents,
            currentStudents: definition.name === "Kids Iniciante" ? 0 : 1,
            status: "ACTIVE",
          },
        })
      : await prisma.classGroup.create({
          data: {
            tenantId: tenant.id,
            modalityId: definition.modalityId,
            teacherProfileId:
              definition.teacherName === teacherProfile.name ? teacherProfile.id : null,
            name: definition.name,
            modalityName: definition.modalityName,
            teacherName: definition.teacherName,
            ageGroups: definition.ageGroups,
            beltRange: definition.beltRange,
            maxStudents: definition.maxStudents,
            currentStudents: definition.name === "Kids Iniciante" ? 0 : 1,
            status: "ACTIVE",
          },
        })

    await prisma.classSchedule.deleteMany({
      where: { classGroupId: classGroup.id },
    })

    await prisma.classSchedule.createMany({
      data: definition.schedules.map((schedule) => ({
        classGroupId: classGroup.id,
        weekday: schedule.weekday,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })),
    })
  }

  await prisma.subscription.upsert({
    where: {
      id: `local-context-${studentUser.id}`,
    },
    update: {
      tenantId: tenant.id,
      userId: studentUser.id,
      planId: essentialPlan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-04-01T00:00:00.000Z"),
    },
    create: {
      id: `local-context-${studentUser.id}`,
      tenantId: tenant.id,
      userId: studentUser.id,
      planId: essentialPlan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-04-01T00:00:00.000Z"),
    },
  })

  console.log(JSON.stringify({
    tenant: tenant.slug,
    modalities: [jiuJitsu.name, noGi.name, kids.name],
    plans: ["Essencial", "Performance", "Kids"],
    classes: classDefinitions.map((item) => item.name),
    teacherUser: {
      email: teacherUser.email,
      password: "12345678",
    },
    studentUser: {
      email: studentUser.email,
      password: "12345678",
    },
  }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
