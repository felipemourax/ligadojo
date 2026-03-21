import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { LeadService } from "@/apps/api/src/modules/crm/services/lead.service"
import { LeadRepository } from "@/apps/api/src/modules/crm/repositories/lead.repository"
import { StudentDashboardService } from "@/apps/api/src/modules/students/services/student-dashboard.service"

export class CrmDashboardService {
  constructor(
    private readonly leadRepository = new LeadRepository(),
    private readonly leadService = new LeadService(),
    private readonly studentDashboardService = new StudentDashboardService()
  ) {}

  async getDashboard(tenantId: string) {
    const [leads, modalities, plans] = await Promise.all([
      this.leadRepository.listByTenant(tenantId),
      prisma.modality.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: [{ activityCategory: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          activityCategory: true,
        },
      }),
      prisma.plan.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
        },
      }),
    ])

    return {
      leads,
      references: {
        modalities: modalities.map((modality) => ({
          id: modality.id,
          name: modality.name,
          activityCategory: modality.activityCategory,
        })),
        plans: plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
        })),
      },
    }
  }

  async createLead(input: {
    tenantId: string
    name: string
    email?: string | null
    phone: string
    modalityId?: string | null
    source: string
    notes?: string | null
  }) {
    return this.leadService.create({
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      modalityId: input.modalityId,
      source: normalizeSource(input.source),
      interestLabel: null,
      notes: input.notes,
      sourceContext: "dashboard:crm",
    })
  }

  async updateLeadStatus(input: {
    tenantId: string
    leadId: string
    status: "new" | "contacted" | "trial_scheduled" | "trial_completed" | "negotiating" | "converted" | "lost"
  }) {
    return this.leadRepository.updateStatus(input)
  }

  async convertLeadToStudent(input: {
    tenantId: string
    leadId: string
    email: string
    birthDate?: string | null
    address?: string | null
    emergencyContact?: string | null
    notes?: string | null
    planId?: string | null
    modalityId: string
  }) {
    const lead = await this.leadRepository.findById(input.tenantId, input.leadId)
    if (!lead) {
      throw new Error("Lead não encontrado para este tenant.")
    }

    const normalizedEmail = input.email.trim().toLowerCase()
    const normalizedPhone = lead.phone.replace(/\D/g, "")

    if (!normalizedEmail) {
      throw new Error("Informe um e-mail válido para cadastrar o aluno.")
    }

    const existingStudent = await prisma.studentProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        OR: [
          {
            user: {
              email: {
                equals: normalizedEmail,
                mode: "insensitive",
              },
            },
          },
          ...(normalizedPhone
            ? [
                {
                  user: {
                    phone: normalizedPhone,
                  },
                },
              ]
            : []),
        ],
      },
      include: {
        user: true,
      },
    })

    if (existingStudent) {
      throw new Error("Já existe um aluno cadastrado nesta academia com este e-mail ou WhatsApp.")
    }

    const studentId = await this.studentDashboardService.upsert({
      tenantId: input.tenantId,
      name: lead.name,
      email: normalizedEmail,
      phone: normalizedPhone,
      birthDate: input.birthDate ?? null,
      address: input.address ?? null,
      emergencyContact: input.emergencyContact ?? null,
      notes: input.notes ?? lead.notes ?? null,
      planId: input.planId ?? null,
      modalities: [
        {
          modalityId: input.modalityId,
          belt: "Branca",
          stripes: 0,
          startDate: new Date().toISOString().slice(0, 10),
          notes: lead.notes ?? null,
        },
      ],
    })

    const updatedLead = await this.leadRepository.updateStatus({
      tenantId: input.tenantId,
      leadId: input.leadId,
      status: "converted",
    })

    return {
      student: await this.studentDashboardService.findForTenant(input.tenantId, studentId),
      lead: updatedLead,
    }
  }
}

function normalizeSource(value: string) {
  switch (value) {
    case "Instagram":
      return "instagram" as const
    case "Facebook":
      return "facebook" as const
    case "Google":
      return "google" as const
    case "Site":
      return "website" as const
    case "Indicação":
      return "referral" as const
    default:
      return "other" as const
  }
}
