import { StudentProfileStatus } from "@prisma/client"
import type {
  StudentAppEventItem,
  StudentAppEventsData,
} from "@/apps/api/src/modules/app/domain/student-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { EventDashboardService } from "@/apps/api/src/modules/events/services/event-dashboard.service"

function formatAmountLabel(amount: number | null) {
  if (amount == null) return null
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

function isPastEvent(input: Pick<StudentAppEventItem, "date" | "sourceStatus">) {
  if (input.sourceStatus === "completed") {
    return true
  }

  const eventDate = new Date(`${input.date}T12:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return eventDate < today
}

function toStudentEventItem(input: {
  event: Awaited<ReturnType<EventDashboardService["getDashboardData"]>>["events"][number]
  userId: string
}): StudentAppEventItem {
  const participant = input.event.participants.find(
    (item) => item.userId === input.userId
  )
  const participantCount = input.event.participants.length
  const isFull = input.event.capacity > 0 && participantCount >= input.event.capacity

  let status: StudentAppEventItem["status"] = "open"
  if (input.event.status === "cancelled") {
    status = "cancelled"
  } else if (!input.event.registrationsOpen) {
    status = "closed"
  } else if (isFull && !participant) {
    status = "full"
  }

  return {
    id: input.event.id,
    name: input.event.name,
    type: input.event.type,
    sourceStatus: input.event.status,
    date: input.event.date,
    time: input.event.time,
    location: input.event.location,
    description: input.event.notes,
    status,
    enrollmentStatus: participant?.status ?? null,
    modalityName: input.event.modality,
    participantCount,
    capacity: input.event.capacity,
    registrationsOpen: input.event.registrationsOpen,
    hasRegistrationFee: input.event.hasRegistrationFee,
    registrationFeeAmountLabel: formatAmountLabel(input.event.registrationFeeAmount),
    paymentStatus: participant?.paymentStatus ?? null,
    isCoordinatorEvent: false,
  }
}

export class StudentAppEventsService {
  constructor(
    private readonly eventDashboardService = new EventDashboardService()
  ) {}

  async getData(input: {
    tenantId: string
    userId: string
  }): Promise<StudentAppEventsData> {
    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        status: StudentProfileStatus.ACTIVE,
      },
      include: {
        modalities: {
          where: { status: "ACTIVE" },
          include: {
            modality: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!studentProfile) {
      throw new Error("Aluno ativo não encontrado para esta academia.")
    }

    const modalityNames = new Set(
      studentProfile.modalities.map((item) => item.modality.name)
    )

    const dashboard = await this.eventDashboardService.getDashboardData(input.tenantId)
    const eventItems = dashboard.events
      .filter((event) => {
        const isParticipant = event.participants.some(
          (participant) => participant.userId === input.userId
        )
        const modalityMatch =
          modalityNames.size === 0 || modalityNames.has(event.modality) || event.modality === "Misto"

        return isParticipant || modalityMatch
      })
      .map((event) => toStudentEventItem({ event, userId: input.userId }))

    const upcomingEvents = eventItems.filter(
      (event) => event.enrollmentStatus == null && !isPastEvent(event)
    )

    const myEvents = eventItems.filter(
      (event) => event.enrollmentStatus != null && !isPastEvent(event)
    )

    const pastEvents = eventItems.filter((event) => isPastEvent(event))

    return {
      role: "student",
      studentId: studentProfile.id,
      upcomingEvents,
      myEvents,
      pastEvents,
    }
  }

  async enroll(input: {
    tenantId: string
    userId: string
    eventId: string
    initialStatus: "confirmed" | "maybe" | "declined"
  }) {
    const event = await prisma.event.findFirst({
      where: {
        id: input.eventId,
        tenantId: input.tenantId,
      },
      include: {
        participants: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    })

    if (!event) {
      throw new Error("Evento não encontrado.")
    }

    if (!event.registrationsOpen) {
      throw new Error("Este evento não está mais aberto para inscrições.")
    }

    if (
      event.capacity > 0 &&
      event.participants.length >= event.capacity &&
      !event.participants.some((participant) => participant.userId === input.userId)
    ) {
      throw new Error("As vagas deste evento já foram preenchidas.")
    }

    await this.eventDashboardService.addParticipant({ ...input, source: "student" })

    return {
      message:
        input.initialStatus === "declined"
          ? "Sua resposta foi registrada como não vai."
          : input.initialStatus === "maybe"
            ? "Sua resposta foi registrada como talvez."
            : event.hasRegistrationFee
              ? "Inscrição registrada. Vá para Pagamentos para confirmar sua participação."
              : "Inscrição realizada e participação confirmada.",
      data: await this.getData(input),
    }
  }

  async updateEnrollmentResponse(input: {
    tenantId: string
    userId: string
    eventId: string
    status: "confirmed" | "maybe" | "declined"
  }) {
    const participant = await prisma.eventParticipant.findFirst({
      where: {
        tenantId: input.tenantId,
        eventId: input.eventId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    })

    if (!participant) {
      throw new Error("Você ainda não possui vínculo com este evento.")
    }

    await this.eventDashboardService.updateParticipantStatus({
      tenantId: input.tenantId,
      eventId: input.eventId,
      participantId: participant.id,
      status: input.status,
    })

    return {
      message:
        input.status === "confirmed"
          ? "Sua participação foi confirmada."
          : input.status === "maybe"
            ? "Sua participação ficou como talvez."
            : "Sua participação foi marcada como não vai.",
      data: await this.getData(input),
    }
  }

  async cancelEnrollment(input: {
    tenantId: string
    userId: string
    eventId: string
  }) {
    return this.updateEnrollmentResponse({
      ...input,
      status: "declined",
    })
  }
}
