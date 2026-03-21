"use client"

import { useMemo, useState } from "react"
import {
  Award,
  BookOpen,
  CheckCircle2,
  Edit,
  Eye,
  FileText,
  FolderOpen,
  GripVertical,
  MoreVertical,
  Play,
  Plus,
  Search,
  Video,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface TechniqueItem {
  id: string
  name: string
  belt: string
  hasVideo: boolean
  description: string
  steps: number
}

interface TechniqueCategory {
  id: string
  name: string
  modality: string
  techniques: TechniqueItem[]
}

interface BeltRequirement {
  belt: string
  modality: string
  requiredTechniques: string[]
  color: string
}

const initialCategories: TechniqueCategory[] = [
  {
    id: "guard",
    name: "Guarda Fechada",
    modality: "Jiu-Jitsu",
    techniques: [
      { id: "1", name: "Armlock da Guarda", belt: "Branca", hasVideo: true, description: "Finalização clássica partindo da guarda fechada.", steps: 5 },
      { id: "2", name: "Triângulo", belt: "Azul", hasVideo: true, description: "Estrangulamento com as pernas e controle de postura.", steps: 6 },
      { id: "3", name: "Omoplata", belt: "Azul", hasVideo: true, description: "Ataque ao ombro usando controle de quadril e pernas.", steps: 7 },
      { id: "4", name: "Kimura da Guarda", belt: "Branca", hasVideo: false, description: "Chave de ombro a partir do controle de punho e cotovelo.", steps: 4 },
    ],
  },
  {
    id: "half-guard",
    name: "Meia Guarda",
    modality: "Jiu-Jitsu",
    techniques: [
      { id: "5", name: "Raspagem Simples", belt: "Branca", hasVideo: true, description: "Raspagem básica saindo da meia guarda por baixo.", steps: 4 },
      { id: "6", name: "Underhook Sweep", belt: "Azul", hasVideo: true, description: "Raspagem com underhook e subida controlada.", steps: 5 },
      { id: "7", name: "Deep Half Entry", belt: "Roxa", hasVideo: false, description: "Entrada para meia guarda profunda e recuperação de base.", steps: 6 },
    ],
  },
  {
    id: "passing",
    name: "Passagem de Guarda",
    modality: "Jiu-Jitsu",
    techniques: [
      { id: "8", name: "Toreando", belt: "Branca", hasVideo: true, description: "Passagem clássica com controle das pernas.", steps: 4 },
      { id: "9", name: "Passagem com Joelho", belt: "Branca", hasVideo: true, description: "Knee slice pass com domínio do quadril.", steps: 5 },
      { id: "10", name: "X-Pass", belt: "Azul", hasVideo: false, description: "Passagem cruzando a linha das pernas com pressão.", steps: 4 },
    ],
  },
  {
    id: "mount",
    name: "Montada",
    modality: "Jiu-Jitsu",
    techniques: [
      { id: "11", name: "Armlock da Montada", belt: "Branca", hasVideo: true, description: "Finalização do alto com controle de cabeça e braço.", steps: 5 },
      { id: "12", name: "Ezequiel", belt: "Azul", hasVideo: true, description: "Estrangulamento por dentro da gola com pressão contínua.", steps: 4 },
      { id: "13", name: "Manutenção da Montada", belt: "Branca", hasVideo: false, description: "Como manter a posição com equilíbrio e ajustes de base.", steps: 3 },
    ],
  },
  {
    id: "muay-basics",
    name: "Técnicas Básicas",
    modality: "Muay Thai",
    techniques: [
      { id: "14", name: "Jab", belt: "Iniciante", hasVideo: true, description: "Soco frontal com a mão da frente.", steps: 3 },
      { id: "15", name: "Cross", belt: "Iniciante", hasVideo: true, description: "Soco cruzado com transferência de peso.", steps: 3 },
      { id: "16", name: "Low Kick", belt: "Iniciante", hasVideo: true, description: "Chute baixo com giro de quadril e retorno rápido.", steps: 4 },
      { id: "17", name: "Teep", belt: "Iniciante", hasVideo: true, description: "Chute frontal para distância e controle.", steps: 3 },
    ],
  },
  {
    id: "muay-combos",
    name: "Combinações",
    modality: "Muay Thai",
    techniques: [
      { id: "18", name: "Jab + Cross", belt: "Iniciante", hasVideo: true, description: "Combinação básica para base e ritmo.", steps: 2 },
      { id: "19", name: "1-2-3", belt: "Intermediário", hasVideo: true, description: "Jab, cross e hook em progressão curta.", steps: 3 },
      { id: "20", name: "Combo com Low Kick", belt: "Intermediário", hasVideo: false, description: "Socos finalizando com chute baixo.", steps: 4 },
    ],
  },
]

const initialBeltRequirements: BeltRequirement[] = [
  { belt: "Branca", modality: "Jiu-Jitsu", requiredTechniques: ["1", "4", "5", "8", "9", "11", "13"], color: "bg-white text-foreground border border-border" },
  { belt: "Azul", modality: "Jiu-Jitsu", requiredTechniques: ["2", "3", "6", "10", "12"], color: "bg-blue-500 text-white" },
  { belt: "Roxa", modality: "Jiu-Jitsu", requiredTechniques: ["7"], color: "bg-purple-500 text-white" },
]

const beltColors: Record<string, string> = {
  Branca: "bg-white text-foreground border border-border",
  Azul: "bg-blue-500 text-white",
  Roxa: "bg-purple-500 text-white",
  Marrom: "bg-amber-700 text-white",
  Preta: "bg-black text-white",
  Iniciante: "bg-green-500/10 text-green-600 border-green-500/20",
  Intermediário: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Avançado: "bg-red-500/10 text-red-600 border-red-500/20",
}

function createTechniqueForm() {
  return {
    name: "",
    categoryId: "",
    belt: "",
    description: "",
    videoUrl: "",
    steps: ["", "", ""],
  }
}

export function TechniquesDashboardScreen() {
  const [categories, setCategories] = useState<TechniqueCategory[]>(initialCategories)
  const [beltRequirements, setBeltRequirements] = useState<BeltRequirement[]>(initialBeltRequirements)
  const [search, setSearch] = useState("")
  const [filterModality, setFilterModality] = useState("all")
  const [filterBelt, setFilterBelt] = useState("all")
  const [selectedTechnique, setSelectedTechnique] = useState<(TechniqueItem & { category: string; modality: string }) | null>(null)
  const [showTechniqueDialog, setShowTechniqueDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showCurriculumDialog, setShowCurriculumDialog] = useState(false)
  const [editingRequirement, setEditingRequirement] = useState<BeltRequirement | null>(null)
  const [curriculumSelection, setCurriculumSelection] = useState<string[]>([])
  const [techniqueForm, setTechniqueForm] = useState(createTechniqueForm())
  const [categoryForm, setCategoryForm] = useState({ name: "", modality: "", description: "" })

  const allTechniques = useMemo(
    () => categories.flatMap((category) =>
      category.techniques.map((technique) => ({ ...technique, category: category.name, modality: category.modality })),
    ),
    [categories],
  )

  const filteredCategories = useMemo(
    () =>
      categories
        .filter((category) => filterModality === "all" || category.modality === filterModality)
        .map((category) => ({
          ...category,
          techniques: category.techniques.filter((technique) => {
            const matchesSearch =
              technique.name.toLowerCase().includes(search.toLowerCase()) ||
              technique.description.toLowerCase().includes(search.toLowerCase())
            const matchesBelt = filterBelt === "all" || technique.belt === filterBelt
            return matchesSearch && matchesBelt
          }),
        }))
        .filter((category) => category.techniques.length > 0),
    [categories, filterBelt, filterModality, search],
  )

  const totalTechniques = allTechniques.length
  const techniquesWithVideo = allTechniques.filter((technique) => technique.hasVideo).length

  function submitCategory() {
    if (!categoryForm.name.trim() || !categoryForm.modality) return

    setCategories((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: categoryForm.name.trim(),
        modality: categoryForm.modality,
        techniques: [],
      },
    ])
    setCategoryForm({ name: "", modality: "", description: "" })
    setShowCategoryDialog(false)
  }

  function submitTechnique() {
    if (!techniqueForm.name.trim() || !techniqueForm.categoryId || !techniqueForm.belt) return

    setCategories((current) =>
      current.map((category) =>
        category.id === techniqueForm.categoryId
          ? {
              ...category,
              techniques: [
                ...category.techniques,
                {
                  id: crypto.randomUUID(),
                  name: techniqueForm.name.trim(),
                  belt: techniqueForm.belt,
                  hasVideo: Boolean(techniqueForm.videoUrl.trim()),
                  description: techniqueForm.description.trim() || "Técnica cadastrada pela academia.",
                  steps: techniqueForm.steps.filter(Boolean).length || 3,
                },
              ],
            }
          : category,
      ),
    )
    setTechniqueForm(createTechniqueForm())
    setShowTechniqueDialog(false)
  }

  function openCurriculumEditor(requirement: BeltRequirement) {
    setEditingRequirement(requirement)
    setCurriculumSelection(requirement.requiredTechniques)
    setShowCurriculumDialog(true)
  }

  function saveCurriculum() {
    if (!editingRequirement) return

    setBeltRequirements((current) =>
      current.map((requirement) =>
        requirement.belt === editingRequirement.belt && requirement.modality === editingRequirement.modality
          ? { ...requirement, requiredTechniques: curriculumSelection }
          : requirement,
      ),
    )
    setShowCurriculumDialog(false)
    setEditingRequirement(null)
  }

  return (
    <>
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
            <DialogDescription>Crie uma categoria para organizar as técnicas da academia.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Nome da categoria</Label>
              <Input
                id="category-name"
                placeholder="Ex: Costas"
                value={categoryForm.name}
                onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-modality">Modalidade</Label>
              <Select
                value={categoryForm.modality}
                onValueChange={(value) => setCategoryForm((current) => ({ ...current, modality: value }))}
              >
                <SelectTrigger id="category-modality">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jiu-Jitsu">Jiu-Jitsu</SelectItem>
                  <SelectItem value="Muay Thai">Muay Thai</SelectItem>
                  <SelectItem value="Boxe">Boxe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-description">Descrição</Label>
              <Textarea
                id="category-description"
                placeholder="Descreva o objetivo desta categoria."
                value={categoryForm.description}
                onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancelar</Button>
            <Button onClick={submitCategory}>Criar categoria</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTechniqueDialog} onOpenChange={setShowTechniqueDialog}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova técnica</DialogTitle>
            <DialogDescription>Adicione uma nova técnica à biblioteca da academia.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="technique-name">Nome da técnica</Label>
              <Input
                id="technique-name"
                placeholder="Ex: Armlock da Montada"
                value={techniqueForm.name}
                onChange={(event) => setTechniqueForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="technique-category">Categoria</Label>
                <Select
                  value={techniqueForm.categoryId}
                  onValueChange={(value) => setTechniqueForm((current) => ({ ...current, categoryId: value }))}
                >
                  <SelectTrigger id="technique-category">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="technique-belt">Nível/Faixa</Label>
                <Select
                  value={techniqueForm.belt}
                  onValueChange={(value) => setTechniqueForm((current) => ({ ...current, belt: value }))}
                >
                  <SelectTrigger id="technique-belt">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Branca">Branca</SelectItem>
                    <SelectItem value="Azul">Azul</SelectItem>
                    <SelectItem value="Roxa">Roxa</SelectItem>
                    <SelectItem value="Marrom">Marrom</SelectItem>
                    <SelectItem value="Preta">Preta</SelectItem>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="technique-description">Descrição</Label>
              <Textarea
                id="technique-description"
                placeholder="Explique o objetivo, a aplicação e o contexto da técnica."
                value={techniqueForm.description}
                onChange={(event) => setTechniqueForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="technique-video">Vídeo (URL)</Label>
              <Input
                id="technique-video"
                placeholder="https://youtube.com/..."
                value={techniqueForm.videoUrl}
                onChange={(event) => setTechniqueForm((current) => ({ ...current, videoUrl: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Passos da execução</Label>
              <div className="space-y-2">
                {techniqueForm.steps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="w-6 pt-2 text-sm text-muted-foreground">{index + 1}.</span>
                    <Input
                      placeholder={`Descreva o passo ${index + 1}`}
                      value={step}
                      onChange={(event) =>
                        setTechniqueForm((current) => ({
                          ...current,
                          steps: current.steps.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item,
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTechniqueDialog(false)}>Cancelar</Button>
            <Button onClick={submitTechnique}>Criar técnica</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCurriculumDialog} onOpenChange={setShowCurriculumDialog}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar currículo por faixa</DialogTitle>
            <DialogDescription>
              Defina quais técnicas são obrigatórias para esta graduação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {allTechniques
              .filter((technique) => !editingRequirement || technique.modality === editingRequirement.modality)
              .map((technique) => {
                const checked = curriculumSelection.includes(technique.id)
                return (
                  <label
                    key={technique.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={(event) =>
                        setCurriculumSelection((current) =>
                          event.target.checked
                            ? [...current, technique.id]
                            : current.filter((id) => id !== technique.id),
                        )
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{technique.name}</p>
                        <Badge className={beltColors[technique.belt] || "border"}>{technique.belt}</Badge>
                        {technique.hasVideo ? (
                          <Badge variant="outline" className="gap-1">
                            <Video className="h-3 w-3" />
                            Vídeo
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{technique.description}</p>
                    </div>
                  </label>
                )
              })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCurriculumDialog(false)}>Cancelar</Button>
            <Button onClick={saveCurriculum}>Salvar currículo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedTechnique)} onOpenChange={(open) => !open && setSelectedTechnique(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {selectedTechnique ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl">{selectedTechnique.name}</DialogTitle>
                    <DialogDescription className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{selectedTechnique.category}</Badge>
                      <Badge variant="secondary">{selectedTechnique.modality}</Badge>
                      <Badge className={beltColors[selectedTechnique.belt] || "border"}>{selectedTechnique.belt}</Badge>
                    </DialogDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {selectedTechnique.hasVideo ? (
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                    <div className="text-center">
                      <Play className="mx-auto mb-2 h-12 w-12 text-primary" />
                      <p className="text-sm text-muted-foreground">Vídeo tutorial</p>
                    </div>
                  </div>
                ) : null}

                <div>
                  <h4 className="mb-2 font-medium">Descrição</h4>
                  <p className="text-muted-foreground">{selectedTechnique.description}</p>
                </div>

                <div>
                  <h4 className="mb-3 font-medium">Passos para execução</h4>
                  <div className="space-y-3">
                    {Array.from({ length: selectedTechnique.steps }).map((_, index) => (
                      <div key={index} className="flex gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                          {index + 1}
                        </div>
                        <p className="flex-1 text-sm">
                          {index === 0 && "Posicione-se corretamente na base inicial e organize as pegadas."}
                          {index === 1 && "Faça o controle principal antes de iniciar o ataque ou a progressão."}
                          {index === 2 && "Execute o movimento central com ajuste de quadril e direção."}
                          {index === 3 && "Consolide a posição final e impeça a reação do adversário."}
                          {index === 4 && "Refine o encaixe para finalizar ou estabilizar o domínio."}
                          {index > 4 && `Passo ${index + 1} da execução técnica.`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Play className="mr-2 h-4 w-4" />
                    Assistir vídeo
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Biblioteca de técnicas</h1>
            <p className="text-muted-foreground">Organize e gerencie técnicas por posição, categoria e nível.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowCategoryDialog(true)}>
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Nova categoria</span>
              <span className="sm:hidden">Categoria</span>
            </Button>
            <Button className="gap-2" onClick={() => setShowTechniqueDialog(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova técnica</span>
              <span className="sm:hidden">Técnica</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard title="Total" value={String(totalTechniques)} icon={BookOpen} tone="primary" />
          <MetricCard title="Jiu-Jitsu" value={String(allTechniques.filter((technique) => technique.modality === "Jiu-Jitsu").length)} icon={BookOpen} tone="info" />
          <MetricCard title="Muay Thai" value={String(allTechniques.filter((technique) => technique.modality === "Muay Thai").length)} icon={BookOpen} tone="warning" />
          <MetricCard title="Com vídeo" value={String(techniquesWithVideo)} icon={Video} tone="success" />
        </div>

        <Tabs defaultValue="library" className="space-y-4">
          <TabsList>
            <TabsTrigger value="library">Biblioteca</TabsTrigger>
            <TabsTrigger value="curriculum">Currículo por faixa</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar técnicas..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterModality} onValueChange={setFilterModality}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Jiu-Jitsu">Jiu-Jitsu</SelectItem>
                  <SelectItem value="Muay Thai">Muay Thai</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterBelt} onValueChange={setFilterBelt}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Branca">Branca</SelectItem>
                  <SelectItem value="Azul">Azul</SelectItem>
                  <SelectItem value="Roxa">Roxa</SelectItem>
                  <SelectItem value="Iniciante">Iniciante</SelectItem>
                  <SelectItem value="Intermediário">Intermediário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Accordion type="multiple" defaultValue={["guard", "muay-basics"]} className="space-y-4">
              {filteredCategories.map((category) => (
                <AccordionItem key={category.id} value={category.id} className="rounded-lg border">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <p className="font-semibold">{category.name}</p>
                        <p className="text-sm font-normal text-muted-foreground">
                          {category.modality} | {category.techniques.length} técnica{category.techniques.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {category.techniques.map((technique) => (
                        <div
                          key={technique.id}
                          className="flex cursor-pointer items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                          onClick={() =>
                            setSelectedTechnique({
                              ...technique,
                              category: category.name,
                              modality: category.modality,
                            })
                          }
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                            <div>
                              <p className="font-medium">{technique.name}</p>
                              <p className="text-sm text-muted-foreground">{technique.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {technique.hasVideo ? (
                              <Badge variant="outline" className="gap-1">
                                <Video className="h-3 w-3" />
                                Vídeo
                              </Badge>
                            ) : null}
                            <Badge className={beltColors[technique.belt] || "border"}>{technique.belt}</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                                <DropdownMenuItem onSelect={() => setSelectedTechnique({ ...technique, category: category.name, modality: category.modality })}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Defina quais técnicas são obrigatórias para cada graduação da academia.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {beltRequirements.map((requirement) => {
                const requiredTechniques = allTechniques.filter((technique) =>
                  requirement.requiredTechniques.includes(technique.id),
                )

                return (
                  <Card key={`${requirement.modality}-${requirement.belt}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className={`h-3 w-6 rounded ${requirement.color.split(" ")[0]}`} />
                          Faixa {requirement.belt}
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCurriculumEditor(requirement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>{requirement.modality}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {requiredTechniques.map((technique) => (
                          <div key={technique.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{technique.name}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {requiredTechniques.length} técnica{requiredTechniques.length !== 1 ? "s" : ""} obrigatória{requiredTechniques.length !== 1 ? "s" : ""}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Atribuir técnicas ao currículo</CardTitle>
                <CardDescription>
                  Use a edição de cada faixa para montar o currículo mínimo de progressão.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
                  <div className="text-center">
                    <Award className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">Abra uma faixa para definir as técnicas obrigatórias.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  icon: typeof BookOpen
  tone: "primary" | "info" | "warning" | "success"
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    info: "bg-blue-500/10 text-blue-500",
    warning: "bg-red-500/10 text-red-500",
    success: "bg-green-500/10 text-green-500",
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
