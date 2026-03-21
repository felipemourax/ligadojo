// Brand Identity Types
export interface BrandColors {
  primary: string
  secondary: string
  accent: string
}

export interface BrandTypography {
  title: string
  body: string
}

export interface BrandMaterial {
  id: string
  name: string
  type: "image/jpeg" | "image/png" | "image/svg+xml"
  category: "logo" | "equipe" | "professor" | "espaco" | "treino" | "outro"
  url: string
}

export interface BrandIdentity {
  colors: BrandColors
  typography: BrandTypography
  logo: BrandMaterial | null
  materials: BrandMaterial[]
  notes: string
}

// Content Creation Types
export type ContentObjective = 
  | "attract" 
  | "training" 
  | "evolution" 
  | "event" 
  | "kids" 
  | "trial"

export type ContentFormat = 
  | "post" 
  | "story" 
  | "carousel" 
  | "reels"

export type ContentTone = 
  | "professional" 
  | "casual" 
  | "inspiring" 
  | "urgent"

export interface ContentCreationState {
  step: number
  objective: ContentObjective | null
  format: ContentFormat | null
  template: string | null
  selectedMaterials: string[]
  tone: ContentTone | null
  cta: string
  additionalInstructions: string
  generatedContent: GeneratedContent | null
}

export interface GeneratedContent {
  title: string
  caption: string
  hashtags: string[]
  previewUrl?: string
}

// Template Types
export type TemplateCategory = 
  | "matricula" 
  | "aula-experimental" 
  | "evento" 
  | "graduacao" 
  | "kids" 
  | "promocao"

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  format: ContentFormat
  previewUrl: string
  isNew?: boolean
  hasIdentityApplied?: boolean
  description?: string
}

// Recent History
export interface RecentContent {
  id: string
  title: string
  subtitle: string
  type: ContentFormat
  createdAt: Date
}
