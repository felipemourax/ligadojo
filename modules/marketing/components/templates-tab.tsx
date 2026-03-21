"use client"

import { useMemo, useState } from "react"
import { Check, Copy, Download, Eye, ImageIcon, LayoutTemplate, Search, Sparkles } from "lucide-react"
import type {
  MarketingTemplateCategory,
  MarketingTemplateFormat,
  MarketingTemplateView,
} from "@/apps/api/src/modules/marketing/domain/marketing-templates"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  templateCategoryIcons,
  templateCategoryLabels,
  templateFormatLabels,
} from "@/modules/marketing/lib/marketing-dashboard"

interface TemplatesTabProps {
  templates: MarketingTemplateView[]
  isLoading: boolean
  onUseTemplate: (template: MarketingTemplateView) => void
  onDownloadTemplate: (template: MarketingTemplateView) => Promise<void>
}

export function TemplatesTab({
  templates,
  isLoading,
  onUseTemplate,
  onDownloadTemplate,
}: TemplatesTabProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | MarketingTemplateCategory>("all")
  const [selectedFormat, setSelectedFormat] = useState<"all" | MarketingTemplateFormat>("all")
  const [previewTemplate, setPreviewTemplate] = useState<MarketingTemplateView | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => {
        const term = search.trim().toLowerCase()
        const matchesSearch =
          term.length === 0 ||
          template.name.toLowerCase().includes(term) ||
          template.headline.toLowerCase().includes(term)
        const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
        const matchesFormat = selectedFormat === "all" || template.format === selectedFormat
        return matchesSearch && matchesCategory && matchesFormat
      }),
    [search, selectedCategory, selectedFormat, templates]
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar template..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="bg-card pl-9"
          />
        </div>

        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as "all" | MarketingTemplateCategory)}>
          <SelectTrigger className="w-[160px] bg-card">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {Object.entries(templateCategoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as "all" | MarketingTemplateFormat)}>
          <SelectTrigger className="w-[140px] bg-card">
            <SelectValue placeholder="Formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos formatos</SelectItem>
            {Object.entries(templateFormatLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
          {templates.filter((item) => item.isNew).length > 0 ? (
            <Badge variant="secondary" className="ml-2 text-xs">
              {templates.filter((item) => item.isNew).length} novo{templates.filter((item) => item.isNew).length !== 1 ? "s" : ""}
            </Badge>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-10 text-center">
            <LayoutTemplate className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Carregando templates</h3>
              <p className="max-w-xl text-sm text-muted-foreground">
                Estamos preparando a biblioteca visual da academia.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filteredTemplates.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-10 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Nenhum template encontrado</h3>
              <p className="max-w-xl text-sm text-muted-foreground">
                Ajuste os filtros ou amplie o kit visual para personalizar melhor os modelos.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredTemplates.map((template) => {
            const CategoryIcon = templateCategoryIcons[template.category]

            return (
              <Card
                key={template.id}
                className={cn("group cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-primary/40")}
                onClick={() => setPreviewTemplate(template)}
              >
                <div
                  className="relative aspect-[4/5] border-b border-border/60"
                  style={{
                    background: `linear-gradient(135deg, ${template.colors[0]} 0%, ${template.colors[1]} 100%)`,
                  }}
                >
                  <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
                    <Badge variant="secondary" className="bg-background/90 text-[10px] backdrop-blur">
                      {templateCategoryLabels[template.category]}
                    </Badge>
                    {template.isNew ? (
                      <Badge className="bg-primary text-[10px] text-primary-foreground">Novo</Badge>
                    ) : null}
                    {template.isPremium ? (
                      <Badge className="bg-amber-300 text-[10px] text-amber-950">Premium</Badge>
                    ) : null}
                  </div>

                  <Badge variant="outline" className="absolute right-2 top-2 z-10 bg-background/90 text-[10px] backdrop-blur">
                    {templateFormatLabels[template.format]}
                  </Badge>

                  <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                    <div className="flex items-start justify-between gap-3 pt-8">
                      <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      {template.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={template.logoUrl}
                          alt="Logo da academia"
                          className="h-10 w-10 rounded-2xl border border-white/15 bg-white/10 object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      {template.previewImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={template.previewImageUrl}
                          alt={template.name}
                          className="h-24 w-full rounded-[18px] object-cover shadow-lg"
                        />
                      ) : (
                        <div className="flex h-24 w-full items-center justify-center rounded-[18px] border border-white/10 bg-white/10">
                          <ImageIcon className="h-8 w-8 text-white/70" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                          {templateFormatLabels[template.format]}
                        </p>
                        <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{template.headline}</h3>
                        <p className="line-clamp-2 text-sm text-white/80">{template.body}</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/90 opacity-0 transition-all group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation()
                        setPreviewTemplate(template)
                      }}
                    >
                      <Eye className="mr-1.5 h-4 w-4" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation()
                        setCopiedId(template.id)
                        setTimeout(() => setCopiedId(null), 2000)
                        onUseTemplate(template)
                      }}
                    >
                      {copiedId === template.id ? (
                        <>
                          <Check className="mr-1.5 h-4 w-4" />
                          Aplicado
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1.5 h-4 w-4" />
                          Usar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={Boolean(previewTemplate)} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl">
          {previewTemplate ? (
            <>
              <DialogHeader>
                <DialogTitle>{previewTemplate.name}</DialogTitle>
                <DialogDescription>
                  {templateCategoryLabels[previewTemplate.category]} • {templateFormatLabels[previewTemplate.format]}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
                <div
                  className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border/60"
                  style={{
                    background: `linear-gradient(135deg, ${previewTemplate.colors[0]} 0%, ${previewTemplate.colors[1]} 100%)`,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="rounded-full bg-white/10 text-white hover:bg-white/10">
                        {templateCategoryLabels[previewTemplate.category]}
                      </Badge>
                      {previewTemplate.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewTemplate.logoUrl}
                          alt="Logo da academia"
                          className="h-12 w-12 rounded-2xl border border-white/15 object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      {previewTemplate.previewImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewTemplate.previewImageUrl}
                          alt={previewTemplate.name}
                          className="h-44 w-full rounded-[22px] object-cover"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center rounded-[22px] border border-white/10 bg-white/10">
                          <ImageIcon className="h-10 w-10 text-white/70" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/70">
                          {templateFormatLabels[previewTemplate.format]}
                        </p>
                        <h3 className="text-2xl font-semibold leading-tight">{previewTemplate.headline}</h3>
                        <p className="text-sm text-white/80">{previewTemplate.body}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="font-medium text-foreground">Descrição</p>
                    <p className="mt-1 text-sm text-muted-foreground">{previewTemplate.body}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-sm font-medium text-foreground">Categoria</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {templateCategoryLabels[previewTemplate.category]}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-sm font-medium text-foreground">Formato</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {templateFormatLabels[previewTemplate.format]}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => {
                        setCopiedId(previewTemplate.id)
                        setTimeout(() => setCopiedId(null), 2000)
                        onUseTemplate(previewTemplate)
                      }}
                    >
                      {copiedId === previewTemplate.id ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Template aplicado
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Usar template
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => void onDownloadTemplate(previewTemplate)}>
                      <Download className="mr-2 h-4 w-4" />
                      Baixar preview
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
