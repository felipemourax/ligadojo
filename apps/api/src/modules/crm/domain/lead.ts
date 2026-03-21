export type CrmLeadSource =
  | "website"
  | "instagram"
  | "facebook"
  | "google"
  | "referral"
  | "walk_in"
  | "event"
  | "other"

export type CrmLeadStatus =
  | "new"
  | "contacted"
  | "trial_scheduled"
  | "trial_completed"
  | "negotiating"
  | "converted"
  | "lost"

export interface CrmLeadEntity {
  id: string
  tenantId: string
  modalityId: string | null
  name: string
  email: string | null
  phone: string
  source: CrmLeadSource
  status: CrmLeadStatus
  interestLabel: string | null
  notes: string | null
  sourceContext: string | null
  consentAcceptedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCrmLeadInput {
  tenantId: string
  modalityId?: string | null
  name: string
  email?: string | null
  phone: string
  source: CrmLeadSource
  interestLabel?: string | null
  notes?: string | null
  sourceContext?: string | null
  consentAcceptedAt?: string | null
}
