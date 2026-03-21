"use client"

import * as React from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Trash2,
  Settings,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Palette,
  Type,
  Image as ImageIcon,
  Layout,
  Users,
  Star,
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
  ChevronRight,
  Sparkles,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
export interface SectionContent {
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

export type SectionType =
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
  | "products"
  | "featured-products"
  | "categories"
  | "promotions"

export interface Template {
  id: string
  name: string
  description: string
  preview: string
  sections: Section[]
  type: "site" | "store"
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
  products: { label: "Produtos", icon: Dumbbell, description: "Lista de produtos" },
  "featured-products": { label: "Produtos em Destaque", icon: Star, description: "Produtos destacados" },
  categories: { label: "Categorias", icon: Layout, description: "Categorias de produtos" },
  promotions: { label: "Promoções", icon: Sparkles, description: "Ofertas especiais" },
}

// Templates for Site
export const siteTemplates: Template[] = [
  {
    id: "modern-martial-arts",
    name: "Artes Marciais Moderno",
    description: "Design limpo e moderno para academias de artes marciais",
    preview: "/templates/modern-martial-arts.png",
    type: "site",
    sections: [
      {
        id: "hero-1",
        type: "hero",
        visible: true,
        content: {
          title: "Treine com os Melhores",
          subtitle: "Descubra o campeão que existe em você",
          description: "Mais de 10 anos formando atletas e transformando vidas através das artes marciais",
          buttonText: "Agende uma Aula Grátis",
          buttonLink: "#contato",
        },
      },
      {
        id: "about-1",
        type: "about",
        visible: true,
        content: {
          title: "Nossa História",
          description: "Fundada em 2010, nossa academia se tornou referência em artes marciais, formando atletas campeões e cidadãos de caráter.",
          features: ["Mais de 500 alunos formados", "20+ campeões estaduais", "Ambiente familiar e seguro"],
        },
      },
      {
        id: "modalities-1",
        type: "modalities",
        visible: true,
        content: {
          title: "Modalidades",
          subtitle: "Encontre a arte marcial ideal para você",
          items: [
            { id: "1", title: "Jiu-Jitsu", description: "Arte suave, técnica e eficiente", icon: "jiu-jitsu" },
            { id: "2", title: "Muay Thai", description: "A arte das oito armas", icon: "muay-thai" },
            { id: "3", title: "Wrestling", description: "Luta olímpica e grappling", icon: "wrestling" },
          ],
        },
      },
      {
        id: "plans-1",
        type: "plans",
        visible: true,
        content: {
          title: "Nossos Planos",
          subtitle: "Escolha o plano ideal para você",
          items: [
            { id: "1", title: "Básico", description: "1 modalidade", price: "R$ 150/mês" },
            { id: "2", title: "Completo", description: "Todas modalidades", price: "R$ 250/mês" },
            { id: "3", title: "VIP", description: "Completo + Personal", price: "R$ 400/mês" },
          ],
        },
      },
      {
        id: "teachers-1",
        type: "teachers",
        visible: true,
        content: {
          title: "Nossos Professores",
          items: [
            { id: "1", title: "Prof. Carlos Silva", description: "Faixa Preta 3º Grau - Jiu-Jitsu" },
            { id: "2", title: "Prof. Ana Santos", description: "Campeã Mundial - Muay Thai" },
          ],
        },
      },
      {
        id: "testimonials-1",
        type: "testimonials",
        visible: true,
        content: {
          title: "O que dizem nossos alunos",
          items: [
            { id: "1", title: "João Pedro", description: "Treino aqui há 2 anos e minha vida mudou completamente!" },
            { id: "2", title: "Maria Clara", description: "Ambiente acolhedor e professores excelentes." },
          ],
        },
      },
      {
        id: "contact-1",
        type: "contact",
        visible: true,
        content: {
          title: "Entre em Contato",
          contactInfo: {
            phone: "(11) 99999-9999",
            email: "contato@academia.com",
            address: "Rua das Artes Marciais, 123 - São Paulo",
            hours: "Seg-Sex: 6h-22h | Sáb: 8h-14h",
          },
          socialLinks: {
            instagram: "@academia",
            facebook: "/academia",
            youtube: "/academia",
          },
        },
      },
      {
        id: "footer-1",
        type: "footer",
        visible: true,
        content: {
          title: "Academia de Artes Marciais",
          description: "Transformando vidas através do esporte",
        },
      },
    ],
  },
  {
    id: "minimalist-dojo",
    name: "Dojo Minimalista",
    description: "Estilo clean focado em conversão",
    preview: "/templates/minimalist-dojo.png",
    type: "site",
    sections: [
      {
        id: "hero-2",
        type: "hero",
        visible: true,
        content: {
          title: "Sua Jornada Começa Aqui",
          subtitle: "Academia de Artes Marciais",
          buttonText: "Começar Agora",
        },
      },
      {
        id: "modalities-2",
        type: "modalities",
        visible: true,
        content: {
          title: "O que Oferecemos",
          items: [
            { id: "1", title: "Jiu-Jitsu", description: "Para todas as idades" },
            { id: "2", title: "Muay Thai", description: "Condicionamento e técnica" },
          ],
        },
      },
      {
        id: "cta-1",
        type: "cta",
        visible: true,
        content: {
          title: "Pronto para Começar?",
          description: "Agende sua aula experimental gratuita",
          buttonText: "Agendar Aula Grátis",
        },
      },
      {
        id: "contact-2",
        type: "contact",
        visible: true,
        content: {
          title: "Fale Conosco",
          contactInfo: {
            phone: "(11) 99999-9999",
            email: "contato@dojo.com",
            address: "Rua do Dojo, 456",
          },
        },
      },
    ],
  },
  {
    id: "champion-academy",
    name: "Academia Campeã",
    description: "Visual impactante para academias de alto rendimento",
    preview: "/templates/champion-academy.png",
    type: "site",
    sections: [
      {
        id: "hero-3",
        type: "hero",
        visible: true,
        content: {
          title: "Seja um Campeão",
          subtitle: "Treinamento de Elite",
          description: "Onde campeões são formados",
          buttonText: "Junte-se a Nós",
        },
      },
      {
        id: "about-3",
        type: "about",
        visible: true,
        content: {
          title: "Sobre a Academia",
          description: "Centro de treinamento de elite para atletas de alto rendimento",
        },
      },
      {
        id: "teachers-3",
        type: "teachers",
        visible: true,
        content: {
          title: "Time de Campeões",
          items: [
            { id: "1", title: "Mestre Ricardo", description: "7x Campeão Brasileiro" },
          ],
        },
      },
      {
        id: "gallery-1",
        type: "gallery",
        visible: true,
        content: {
          title: "Nossa Estrutura",
          description: "Conheça nosso espaço",
        },
      },
      {
        id: "schedule-1",
        type: "schedule",
        visible: true,
        content: {
          title: "Grade de Horários",
          description: "Encontre o melhor horário para você",
        },
      },
      {
        id: "contact-3",
        type: "contact",
        visible: true,
        content: {
          title: "Contato",
          contactInfo: {
            phone: "(11) 98888-8888",
            email: "elite@academia.com",
          },
        },
      },
    ],
  },
]

// Templates for Store
export const storeTemplates: Template[] = [
  {
    id: "martial-store",
    name: "Loja de Artes Marciais",
    description: "Loja completa para equipamentos e vestuário",
    preview: "/templates/martial-store.png",
    type: "store",
    sections: [
      {
        id: "hero-store-1",
        type: "hero",
        visible: true,
        content: {
          title: "Equipamentos de Qualidade",
          subtitle: "Tudo para seu treino",
          buttonText: "Ver Produtos",
          buttonLink: "#produtos",
        },
      },
      {
        id: "categories-1",
        type: "categories",
        visible: true,
        content: {
          title: "Categorias",
          items: [
            { id: "1", title: "Kimonos", description: "Gi e No-Gi" },
            { id: "2", title: "Proteções", description: "Luvas, caneleiras e mais" },
            { id: "3", title: "Vestuário", description: "Rashguards e shorts" },
            { id: "4", title: "Acessórios", description: "Faixas, bags e equipamentos" },
          ],
        },
      },
      {
        id: "featured-1",
        type: "featured-products",
        visible: true,
        content: {
          title: "Produtos em Destaque",
          items: [
            { id: "1", title: "Kimono Premium", price: "R$ 399,90", description: "Tecido reforçado" },
            { id: "2", title: "Luva de Boxe Pro", price: "R$ 249,90", description: "12oz - Couro" },
            { id: "3", title: "Rashguard Oficial", price: "R$ 149,90", description: "Compressão UV50+" },
          ],
        },
      },
      {
        id: "products-1",
        type: "products",
        visible: true,
        content: {
          title: "Todos os Produtos",
          items: [
            { id: "1", title: "Kimono Iniciante", price: "R$ 199,90" },
            { id: "2", title: "Faixa Branca", price: "R$ 29,90" },
            { id: "3", title: "Caneleira", price: "R$ 89,90" },
            { id: "4", title: "Short MMA", price: "R$ 119,90" },
          ],
        },
      },
      {
        id: "promotions-1",
        type: "promotions",
        visible: true,
        content: {
          title: "Promoções",
          subtitle: "Ofertas por tempo limitado",
          items: [
            { id: "1", title: "Kit Iniciante", price: "R$ 299,90", description: "Kimono + Faixa + Bag" },
          ],
        },
      },
      {
        id: "contact-store-1",
        type: "contact",
        visible: true,
        content: {
          title: "Atendimento",
          contactInfo: {
            phone: "(11) 97777-7777",
            email: "loja@academia.com",
          },
        },
      },
      {
        id: "footer-store-1",
        type: "footer",
        visible: true,
        content: {
          title: "Loja da Academia",
          description: "Equipamentos oficiais",
        },
      },
    ],
  },
  {
    id: "simple-store",
    name: "Loja Simples",
    description: "Layout direto ao ponto",
    preview: "/templates/simple-store.png",
    type: "store",
    sections: [
      {
        id: "hero-store-2",
        type: "hero",
        visible: true,
        content: {
          title: "Nossa Loja",
          subtitle: "Produtos selecionados",
        },
      },
      {
        id: "featured-2",
        type: "featured-products",
        visible: true,
        content: {
          title: "Mais Vendidos",
          items: [
            { id: "1", title: "Kimono A3", price: "R$ 299,90" },
            { id: "2", title: "Luva 14oz", price: "R$ 199,90" },
          ],
        },
      },
      {
        id: "products-2",
        type: "products",
        visible: true,
        content: {
          title: "Catálogo",
          items: [],
        },
      },
      {
        id: "contact-store-2",
        type: "contact",
        visible: true,
        content: {
          title: "Dúvidas?",
          contactInfo: {
            phone: "(11) 96666-6666",
          },
        },
      },
    ],
  },
]

// Sortable Section Component
function SortableSection({
  section,
  onEdit,
  onToggleVisibility,
  onRemove,
}: {
  section: Section
  onEdit: (section: Section) => void
  onToggleVisibility: (id: string) => void
  onRemove: (id: string) => void
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border bg-card p-4 transition-all",
        isDragging && "z-50 shadow-xl ring-2 ring-primary",
        !section.visible && "opacity-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{meta.label}</p>
        <p className="text-sm text-muted-foreground truncate">{section.content.title || meta.description}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(section)}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleVisibility(section.id)}>
          {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onRemove(section.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Section Editor Sheet
function SectionEditor({
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <meta.icon className="h-5 w-5 text-primary" />
            Editar {meta.label}
          </SheetTitle>
          <SheetDescription>{meta.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Common fields */}
          <div className="space-y-4">
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

            {(editedSection.type === "hero" ||
              editedSection.type === "about" ||
              editedSection.type === "cta" ||
              editedSection.type === "footer") && (
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
                    <Phone className="h-4 w-4 text-muted-foreground" />
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
                    <Mail className="h-4 w-4 text-muted-foreground" />
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
                    <MapPin className="h-4 w-4 text-muted-foreground" />
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
                    <Clock className="h-4 w-4 text-muted-foreground" />
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
                    <Instagram className="h-4 w-4 text-muted-foreground" />
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
                    <Facebook className="h-4 w-4 text-muted-foreground" />
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
                    <Youtube className="h-4 w-4 text-muted-foreground" />
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
              editedSection.type === "testimonials" ||
              editedSection.type === "products" ||
              editedSection.type === "featured-products" ||
              editedSection.type === "categories" ||
              editedSection.type === "promotions") && (
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
                        {(editedSection.type === "plans" ||
                          editedSection.type === "products" ||
                          editedSection.type === "featured-products" ||
                          editedSection.type === "promotions") && (
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
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Preview Component
function SitePreview({
  sections,
  viewMode,
}: {
  sections: Section[]
  viewMode: "desktop" | "tablet" | "mobile"
}) {
  const visibleSections = sections.filter((s) => s.visible)

  const containerClass = cn(
    "bg-background rounded-lg border overflow-hidden transition-all duration-300",
    viewMode === "desktop" && "w-full",
    viewMode === "tablet" && "w-[768px] mx-auto",
    viewMode === "mobile" && "w-[375px] mx-auto"
  )

  return (
    <div className={containerClass}>
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {visibleSections.map((section) => (
          <PreviewSection key={section.id} section={section} viewMode={viewMode} />
        ))}
      </div>
    </div>
  )
}

function PreviewSection({ section, viewMode }: { section: Section; viewMode: string }) {
  const { type, content } = section

  // Hero Section
  if (type === "hero") {
    return (
      <div className="relative bg-gradient-to-br from-primary/20 via-background to-background py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          {content.subtitle && (
            <Badge variant="secondary" className="mb-2">
              {content.subtitle}
            </Badge>
          )}
          <h1 className={cn("font-bold", viewMode === "mobile" ? "text-2xl" : "text-4xl")}>{content.title}</h1>
          {content.description && <p className="text-muted-foreground text-lg">{content.description}</p>}
          {content.buttonText && <Button size="lg">{content.buttonText}</Button>}
        </div>
      </div>
    )
  }

  // About Section
  if (type === "about") {
    return (
      <div className="py-12 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className={cn("font-bold text-center", viewMode === "mobile" ? "text-xl" : "text-2xl")}>
            {content.title}
          </h2>
          {content.description && <p className="text-muted-foreground text-center">{content.description}</p>}
          {content.features && (
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {content.features.map((feature, i) => (
                <Badge key={i} variant="outline">
                  <Check className="h-3 w-3 mr-1" />
                  {feature}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Modalities/Categories Section
  if (type === "modalities" || type === "categories") {
    return (
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className={cn("font-bold", viewMode === "mobile" ? "text-xl" : "text-2xl")}>{content.title}</h2>
            {content.subtitle && <p className="text-muted-foreground mt-2">{content.subtitle}</p>}
          </div>
          <div className={cn("grid gap-4", viewMode === "mobile" ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
            {(content.items || []).map((item) => (
              <Card key={item.id} className="p-4 hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Plans Section
  if (type === "plans") {
    return (
      <div className="py-12 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className={cn("font-bold", viewMode === "mobile" ? "text-xl" : "text-2xl")}>{content.title}</h2>
            {content.subtitle && <p className="text-muted-foreground mt-2">{content.subtitle}</p>}
          </div>
          <div className={cn("grid gap-4", viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3")}>
            {(content.items || []).map((item, index) => (
              <Card
                key={item.id}
                className={cn("p-6 text-center", index === 1 && "border-primary ring-2 ring-primary/20")}
              >
                {index === 1 && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Popular</Badge>
                )}
                <h3 className="font-bold text-lg">{item.title}</h3>
                {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                {item.price && <p className="text-2xl font-bold text-primary mt-4">{item.price}</p>}
                <Button className="w-full mt-4" variant={index === 1 ? "default" : "outline"}>
                  Escolher
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Teachers Section
  if (type === "teachers") {
    return (
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className={cn("font-bold text-center", viewMode === "mobile" ? "text-xl" : "text-2xl")}>
            {content.title}
          </h2>
          <div className={cn("grid gap-4", viewMode === "mobile" ? "grid-cols-1" : "grid-cols-2")}>
            {(content.items || []).map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Testimonials Section
  if (type === "testimonials") {
    return (
      <div className="py-12 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className={cn("font-bold text-center", viewMode === "mobile" ? "text-xl" : "text-2xl")}>
            {content.title}
          </h2>
          <div className={cn("grid gap-4", viewMode === "mobile" ? "grid-cols-1" : "grid-cols-2")}>
            {(content.items || []).map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{item.description}"</p>
                <p className="font-medium mt-2">- {item.title}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Products Section
  if (type === "products" || type === "featured-products") {
    return (
      <div className={cn("py-12 px-6", type === "featured-products" && "bg-muted/30")}>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className={cn("font-bold", viewMode === "mobile" ? "text-xl" : "text-2xl")}>{content.title}</h2>
          </div>
          <div className={cn("grid gap-4", viewMode === "mobile" ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4")}>
            {(content.items || []).map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  {item.price && <p className="text-primary font-bold">{item.price}</p>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Promotions Section
  if (type === "promotions") {
    return (
      <div className="py-12 px-6 bg-primary/10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <Badge variant="destructive" className="mb-2">
              Oferta Especial
            </Badge>
            <h2 className={cn("font-bold", viewMode === "mobile" ? "text-xl" : "text-2xl")}>{content.title}</h2>
            {content.subtitle && <p className="text-muted-foreground">{content.subtitle}</p>}
          </div>
          <div className="grid gap-4">
            {(content.items || []).map((item) => (
              <Card key={item.id} className="p-6 border-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    {item.description && <p className="text-muted-foreground">{item.description}</p>}
                  </div>
                  <div className="text-right">
                    {item.price && <p className="text-2xl font-bold text-primary">{item.price}</p>}
                    <Button className="mt-2">Comprar</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // CTA Section
  if (type === "cta") {
    return (
      <div className="py-16 px-6 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className={cn("font-bold", viewMode === "mobile" ? "text-xl" : "text-2xl")}>{content.title}</h2>
          {content.description && <p className="opacity-90">{content.description}</p>}
          {content.buttonText && (
            <Button size="lg" variant="secondary">
              {content.buttonText}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Contact Section
  if (type === "contact") {
    return (
      <div className="py-12 px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className={cn("font-bold text-center", viewMode === "mobile" ? "text-xl" : "text-2xl")}>
            {content.title}
          </h2>
          <div className="grid gap-4">
            {content.contactInfo?.phone && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <span>{content.contactInfo.phone}</span>
              </div>
            )}
            {content.contactInfo?.email && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <span>{content.contactInfo.email}</span>
              </div>
            )}
            {content.contactInfo?.address && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <span>{content.contactInfo.address}</span>
              </div>
            )}
            {content.contactInfo?.hours && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <span>{content.contactInfo.hours}</span>
              </div>
            )}
          </div>
          {content.socialLinks && (
            <div className="flex justify-center gap-4 pt-4">
              {content.socialLinks.instagram && (
                <Button variant="outline" size="icon">
                  <Instagram className="h-5 w-5" />
                </Button>
              )}
              {content.socialLinks.facebook && (
                <Button variant="outline" size="icon">
                  <Facebook className="h-5 w-5" />
                </Button>
              )}
              {content.socialLinks.youtube && (
                <Button variant="outline" size="icon">
                  <Youtube className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Footer Section
  if (type === "footer") {
    return (
      <div className="py-8 px-6 bg-muted/50 border-t">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p className="font-medium">{content.title}</p>
          {content.description && <p className="text-sm text-muted-foreground">{content.description}</p>}
          <p className="text-xs text-muted-foreground pt-4">
            © {new Date().getFullYear()} Todos os direitos reservados
          </p>
        </div>
      </div>
    )
  }

  // Gallery/Schedule/FAQ - Placeholder
  return (
    <div className="py-12 px-6 bg-muted/20">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h2 className="font-bold text-2xl">{content.title}</h2>
        <p className="text-muted-foreground">{content.description || sectionMeta[type].description}</p>
        <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8">
          <p className="text-sm text-muted-foreground">Conteúdo da seção {sectionMeta[type].label}</p>
        </div>
      </div>
    </div>
  )
}

// Template Selector Dialog
function TemplateSelector({
  templates,
  open,
  onOpenChange,
  onSelect,
}: {
  templates: Template[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (template: Template) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolher Template</DialogTitle>
          <DialogDescription>Selecione um modelo para começar. Você pode personalizar depois.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
              onClick={() => {
                onSelect(template)
                onOpenChange(false)
              }}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-background flex items-center justify-center">
                <Layout className="h-12 w-12 text-primary/50" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {template.sections.length} seções
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main SiteBuilder Component
export function SiteBuilder({
  type,
  templates,
}: {
  type: "site" | "store"
  templates: Template[]
}) {
  const [sections, setSections] = React.useState<Section[]>([])
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null)
  const [editingSection, setEditingSection] = React.useState<Section | null>(null)
  const [editorOpen, setEditorOpen] = React.useState(false)
  const [templateSelectorOpen, setTemplateSelectorOpen] = React.useState(true)
  const [viewMode, setViewMode] = React.useState<"desktop" | "tablet" | "mobile">("desktop")
  const [activeTab, setActiveTab] = React.useState<"editor" | "preview">("editor")
  const [copied, setCopied] = React.useState(false)
  const [siteUrl] = React.useState(
    type === "site"
      ? "https://dojo-centro.meusite.com.br"
      : "https://dojo-centro.minhaloja.com.br"
  )
  const [isPublished, setIsPublished] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setSections(JSON.parse(JSON.stringify(template.sections)))
  }

  const handleEditSection = (section: Section) => {
    setEditingSection(section)
    setEditorOpen(true)
  }

  const handleSaveSection = (updatedSection: Section) => {
    setSections((prev) => prev.map((s) => (s.id === updatedSection.id ? updatedSection : s)))
  }

  const handleToggleVisibility = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)))
  }

  const handleRemoveSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(siteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddSection = (sectionType: SectionType) => {
    const newSection: Section = {
      id: `${sectionType}-${Date.now()}`,
      type: sectionType,
      visible: true,
      content: {
        title: sectionMeta[sectionType].label,
        items: [],
      },
    }
    setSections((prev) => [...prev, newSection])
  }

  const availableSections: SectionType[] =
    type === "site"
      ? ["hero", "about", "modalities", "plans", "teachers", "testimonials", "schedule", "gallery", "contact", "cta", "faq", "footer"]
      : ["hero", "categories", "featured-products", "products", "promotions", "contact", "footer"]

  return (
    <div className="flex flex-col h-full">
      {/* Template Selector */}
      <TemplateSelector
        templates={templates}
        open={templateSelectorOpen && !selectedTemplate}
        onOpenChange={setTemplateSelectorOpen}
        onSelect={handleSelectTemplate}
      />

      {/* Section Editor */}
      <SectionEditor
        section={editingSection}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSaveSection}
      />

      {selectedTemplate && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setTemplateSelectorOpen(true)}>
                <Palette className="h-4 w-4 mr-2" />
                Trocar Template
              </Button>
              <Badge variant="secondary">{selectedTemplate.name}</Badge>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* URL Copy */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm">
                <span className="text-muted-foreground truncate max-w-[200px]">{siteUrl}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyUrl}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <Label htmlFor="published" className="text-sm cursor-pointer">
                  {isPublished ? "Publicado" : "Rascunho"}
                </Label>
                <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "editor" | "preview")} className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="editor">
                  <Settings className="h-4 w-4 mr-2" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </TabsTrigger>
              </TabsList>

              {activeTab === "preview" && (
                <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
                  <Button
                    variant={viewMode === "desktop" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("desktop")}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "tablet" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("tablet")}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "mobile" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="editor" className="mt-0 flex-1">
              <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* Section List */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Seções</h3>
                    <span className="text-sm text-muted-foreground">{sections.length} seções</span>
                  </div>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {sections.map((section) => (
                          <SortableSection
                            key={section.id}
                            section={section}
                            onEdit={handleEditSection}
                            onToggleVisibility={handleToggleVisibility}
                            onRemove={handleRemoveSection}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </Card>

                {/* Add Section Panel */}
                <Card className="p-4 h-fit">
                  <h3 className="font-semibold mb-4">Adicionar Seção</h3>
                  <div className="space-y-2">
                    {availableSections.map((sectionType) => {
                      const meta = sectionMeta[sectionType]
                      const Icon = meta.icon
                      const exists = sections.some((s) => s.type === sectionType)
                      return (
                        <button
                          key={sectionType}
                          onClick={() => handleAddSection(sectionType)}
                          disabled={exists && ["hero", "footer"].includes(sectionType)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                            "hover:border-primary hover:bg-primary/5",
                            exists && ["hero", "footer"].includes(sectionType) && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{meta.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{meta.description}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )
                    })}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0 flex-1 overflow-auto">
              <SitePreview sections={sections} viewMode={viewMode} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
