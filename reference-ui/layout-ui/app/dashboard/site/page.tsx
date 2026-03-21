"use client"

// Site page - manages templates and sections
import * as React from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  GripVertical,
  Eye,
  EyeOff,
  Globe,
  Check,
  ExternalLink,
  Pencil,
  Layout,
  Users,
  MessageSquare,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Clock,
  Award,
  Dumbbell,
  CreditCard,
  Sparkles,
  Plus,
  Image as ImageIcon,
  Search,
  Star,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Dynamic import para evitar hydration mismatch do @dnd-kit
const SiteSectionsList = dynamic(
  () => import("@/components/site-sections-list").then((mod) => mod.SiteSectionsList),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3 animate-pulse">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="h-8 w-8 bg-muted rounded-md" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }
)

// Types
interface SectionContent {
  title?: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  image?: string
  backgroundColor?: string
  textColor?: string
  items?: { id: string; title: string; description?: string; image?: string; price?: string }[]
  contactInfo?: { phone?: string; email?: string; address?: string; hours?: string }
  socialLinks?: { instagram?: string; facebook?: string; youtube?: string; whatsapp?: string }
}

interface Section {
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



interface SiteConfig {
  seoTitle: string
  seoDescription: string
  logo: string | null
  font: string
}

// Section metadata
const sectionMeta: Record<SectionType, { label: string; icon: React.ElementType; description: string }> = {
  hero: { label: "Banner Principal", icon: Layout, description: "Seção de destaque com título e CTA" },
  about: { label: "Sobre Nós", icon: Users, description: "História e valores da academia" },
  modalities: { label: "Modalidades", icon: Dumbbell, description: "Artes marciais oferecidas" },
  plans: { label: "Planos", icon: CreditCard, description: "Tabela de preços e planos" },
  teachers: { label: "Professores", icon: Award, description: "Equipe de instrutores" },
  testimonials: { label: "Depoimentos", icon: MessageSquare, description: "Avaliações de alunos" },
  schedule: { label: "Horários", icon: Calendar, description: "Grade de aulas" },
  gallery: { label: "Galeria", icon: ImageIcon, description: "Fotos da academia" },
  contact: { label: "Contato", icon: Phone, description: "Informações de contato" },
  footer: { label: "Rodapé", icon: Layout, description: "Links e informações finais" },
  cta: { label: "Chamada para Ação", icon: Sparkles, description: "Botão de conversão" },
  faq: { label: "Perguntas Frequentes", icon: MessageSquare, description: "Dúvidas comuns" },
}

// Seções fixas (iguais para todos os templates)
const defaultSections: Section[] = [
  { id: "header", type: "hero", visible: true, content: { title: "Nome da academia" } },
  { id: "hero", type: "hero", visible: true, content: { title: "Treine com os Melhores", subtitle: "Academia de Artes Marciais", buttonText: "Agende uma Aula Grátis" } },
  { id: "about", type: "about", visible: true, content: { title: "Sobre a academia", description: "Fundada em 2010, nossa academia se tornou referência em artes marciais." } },
  { id: "modalities", type: "modalities", visible: true, content: { title: "Modalidades", items: [{ id: "1", title: "Jiu-Jitsu" }, { id: "2", title: "Muay Thai" }] } },
  { id: "plans", type: "plans", visible: true, content: { title: "Planos", items: [{ id: "1", title: "Básico", price: "R$ 150/mês" }, { id: "2", title: "Completo", price: "R$ 250/mês" }] } },
  { id: "teachers", type: "teachers", visible: true, content: { title: "Professores", items: [{ id: "1", title: "Prof. Carlos Silva" }] } },
  { id: "trial", type: "cta", visible: true, content: { title: "Aula experimental", buttonText: "Agendar Aula Grátis" } },
  { id: "location", type: "contact", visible: true, content: { title: "Localização", contactInfo: { address: "Rua das Artes, 123" } } },
  { id: "footer", type: "footer", visible: true, content: { title: "Rodapé" } },
]

// Section labels para exibição
const sectionLabels: Record<string, string> = {
  header: "Cabeçalho",
  hero: "Hero",
  about: "Sobre a academia",
  modalities: "Modalidades",
  plans: "Planos",
  teachers: "Professores",
  trial: "Aula experimental",
  location: "Localização",
  footer: "Rodapé",
}

// Templates (apenas visual, não muda as seções)
interface TemplateInfo {
  id: string
  name: string
  subtitle: string
  description: string
  color: string
}

const templates: TemplateInfo[] = [
  { id: "tradicional", name: "Tradicional", subtitle: "THE HERITAGE", description: "Clássico, institucional e com força visual.", color: "bg-red-500" },
  { id: "moderno", name: "Moderno", subtitle: "THE STUDIO", description: "Mais clean, leve e orientado a conversão.", color: "bg-blue-500" },
  { id: "competitivo", name: "Competitivo", subtitle: "THE ARENA", description: "Atlético, agressivo e com contraste alto.", color: "bg-yellow-500" },
  { id: "comunidade", name: "Comunidade", subtitle: "THE TRIBE", description: "Acolhedor, familiar e com identidade suave.", color: "bg-green-500" },
]

const fonts = [
  { id: "inter", name: "Inter", preview: "Aa" },
  { id: "roboto", name: "Roboto", preview: "Aa" },
  { id: "poppins", name: "Poppins", preview: "Aa" },
  { id: "montserrat", name: "Montserrat", preview: "Aa" },
]

// Section Editor - Modal Dialog
function SectionEditorSheet({
  section,
  open,
  onOpenChange,
  onSave,
}: {
  section: Section | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (section: Section) => void
}) {
  const [editedSection, setEditedSection] = React.useState<Section | null>(null)

  React.useEffect(() => {
    if (section) {
      setEditedSection(JSON.parse(JSON.stringify(section)))
    }
  }, [section])

  if (!editedSection) return null

  const meta = sectionMeta[editedSection.type]
  const label = sectionLabels[editedSection.id] || meta.label

  const handleSave = () => {
    onSave(editedSection)
    onOpenChange(false)
  }

  const updateContent = (key: keyof SectionContent, value: unknown) => {
    setEditedSection({
      ...editedSection,
      content: {
        ...editedSection.content,
        [key]: value,
      },
    })
  }

  // Campos específicos para Cabeçalho (header)
  if (editedSection.id === "header") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{label}</SheetTitle>
            <SheetDescription>Ajuste textos, imagens e cores da seção selecionada.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do menu</Label>
              <Input
                id="title"
                value={editedSection.content.title || ""}
                onChange={(e) => updateContent("title", e.target.value)}
                placeholder="Nome da academia"
              />
            </div>

            <div className="space-y-2">
              <Label>Cor de fundo</Label>
              <div className="flex gap-2">
                <div 
                  className="h-9 w-12 rounded border" 
                  style={{ backgroundColor: editedSection.content.backgroundColor || "#000000" }}
                />
                <Input
                  value={editedSection.content.backgroundColor || "#000000"}
                  onChange={(e) => updateContent("backgroundColor", e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor do texto</Label>
              <div className="flex gap-2">
                <div 
                  className="h-9 w-12 rounded border" 
                  style={{ backgroundColor: editedSection.content.textColor || "#000000" }}
                />
                <Input
                  value={editedSection.content.textColor || "#000000"}
                  onChange={(e) => updateContent("textColor", e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave}>Fechar</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{label}</SheetTitle>
          <SheetDescription>Ajuste textos, imagens e cores da seção selecionada.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={editedSection.content.title || ""}
              onChange={(e) => updateContent("title", e.target.value)}
              placeholder="Digite o título"
            />
          </div>

          {(editedSection.type === "hero" || editedSection.type === "cta" || editedSection.type === "about") && (
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={editedSection.content.subtitle || ""}
                onChange={(e) => updateContent("subtitle", e.target.value)}
                placeholder="Digite o subtítulo"
              />
            </div>
          )}

          {(editedSection.type === "hero" || editedSection.type === "about" || editedSection.type === "cta" || editedSection.type === "footer") && (
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={editedSection.content.description || ""}
                onChange={(e) => updateContent("description", e.target.value)}
                placeholder="Digite a descrição"
                rows={3}
              />
            </div>
          )}

          {(editedSection.type === "hero" || editedSection.type === "cta") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="buttonText">Texto do Botão</Label>
                <Input
                  id="buttonText"
                  value={editedSection.content.buttonText || ""}
                  onChange={(e) => updateContent("buttonText", e.target.value)}
                  placeholder="Ex: Saiba mais"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonLink">Link do Botão</Label>
                <Input
                  id="buttonLink"
                  value={editedSection.content.buttonLink || ""}
                  onChange={(e) => updateContent("buttonLink", e.target.value)}
                  placeholder="Ex: #contato"
                />
              </div>
            </>
          )}

          {editedSection.type === "contact" && (
            <div className="space-y-4">
              <Label>Informações de Contato</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={editedSection.content.contactInfo?.phone || ""}
                    onChange={(e) =>
                      updateContent("contactInfo", {
                        ...editedSection.content.contactInfo,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Telefone"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={editedSection.content.contactInfo?.email || ""}
                    onChange={(e) =>
                      updateContent("contactInfo", {
                        ...editedSection.content.contactInfo,
                        email: e.target.value,
                      })
                    }
                    placeholder="E-mail"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={editedSection.content.contactInfo?.address || ""}
                    onChange={(e) =>
                      updateContent("contactInfo", {
                        ...editedSection.content.contactInfo,
                        address: e.target.value,
                      })
                    }
                    placeholder="Endereço"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={editedSection.content.contactInfo?.hours || ""}
                    onChange={(e) =>
                      updateContent("contactInfo", {
                        ...editedSection.content.contactInfo,
                        hours: e.target.value,
                      })
                    }
                    placeholder="Horário de funcionamento"
                  />
                </div>
              </div>
            </div>
          )}

          {editedSection.type === "contact" && (
            <div className="space-y-4">
              <Label>Redes Sociais</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={editedSection.content.socialLinks?.instagram || ""}
                    onChange={(e) =>
                      updateContent("socialLinks", {
                        ...editedSection.content.socialLinks,
                        instagram: e.target.value,
                      })
                    }
                    placeholder="@usuario"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={editedSection.content.socialLinks?.facebook || ""}
                    onChange={(e) =>
                      updateContent("socialLinks", {
                        ...editedSection.content.socialLinks,
                        facebook: e.target.value,
                      })
                    }
                    placeholder="/pagina"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={editedSection.content.socialLinks?.youtube || ""}
                    onChange={(e) =>
                      updateContent("socialLinks", {
                        ...editedSection.content.socialLinks,
                        youtube: e.target.value,
                      })
                    }
                    placeholder="/canal"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Items editor for sections with lists */}
          {(editedSection.type === "modalities" ||
            editedSection.type === "plans" ||
            editedSection.type === "teachers" ||
            editedSection.type === "testimonials") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Itens</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItem = {
                      id: Date.now().toString(),
                      title: "",
                      description: "",
                      price: "",
                    }
                    updateContent("items", [...(editedSection.content.items || []), newItem])
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {(editedSection.content.items || []).map((item, index) => (
                  <Card key={item.id} className="p-3">
                    <div className="space-y-2">
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const items = [...(editedSection.content.items || [])]
                          items[index] = { ...items[index], title: e.target.value }
                          updateContent("items", items)
                        }}
                        placeholder="Título"
                      />
                      <Input
                        value={item.description || ""}
                        onChange={(e) => {
                          const items = [...(editedSection.content.items || [])]
                          items[index] = { ...items[index], description: e.target.value }
                          updateContent("items", items)
                        }}
                        placeholder="Descrição"
                      />
                      {editedSection.type === "plans" && (
                        <Input
                          value={item.price || ""}
                          onChange={(e) => {
                            const items = [...(editedSection.content.items || [])]
                            items[index] = { ...items[index], price: e.target.value }
                            updateContent("items", items)
                          }}
                          placeholder="Preço"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          const items = (editedSection.content.items || []).filter((_, i) => i !== index)
                          updateContent("items", items)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function SitePage() {
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateInfo>(templates[0])
  const [sections, setSections] = React.useState<Section[]>(defaultSections)
  const [editingSection, setEditingSection] = React.useState<Section | null>(null)
  const [editorOpen, setEditorOpen] = React.useState(false)
  const [isPublished, setIsPublished] = React.useState(false)
  const [config, setConfig] = React.useState<SiteConfig>({
    seoTitle: "",
    seoDescription: "",
    logo: null,
    font: "inter",
  })

  const handleSelectTemplate = (template: TemplateInfo) => {
    setSelectedTemplate(template)
  }

  const handleEditSection = (section: Section) => {
    setEditingSection(section)
    setEditorOpen(true)
  }

  const handleSaveSection = (updatedSection: Section) => {
    setSections((prev) => prev.map((s) => (s.id === updatedSection.id ? updatedSection : s)))
  }

  const activeSections = sections.filter((s) => s.visible).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site</h1>
          <p className="text-muted-foreground">
            Escolha o modelo, personalize as seções e publique o site da academia.
          </p>
        </div>
        <Button className="shrink-0">
          <Globe className="h-4 w-4 mr-2" />
          Salvar e publicar
        </Button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isPublished ? "bg-green-500" : "bg-yellow-500"
          )} />
          <span className="text-sm font-medium">
            {isPublished ? "Online" : "Rascunho"}
          </span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layout className="h-4 w-4" />
          <span>{selectedTemplate.name}</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>{activeSections} seções ativas</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Ver site
            </a>
          </Button>
          <div className="flex items-center gap-2 px-3">
            <Label htmlFor="published" className="text-sm cursor-pointer">
              Publicado
            </Label>
            <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Main Content - Sections */}
        <div className="space-y-6">
          {/* Identidade e SEO Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Identidade e SEO</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">Título do site</Label>
                  <Input
                    id="seoTitle"
                    value={config.seoTitle}
                    onChange={(e) => setConfig({ ...config, seoTitle: e.target.value })}
                    placeholder="Nome da academia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Descrição</Label>
                  <Input
                    id="seoDescription"
                    value={config.seoDescription}
                    onChange={(e) => setConfig({ ...config, seoDescription: e.target.value })}
                    placeholder="Breve descrição para buscadores"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logotipo</Label>
                  <Button variant="outline" className="w-full justify-start text-muted-foreground">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {config.logo ? "Alterar logo" : "Enviar logo"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Fonte</Label>
                  <Select value={config.font} onValueChange={(value) => setConfig({ ...config, font: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font.id} value={font.id}>
                          <span style={{ fontFamily: font.name }}>{font.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections List */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Seções do site</h3>
                </div>
                <span className="text-sm text-muted-foreground">{sections.length} seções</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Arraste para reordenar, clique para editar ou use o toggle para mostrar/ocultar.
              </p>
              <SiteSectionsList
                sections={sections}
                onSectionsChange={setSections}
                onEditSection={handleEditSection}
                sectionMeta={sectionMeta}
                sectionLabels={sectionLabels}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Template */}
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Modelo do site</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Escolha o template visual. O conteúdo das seções é preservado.
              </p>
              <Select
                value={selectedTemplate.id}
                onValueChange={(value) => {
                  const template = templates.find((t) => t.id === value)
                  if (template) handleSelectTemplate(template)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-3 w-3 rounded-sm", template.color)} />
                        <span className="font-medium">{template.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Miniatura do template selecionado */}
              <div className="mt-4 rounded-lg border overflow-hidden">
                <div className="bg-muted/30 p-3">
                  {/* Mini preview do site */}
                  <div className="rounded-md border bg-background overflow-hidden">
                    {/* Header mini */}
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded bg-foreground/20" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-1.5 rounded bg-foreground/10" />
                        <div className="w-8 h-1.5 rounded bg-foreground/10" />
                        <div className="w-8 h-1.5 rounded bg-foreground/10" />
                        <div className="w-8 h-1.5 rounded bg-foreground/10" />
                      </div>
                    </div>
                    {/* Hero mini */}
                    <div className="p-4 space-y-2">
                      <div className="w-3/4 h-3 rounded bg-foreground/15" />
                      <div className="w-1/2 h-2 rounded bg-foreground/10" />
                      <div className={cn("w-16 h-4 rounded mt-2", selectedTemplate.color)} />
                    </div>
                    {/* Content blocks mini */}
                    <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                      <div className="h-8 rounded bg-muted" />
                      <div className="h-8 rounded bg-muted" />
                      <div className="h-8 rounded bg-muted" />
                    </div>
                  </div>
                </div>
                {/* Template info */}
                <div className="p-3 border-t bg-card">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", selectedTemplate.color.replace("bg-", "text-").replace("-500", "-600"))}>
                      {selectedTemplate.name}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
                      {selectedTemplate.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Editor Sheet */}
      <SectionEditorSheet
        section={editingSection}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSaveSection}
      />

      {/* Footer info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
        <p>Selecione o modelo, edite as seções e publique o site da academia.</p>
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <span>Salvamento automático ativo</span>
        </div>
      </div>
    </div>
  )
}
