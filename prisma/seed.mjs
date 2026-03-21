import { randomBytes, scryptSync } from "node:crypto"
import {
  PrismaClient,
  AcademyRole,
  MembershipStatus,
  InvitationStatus,
  EnrollmentRequestStatus,
  TeacherProfileStatus,
  ClassGroupStatus,
  ClassSessionStatus,
  SubscriptionStatus,
} from "@prisma/client"
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

async function main() {
  const dojoCentro = await prisma.tenant.upsert({
    where: { slug: "dojo-centro" },
    update: {
      legalName: "Dojo Centro Artes Marciais LTDA",
      displayName: "Dojo Centro",
      brandingJson: {
        themeColor: "#16a34a",
        appName: "Dojo Centro App",
      },
    },
    create: {
      slug: "dojo-centro",
      legalName: "Dojo Centro Artes Marciais LTDA",
      displayName: "Dojo Centro",
      brandingJson: {
        themeColor: "#16a34a",
        appName: "Dojo Centro App",
      },
    },
  })

  const fightLab = await prisma.tenant.upsert({
    where: { slug: "fight-lab" },
    update: {
      legalName: "Fight Lab Performance LTDA",
      displayName: "Fight Lab",
    },
    create: {
      slug: "fight-lab",
      legalName: "Fight Lab Performance LTDA",
      displayName: "Fight Lab",
    },
  })

  await prisma.tenantDomain.upsert({
    where: { domain: "dojo-centro.localhost" },
    update: {
      tenantId: dojoCentro.id,
      isPrimary: true,
      isVerified: true,
    },
    create: {
      tenantId: dojoCentro.id,
      domain: "dojo-centro.localhost",
      isPrimary: true,
      isVerified: true,
    },
  })

  await prisma.tenantDomain.deleteMany({
    where: { domain: "dojo-center.localhost" },
  })

  await prisma.tenantDomain.upsert({
    where: { domain: "fight-lab.localhost" },
    update: {
      tenantId: fightLab.id,
      isPrimary: true,
      isVerified: true,
    },
    create: {
      tenantId: fightLab.id,
      domain: "fight-lab.localhost",
      isPrimary: true,
      isVerified: true,
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: "joao@academia.com" },
    update: { name: "João da Silva" },
    create: {
      email: "joao@academia.com",
      name: "João da Silva",
      phone: "(11) 99999-0000",
    },
  })

  const teacher = await prisma.user.upsert({
    where: { email: "prof.ricardo@email.com" },
    update: { name: "Prof. Ricardo" },
    create: {
      email: "prof.ricardo@email.com",
      name: "Prof. Ricardo",
    },
  })

  const student = await prisma.user.upsert({
    where: { email: "maria@email.com" },
    update: { name: "Maria Santos" },
    create: {
      email: "maria@email.com",
      name: "Maria Santos",
    },
  })

  const classStudents = await Promise.all(
    [
      ["carlos@email.com", "Carlos Silva"],
      ["ana@email.com", "Ana Costa"],
      ["pedro@email.com", "Pedro Lima"],
      ["joao.oliveira@email.com", "João Oliveira"],
    ].map(([email, name]) =>
      prisma.user.upsert({
        where: { email },
        update: { name },
        create: { email, name },
      })
    )
  )

  const fightLabAdmin = await prisma.user.upsert({
    where: { email: "admin.fightlab@email.com" },
    update: { name: "Marina Costa" },
    create: {
      email: "admin.fightlab@email.com",
      name: "Marina Costa",
      phone: "(11) 98888-0000",
    },
  })

  const outsider = await prisma.user.upsert({
    where: { email: "outsider@email.com" },
    update: { name: "Usuário Sem Vínculo" },
    create: {
      email: "outsider@email.com",
      name: "Usuário Sem Vínculo",
    },
  })

  const preCreatedTeacher = await prisma.user.upsert({
    where: { email: "prof.cadastrado@email.com" },
    update: { name: "Professor Cadastrado" },
    create: {
      email: "prof.cadastrado@email.com",
      name: "Professor Cadastrado",
    },
  })

  const adminCredential = createPasswordHash("12345678")
  const teacherCredential = createPasswordHash("12345678")
  const studentCredential = createPasswordHash("12345678")
  const fightLabAdminCredential = createPasswordHash("12345678")
  const outsiderCredential = createPasswordHash("12345678")

  await prisma.passwordCredential.upsert({
    where: { userId: admin.id },
    update: adminCredential,
    create: {
      userId: admin.id,
      ...adminCredential,
    },
  })

  await prisma.passwordCredential.upsert({
    where: { userId: teacher.id },
    update: teacherCredential,
    create: {
      userId: teacher.id,
      ...teacherCredential,
    },
  })

  await prisma.passwordCredential.upsert({
    where: { userId: student.id },
    update: studentCredential,
    create: {
      userId: student.id,
      ...studentCredential,
    },
  })

  await prisma.passwordCredential.upsert({
    where: { userId: fightLabAdmin.id },
    update: fightLabAdminCredential,
    create: {
      userId: fightLabAdmin.id,
      ...fightLabAdminCredential,
    },
  })

  await prisma.passwordCredential.upsert({
    where: { userId: outsider.id },
    update: outsiderCredential,
    create: {
      userId: outsider.id,
      ...outsiderCredential,
    },
  })

  await prisma.passwordCredential.deleteMany({
    where: { userId: preCreatedTeacher.id },
  })

  await prisma.academyMembership.upsert({
    where: {
      userId_tenantId: {
        userId: admin.id,
        tenantId: dojoCentro.id,
      },
    },
    update: {
      role: AcademyRole.ACADEMY_ADMIN,
      status: MembershipStatus.ACTIVE,
      invitedByName: "Sistema",
      acceptedAt: new Date("2026-03-01T10:00:00.000Z"),
    },
    create: {
      userId: admin.id,
      tenantId: dojoCentro.id,
      role: AcademyRole.ACADEMY_ADMIN,
      status: MembershipStatus.ACTIVE,
      invitedByName: "Sistema",
      acceptedAt: new Date("2026-03-01T10:00:00.000Z"),
    },
  })

  const teacherMembership = await prisma.academyMembership.upsert({
    where: {
      userId_tenantId: {
        userId: teacher.id,
        tenantId: dojoCentro.id,
      },
    },
    update: {
      role: AcademyRole.TEACHER,
      status: MembershipStatus.ACTIVE,
      invitedByName: admin.name ?? "João da Silva",
      acceptedAt: new Date("2026-03-10T10:00:00.000Z"),
    },
    create: {
      userId: teacher.id,
      tenantId: dojoCentro.id,
      role: AcademyRole.TEACHER,
      status: MembershipStatus.ACTIVE,
      invitedByName: admin.name ?? "João da Silva",
      acceptedAt: new Date("2026-03-10T10:00:00.000Z"),
    },
  })

  for (const candidate of [student, ...classStudents]) {
    await prisma.academyMembership.upsert({
      where: {
        userId_tenantId: {
          userId: candidate.id,
          tenantId: dojoCentro.id,
        },
      },
      update: {
        role: AcademyRole.STUDENT,
        status: MembershipStatus.ACTIVE,
        invitedByName: admin.name ?? "João da Silva",
        acceptedAt: new Date("2026-03-10T10:00:00.000Z"),
      },
      create: {
        userId: candidate.id,
        tenantId: dojoCentro.id,
        role: AcademyRole.STUDENT,
        status: MembershipStatus.ACTIVE,
        invitedByName: admin.name ?? "João da Silva",
        acceptedAt: new Date("2026-03-10T10:00:00.000Z"),
      },
    })
  }

  const preCreatedTeacherMembership = await prisma.academyMembership.upsert({
    where: {
      userId_tenantId: {
        userId: preCreatedTeacher.id,
        tenantId: dojoCentro.id,
      },
    },
    update: {
      role: AcademyRole.TEACHER,
      status: MembershipStatus.ACTIVE,
      invitedByName: admin.name ?? "João da Silva",
      acceptedAt: new Date("2026-03-10T10:00:00.000Z"),
    },
    create: {
      userId: preCreatedTeacher.id,
      tenantId: dojoCentro.id,
      role: AcademyRole.TEACHER,
      status: MembershipStatus.ACTIVE,
      invitedByName: admin.name ?? "João da Silva",
      acceptedAt: new Date("2026-03-10T10:00:00.000Z"),
    },
  })

  await prisma.academyMembership.upsert({
    where: {
      userId_tenantId: {
        userId: fightLabAdmin.id,
        tenantId: fightLab.id,
      },
    },
    update: {
      role: AcademyRole.ACADEMY_ADMIN,
      status: MembershipStatus.ACTIVE,
      invitedByName: "Sistema",
      acceptedAt: new Date("2026-03-05T15:00:00.000Z"),
    },
    create: {
      userId: fightLabAdmin.id,
      tenantId: fightLab.id,
      role: AcademyRole.ACADEMY_ADMIN,
      status: MembershipStatus.ACTIVE,
      invitedByName: "Sistema",
      acceptedAt: new Date("2026-03-05T15:00:00.000Z"),
    },
  })

  await prisma.academyMembership.upsert({
    where: {
      userId_tenantId: {
        userId: admin.id,
        tenantId: fightLab.id,
      },
    },
    update: {
      role: AcademyRole.TEACHER,
      status: MembershipStatus.ACTIVE,
      invitedByName: "Marina Costa",
      acceptedAt: new Date("2026-03-05T15:00:00.000Z"),
    },
    create: {
      userId: admin.id,
      tenantId: fightLab.id,
      role: AcademyRole.TEACHER,
      status: MembershipStatus.ACTIVE,
      invitedByName: "Marina Costa",
      acceptedAt: new Date("2026-03-05T15:00:00.000Z"),
    },
  })

  await prisma.invitation.upsert({
    where: { token: "invite-teacher-dojo-centro" },
    update: {
      tenantId: dojoCentro.id,
      email: teacher.email,
      role: AcademyRole.TEACHER,
      status: InvitationStatus.PENDING,
      invitedByName: admin.name ?? "João da Silva",
      expiresAt: new Date("2026-04-01T23:59:59.000Z"),
    },
    create: {
      tenantId: dojoCentro.id,
      email: teacher.email,
      role: AcademyRole.TEACHER,
      token: "invite-teacher-dojo-centro",
      status: InvitationStatus.PENDING,
      invitedByName: admin.name ?? "João da Silva",
      expiresAt: new Date("2026-04-01T23:59:59.000Z"),
    },
  })

  await prisma.enrollmentRequest.upsert({
    where: {
      tenantId_userId: {
        tenantId: dojoCentro.id,
        userId: student.id,
      },
    },
    update: {
      status: EnrollmentRequestStatus.PENDING,
      reviewedAt: null,
    },
    create: {
      tenantId: dojoCentro.id,
      userId: student.id,
      status: EnrollmentRequestStatus.PENDING,
    },
  })

  await prisma.modality.deleteMany({
    where: {
      tenantId: {
        in: [dojoCentro.id, fightLab.id],
      },
    },
  })

  await prisma.modality.createMany({
    data: [
      {
        tenantId: dojoCentro.id,
        name: "Jiu-Jitsu",
        ageGroups: ["ADULT"],
        defaultDurationMinutes: 60,
        defaultCapacity: 24,
        sortOrder: 0,
        isActive: true,
      },
      {
        tenantId: dojoCentro.id,
        name: "Jiu-Jitsu Infantil",
        ageGroups: ["KIDS"],
        defaultDurationMinutes: 45,
        defaultCapacity: 18,
        sortOrder: 1,
        isActive: true,
      },
      {
        tenantId: fightLab.id,
        name: "Muay Thai",
        ageGroups: ["ADULT"],
        defaultDurationMinutes: 60,
        defaultCapacity: 20,
        sortOrder: 0,
        isActive: true,
      },
    ],
  })

  const dojoModalities = await prisma.modality.findMany({
    where: { tenantId: dojoCentro.id },
    orderBy: { sortOrder: "asc" },
  })
  const dojoPlanModalityIds = dojoModalities.map((item) => item.id)

  const jiuJitsu = dojoModalities.find((item) => item.name === "Jiu-Jitsu")
  const jiuJitsuKids = dojoModalities.find((item) => item.name === "Jiu-Jitsu Infantil")

  await prisma.subscription.deleteMany({
    where: { tenantId: { in: [dojoCentro.id, fightLab.id] } },
  })
  await prisma.plan.deleteMany({
    where: { tenantId: { in: [dojoCentro.id, fightLab.id] } },
  })

  const monthlyBasic = await prisma.plan.create({
    data: {
      tenantId: dojoCentro.id,
      name: "Mensal Básico",
      amountCents: 18000,
      billingCycle: "MONTHLY",
      classLimitKind: "UNLIMITED",
      sortOrder: 0,
      isActive: true,
      modalities: {
        create: dojoPlanModalityIds.map((modalityId) => ({
          modalityId,
        })),
      },
    },
  })

  const monthlyComplete = await prisma.plan.create({
    data: {
      tenantId: dojoCentro.id,
      name: "Mensal Completo",
      amountCents: 25000,
      billingCycle: "MONTHLY",
      classLimitKind: "UNLIMITED",
      sortOrder: 1,
      isActive: true,
      modalities: {
        create: dojoPlanModalityIds.map((modalityId) => ({
          modalityId,
        })),
      },
    },
  })

  const annualPlan = await prisma.plan.create({
    data: {
      tenantId: dojoCentro.id,
      name: "Anual",
      amountCents: 240000,
      billingCycle: "YEARLY",
      classLimitKind: "UNLIMITED",
      sortOrder: 2,
      isActive: true,
      modalities: {
        create: dojoPlanModalityIds.map((modalityId) => ({
          modalityId,
        })),
      },
    },
  })

  await prisma.classSession.deleteMany({
    where: { tenantId: { in: [dojoCentro.id, fightLab.id] } },
  })
  await prisma.classSchedule.deleteMany({})
  await prisma.classGroup.deleteMany({
    where: { tenantId: { in: [dojoCentro.id, fightLab.id] } },
  })
  await prisma.teacherProfile.deleteMany({
    where: { tenantId: { in: [dojoCentro.id, fightLab.id] } },
  })

  const mestreRicardo = await prisma.teacherProfile.create({
    data: {
      tenantId: dojoCentro.id,
      userId: teacher.id,
      membershipId: teacherMembership.id,
      name: "Mestre Ricardo",
      email: teacher.email,
      phone: "(11) 97777-1111",
      rank: "Faixa Preta",
      specialty: "Jiu-Jitsu Adulto",
      status: TeacherProfileStatus.ACTIVE,
      sortOrder: 0,
    },
  })

  const professoraCarla = await prisma.teacherProfile.create({
    data: {
      tenantId: dojoCentro.id,
      name: "Professora Carla",
      email: "carla@dojo.com",
      phone: "(11) 97777-2222",
      rank: "Faixa Roxa",
      specialty: "Jiu-Jitsu Kids",
      status: TeacherProfileStatus.ACTIVE,
      sortOrder: 1,
    },
  })

  const professorAndre = await prisma.teacherProfile.create({
    data: {
      tenantId: dojoCentro.id,
      name: "Professor André",
      email: "andre@dojo.com",
      phone: "(11) 97777-3333",
      rank: "Instrutor",
      specialty: "Preparação física",
      status: TeacherProfileStatus.ACTIVE,
      sortOrder: 2,
    },
  })

  const jiuJitsuBeginner = await prisma.classGroup.create({
    data: {
      tenantId: dojoCentro.id,
      modalityId: jiuJitsu?.id ?? null,
      teacherProfileId: mestreRicardo.id,
      name: "Jiu-Jitsu Iniciante",
      modalityName: "Jiu-Jitsu",
      teacherName: "Mestre Ricardo",
      ageGroups: ["ADULT"],
      beltRange: "Branca a Azul",
      maxStudents: 20,
      currentStudents: 0,
      status: ClassGroupStatus.ACTIVE,
      schedules: {
        create: [
          { weekday: 0, startTime: "19:00", endTime: "20:30" },
          { weekday: 2, startTime: "19:00", endTime: "20:30" },
          { weekday: 4, startTime: "19:00", endTime: "20:30" },
        ],
      },
    },
  })

  const jiuJitsuAdvanced = await prisma.classGroup.create({
    data: {
      tenantId: dojoCentro.id,
      modalityId: jiuJitsu?.id ?? null,
      teacherProfileId: mestreRicardo.id,
      name: "Jiu-Jitsu Avançado",
      modalityName: "Jiu-Jitsu",
      teacherName: "Mestre Ricardo",
      ageGroups: ["ADULT"],
      beltRange: "Roxa a Preta",
      maxStudents: 15,
      currentStudents: 0,
      status: ClassGroupStatus.ACTIVE,
      schedules: {
        create: [
          { weekday: 0, startTime: "20:30", endTime: "22:00" },
          { weekday: 2, startTime: "20:30", endTime: "22:00" },
          { weekday: 4, startTime: "20:30", endTime: "22:00" },
        ],
      },
    },
  })

  const kidsClass = await prisma.classGroup.create({
    data: {
      tenantId: dojoCentro.id,
      modalityId: jiuJitsuKids?.id ?? null,
      teacherProfileId: professoraCarla.id,
      name: "Kids Jiu-Jitsu",
      modalityName: "Jiu-Jitsu Infantil",
      teacherName: "Professora Carla",
      ageGroups: ["KIDS"],
      beltRange: "Todas as faixas",
      maxStudents: 15,
      currentStudents: 0,
      status: ClassGroupStatus.ACTIVE,
      schedules: {
        create: [{ weekday: 5, startTime: "10:00", endTime: "11:00" }],
      },
    },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isoDate = today.toISOString()
  const weekday = Math.max(0, today.getDay() - 1)

  await prisma.classSession.create({
    data: {
      tenantId: dojoCentro.id,
      classGroupId: jiuJitsuBeginner.id,
      sessionDate: today,
      weekday,
      startTime: "19:00",
      endTime: "20:30",
      status: ClassSessionStatus.SCHEDULED,
      confirmedStudentIds: [classStudents[0].id, student.id],
      confirmedStudentNames: ["Carlos Silva", "Maria Santos"],
      presentStudentIds: [classStudents[0].id],
      absentStudentIds: [student.id],
    },
  })

  await prisma.classSession.create({
    data: {
      tenantId: dojoCentro.id,
      classGroupId: kidsClass.id,
      sessionDate: new Date(isoDate),
      weekday,
      startTime: "10:00",
      endTime: "11:00",
      status: ClassSessionStatus.CANCELLED,
      confirmedStudentIds: [],
      confirmedStudentNames: [],
      presentStudentIds: [],
      absentStudentIds: [],
    },
  })

  await prisma.studentGraduation.deleteMany({})
  await prisma.studentModality.deleteMany({})
  await prisma.studentProfile.deleteMany({
    where: { tenantId: { in: [dojoCentro.id, fightLab.id] } },
  })

  const dojoStudentMemberships = await prisma.academyMembership.findMany({
    where: {
      tenantId: dojoCentro.id,
      role: "STUDENT",
    },
    include: {
      user: true,
    },
  })

  const studentMembershipByEmail = new Map(
    dojoStudentMemberships.map((membership) => [membership.user.email, membership])
  )

  const mariaMembership = studentMembershipByEmail.get("maria@email.com")
  const carlosMembership = studentMembershipByEmail.get("carlos@email.com")
  const anaMembership = studentMembershipByEmail.get("ana@email.com")
  const pedroMembership = studentMembershipByEmail.get("pedro@email.com")
  const joaoMembership = studentMembershipByEmail.get("joao.oliveira@email.com")

  const mariaProfile = await prisma.studentProfile.create({
    data: {
      tenantId: dojoCentro.id,
      userId: student.id,
      membershipId: mariaMembership?.id ?? null,
      emergencyContact: "João Santos - (11) 98888-0002",
      notes: "Treina Jiu-Jitsu e aulas kids como apoio familiar.",
      status: "ACTIVE",
    },
  })

  const carlosProfile = await prisma.studentProfile.create({
    data: {
      tenantId: dojoCentro.id,
      userId: classStudents[0].id,
      membershipId: carlosMembership?.id ?? null,
      emergencyContact: "Maria Silva - (11) 98888-0001",
      notes: "Competidor em treinamento.",
      status: "ACTIVE",
    },
  })

  const anaProfile = await prisma.studentProfile.create({
    data: {
      tenantId: dojoCentro.id,
      userId: classStudents[1].id,
      membershipId: anaMembership?.id ?? null,
      emergencyContact: "Pedro Costa - (11) 98888-0004",
      notes: "Foco em graduação avançada.",
      status: "ACTIVE",
    },
  })

  const pedroProfile = await prisma.studentProfile.create({
    data: {
      tenantId: dojoCentro.id,
      userId: classStudents[2].id,
      membershipId: pedroMembership?.id ?? null,
      emergencyContact: "Rosa Lima - (11) 98888-0005",
      status: "ACTIVE",
    },
  })

  const joaoProfile = await prisma.studentProfile.create({
    data: {
      tenantId: dojoCentro.id,
      userId: classStudents[3].id,
      membershipId: joaoMembership?.id ?? null,
      emergencyContact: "Ana Oliveira - (11) 98888-0003",
      status: "INACTIVE",
    },
  })

  const mariaJiuJitsu = await prisma.studentModality.create({
    data: {
      studentProfileId: mariaProfile.id,
      modalityId: jiuJitsu.id,
      belt: "Roxa",
      stripes: 3,
      startDate: new Date("2021-06-15T00:00:00.000Z"),
      notes: "Faixa avançada na modalidade principal.",
    },
  })

  const mariaKids = await prisma.studentModality.create({
    data: {
      studentProfileId: mariaProfile.id,
      modalityId: jiuJitsuKids.id,
      belt: "Branca",
      stripes: 1,
      startDate: new Date("2025-02-10T00:00:00.000Z"),
      notes: "Participa do apoio pedagógico no kids.",
    },
  })

  const carlosJiuJitsu = await prisma.studentModality.create({
    data: {
      studentProfileId: carlosProfile.id,
      modalityId: jiuJitsu.id,
      belt: "Azul",
      stripes: 2,
      startDate: new Date("2023-03-10T00:00:00.000Z"),
    },
  })

  const anaJiuJitsu = await prisma.studentModality.create({
    data: {
      studentProfileId: anaProfile.id,
      modalityId: jiuJitsu.id,
      belt: "Marrom",
      stripes: 1,
      startDate: new Date("2019-02-20T00:00:00.000Z"),
    },
  })

  const pedroJiuJitsu = await prisma.studentModality.create({
    data: {
      studentProfileId: pedroProfile.id,
      modalityId: jiuJitsu.id,
      belt: "Azul",
      stripes: 0,
      startDate: new Date("2023-08-15T00:00:00.000Z"),
    },
  })

  const joaoKids = await prisma.studentModality.create({
    data: {
      studentProfileId: joaoProfile.id,
      modalityId: jiuJitsuKids.id,
      belt: "Branca",
      stripes: 4,
      startDate: new Date("2023-09-01T00:00:00.000Z"),
      status: "INACTIVE",
    },
  })

  await prisma.classGroupEnrollment.createMany({
    data: [
      {
        classGroupId: jiuJitsuBeginner.id,
        studentProfileId: mariaProfile.id,
        status: "ACTIVE",
      },
      {
        classGroupId: jiuJitsuBeginner.id,
        studentProfileId: carlosProfile.id,
        status: "ACTIVE",
      },
      {
        classGroupId: jiuJitsuAdvanced.id,
        studentProfileId: anaProfile.id,
        status: "ACTIVE",
      },
      {
        classGroupId: jiuJitsuAdvanced.id,
        studentProfileId: pedroProfile.id,
        status: "ACTIVE",
      },
      {
        classGroupId: kidsClass.id,
        studentProfileId: mariaProfile.id,
        status: "ACTIVE",
      },
    ],
  })

  await prisma.classGroup.update({
    where: { id: jiuJitsuBeginner.id },
    data: {
      currentStudents: 2,
    },
  })

  await prisma.classGroup.update({
    where: { id: jiuJitsuAdvanced.id },
    data: {
      currentStudents: 2,
    },
  })

  await prisma.classGroup.update({
    where: { id: kidsClass.id },
    data: {
      currentStudents: 1,
    },
  })

  await prisma.studentGraduation.createMany({
    data: [
      {
        studentModalityId: mariaJiuJitsu.id,
        fromBelt: "Azul",
        fromStripes: 3,
        toBelt: "Roxa",
        toStripes: 3,
        evaluatorName: "Mestre Ricardo",
        graduatedAt: new Date("2025-12-15T00:00:00.000Z"),
      },
      {
        studentModalityId: carlosJiuJitsu.id,
        fromBelt: "Azul",
        fromStripes: 1,
        toBelt: "Azul",
        toStripes: 2,
        evaluatorName: "Mestre Ricardo",
        graduatedAt: new Date("2025-06-20T00:00:00.000Z"),
      },
      {
        studentModalityId: anaJiuJitsu.id,
        fromBelt: "Roxa",
        fromStripes: 4,
        toBelt: "Marrom",
        toStripes: 1,
        evaluatorName: "Professor André",
        graduatedAt: new Date("2025-03-15T00:00:00.000Z"),
      },
      {
        studentModalityId: mariaKids.id,
        fromBelt: "Branca",
        fromStripes: 0,
        toBelt: "Branca",
        toStripes: 1,
        evaluatorName: "Professora Carla",
        graduatedAt: new Date("2025-02-25T00:00:00.000Z"),
      },
      {
        studentModalityId: joaoKids.id,
        fromBelt: "Branca",
        fromStripes: 3,
        toBelt: "Branca",
        toStripes: 4,
        evaluatorName: "Professora Carla",
        graduatedAt: new Date("2024-11-10T00:00:00.000Z"),
      },
    ],
  })

  await prisma.subscription.createMany({
    data: [
      {
        tenantId: dojoCentro.id,
        userId: student.id,
        planId: monthlyComplete.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-04-01T00:00:00.000Z"),
      },
      {
        tenantId: dojoCentro.id,
        userId: classStudents[0].id,
        planId: monthlyComplete.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date("2026-01-05T00:00:00.000Z"),
        endDate: new Date("2026-02-05T00:00:00.000Z"),
      },
      {
        tenantId: dojoCentro.id,
        userId: classStudents[1].id,
        planId: annualPlan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2027-01-01T00:00:00.000Z"),
      },
      {
        tenantId: dojoCentro.id,
        userId: classStudents[2].id,
        planId: monthlyComplete.id,
        status: SubscriptionStatus.PENDING,
        startDate: new Date("2026-01-03T00:00:00.000Z"),
        endDate: new Date("2026-02-03T00:00:00.000Z"),
      },
      {
        tenantId: dojoCentro.id,
        userId: classStudents[3].id,
        planId: monthlyBasic.id,
        status: SubscriptionStatus.PAST_DUE,
        startDate: new Date("2025-11-15T00:00:00.000Z"),
        endDate: new Date("2025-12-15T00:00:00.000Z"),
      },
    ],
  })

  await prisma.tenantOnboarding.upsert({
    where: { tenantId: dojoCentro.id },
    update: {
      status: "COMPLETED",
      currentStep: 7,
      completedSteps: ["academy_info", "location", "class_structure", "branding", "teachers", "plans", "payments"],
      completedAt: new Date("2026-03-01T10:00:00.000Z"),
      academyInfoJson: {
        academyName: dojoCentro.legalName,
        displayName: dojoCentro.displayName,
        contactEmail: admin.email,
        phone: admin.phone,
        mainModality: "Jiu-Jitsu",
      },
      locationJson: {
        city: "Sao Paulo",
        country: "Brasil",
      },
      classStructureJson: {
        modalities: [
          {
            clientId: "seed-dojo-jj",
            name: "Jiu-Jitsu",
            ageGroups: ["adult"],
            defaultDurationMinutes: 60,
            defaultCapacity: 24,
          },
          {
            clientId: "seed-dojo-kids",
            name: "Jiu-Jitsu Infantil",
            ageGroups: ["kids"],
            defaultDurationMinutes: 45,
            defaultCapacity: 18,
          },
        ],
      },
      brandingSetupJson: {
        primaryColor: "#16a34a",
        secondaryColor: "#0f172a",
      },
    },
    create: {
      tenantId: dojoCentro.id,
      status: "COMPLETED",
      currentStep: 7,
      completedSteps: ["academy_info", "location", "class_structure", "branding", "teachers", "plans", "payments"],
      completedAt: new Date("2026-03-01T10:00:00.000Z"),
      academyInfoJson: {
        academyName: dojoCentro.legalName,
        displayName: dojoCentro.displayName,
        contactEmail: admin.email,
        phone: admin.phone,
        mainModality: "Jiu-Jitsu",
      },
      locationJson: {
        city: "Sao Paulo",
        country: "Brasil",
      },
      classStructureJson: {
        modalities: [
          {
            clientId: "seed-dojo-jj",
            name: "Jiu-Jitsu",
            ageGroups: ["adult"],
            defaultDurationMinutes: 60,
            defaultCapacity: 24,
          },
          {
            clientId: "seed-dojo-kids",
            name: "Jiu-Jitsu Infantil",
            ageGroups: ["kids"],
            defaultDurationMinutes: 45,
            defaultCapacity: 18,
          },
        ],
      },
      brandingSetupJson: {
        primaryColor: "#16a34a",
        secondaryColor: "#0f172a",
      },
    },
  })

  await prisma.tenantOnboarding.upsert({
    where: { tenantId: fightLab.id },
    update: {
      status: "COMPLETED",
      currentStep: 7,
      completedSteps: ["academy_info", "location", "class_structure", "branding"],
      completedAt: new Date("2026-03-05T15:00:00.000Z"),
    },
    create: {
      tenantId: fightLab.id,
      status: "COMPLETED",
      currentStep: 7,
      completedSteps: ["academy_info", "location", "class_structure", "branding"],
      completedAt: new Date("2026-03-05T15:00:00.000Z"),
    },
  })

  console.log("Seed completed")
  console.log({
    dojoCentroTenantId: dojoCentro.id,
    fightLabTenantId: fightLab.id,
    adminEmail: admin.email,
    fightLabAdminEmail: fightLabAdmin.email,
    outsiderEmail: outsider.email,
    preCreatedTeacherEmail: preCreatedTeacher.email,
    defaultPassword: "12345678",
    teacherInvitationToken: "invite-teacher-dojo-centro",
    studentEnrollmentEmail: student.email,
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
