export type PlatformTenantStatus = "active" | "suspended"
export type PlatformAcademyAction = "approve" | "suspend" | "cancel"

export interface PlatformOverviewData {
  totalAcademies: number
  activeAcademies: number
  suspendedAcademies: number
  newAcademiesThisMonth: number
}

export interface PlatformAcademyListItem {
  id: string
  slug: string
  legalName: string
  displayName: string
  status: PlatformTenantStatus
  primaryDomain: string | null
  appName: string | null
  logoUrl: string | null
  primaryColor: string | null
  ownerName: string | null
  ownerEmail: string | null
  studentsCount: number
  teachersCount: number
  createdAt: string
}

export interface PlatformAcademyDetail extends PlatformAcademyListItem {
  domains: Array<{
    id: string
    domain: string
    isPrimary: boolean
    isVerified: boolean
  }>
  modalitiesCount: number
  plansCount: number
  onboardingStatus: string | null
}
