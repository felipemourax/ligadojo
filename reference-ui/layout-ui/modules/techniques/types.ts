// Types for Techniques Module (Library)
export interface Technique {
  id: string
  name: string
  namePortuguese?: string
  nameJapanese?: string
  description: string
  modalityId: string
  categoryId: string
  category?: TechniqueCategory
  level: TechniqueLevel
  position?: Position
  videoUrl?: string
  thumbnailUrl?: string
  steps?: TechniqueStep[]
  tips?: string[]
  commonMistakes?: string[]
  relatedTechniques?: string[]
  beltRequirement?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface TechniqueCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  modalityId: string
  order: number
}

export type TechniqueLevel = "white" | "blue" | "purple" | "brown" | "black" | "all"

export interface Position {
  id: string
  name: string
  description?: string
  type: PositionType
}

export type PositionType = "guard" | "mount" | "side_control" | "back" | "standing" | "turtle" | "other"

export interface TechniqueStep {
  order: number
  description: string
  imageUrl?: string
  videoTimestamp?: number
}

export interface Curriculum {
  id: string
  name: string
  modalityId: string
  beltId: string
  techniques: CurriculumTechnique[]
  description?: string
}

export interface CurriculumTechnique {
  techniqueId: string
  required: boolean
  order: number
}

export interface TechniqueFilters {
  search?: string
  modalityId?: string
  categoryId?: string
  level?: TechniqueLevel
  positionId?: string
  beltRequirement?: string
}
