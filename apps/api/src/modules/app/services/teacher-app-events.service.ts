import type { TeacherAppEventsData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { EventDashboardService } from "@/apps/api/src/modules/events/services/event-dashboard.service"
import { buildTeacherPermissions } from "@/apps/api/src/modules/teachers/domain/teacher-permissions"

function normalizeTeacherRole(roleTitle: string | null | undefined, sortOrder: number) {
  const normalized = roleTitle?.trim().toLowerCase()

  if (normalized?.includes("chefe")) {
    return "head_instructor" as const
  }

  if (normalized?.includes("assist")) {
    return "assistant" as const
  }

  if (normalized?.includes("instrutor") || normalized?.includes("professor")) {
    return "instructor" as const
  }

  if (sortOrder === 0) return "head_instructor" as const
  if (sortOrder <= 2) return "instructor" as const
  return "assistant" as const
}

function formatAmountLabel(amount: number | null) {
  if (amount == null) return null
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

export class TeacherAppEventsService {
  constructor(private readonly eventDashboardService = new EventDashboardService()) {}

  async getData(input: { tenantId: string; userId: string }): Promise<TeacherAppEventsData> {
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      select: {
        id: true,
        name: true,
        sortOrder: true,
        roleTitle: true,
        modalities: {
          include: {
            modality: {
              select: { name: true },
            },
          },
        },
      },
    })

    if (!teacherProfile) {
      throw new Error("Professor não encontrado para este tenant.")
    }

    const dashboard = await this.eventDashboardService.getDashboardData(input.tenantId)
    const modalityNames = new Set(teacherProfile.modalities.map((item) => item.modality.name))
    const permissions = buildTeacherPermissions(
      normalizeTeacherRole(teacherProfile.roleTitle, teacherProfile.sortOrder)
    )

    const upcomingEvents = dashboard.events
      .filter((event) => {
        const isCoordinator =
          event.teacherProfileId === teacherProfile.id || event.organizer === teacherProfile.name
        const isParticipant = event.participants.some((participant) => participant.userId === input.userId)
        const modalityMatch = modalityNames.size === 0 || modalityNames.has(event.modality)
        return isCoordinator || isParticipant || modalityMatch
      })
      .map((event) => ({
        id: event.id,
        name: event.name,
        type: event.type,
        date: event.date,
        time: event.time,
        location: event.location,
        notes: event.notes,
        organizer: event.organizer,
        modality: event.modality,
        status: event.status,
        registrationsOpen: event.registrationsOpen,
        capacity: event.capacity,
        participantCount: event.participants.length,
        isCoordinator:
          event.teacherProfileId === teacherProfile.id || event.organizer === teacherProfile.name,
        hasRegistrationFee: event.hasRegistrationFee,
        registrationFeeAmountLabel: formatAmountLabel(event.registrationFeeAmount),
        participants: event.participants,
      }))

    const participatingEvents = upcomingEvents
      .filter((event) => !event.isCoordinator)
      .map((event) => ({
        id: event.id,
        name: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
        status: event.status,
      }))

    const pastEvents = dashboard.pastEvents
      .filter((event) => modalityNames.size === 0 || modalityNames.has(event.modality))
      .map((event) => ({
        id: event.id,
        name: event.name,
        type: event.type,
        date: event.date,
        participantCount: event.participants,
        modality: event.modality,
      }))

    return {
      role: "teacher",
      teacherId: input.userId,
      permissions: {
        manageEvents: permissions.manageEvents,
      },
      availableParticipants: dashboard.availableParticipants,
      metrics: {
        upcoming: upcomingEvents.length,
        coordinating: upcomingEvents.filter((event) => event.isCoordinator).length,
        studentsLinked: upcomingEvents.reduce((total, event) => total + event.participantCount, 0),
      },
      upcomingEvents,
      participatingEvents,
      pastEvents,
    }
  }

  async addParticipant(input: {
    tenantId: string
    userId: string
    eventId: string
    participantUserId: string
  }) {
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      select: {
        id: true,
        name: true,
        sortOrder: true,
        roleTitle: true,
      },
    })

    if (!teacherProfile) {
      throw new Error("Professor não encontrado para este tenant.")
    }

    const permissions = buildTeacherPermissions(
      normalizeTeacherRole(teacherProfile.roleTitle, teacherProfile.sortOrder)
    )

    if (!permissions.manageEvents) {
      throw new Error("Seu perfil não possui permissão para gerenciar eventos.")
    }

    const dashboard = await this.eventDashboardService.getDashboardData(input.tenantId)
    const event = dashboard.events.find((item) => item.id === input.eventId)

    if (!event) {
      throw new Error("Evento não encontrado.")
    }

    const isCoordinator =
      event.teacherProfileId === teacherProfile.id || event.organizer === teacherProfile.name

    if (!isCoordinator) {
      throw new Error("Você só pode adicionar participantes em eventos sob sua responsabilidade.")
    }

    await this.eventDashboardService.addParticipant({
      tenantId: input.tenantId,
      eventId: input.eventId,
      userId: input.participantUserId,
      source: "teacher",
    })

    return {
      message: "Participante adicionado com sucesso.",
      data: await this.getData(input),
    }
  }
}
