import type { CrmLeadEntity, CrmLeadSource, CrmLeadStatus } from "@/apps/api/src/modules/crm/domain/lead"

function mapSource(source: string): CrmLeadSource {
  return source.toLowerCase() as CrmLeadSource
}

function mapStatus(status: string): CrmLeadStatus {
  return status.toLowerCase() as CrmLeadStatus
}

export function toCrmLeadEntity(lead: {
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
}): CrmLeadEntity {
  return {
    id: lead.id,
    tenantId: lead.tenantId,
    modalityId: lead.modalityId,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: mapSource(lead.source),
    status: mapStatus(lead.status),
    interestLabel: lead.interestLabel,
    notes: lead.notes,
    sourceContext: lead.sourceContext,
    consentAcceptedAt: lead.consentAcceptedAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }
}
