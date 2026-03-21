import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import type {
  CreateEventInput,
  EventDashboardCandidateRecord,
  EventDashboardData,
  EventDashboardEventRecord,
  EventDashboardHistoryRecord,
  EventDashboardParticipantRecord,
} from "@/apps/api/src/modules/events/domain/event-dashboard"
import {
  EventParticipantStatus as PrismaEventParticipantStatus,
  EventStatus as PrismaEventStatus,
} from "@prisma/client"

function mapEventType(value: string): EventDashboardEventRecord["type"] {
  switch (value) {
    case "COMPETITION":
      return "competition"
    case "SEMINAR":
      return "seminar"
    case "GRADUATION_EXAM":
      return "graduation_exam"
    case "WORKSHOP":
      return "workshop"
    case "FESTIVAL":
      return "festival"
    case "SPECIAL_CLASS":
      return "special_class"
    default:
      return "workshop"
  }
}

function mapEventStatus(value: string): EventDashboardEventRecord["status"] {
  switch (value) {
    case "COMPLETED":
      return "completed"
    case "CANCELLED":
      return "cancelled"
    default:
      return "scheduled"
  }
}

function toPrismaEventStatus(
  value: EventDashboardEventRecord["status"]
): PrismaEventStatus {
  switch (value) {
    case "completed":
      return "COMPLETED"
    case "cancelled":
      return "CANCELLED"
    default:
      return "SCHEDULED"
  }
}

function mapParticipantRole(value: string): EventDashboardCandidateRecord["role"] {
  return value === "STAFF" ? "staff" : "athlete"
}

function mapParticipantStatus(value: string): EventDashboardParticipantRecord["status"] {
  switch (value) {
    case "CONFIRMED":
      return "confirmed"
    case "MAYBE":
      return "maybe"
    case "DECLINED":
      return "declined"
    case "PAYMENT_PENDING":
      return "payment_pending"
    default:
      return "invited"
  }
}

function toPrismaParticipantStatus(
  value: "invited" | "confirmed" | "maybe" | "declined" | "payment_pending"
): PrismaEventParticipantStatus {
  switch (value) {
    case "confirmed":
      return "CONFIRMED"
    case "maybe":
      return "MAYBE"
    case "declined":
      return "DECLINED"
    case "payment_pending":
      return "PAYMENT_PENDING"
    default:
      return "INVITED"
  }
}

function toEventDate(date: string) {
  return new Date(`${date}T12:00:00`)
}

function currencyFromCents(value: number | null | undefined) {
  if (value == null) return null
  return Math.round(value) / 100
}

function eventChargeExternalKey(eventId: string, userId: string) {
  return `event:${eventId}:user:${userId}`
}

function eventIsPast(event: { eventDate: Date; status: string }, todayStart: Date) {
  return event.status === "COMPLETED" || event.eventDate < todayStart
}

type ChargeSnapshot = {
  id: string
  externalKey: string
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
}

