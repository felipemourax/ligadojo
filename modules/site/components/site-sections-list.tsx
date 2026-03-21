"use client"

import * as React from "react"
import { useId } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Eye, EyeOff, GripVertical, Pencil } from "lucide-react"
import type {
  SiteSectionId,
  TenantSiteSectionConfig,
} from "@/apps/api/src/modules/site/domain/site"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SectionMeta {
  label: string
  icon: React.ElementType
}

interface SiteSectionsListProps {
  sections: TenantSiteSectionConfig[]
  onSectionsChange: (sections: TenantSiteSectionConfig[]) => void
  onEditSection: (section: TenantSiteSectionConfig) => void
  sectionMeta: Record<SiteSectionId, SectionMeta>
  sectionLabels: Record<SiteSectionId, string>
}

function SortableSection({
  section,
  index,
  onEdit,
  onToggleVisibility,
  sectionMeta,
  sectionLabels,
}: {
  section: TenantSiteSectionConfig
  index: number
  onEdit: (section: TenantSiteSectionConfig) => void
  onToggleVisibility: (id: SiteSectionId) => void
  sectionMeta: Record<SiteSectionId, SectionMeta>
  sectionLabels: Record<SiteSectionId, string>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const meta = sectionMeta[section.id]
  const Icon = meta.icon

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

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{sectionLabels[section.id]}</p>
          <Badge variant={section.visible ? "default" : "secondary"} className="px-1.5 py-0 text-[10px]">
            {section.visible ? "Visível" : "Oculto"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Posição {index + 1}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(section)}>
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

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sections.findIndex((item) => item.id === active.id)
    const newIndex = sections.findIndex((item) => item.id === over.id)

    onSectionsChange(arrayMove(sections, oldIndex, newIndex))
  }

  const handleToggleVisibility = (id: SiteSectionId) => {
    onSectionsChange(sections.map((section) => (section.id === id ? { ...section, visible: !section.visible } : section)))
  }

  if (!mounted) {
    return (
      <div className="space-y-2">
        {sections.map((section, index) => {
          const meta = sectionMeta[section.id]
          const Icon = meta.icon

          return (
            <div
              key={section.id}
              className={cn(
                "group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all",
                !section.visible && "opacity-50"
              )}
            >
              <div className="w-4 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{sectionLabels[section.id]}</p>
                  <Badge variant={section.visible ? "default" : "secondary"} className="px-1.5 py-0 text-[10px]">
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
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
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
