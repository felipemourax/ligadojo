// Types for CRM Module
export interface Lead {
  id: string
  name: string
  email?: string
  phone: string
  source: LeadSource
  interest?: string[]
  status: LeadStatus
  notes?: string
  assignedTo?: string
  trialClassDate?: string
  trialClassId?: string
  convertedToStudentId?: string
  createdAt: string
  updatedAt: string
}

export type LeadSource = 
  | "website" 
  | "instagram" 
  | "facebook" 
  | "google" 
  | "referral" 
  | "walk_in" 
  | "event" 
  | "other"

export type LeadStatus = 
  | "new" 
  | "contacted" 
  | "trial_scheduled" 
  | "trial_completed" 
  | "negotiating" 
  | "converted" 
  | "lost"

export interface LeadActivity {
  id: string
  leadId: string
  type: ActivityType
  description: string
  userId: string
  createdAt: string
}

export type ActivityType = 
  | "call" 
  | "email" 
  | "whatsapp" 
  | "meeting" 
  | "trial_class" 
  | "follow_up" 
  | "note"

export interface Campaign {
  id: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  budget?: number
  source: LeadSource
  leads: string[]
  conversions: number
  status: CampaignStatus
  createdAt: string
}

export type CampaignStatus = "draft" | "active" | "paused" | "completed"

export interface CRMStats {
  totalLeads: number
  newLeads: number
  trialsScheduled: number
  conversions: number
  conversionRate: number
  bySource: SourceStats[]
}

export interface SourceStats {
  source: LeadSource
  count: number
  conversions: number
  rate: number
}

export interface CRMFilters {
  search?: string
  status?: LeadStatus
  source?: LeadSource
  startDate?: string
  endDate?: string
  assignedTo?: string
}