export class EventDashboardService {
  async getDashboardData(tenantId: string): Promise<EventDashboardData> {
    const now = new Date()
    const todayStart = new Date(now.toISOString().slice(0, 10))

    const [events, students, teachers, modalities] = await Promise.all([
      prisma.event.findMany({
        where: { tenantId },
        orderBy: [{ eventDate: "asc" }, { startTime: "asc" }],
        include: {
          participants: {
            orderBy: [{ createdAt: "asc" }],
          },
        },
      }),
      prisma.studentProfile.findMany({
        where: {
          tenantId,
          status: "ACTIVE",
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          modalities: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "asc" },
            include: { modality: { select: { name: true } } },
          },
        },
      }),
      prisma.teacherProfile.findMany({
        where: {
          tenantId,
          status: "ACTIVE",
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          modalities: {
            include: { modality: { select: { name: true } } },
          },
          user: { select: { id: true, email: true } },
        },
      }),
      prisma.modality.findMany({
        where: { tenantId, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true },
      }),
    ])

    const chargeKeys = events.flatMap((event) =>
      event.participants
        .filter((participant) => participant.studentProfileId)
        .map((participant) => eventChargeExternalKey(event.id, participant.userId))
    )

    const charges = chargeKeys.length
      ? await prisma.financeCharge.findMany({
          where: {
            tenantId,
            externalKey: { in: chargeKeys },
          },
          select: {
            id: true,
            externalKey: true,
            status: true,
          },
        })
      : []

    const chargeByExternalKey = new Map<string, ChargeSnapshot>(
      charges.flatMap((charge) =>
        charge.externalKey
          ? [
              [
                charge.externalKey,
                {
                  id: charge.id,
                  externalKey: charge.externalKey,
                  status: charge.status,
                },
              ] as const,
            ]
          : []
      )
    )

    const mapParticipant = (
      event: (typeof events)[number],
      participant: (typeof events)[number]["participants"][number]
    ): EventDashboardParticipantRecord => {
      const charge =
        participant.studentProfileId != null
          ? chargeByExternalKey.get(eventChargeExternalKey(event.id, participant.userId)) ?? null
          : null

      const status = mapParticipantStatus(participant.status)

      return {
        id: participant.id,
        userId: participant.userId,
        name: participant.nameSnapshot,
        role: mapParticipantRole(participant.role),
        modality: participant.modalityName ?? "Misto",
        status,
        financeChargeId: charge?.id ?? null,
        paymentStatus: charge ? charge.status.toLowerCase() as "pending" | "paid" | "overdue" | "cancelled" : null,
        canMarkAsPaid: status === "payment_pending" && charge?.status !== "PAID",
      }
    }

    const dashboardEvents = events
      .filter((event) => !eventIsPast(event, todayStart))
      .map<EventDashboardEventRecord>((event) => ({
        id: event.id,
        name: event.name,
        type: mapEventType(event.type),
        date: event.eventDate.toISOString().slice(0, 10),
        time: event.startTime,
        location: event.location,
        notes: event.notes,
        organizer: event.organizerName,
        modalityId: event.modalityId,
        teacherProfileId: event.teacherProfileId,
        status: mapEventStatus(event.status),
        modality: event.modalityName,
        capacity: event.capacity,
        registrationsOpen: event.registrationsOpen,
        hasRegistrationFee: event.hasRegistrationFee,
        registrationFeeAmount: currencyFromCents(event.registrationFeeCents),
        registrationFeeDueDays: event.registrationFeeDueDays,
        participants: event.participants.map((participant) => mapParticipant(event, participant)),
      }))

    const pastEvents = events
      .filter((event) => eventIsPast(event, todayStart))
      .sort((left, right) => right.eventDate.getTime() - left.eventDate.getTime())
      .map<EventDashboardHistoryRecord>((event) => ({
        id: event.id,
        name: event.name,
        type: mapEventType(event.type),
        date: event.eventDate.toISOString().slice(0, 10),
        participants: event.participants.length,
        modality: event.modalityName,
      }))

    const availableParticipants: EventDashboardCandidateRecord[] = [
      ...students.map((student) => ({
        id: `student-${student.id}`,
        userId: student.user.id,
        name: student.user.name ?? "Aluno",
        email: student.user.email ?? null,
        role: "athlete" as const,
        modality: student.modalities[0]?.modality.name ?? "Misto",
      })),
      ...teachers
        .filter((teacher) => teacher.user?.id)
        .map((teacher) => ({
          id: `teacher-${teacher.id}`,
          userId: teacher.user!.id,
          name: teacher.name,
          email: teacher.user?.email ?? null,
          role: "staff" as const,
          modality: teacher.modalities[0]?.modality.name ?? "Misto",
        })),
    ]

    return {
      events: dashboardEvents,
      pastEvents,
      availableParticipants,
      references: {
        modalities,
        teachers: teachers.map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
        })),
      },
    }
  }

  async createEvent(input: CreateEventInput) {
    const modality =
      input.modalityId != null
        ? await prisma.modality.findFirst({
            where: {
              id: input.modalityId,
              tenantId: input.tenantId,
            },
          })
        : null

    const teacherProfile =
      input.teacherProfileId != null
        ? await prisma.teacherProfile.findFirst({
            where: {
              id: input.teacherProfileId,
              tenantId: input.tenantId,
            },
            select: { id: true },
          })
        : null

    if (input.modalityId && !modality) {
      throw new Error("Modalidade inválida para este tenant.")
    }

    if (input.teacherProfileId && !teacherProfile) {
      throw new Error("Professor responsável inválido para este tenant.")
    }

    if (input.hasRegistrationFee) {
      if (input.registrationFeeAmount == null || input.registrationFeeAmount <= 0) {
        throw new Error("Informe um valor de taxa maior que zero.")
      }

      if ((input.registrationFeeDueDays ?? 0) < 0) {
        throw new Error("O prazo de vencimento da taxa não pode ser negativo.")
      }
    }

    const event = await prisma.event.create({
      data: {
        tenantId: input.tenantId,
        modalityId: modality?.id ?? null,
        teacherProfileId: teacherProfile?.id ?? null,
        name: input.name,
        type: this.toPrismaEventType(input.type),
        eventDate: toEventDate(input.date),
        startTime: input.time,
        location: input.location,
        organizerName: input.organizerName,
        modalityName: modality?.name ?? "Misto",
        status: "SCHEDULED",
        capacity: input.capacity,
        registrationsOpen: input.registrationsOpen ?? true,
        hasRegistrationFee: input.hasRegistrationFee ?? false,
        registrationFeeCents:
          input.hasRegistrationFee && input.registrationFeeAmount != null
            ? Math.round(input.registrationFeeAmount * 100)
            : null,
        registrationFeeDueDays:
          input.hasRegistrationFee && input.registrationFeeDueDays != null
            ? input.registrationFeeDueDays
            : null,
        notes: input.notes ?? null,
      },
    })

    return event
  }

  async updateEvent(input: {
    tenantId: string
    eventId: string
    name: string
    type: CreateEventInput["type"]
    date: string
    time: string
    modalityId?: string | null
    location: string
    organizerName?: string | null
    teacherProfileId?: string | null
    capacity: number
    hasRegistrationFee?: boolean
    registrationFeeAmount?: number | null
    registrationFeeDueDays?: number | null
    registrationsOpen?: boolean
    notes?: string | null
    status: EventDashboardEventRecord["status"]
  }) {
    const event = await prisma.event.findFirst({
      where: {
        id: input.eventId,
        tenantId: input.tenantId,
      },
      include: {
        participants: {
          select: { id: true },
        },
      },
    })

    if (!event) {
      throw new Error("Evento não encontrado.")
    }

    const modality =
      input.modalityId != null
        ? await prisma.modality.findFirst({
            where: {
              id: input.modalityId,
              tenantId: input.tenantId,
            },
          })
        : null

    const teacherProfile =
      input.teacherProfileId != null
        ? await prisma.teacherProfile.findFirst({
            where: {
              id: input.teacherProfileId,
              tenantId: input.tenantId,
            },
            select: { id: true },
          })
        : null

    if (input.modalityId && !modality) {
      throw new Error("Modalidade inválida para este tenant.")
    }

    if (input.teacherProfileId && !teacherProfile) {
      throw new Error("Professor responsável inválido para este tenant.")
    }

    const feeConfigChanged =
      event.hasRegistrationFee !== (input.hasRegistrationFee ?? false) ||
      (event.registrationFeeCents ?? null) !==
        ((input.hasRegistrationFee && input.registrationFeeAmount != null)
          ? Math.round(input.registrationFeeAmount * 100)
          : null) ||
      (event.registrationFeeDueDays ?? null) !==
        ((input.hasRegistrationFee && input.registrationFeeDueDays != null)
          ? input.registrationFeeDueDays
          : null)

    if (feeConfigChanged && event.participants.length > 0) {
      throw new Error(
        "Nao e seguro alterar a configuracao de taxa de um evento que ja possui participantes."
      )
    }

    await prisma.event.update({
      where: { id: event.id },
      data: {
        modalityId: modality?.id ?? null,
        teacherProfileId: teacherProfile?.id ?? null,
        name: input.name,
        type: this.toPrismaEventType(input.type),
        eventDate: toEventDate(input.date),
        startTime: input.time,
        location: input.location,
        organizerName: input.organizerName ?? null,
        modalityName: modality?.name ?? "Misto",
        status: toPrismaEventStatus(input.status),
        capacity: input.capacity,
        registrationsOpen:
          input.status === "completed" || input.status === "cancelled"
            ? false
            : input.registrationsOpen ?? true,
        hasRegistrationFee: input.hasRegistrationFee ?? false,
        registrationFeeCents:
          input.hasRegistrationFee && input.registrationFeeAmount != null
            ? Math.round(input.registrationFeeAmount * 100)
            : null,
        registrationFeeDueDays:
          input.hasRegistrationFee && input.registrationFeeDueDays != null
            ? input.registrationFeeDueDays
            : null,
        notes: input.notes ?? null,
      },
    })
  }

  async deleteEvent(input: { tenantId: string; eventId: string }) {
    const event = await prisma.event.findFirst({
      where: {
        id: input.eventId,
        tenantId: input.tenantId,
      },
      include: {
        participants: {
          select: { id: true },
        },
      },
    })

    if (!event) {
      throw new Error("Evento não encontrado.")
    }

    if (event.participants.length > 0) {
      throw new Error("Eventos com participantes nao podem ser excluidos. Cancele o evento.")
    }

    await prisma.event.delete({
      where: { id: event.id },
    })
  }

  async addParticipant(input: {
    tenantId: string
    eventId: string
    userId: string
    source: "admin" | "teacher" | "student"
    initialStatus?: "confirmed" | "maybe" | "declined"
  }) {
    const event = await prisma.event.findFirst({
      where: { id: input.eventId, tenantId: input.tenantId },
      select: {
        id: true,
        name: true,
        status: true,
        registrationsOpen: true,
        hasRegistrationFee: true,
        registrationFeeCents: true,
        registrationFeeDueDays: true,
      },
    })

    if (!event) {
      throw new Error("Evento não encontrado.")
    }

    if (event.status === "CANCELLED" || event.status === "COMPLETED") {
      throw new Error("Este evento não aceita novas participações.")
    }

    if (!event.registrationsOpen) {
      throw new Error("Evento fechado para inscrições.")
    }

    const studentProfile = await prisma.studentProfile.findFirst({
      where: { tenantId: input.tenantId, userId: input.userId },
      include: {
        user: { select: { name: true } },
        modalities: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "asc" },
          include: { modality: { select: { name: true } } },
        },
      },
    })

    const teacherProfile =
      studentProfile == null
        ? await prisma.teacherProfile.findFirst({
            where: { tenantId: input.tenantId, userId: input.userId },
            include: {
              user: { select: { name: true } },
              modalities: {
                include: { modality: { select: { name: true } } },
              },
            },
          })
        : null

    if (!studentProfile && !teacherProfile) {
      throw new Error("Participante não encontrado neste tenant.")
    }

    const existingCharge =
      studentProfile != null
        ? await prisma.financeCharge.findUnique({
            where: {
              externalKey: eventChargeExternalKey(input.eventId, input.userId),
            },
            select: {
              id: true,
              status: true,
              paymentMethod: true,
              paidAt: true,
            },
          })
        : null

    const requiresPaymentConfirmation =
      Boolean(event.hasRegistrationFee && event.registrationFeeCents && studentProfile)

    const nextStatus: PrismaEventParticipantStatus =
      existingCharge?.status === "PAID"
        ? PrismaEventParticipantStatus.CONFIRMED
        : input.source === "student"
          ? input.initialStatus === "declined"
            ? PrismaEventParticipantStatus.DECLINED
            : input.initialStatus === "maybe"
              ? PrismaEventParticipantStatus.MAYBE
              : requiresPaymentConfirmation
                ? PrismaEventParticipantStatus.PAYMENT_PENDING
                : PrismaEventParticipantStatus.CONFIRMED
          : requiresPaymentConfirmation
            ? PrismaEventParticipantStatus.PAYMENT_PENDING
            : PrismaEventParticipantStatus.INVITED

    await prisma.eventParticipant.upsert({
      where: {
        eventId_userId: {
          eventId: input.eventId,
          userId: input.userId,
        },
      },
      update: {
        status: nextStatus,
      },
      create: {
        tenantId: input.tenantId,
        eventId: input.eventId,
        userId: input.userId,
        studentProfileId: studentProfile?.id ?? null,
        teacherProfileId: teacherProfile?.id ?? null,
        nameSnapshot: studentProfile?.user.name ?? teacherProfile?.name ?? "Participante",
        role: studentProfile ? "ATHLETE" : "STAFF",
        modalityName:
          studentProfile?.modalities[0]?.modality.name ??
          teacherProfile?.modalities[0]?.modality.name ??
          "Misto",
        status: nextStatus,
      },
    })

    if (
      requiresPaymentConfirmation &&
      studentProfile &&
      nextStatus === PrismaEventParticipantStatus.PAYMENT_PENDING
    ) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + (event.registrationFeeDueDays ?? 0))

      await prisma.financeCharge.upsert({
        where: {
          externalKey: eventChargeExternalKey(event.id, input.userId),
        },
        update:
          existingCharge?.status === "PAID"
            ? {
                description: event.name,
                category: "Inscrição em Evento",
                amountCents: event.registrationFeeCents!,
                dueDate,
                studentProfileId: studentProfile.id,
              }
            : {
                description: event.name,
                category: "Inscrição em Evento",
                amountCents: event.registrationFeeCents!,
                dueDate,
                status: "PENDING",
                studentProfileId: studentProfile.id,
                paymentMethod: null,
                paidAt: null,
              },
        create: {
          tenantId: input.tenantId,
          userId: input.userId,
          studentProfileId: studentProfile.id,
          externalKey: eventChargeExternalKey(event.id, input.userId),
          description: event.name,
          category: "Inscrição em Evento",
          amountCents: event.registrationFeeCents!,
          dueDate,
          status: "PENDING",
        },
      })
    } else if (studentProfile && existingCharge && existingCharge.status !== "PAID") {
      await prisma.financeCharge.update({
        where: { id: existingCharge.id },
        data: {
          status: "CANCELLED",
          paymentMethod: null,
          paidAt: null,
        },
      })
    }
  }

  async updateRegistrationsState(input: {
    tenantId: string
    eventId: string
    registrationsOpen: boolean
  }) {
    const event = await prisma.event.findFirst({
      where: {
        id: input.eventId,
        tenantId: input.tenantId,
      },
      select: { id: true, status: true },
    })

    if (!event) {
      throw new Error("Evento não encontrado.")
    }

    if (event.status === "COMPLETED" || event.status === "CANCELLED") {
      throw new Error("Eventos cancelados ou realizados não podem reabrir inscrições.")
    }

    await prisma.event.update({
      where: { id: event.id },
      data: {
        registrationsOpen: input.registrationsOpen,
      },
    })
  }

  async updateParticipantStatus(input: {
    tenantId: string
    eventId: string
    participantId: string
    status: "invited" | "confirmed" | "maybe" | "declined"
  }) {
    const participant = await prisma.eventParticipant.findFirst({
      where: {
        id: input.participantId,
        tenantId: input.tenantId,
        eventId: input.eventId,
      },
      select: {
        id: true,
        userId: true,
        studentProfileId: true,
      },
    })

    if (!participant) {
      throw new Error("Participante não encontrado.")
    }

    const event = await prisma.event.findFirst({
      where: {
        id: input.eventId,
        tenantId: input.tenantId,
      },
      select: {
        id: true,
        hasRegistrationFee: true,
      },
    })

    if (!event) {
      throw new Error("Evento não encontrado.")
    }

    const externalKey = eventChargeExternalKey(input.eventId, participant.userId)
    const existingCharge =
      participant.studentProfileId != null
        ? await prisma.financeCharge.findUnique({
            where: { externalKey },
            select: { id: true, status: true },
          })
        : null

    if (
      input.status === "confirmed" &&
      event.hasRegistrationFee &&
      participant.studentProfileId &&
      existingCharge?.status !== "PAID"
    ) {
      throw new Error(
        "Participantes de evento pago só podem ser confirmados depois do pagamento."
      )
    }

    await prisma.eventParticipant.update({
      where: { id: participant.id },
      data: {
        status: toPrismaParticipantStatus(input.status),
      },
    })

    if (
      participant.studentProfileId &&
      existingCharge &&
      existingCharge.status !== "PAID" &&
      existingCharge.status !== "CANCELLED" &&
      input.status !== "confirmed"
    ) {
      await prisma.financeCharge.update({
        where: { id: existingCharge.id },
        data: {
          status: "CANCELLED",
          paymentMethod: null,
          paidAt: null,
        },
      })
    }
  }

  async confirmParticipantPayment(input: {
    tenantId: string
    eventId: string
    participantId: string
    paymentMethod: "PIX" | "CARD" | "BOLETO" | "CASH"
  }) {
    const participant = await prisma.eventParticipant.findFirst({
      where: {
        id: input.participantId,
        tenantId: input.tenantId,
        eventId: input.eventId,
      },
      select: {
        id: true,
        userId: true,
        studentProfileId: true,
      },
    })

    if (!participant) {
      throw new Error("Participante não encontrado.")
    }

    if (!participant.studentProfileId) {
      throw new Error("Somente alunos com taxa podem ser confirmados por pagamento.")
    }

    const event = await prisma.event.findFirst({
      where: {
        id: input.eventId,
        tenantId: input.tenantId,
      },
      select: {
        id: true,
        name: true,
        hasRegistrationFee: true,
        registrationFeeCents: true,
        registrationFeeDueDays: true,
      },
    })

    if (!event || !event.hasRegistrationFee || !event.registrationFeeCents) {
      throw new Error("Este participante não depende de confirmação por pagamento.")
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (event.registrationFeeDueDays ?? 0))
    const externalKey = eventChargeExternalKey(input.eventId, participant.userId)

    await prisma.$transaction(async (tx) => {
      const existingCharge = await tx.financeCharge.findUnique({
        where: { externalKey },
        select: { id: true, status: true },
      })

      if (existingCharge) {
        await tx.financeCharge.update({
          where: { id: existingCharge.id },
          data: {
            description: event.name,
            category: "Inscrição em Evento",
            amountCents: event.registrationFeeCents!,
            dueDate,
            status: "PAID",
            paymentMethod: input.paymentMethod,
            paidAt: new Date(),
            studentProfileId: participant.studentProfileId,
          },
        })
      } else {
        await tx.financeCharge.create({
          data: {
            tenantId: input.tenantId,
            userId: participant.userId,
            studentProfileId: participant.studentProfileId,
            externalKey,
            description: event.name,
            category: "Inscrição em Evento",
            amountCents: event.registrationFeeCents!,
            dueDate,
            status: "PAID",
            paymentMethod: input.paymentMethod,
            paidAt: new Date(),
          },
        })
      }

      await tx.eventParticipant.update({
        where: { id: participant.id },
        data: {
          status: PrismaEventParticipantStatus.CONFIRMED,
        },
      })
    })
  }

  async removeParticipant(input: {
    tenantId: string
    eventId: string
    participantId: string
  }) {
    const participant = await prisma.eventParticipant.findFirst({
      where: {
        id: input.participantId,
        tenantId: input.tenantId,
        eventId: input.eventId,
      },
      select: { id: true, userId: true },
    })

    if (!participant) {
      throw new Error("Participante não encontrado.")
    }

    await prisma.eventParticipant.delete({
      where: { id: participant.id },
    })

    const charge = await prisma.financeCharge.findUnique({
      where: {
        externalKey: eventChargeExternalKey(input.eventId, participant.userId),
      },
      select: { id: true, status: true },
    }).catch(() => null)

    if (charge && charge.status !== "PAID" && charge.status !== "CANCELLED") {
      await prisma.financeCharge.update({
        where: { id: charge.id },
        data: {
          status: "CANCELLED",
          paymentMethod: null,
          paidAt: null,
        },
      })
    }
  }

  private toPrismaEventType(input: CreateEventInput["type"]) {
    switch (input) {
      case "competition":
        return "COMPETITION" as const
      case "seminar":
        return "SEMINAR" as const
      case "graduation_exam":
        return "GRADUATION_EXAM" as const
      case "workshop":
        return "WORKSHOP" as const
      case "festival":
        return "FESTIVAL" as const
      case "special_class":
        return "SPECIAL_CLASS" as const
      default:
        return "WORKSHOP" as const
    }
  }
}
