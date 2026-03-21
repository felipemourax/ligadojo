"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Award,
  Check,
  Clock3,
  CreditCard,
  Dumbbell,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Layout,
  LayoutTemplate,
  MapPin,
  MessageSquare,
  Search,
  Sparkles,
  Upload,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type {
  TenantSiteEntity,
  TenantSiteSectionConfig,
  SiteSectionId,
  SiteTemplateId,
} from "@/apps/api/src/modules/site/domain/site"
import { toast } from "@/components/ui/use-toast"
import { useCurrentSession } from "@/hooks/use-current-session"
import { useCurrentTenantSlug } from "@/hooks/use-current-tenant-slug"
import { buildTenantHost } from "@/lib/tenancy/url"
import { cn } from "@/lib/utils"
import { fetchSite, publishSite, saveSite, unpublishSite } from "@/modules/site/services"
import { SiteSectionsList } from "./site-sections-list"

const templateOptions: Array<{
  value: SiteTemplateId
  label: string
  subtitle: string
  description: string
  previewClassName: string
  accentClassName: string
}> = [
  {
    value: "traditional",
    label: "Tradicional",
    subtitle: "THE HERITAGE",
    description: "Clássico, institucional e com força visual.",
    previewClassName: "bg-[linear-gradient(180deg,#111111_0%,#1a1a1a_100%)] text-white border-white/10",
    accentClassName: "bg-[#e11d2f]",
  },
  {
    value: "modern",
    label: "Moderno",
    subtitle: "THE STUDIO",
    description: "Mais clean, leve e orientado a conversão.",
    previewClassName: "bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fb_100%)] text-[#141922] border-slate-200",
    accentClassName: "bg-[#1765ff]",
  },
  {
    value: "competitive",
    label: "Competitivo",
    subtitle: "THE ARENA",
    description: "Atlético, agressivo e com contraste alto.",
    previewClassName: "bg-[linear-gradient(180deg,#000000_0%,#111111_100%)] text-white border-white/10",
    accentClassName: "bg-[#f4e11f]",
  },
  {
    value: "community",
    label: "Comunidade",
    subtitle: "THE TRIBE",
    description: "Acolhedor, familiar e com identidade suave.",
    previewClassName: "bg-[linear-gradient(180deg,#f7faf8_0%,#eef5f1_100%)] text-[#21332b] border-[#dde7e2]",
    accentClassName: "bg-[#0f6a4f]",
  },
]

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
] as const

const sectionLabels: Record<SiteSectionId, string> = {
  header: "Cabeçalho",
  hero: "Hero",
  about: "Sobre a academia",
  modalities: "Modalidades",
  plans: "Planos",
  teachers: "Professores",
  testimonials: "Depoimentos",
  trial_class: "Aula experimental",
  location: "Localização",
  faq: "Perguntas frequentes",
  footer: "Rodapé",
}

const sectionMeta: Record<SiteSectionId, { label: string; icon: React.ElementType; description: string }> = {
  header: { label: "Cabeçalho", icon: Layout, description: "Título de navegação e cores do topo" },
  hero: { label: "Hero", icon: Sparkles, description: "Seção principal com mensagem e CTA" },
  about: { label: "Sobre a academia", icon: Users, description: "História, proposta e diferenciais" },
  modalities: { label: "Modalidades", icon: Dumbbell, description: "Atividades oferecidas pela academia" },
  plans: { label: "Planos", icon: CreditCard, description: "Planos e destaque comercial" },
  teachers: { label: "Professores", icon: Award, description: "Equipe e autoridade técnica" },
  testimonials: { label: "Depoimentos", icon: MessageSquare, description: "Prova social da academia" },
  trial_class: { label: "Aula experimental", icon: Sparkles, description: "CTA e chamada de conversão" },
  location: { label: "Localização", icon: MapPin, description: "Mapa e informações do endereço" },
  faq: { label: "Perguntas frequentes", icon: MessageSquare, description: "Dúvidas comuns da academia" },
  footer: { label: "Rodapé", icon: Layout, description: "Informações finais e fechamento visual" },
}

type SectionFieldType = "text" | "textarea" | "color" | "image"

