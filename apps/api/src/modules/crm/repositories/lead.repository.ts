import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import type { CreateCrmLeadInput } from "@/apps/api/src/modules/crm/domain/lead"
import { toCrmLeadEntity } from "@/apps/api/src/modules/crm/domain/lead-mappers"

export class LeadRepository {
  async findById(tenantId: string, leadId: string) {
    const lead = await (prisma as typeof prisma & {
      lead: {
        findFirst: (args: {
          where: { id: string; tenantId: string }
          include?: { modality: { select: { name: true } } }
        }) => Promise<{
          id: string
          tenantId: string
          modalityId: string | null
          name: string
          email: string | null
          phone: string
          source: string
          status: string
          interestLabel: string | null
          notes: string | null
          sourceContext: string | null
          consentAcceptedAt: Date | null
          createdAt: Date
          updatedAt: Date
          modality?: { name: string } | null
        } | null>
      }
    }).lead.findFirst({
      where: { id: leadId, tenantId },
      include: {
        modality: {
          select: {
            name: true,
          },
        },
      },
    })

    return lead
      ? toCrmLeadEntity({
          ...lead,
          interestLabel: lead.interestLabel ?? lead.modality?.name ?? null,
        })
      : null
  }

  async listByTenant(tenantId: string) {
    const leads = await (prisma as typeof prisma & {
      lead: {
        findMany: (args: {
          where: { tenantId: string }
          orderBy: Array<{ createdAt: "desc" }>
          include: { modality: { select: { name: true } } }
        }) => Promise<
          Array<{
            id: string
            tenantId: string
            modalityId: string | null
            name: string
            email: string | null
            phone: string
            source: string
            status: string
            interestLabel: string | null
            notes: string | null
            sourceContext: string | null
            consentAcceptedAt: Date | null
            createdAt: Date
            updatedAt: Date
            modality: { name: string } | null
          }>
        >
      }
    }).lead.findMany({
      where: { tenantId },
      orderBy: [{ createdAt: "desc" }],
      include: {
        modality: {
          select: {
            name: true,
          },
        },
      },
    })

    return leads.map((lead) =>
      toCrmLeadEntity({
        ...lead,
        interestLabel: lead.interestLabel ?? lead.modality?.name ?? null,
      })
    )
  }

  async create(input: CreateCrmLeadInput) {
    const lead = await (prisma as typeof prisma & {
      lead: {
        create: (args: {
          data: {
            tenantId: string
            modalityId: string | null
            name: string
            email: string | null
            phone: string
            source: string
            interestLabel: string | null
            notes: string | null
            sourceContext: string | null
            consentAcceptedAt: Date | null
          }
        }) => Promise<{
          id: string
          tenantId: string
          modalityId: string | null
          name: string
          email: string | null
          phone: string
          source: string
          status: string
          interestLabel: string | null
          notes: string | null
          sourceContext: string | null
          consentAcceptedAt: Date | null
          createdAt: Date
          updatedAt: Date
        }>
      }
    }).lead.create({
      data: {
        tenantId: input.tenantId,
        modalityId: input.modalityId ?? null,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone,
        source: input.source.toUpperCase() as never,
        interestLabel: input.interestLabel ?? null,
        notes: input.notes ?? null,
        sourceContext: input.sourceContext ?? null,
        consentAcceptedAt: input.consentAcceptedAt ? new Date(input.consentAcceptedAt) : null,
      },
    })

    return toCrmLeadEntity(lead)
  }

  async updateStatus(input: {
    tenantId: string
    leadId: string
    status: "new" | "contacted" | "trial_scheduled" | "trial_completed" | "negotiating" | "converted" | "lost"
  }) {
    const lead = await (prisma as typeof prisma & {
      lead: {
        updateMany: (args: {
          where: { id: string; tenantId: string }
          data: { status: string }
        }) => Promise<{ count: number }>
        findFirst: (args: {
          where: { id: string; tenantId: string }
        }) => Promise<{
          id: string
          tenantId: string
          modalityId: string | null
          name: string
          email: string | null
          phone: string
          source: string
          status: string
          interestLabel: string | null
          notes: string | null
          sourceContext: string | null
          consentAcceptedAt: Date | null
          createdAt: Date
          updatedAt: Date
        } | null>
      }
    }).lead.updateMany({
      where: {
        id: input.leadId,
        tenantId: input.tenantId,
      },
      data: {
        status: input.status.toUpperCase(),
      },
    })

    if (lead.count === 0) {
      return null
    }

    const updatedLead = await (prisma as typeof prisma & {
      lead: {
        findFirst: (args: {
          where: { id: string; tenantId: string }
        }) => Promise<{
          id: string
          tenantId: string
          modalityId: string | null
          name: string
          email: string | null
          phone: string
          source: string
          status: string
          interestLabel: string | null
          notes: string | null
          sourceContext: string | null
          consentAcceptedAt: Date | null
          createdAt: Date
          updatedAt: Date
        } | null>
      }
    }).lead.findFirst({
      where: {
        id: input.leadId,
        tenantId: input.tenantId,
      },
    })

    return updatedLead ? toCrmLeadEntity(updatedLead) : null
  }
}
