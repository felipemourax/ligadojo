"use client"

import * as React from "react"
import { useId } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Eye, EyeOff, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

// Types
interface SectionContent {
  title?: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  image?: string
  items?: Array<{
    id: string
    title: string
    description?: string
    price?: string
    image?: string
    icon?: string
  }>
  features?: string[]
  contactInfo?: {
    phone?: string
    email?: string
    address?: string
    hours?: string
  }
  socialLinks?: {
    instagram?: string
    facebook?: string
    youtube?: string
  }
}

export interface Section {
  id: string
  type: SectionType
  visible: boolean
  content: SectionContent
}

type SectionType =
  | "hero"
  | "about"
  | "modalities"
  | "plans"
  | "teachers"
  | "testimonials"
  | "schedule"
  | "gallery"
  | "contact"
  | "footer"
  | "cta"
  | "faq"

interface SectionMeta {
  label: string
  icon: React.ElementType
  description: string
}

interface SiteSectionsListProps {
  sections: Section[]
  onSectionsChange: (sections: Section[]) => void
  onEditSection: (section: Section) => void
  sectionMeta: Record<SectionType, SectionMeta>
  sectionLabels: Record<string, string>
}

// Sortable Section Component
function SortableSection({
  section,
  index,
  onEdit,
  onToggleVisibility,
  sectionMeta,
  sectionLabels,
}: {
  section: Section
  index: number
  onEdit: (section: Section) => void
  onToggleVisibility: (id: string) => void
  sectionMeta: Record<SectionType, SectionMeta>
  sectionLabels: Record<string, string>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const meta = sectionMeta[section.type]
  const Icon = meta.icon
  const label = sectionLabels[section.id] || meta.label

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all",
        isDragging && "z-50 shadow-lg ring-2 ring-primary",
        !section.visible && "opacity-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{label}</p>
          <Badge variant={section.visible ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
            {section.visible ? "Visível" : "Oculto"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Posição {index + 1}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(section)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onToggleVisibility(section.id)}
        >
          {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  )
}

export function SiteSectionsList({
  sections,
  onSectionsChange,
  onEditSection,
  sectionMeta,
  sectionLabels,
}: SiteSectionsListProps) {
  const dndId = useId()
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id)
      const newIndex = sections.findIndex((item) => item.id === over.id)
      onSectionsChange(arrayMove(sections, oldIndex, newIndex))
    }
  }

  const handleToggleVisibility = (id: string) => {
    onSectionsChange(sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)))
  }

  // Render static list while not mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-2">
        {sections.map((section, index) => {
          const meta = sectionMeta[section.type]
          const Icon = meta.icon
          const label = sectionLabels[section.id] || meta.label
          return (
            <div
              key={section.id}
              className={cn(
                "group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all",
                !section.visible && "opacity-50"
              )}
            >
              <div className="w-4 h-4 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{label}</p>
                  <Badge variant={section.visible ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                    {section.visible ? "Visível" : "Oculto"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Posição {index + 1}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sections.map((section, index) => (
            <SortableSection
              key={section.id}
              section={section}
              index={index}
              onEdit={onEditSection}
              onToggleVisibility={handleToggleVisibility}
              sectionMeta={sectionMeta}
              sectionLabels={sectionLabels}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