interface SectionFieldConfig {
  key: string
  label: string
  type: SectionFieldType
  placeholder?: string
}

const sectionFieldMap: Partial<Record<SiteSectionId, SectionFieldConfig[]>> = {
  header: [
    { key: "menuLabel", label: "Título do menu", type: "text", placeholder: "Nome da academia" },
    { key: "backgroundColor", label: "Cor de fundo", type: "color" },
    { key: "textColor", label: "Cor do texto", type: "color" },
  ],
  hero: [
    { key: "headline", label: "Título principal", type: "textarea", placeholder: "Treine com os melhores" },
    { key: "subheadline", label: "Subtítulo", type: "textarea", placeholder: "Texto de apoio" },
    { key: "primaryCtaText", label: "CTA principal", type: "text", placeholder: "Agendar aula" },
    { key: "secondaryCtaText", label: "CTA secundário", type: "text", placeholder: "Entrar no app" },
    { key: "backgroundImageUrl", label: "Imagem de fundo", type: "image" },
    { key: "accentColor", label: "Cor de destaque", type: "color" },
  ],
  about: [
    { key: "title", label: "Título", type: "text", placeholder: "Sobre a academia" },
    { key: "description", label: "Descrição", type: "textarea", placeholder: "Conte a história da academia" },
    { key: "imageUrl", label: "Imagem da seção", type: "image" },
    { key: "accentColor", label: "Cor de destaque", type: "color" },
  ],
  modalities: [
    { key: "title", label: "Título", type: "text", placeholder: "Atividades e modalidades" },
    { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Apresentação da seção" },
    { key: "cardBackgroundColor", label: "Cor dos cards", type: "color" },
  ],
  plans: [
    { key: "title", label: "Título", type: "text", placeholder: "Planos" },
    { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Escolha o plano ideal" },
    { key: "ctaText", label: "Texto do CTA", type: "text", placeholder: "Escolher plano" },
    { key: "highlightColor", label: "Cor de destaque", type: "color" },
  ],
  teachers: [
    { key: "title", label: "Título", type: "text", placeholder: "Professores" },
    { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Apresentação da equipe" },
  ],
  testimonials: [
    { key: "title", label: "Título", type: "text", placeholder: "Depoimentos" },
    { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "O que dizem os alunos" },
  ],
  trial_class: [
    { key: "title", label: "Título", type: "text", placeholder: "Agende uma aula experimental" },
    { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Texto de apoio" },
    { key: "ctaText", label: "Texto do botão", type: "text", placeholder: "Quero agendar" },
    { key: "backgroundColor", label: "Cor de fundo", type: "color" },
  ],
  location: [
    { key: "title", label: "Título", type: "text", placeholder: "Localização" },
    { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Informações do local" },
    { key: "mapImageUrl", label: "Imagem do mapa", type: "image" },
  ],
  footer: [
    { key: "headline", label: "Título do rodapé", type: "text", placeholder: "Nome da academia" },
    { key: "description", label: "Descrição", type: "textarea", placeholder: "Mensagem do rodapé" },
    { key: "backgroundColor", label: "Cor de fundo", type: "color" },
  ],
}

export function SiteDashboardScreen() {
  const { session } = useCurrentSession()
  const currentTenantSlug = useCurrentTenantSlug()
  const [site, setSite] = useState<TenantSiteEntity | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<SiteSectionId | null>(null)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const didInitializeRef = useRef(false)
  const lastSavedConfigRef = useRef<string | null>(null)
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingToastRef = useRef<ReturnType<typeof toast> | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await fetchSite()
        if (!active) {
          return
        }

        setSite(response)
        lastSavedConfigRef.current = JSON.stringify(response.config)
        didInitializeRef.current = true
      } catch (error) {
        if (!active) {
          return
        }

        setFeedback(error instanceof Error ? error.message : "Não foi possível carregar o site.")
        setSaveState("error")
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!site || !didInitializeRef.current) {
      return
    }

    const serializedConfig = JSON.stringify(site.config)
    if (lastSavedConfigRef.current === serializedConfig) {
      return
    }

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current)
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      void performAutoSave(site.config)
    }, 700)

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }
    }
  }, [site?.config])

  const orderedSections = useMemo(
    () => [...(site?.config.sections ?? [])].sort((left, right) => left.sortOrder - right.sortOrder),
    [site?.config.sections]
  )

  const activeSection = activeSectionId
    ? orderedSections.find((section) => section.id === activeSectionId) ?? null
    : null

  const activeTemplate =
    templateOptions.find((option) => option.value === site?.config.templateId) ?? templateOptions[0]

  const activeSectionsCount = orderedSections.filter((section) => section.visible).length
  const previewUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "/site"
    }

    const tenantSlug = currentTenantSlug ?? session?.currentMembership?.tenant?.slug ?? null
    if (!tenantSlug) {
      return "/site"
    }

    const previewHost = buildTenantHost({
      currentHostname: window.location.hostname,
      currentPort: window.location.port || null,
      tenantSlug,
      preferredDomain: null,
    })

    return `${window.location.protocol}//${previewHost}/site`
  }, [currentTenantSlug, session?.currentMembership?.tenant?.slug])

  function updateSectionField(sectionId: SiteSectionId, key: string, value: string) {
    setSite((current) =>
      current
        ? {
            ...current,
            config: {
              ...current.config,
              sections: current.config.sections.map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      content: {
                        ...section.content,
                        [key]: value,
                      },
                    }
                  : section
              ),
            },
          }
        : current
    )
  }

  function updateSeoField(key: "title" | "description", value: string) {
    setSite((current) =>
      current
        ? {
            ...current,
            config: {
              ...current.config,
              seo: {
                ...current.config.seo,
                [key]: value,
              },
            },
          }
        : current
    )
  }

  function updateThemeField(
    key: "logoUrl" | "fontFamily" | "primaryColor" | "secondaryColor" | "accentColor",
    value: string
  ) {
    setSite((current) =>
      current
        ? {
            ...current,
            config: {
              ...current.config,
              theme: {
                ...current.config.theme,
                [key]: value,
              },
            },
          }
        : current
    )
  }

  function updateTemplate(templateId: SiteTemplateId) {
    setSite((current) =>
      current
        ? {
            ...current,
            config: {
              ...current.config,
              templateId,
            },
          }
        : current
    )
  }

  function updateSections(nextSections: TenantSiteSectionConfig[]) {
    setSite((current) =>
      current
        ? {
            ...current,
            config: {
              ...current.config,
              sections: nextSections.map((section, index) => ({
                ...section,
                sortOrder: index,
              })),
            },
          }
        : current
    )
  }

  async function uploadSectionImage(sectionId: SiteSectionId, key: string, file: File) {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      setFeedback("Envie uma imagem PNG, JPG ou WEBP.")
      return
    }

    const maxSizeBytes = 2 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setFeedback("A imagem deve ter no máximo 2 MB.")
      return
    }

    const dataUrl = await readFileAsDataUrl(file)
    updateSectionField(sectionId, key, dataUrl)
    setFeedback("Imagem carregada com sucesso.")
  }

  async function uploadThemeImage(key: "logoUrl", file: File) {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      setFeedback("Envie uma imagem PNG, JPG, SVG ou WEBP.")
      return
    }

    const maxSizeBytes = 2 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setFeedback("A imagem deve ter no máximo 2 MB.")
      return
    }

    const dataUrl = await readFileAsDataUrl(file)
    updateThemeField(key, dataUrl)
    setFeedback("Logotipo carregado com sucesso.")
  }

  async function performAutoSave(config: TenantSiteEntity["config"], showSuccessToast = false) {
    setIsSaving(true)
    setSaveState("saving")
    savingToastRef.current?.dismiss()
    savingToastRef.current = toast({
      title: "Salvando alterações",
      description: "Estamos salvando as alterações do site.",
    })

    try {
      const response = await saveSite(config)
      setSite(response.site)
      lastSavedConfigRef.current = JSON.stringify(response.site.config)
      setFeedback(response.message ?? "Configurações do site atualizadas com sucesso.")
      setSaveState("saved")
      savingToastRef.current?.dismiss()
      savingToastRef.current = null
      if (showSuccessToast || document.visibilityState === "visible") {
        toast({
          title: "Alterações salvas",
          description: "O site foi atualizado automaticamente.",
        })
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar o site.")
      setSaveState("error")
      savingToastRef.current?.dismiss()
      savingToastRef.current = null
      toast({
        variant: "destructive",
        title: "Falha ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o site.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePublishToggle(checked: boolean) {
    setIsSaving(true)

    try {
      if (site) {
        const saveResponse = await saveSite(site.config)
        setSite(saveResponse.site)
        lastSavedConfigRef.current = JSON.stringify(saveResponse.site.config)
      }

      const response = checked ? await publishSite() : await unpublishSite()
      setSite(response.site)
      setFeedback(response.message ?? "Status do site atualizado.")
      setSaveState("saved")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível atualizar o status do site.")
      setSaveState("error")
    } finally {
      setIsSaving(false)
    }
  }

  if (!site) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site</h1>
          <p className="text-muted-foreground">Carregando configurações do site da academia.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site</h1>
          <p className="text-muted-foreground">
            Escolha o modelo, personalize as seções e publique o site da academia.
          </p>
        </div>
        <Button
          className="shrink-0"
          disabled={isSaving}
          onClick={() => void handlePublishToggle(site.status !== "published")}
        >
          <Globe className="mr-2 h-4 w-4" />
          {site.status === "published" ? "Voltar para rascunho" : "Salvar e publicar"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/50 p-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              site.status === "published" ? "bg-green-500" : "bg-yellow-500"
            )}
          />
          <span className="text-sm font-medium">{site.status === "published" ? "Online" : "Rascunho"}</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutTemplate className="h-4 w-4" />
          <span>{activeTemplate.label}</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4" />
          <span>{activeSectionsCount} seções ativas</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={previewUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Ver site
            </a>
          </Button>
          <div className="flex items-center gap-2 px-3">
            <Label htmlFor="site-published" className="cursor-pointer text-sm">
              Publicado
            </Label>
            <Switch
              id="site-published"
              checked={site.status === "published"}
              disabled={isSaving}
              onCheckedChange={(checked) => void handlePublishToggle(checked)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Identidade e SEO</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site-seo-title">Título do site</Label>
                  <Input
                    id="site-seo-title"
                    value={typeof site.config.seo.title === "string" ? site.config.seo.title : ""}
                    onChange={(event) => updateSeoField("title", event.target.value)}
                    placeholder="Nome da academia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-seo-description">Descrição</Label>
                  <Input
                    id="site-seo-description"
                    value={typeof site.config.seo.description === "string" ? site.config.seo.description : ""}
                    onChange={(event) => updateSeoField("description", event.target.value)}
                    placeholder="Breve descrição para buscadores"
                  />
                </div>

                <ImageUploadField
                  label="Logotipo"
                  value={typeof site.config.theme.logoUrl === "string" ? site.config.theme.logoUrl : ""}
                  uploadLabel="logo"
                  onUpload={(file) => void uploadThemeImage("logoUrl", file)}
                  onRemove={() => updateThemeField("logoUrl", "")}
                />

                <div className="space-y-2">
                  <Label>Fonte</Label>
                  <Select
                    value={typeof site.config.theme.fontFamily === "string" ? site.config.theme.fontFamily : "Inter"}
                    onValueChange={(value) => updateThemeField("fontFamily", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Seções do site</h3>
                </div>
                <span className="text-sm text-muted-foreground">{orderedSections.length} seções</span>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                Arraste para reordenar, clique para editar ou use o toggle para mostrar e ocultar.
              </p>

              <SiteSectionsList
                sections={orderedSections}
                onSectionsChange={updateSections}
                onEditSection={(section) => setActiveSectionId(section.id)}
                sectionMeta={sectionMeta}
                sectionLabels={sectionLabels}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Modelo do site</h3>
              </div>

              <p className="mb-3 text-sm text-muted-foreground">
                Escolha o template visual. O conteúdo das seções é preservado.
              </p>

              <Select value={site.config.templateId} onValueChange={(value) => updateTemplate(value as SiteTemplateId)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-3 w-3 rounded-sm", template.accentClassName)} />
                        <span className="font-medium">{template.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mt-4 overflow-hidden rounded-lg border">
                <div className="bg-muted/30 p-3">
                  <TemplatePreviewCanvas template={activeTemplate} />
                </div>

                <div className="border-t bg-card p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activeTemplate.label}
                    </Badge>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {activeTemplate.subtitle}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{activeTemplate.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SectionEditorSheet
        section={activeSection}
        open={Boolean(activeSection)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSectionId(null)
          }
        }}
        onFieldChange={(key, value) => {
          if (!activeSection) {
            return
          }

          updateSectionField(activeSection.id, key, value)
        }}
        onImageUpload={(key, file) => {
          if (!activeSection || !file) {
            return
          }

          return uploadSectionImage(activeSection.id, key, file)
        }}
      />

      <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
        <p>
          {saveState === "saving"
            ? "Salvando alterações..."
            : feedback ?? "Selecione o modelo, edite as seções e publique o site da academia."}
        </p>
        <div className="flex items-center gap-2">
          <Check className={cn("h-4 w-4", saveState === "error" ? "text-destructive" : "text-green-500")} />
          <span>
            {saveState === "saving"
              ? "Salvando"
              : saveState === "saved"
                ? "Salvamento automático ativo"
                : saveState === "error"
                  ? "Erro ao salvar"
                  : "Salvamento automático ativo"}
          </span>
        </div>
      </div>
    </div>
  )
}

function SectionEditorSheet({
  section,
  open,
  onOpenChange,
  onFieldChange,
  onImageUpload,
}: {
  section: TenantSiteSectionConfig | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onFieldChange: (key: string, value: string) => void
  onImageUpload: (key: string, file: File | null) => Promise<void> | void
}) {
  const fields = section ? sectionFieldMap[section.id] ?? [] : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{section ? sectionLabels[section.id] : "Editar seção"}</SheetTitle>
          <SheetDescription>
            Ajuste textos, imagens e cores da seção selecionada.
          </SheetDescription>
        </SheetHeader>

        {section ? (
          <div className="mt-6 space-y-4">
            {fields.length > 0 ? (
              fields.map((field) => {
                const value = typeof section.content[field.key] === "string" ? (section.content[field.key] as string) : ""

                if (field.type === "textarea") {
                  return (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Textarea
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(event) => onFieldChange(field.key, event.target.value)}
                      />
                    </div>
                  )
                }

                if (field.type === "color") {
                  return (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      <div className="flex gap-2">
                        <div
                          className="h-9 w-12 rounded border"
                          style={{ backgroundColor: value || "#000000" }}
                        />
                        <Input
                          value={value}
                          placeholder="#000000"
                          onChange={(event) => onFieldChange(field.key, event.target.value)}
                        />
                      </div>
                    </div>
                  )
                }

                if (field.type === "image") {
                  return (
                    <ImageUploadField
                      key={field.key}
                      label={field.label}
                      value={value}
                      uploadLabel="imagem"
                      onUpload={(file) => onImageUpload(field.key, file)}
                      onRemove={() => onFieldChange(field.key, "")}
                    />
                  )
                }

                return (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Input
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(event) => onFieldChange(field.key, event.target.value)}
                    />
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Esta seção ainda não possui campos configuráveis neste corte do builder.
              </p>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function ImageUploadField({
  label,
  value,
  uploadLabel,
  onUpload,
  onRemove,
}: {
  label: string
  value: string
  uploadLabel: "imagem" | "logo"
  onUpload: (file: File) => Promise<void> | void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-3 rounded-lg border p-3">
        {value ? (
          <div className="overflow-hidden rounded-md border bg-muted/30">
            <img src={value} alt={label} className="max-h-24 w-full object-contain bg-white p-2" />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>Envie PNG, JPG, SVG ou WEBP de até 2 MB.</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="justify-start" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            {value ? `Alterar ${uploadLabel}` : `Enviar ${uploadLabel}`}
          </Button>
          {value ? (
            <Button type="button" variant="outline" onClick={onRemove}>
              Remover
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          if (file) {
            void onUpload(file)
          }
          event.currentTarget.value = ""
        }}
      />
    </div>
  )
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(new Error("Não foi possível carregar a imagem."))
    reader.readAsDataURL(file)
  })
}

function TemplatePreviewCanvas({
  template,
}: {
  template: (typeof templateOptions)[number]
}) {
  const isTraditional = template.value === "traditional"
  const isModern = template.value === "modern"
  const isCompetitive = template.value === "competitive"
  const isCommunity = template.value === "community"

  return (
    <div className={cn("overflow-hidden rounded-md border", template.previewClassName)}>
      <div className="border-b border-current/10 px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold tracking-tight text-[11px]">Academia Elite Fight</div>
          <div className="flex items-center gap-2 text-[10px] text-current/70">
            <span>Sobre</span>
            <span>Planos</span>
            <span>Contato</span>
          </div>
        </div>
      </div>

      <div className="min-h-[126px] space-y-2.5 p-2.5">
        {isTraditional ? (
          <>
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-2.5">
              <div className="max-w-[70%] space-y-2.5">
                <div className="h-2 w-20 rounded-full bg-white/25" />
                <div className="h-6 w-5/6 rounded-md bg-white/15" />
                <div className="h-2 w-2/3 rounded-full bg-white/15" />
                <div className="h-6 w-20 rounded-full bg-[#e11d2f]" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                  <div className="h-6 rounded-xl bg-white/10" />
                  <div className="mt-2 h-2.5 w-2/3 rounded-full bg-white/20" />
                  <div className="mt-1.5 h-2 w-full rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </>
        ) : null}

        {isModern ? (
          <>
            <div className="grid grid-cols-[1.1fr_0.9fr] items-center gap-3">
              <div className="space-y-2.5">
                <div className="h-2 w-20 rounded-full bg-[#1765ff]/20" />
                <div className="h-6 w-5/6 rounded-md bg-[#141922]/12" />
                <div className="h-2 w-2/3 rounded-full bg-[#141922]/12" />
                <div className="h-6 w-20 rounded-full bg-[#1765ff]" />
              </div>
              <div className="h-16 rounded-[22px] bg-[linear-gradient(135deg,#dde7ff,#f4f7fb)]" />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
                  <div className="h-6 rounded-xl bg-slate-100" />
                  <div className="mt-2 h-2.5 w-2/3 rounded-full bg-slate-200" />
                  <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          </>
        ) : null}

        {isCompetitive ? (
          <>
            <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,#050505,#161616)] p-2.5">
              <div className="max-w-[75%] space-y-2.5">
                <div className="h-2 w-20 rounded-full bg-[#f4e11f]/30" />
                <div className="h-6 w-full rounded-md bg-white/15" />
                <div className="h-2 w-2/3 rounded-full bg-white/15" />
                <div className="h-6 w-20 rounded-full bg-[#f4e11f]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                <div className="h-8 rounded-xl bg-white/10" />
                <div className="mt-2 h-2.5 w-1/2 rounded-full bg-white/20" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#f4e11f]/10 p-2.5">
                <div className="h-8 rounded-xl bg-[#f4e11f]/15" />
                <div className="mt-2 h-2.5 w-1/2 rounded-full bg-[#f4e11f]/40" />
              </div>
            </div>
          </>
        ) : null}

        {isCommunity ? (
          <>
            <div className="rounded-[22px] border border-[#dfe8e3] bg-[linear-gradient(135deg,#e7f0eb,#f7faf8)] p-2.5">
              <div className="max-w-[80%] space-y-2.5">
                <div className="h-2 w-20 rounded-full bg-[#0f6a4f]/20" />
                <div className="h-6 w-5/6 rounded-md bg-[#21332b]/10" />
                <div className="h-2 w-2/3 rounded-full bg-[#21332b]/10" />
                <div className="h-6 w-20 rounded-full bg-[#0f6a4f]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[0, 1].map((item) => (
                <div key={item} className="rounded-2xl border border-[#dfe8e3] bg-white/80 p-2.5">
                  <div className="h-6 rounded-xl bg-[#eef5f1]" />
                  <div className="mt-2 h-2.5 w-2/3 rounded-full bg-[#d8e5de]" />
                  <div className="mt-1.5 h-2 w-full rounded-full bg-[#eef5f1]" />
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
