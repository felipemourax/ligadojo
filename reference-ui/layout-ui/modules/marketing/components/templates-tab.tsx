"use client"

import { useState } from "react"
import { 
  LayoutTemplate, 
  Search, 
  Eye,
  Copy,
  Sparkles,
  Check,
  ImageIcon
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Template, TemplateCategory, ContentFormat } from "../types"

const categoryLabels: Record<TemplateCategory, string> = {
  "matricula": "Matricula",
  "aula-experimental": "Aula experimental",
  "evento": "Evento",
  "graduacao": "Graduacao",
  "kids": "Kids",
  "promocao": "Promocao",
}

const formatLabels: Record<ContentFormat, string> = {
  "post": "Post",
  "story": "Story",
  "carousel": "Carrossel",
  "reels": "Reels",
}

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Matriculas abertas",
    category: "matricula",
    format: "post",
    previewUrl: "/placeholder.svg",
    isNew: true,
    hasIdentityApplied: true,
    description: "Template para campanha de matriculas",
  },
  {
    id: "2",
    name: "Treine com condicao especial",
    category: "matricula",
    format: "post",
    previewUrl: "/placeholder.svg",
    hasIdentityApplied: true,
    description: "Promocao para novos alunos",
  },
  {
    id: "3",
    name: "Sua primeira aula pode ser hoje",
    category: "aula-experimental",
    format: "story",
    previewUrl: "/placeholder.svg",
    isNew: true,
    hasIdentityApplied: true,
    description: "Convite para aula experimental",
  },
  {
    id: "4",
    name: "Graduacao de faixas",
    category: "graduacao",
    format: "post",
    previewUrl: "/placeholder.svg",
    hasIdentityApplied: false,
    description: "Anuncio de graduacao",
  },
  {
    id: "5",
    name: "Turma Kids - Matriculas",
    category: "kids",
    format: "post",
    previewUrl: "/placeholder.svg",
    hasIdentityApplied: true,
    description: "Matriculas para turma infantil",
  },
  {
    id: "6",
    name: "Campeonato - Save the Date",
    category: "evento",
    format: "story",
    previewUrl: "/placeholder.svg",
    hasIdentityApplied: false,
    description: "Anuncio de campeonato",
  },
  {
    id: "7",
    name: "Black Friday Academia",
    category: "promocao",
    format: "carousel",
    previewUrl: "/placeholder.svg",
    hasIdentityApplied: true,
    description: "Promocao especial",
  },
  {
    id: "8",
    name: "Dia dos Pais - Treino especial",
    category: "evento",
    format: "post",
    previewUrl: "/placeholder.svg",
    isNew: true,
    hasIdentityApplied: false,
    description: "Evento comemorativo",
  },
  {
    id: "9",
    name: "Kids - Desenvolvimento infantil",
    category: "kids",
    format: "carousel",
    previewUrl: "/placeholder.svg",
    hasIdentityApplied: true,
    description: "Beneficios do jiu-jitsu infantil",
  },
]

export function TemplatesTab() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedFormat, setSelectedFormat] = useState<string>("all")
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    const matchesFormat = selectedFormat === "all" || template.format === selectedFormat
    return matchesSearch && matchesCategory && matchesFormat
  })

  const handleUseTemplate = (id: string) => {
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const newTemplates = mockTemplates.filter(t => t.isNew).length

  return (
    <div className="space-y-5">
      {/* Search and Filters - Inline */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[160px] bg-card">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedFormat} onValueChange={setSelectedFormat}>
          <SelectTrigger className="w-[140px] bg-card">
            <SelectValue placeholder="Formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos formatos</SelectItem>
            {Object.entries(formatLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 && "s"}
          {newTemplates > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {newTemplates} novo{newTemplates !== 1 && "s"}
            </Badge>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={cn(
                "group border-border bg-card overflow-hidden transition-all hover:border-primary/40",
                "cursor-pointer"
              )}
              onClick={() => setPreviewTemplate(template)}
            >
              {/* Template Preview */}
              <div className="relative aspect-[4/5] bg-gradient-to-br from-muted to-muted/50">
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                  <Badge variant="secondary" className="text-[10px] bg-background/90 backdrop-blur">
                    {categoryLabels[template.category]}
                  </Badge>
                  {template.isNew && (
                    <Badge className="bg-primary text-primary-foreground text-[10px]">
                      Novo
                    </Badge>
                  )}
                </div>

                {/* Format badge */}
                <Badge 
                  variant="outline" 
                  className="absolute top-2 right-2 text-[10px] bg-background/90 backdrop-blur z-10"
                >
                  {formatLabels[template.format]}
                </Badge>

                {/* Preview placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-4">
                  <p className="text-sm text-center text-muted-foreground">
                    {template.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewTemplate(template)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUseTemplate(template.id)
                      }}
                    >
                      {copiedId === template.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1.5" />
                          Pronto
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1.5" />
                          Usar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground text-sm truncate">
                    {template.name}
                  </p>
                  {template.hasIdentityApplied && (
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutTemplate className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Nenhum template encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tente mudar os filtros ou buscar por outro termo.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => {
                setSearch("")
                setSelectedCategory("all")
                setSelectedFormat("all")
              }}
            >
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {previewTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{previewTemplate.name}</DialogTitle>
                  {previewTemplate.hasIdentityApplied && (
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Personalizado
                    </Badge>
                  )}
                </div>
                <DialogDescription>
                  {categoryLabels[previewTemplate.category]} - {formatLabels[previewTemplate.format]}
                </DialogDescription>
              </DialogHeader>
              
              <div className="aspect-[4/5] bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Preview do template</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {previewTemplate.description}
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Fechar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleUseTemplate(previewTemplate.id)
                    setPreviewTemplate(null)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Usar template
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
