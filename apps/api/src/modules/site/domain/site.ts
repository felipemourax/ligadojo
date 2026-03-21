export type SiteTemplateId = "traditional" | "modern" | "competitive" | "community"

export type SiteSectionId =
  | "header"
  | "hero"
  | "about"
  | "modalities"
  | "plans"
  | "teachers"
  | "testimonials"
  | "trial_class"
  | "location"
  | "faq"
  | "footer"

export type SiteStatus = "draft" | "published"

export interface TenantSiteSectionConfig {
  id: SiteSectionId
  visible: boolean
  sortOrder: number
  content: Record<string, unknown>
}

export interface TenantSiteConfig {
  templateId: SiteTemplateId
  seo: {
    title?: string
    description?: string
    ogImageUrl?: string
  }
  theme: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    logoUrl?: string
    fontFamily?: string
  }
  sections: TenantSiteSectionConfig[]
}

export interface TenantSiteEntity {
  id: string
  tenantId: string
  status: SiteStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  config: TenantSiteConfig
}

export interface PublicTenantSiteView {
  tenant: {
    id: string
    slug: string
    displayName: string
  }
  site: TenantSiteEntity
  profile: {
    phone?: string | null
    contactEmail?: string | null
    website?: string | null
  }
  location: {
    street?: string | null
    number?: string | null
    city?: string | null
    state?: string | null
    country?: string | null
  }
  branding: {
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
  }
  modalities: Array<{
    id: string
    activityCategory?: string | null
    name: string
    ageGroups: string[]
  }>
  plans: Array<{
    id: string
    name: string
    amountCents: number
    billingCycle: string
    includedModalityIds: string[]
  }>
  teachers: Array<{
    id: string
    name: string
    roleTitle?: string | null
    rank?: string | null
  }>
}

export const defaultSiteSections: TenantSiteSectionConfig[] = [
  {
    id: "header",
    visible: true,
    sortOrder: 0,
    content: {},
  },
  {
    id: "hero",
    visible: true,
    sortOrder: 1,
    content: {
      headline: "Treine com os melhores",
      subheadline: "Conheça a academia, veja nossos planos e agende uma aula experimental.",
      primaryCtaText: "Agendar aula experimental",
      secondaryCtaText: "Ver planos",
    },
  },
  {
    id: "about",
    visible: true,
    sortOrder: 2,
    content: {
      title: "Sobre a academia",
      description: "Apresente a história, a proposta e os diferenciais da sua academia.",
    },
  },
  {
    id: "modalities",
    visible: true,
    sortOrder: 3,
    content: {
      title: "Atividades e modalidades",
      subtitle: "Veja as atividades oferecidas pela academia.",
    },
  },
  {
    id: "plans",
    visible: true,
    sortOrder: 4,
    content: {
      title: "Planos",
      subtitle: "Escolha o plano ideal para começar.",
      ctaText: "Contratar plano",
    },
  },
  {
    id: "teachers",
    visible: true,
    sortOrder: 5,
    content: {
      title: "Professores",
      subtitle: "Conheça a equipe da academia.",
    },
  },
  {
    id: "trial_class",
    visible: true,
    sortOrder: 6,
    content: {
      title: "Agende uma aula experimental",
      subtitle: "Envie seus dados e nossa equipe entrará em contato.",
      ctaText: "Quero agendar",
    },
  },
  {
    id: "location",
    visible: true,
    sortOrder: 7,
    content: {
      title: "Localização",
      subtitle: "Veja onde a academia está localizada.",
    },
  },
  {
    id: "footer",
    visible: true,
    sortOrder: 8,
    content: {},
  },
]

export function createDefaultTenantSiteConfig(): TenantSiteConfig {
  return {
    templateId: "traditional",
    seo: {},
    theme: {},
    sections: defaultSiteSections,
  }
}
