"use client"

import { useState } from "react"
import { Plus, Search, BookOpen, Play, Filter, GripVertical, ChevronRight, Video, FileText, Link2, Edit, Trash2, MoreVertical, FolderOpen, Award, CheckCircle2, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Mock data - Categorias por posicao
const categories = [
  {
    id: "guard",
    name: "Guarda Fechada",
    modality: "Jiu-Jitsu",
    techniques: [
      { id: "1", name: "Armlock da Guarda", belt: "Branca", hasVideo: true, description: "Finalizacao classica partindo da guarda fechada", steps: 5 },
      { id: "2", name: "Triangulo", belt: "Azul", hasVideo: true, description: "Estrangulamento com as pernas", steps: 6 },
      { id: "3", name: "Omoplata", belt: "Azul", hasVideo: true, description: "Chave de ombro usando as pernas", steps: 7 },
      { id: "4", name: "Kimura da Guarda", belt: "Branca", hasVideo: false, description: "Chave de ombro americana", steps: 4 },
    ],
  },
  {
    id: "half-guard",
    name: "Meia Guarda",
    modality: "Jiu-Jitsu",
    techniques: [
      { id: "5", name: "Raspagem Simples", belt: "Branca", hasVideo: true, description: "Raspagem basica da meia guarda", steps: 4 },
      { id: "6", name: "Underhook Sweep", belt: "Azul", hasVideo: true, description: "Raspagem com underhook", steps: 5 },
      { id: "7", name: "Deep Half Entry", belt: "Roxa", hasVideo: false, description: "Entrada para meia guarda profunda", steps: 6 },
    ],
  },
  {
    id: "passing",
    name: "Passagem de Guarda",
    modality: "Jiu-Jitsu",
    techniques: [
      { id: "8", name: "Toreando", belt: "Branca", hasVideo: true, description: "Passagem de guarda classica", steps: 4 },
      { id: "9", name: "Passagem com Joelho", belt: "Branca", hasVideo: true, description: "Knee slice pass", steps: 5 },
      { id: "10", name: "X-Pass", belt: "Azul", hasVideo: false, description: "Passagem cruzando as maos", steps: 4 },
    ],
  },
  {
    id: "mount",
    name: "Montada",
    modality: "Jiu-Jitsu",
    techniques: [
      { id: "11", name: "Armlock da Montada", belt: "Branca", hasVideo: true, description: "Finalizacao do alto", steps: 5 },
      { id: "12", name: "Ezequiel", belt: "Azul", hasVideo: true, description: "Estrangulamento Ezequiel", steps: 4 },
      { id: "13", name: "Manutencao da Montada", belt: "Branca", hasVideo: false, description: "Como manter a posicao de montada", steps: 3 },
    ],
  },
  {
    id: "muay-basics",
    name: "Tecnicas Basicas",
    modality: "Muay Thai",
    techniques: [
      { id: "14", name: "Jab", belt: "Iniciante", hasVideo: true, description: "Soco frontal com a mao da frente", steps: 3 },
      { id: "15", name: "Cross", belt: "Iniciante", hasVideo: true, description: "Soco cruzado com a mao de tras", steps: 3 },
      { id: "16", name: "Low Kick", belt: "Iniciante", hasVideo: true, description: "Chute baixo na perna", steps: 4 },
      { id: "17", name: "Teep", belt: "Iniciante", hasVideo: true, description: "Chute frontal empurrando", steps: 3 },
    ],
  },
  {
    id: "muay-combos",
    name: "Combinacoes",
    modality: "Muay Thai",
    techniques: [
      { id: "18", name: "Jab + Cross", belt: "Iniciante", hasVideo: true, description: "Combinacao basica de socos", steps: 2 },
      { id: "19", name: "1-2-3", belt: "Intermediario", hasVideo: true, description: "Jab, Cross, Hook", steps: 3 },
      { id: "20", name: "Combo com Low Kick", belt: "Intermediario", hasVideo: false, description: "Socos finalizando com chute baixo", steps: 4 },
    ],
  },
]

const beltRequirements = [
  {
    belt: "Branca",
    modality: "Jiu-Jitsu",
    requiredTechniques: ["1", "4", "5", "8", "9", "11", "13"],
    color: "bg-white text-foreground border",
  },
  {
    belt: "Azul",
    modality: "Jiu-Jitsu",
    requiredTechniques: ["2", "3", "6", "10", "12"],
    color: "bg-blue-500 text-white",
  },
  {
    belt: "Roxa",
    modality: "Jiu-Jitsu",
    requiredTechniques: ["7"],
    color: "bg-purple-500 text-white",
  },
]

const categoryColors: Record<string, string> = {
  "Finalizacao": "bg-red-500/10 text-red-500 border-red-500/20",
  "Passagem": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Raspagem": "bg-green-500/10 text-green-500 border-green-500/20",
  "Defesa": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "Posicao": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Chute": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Soco": "bg-red-500/10 text-red-500 border-red-500/20",
  "Combinacao": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
}

const beltColors: Record<string, string> = {
  "Branca": "bg-white text-foreground border",
  "Azul": "bg-blue-500 text-white",
  "Roxa": "bg-purple-500 text-white",
  "Marrom": "bg-amber-700 text-white",
  "Preta": "bg-black text-white",
  "Iniciante": "bg-green-500/10 text-green-500 border-green-500/20",
  "Intermediario": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "Avancado": "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function TechniquesPage() {
  const [search, setSearch] = useState("")
  const [filterModality, setFilterModality] = useState("all")
  const [filterBelt, setFilterBelt] = useState("all")
  const [selectedTechnique, setSelectedTechnique] = useState<any>(null)
  const [showNewTechniqueDialog, setShowNewTechniqueDialog] = useState(false)
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const allTechniques = categories.flatMap((cat) => 
    cat.techniques.map((tech) => ({ ...tech, category: cat.name, modality: cat.modality }))
  )

  const filteredCategories = categories.filter((cat) => {
    const matchesModality = filterModality === "all" || cat.modality === filterModality
    const hasTechniques = cat.techniques.some((tech) => {
      const matchesSearch = tech.name.toLowerCase().includes(search.toLowerCase())
      const matchesBelt = filterBelt === "all" || tech.belt === filterBelt
      return matchesSearch && matchesBelt
    })
    return matchesModality && hasTechniques
  })

  const totalTechniques = allTechniques.length
  const techniquesWithVideo = allTechniques.filter((t) => t.hasVideo).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Biblioteca de Tecnicas</h1>
          <p className="text-muted-foreground">Organize e gerencie tecnicas por posicao e nivel</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Categoria</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
                <DialogDescription>Crie uma nova categoria para organizar tecnicas</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nome da Categoria</Label>
                  <Input placeholder="Ex: Costas" />
                </div>
                <div className="grid gap-2">
                  <Label>Modalidade</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jiu-jitsu">Jiu-Jitsu</SelectItem>
                      <SelectItem value="muay-thai">Muay Thai</SelectItem>
                      <SelectItem value="boxe">Boxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Descricao</Label>
                  <Textarea placeholder="Descricao da categoria..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>Cancelar</Button>
                <Button onClick={() => setShowNewCategoryDialog(false)}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showNewTechniqueDialog} onOpenChange={setShowNewTechniqueDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Tecnica</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Tecnica</DialogTitle>
                <DialogDescription>Adicione uma nova tecnica a biblioteca</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nome da Tecnica</Label>
                  <Input placeholder="Ex: Armlock da Montada" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Nivel/Faixa</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="branca">Branca</SelectItem>
                        <SelectItem value="azul">Azul</SelectItem>
                        <SelectItem value="roxa">Roxa</SelectItem>
                        <SelectItem value="marrom">Marrom</SelectItem>
                        <SelectItem value="preta">Preta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Descricao</Label>
                  <Textarea placeholder="Descricao da tecnica..." />
                </div>
                <div className="grid gap-2">
                  <Label>Video (URL)</Label>
                  <Input placeholder="https://youtube.com/..." />
                </div>
                <div className="grid gap-2">
                  <Label>Passos da Execucao</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="text-sm text-muted-foreground w-6">1.</span>
                      <Input placeholder="Primeiro passo..." />
                    </div>
                    <div className="flex gap-2">
                      <span className="text-sm text-muted-foreground w-6">2.</span>
                      <Input placeholder="Segundo passo..." />
                    </div>
                    <div className="flex gap-2">
                      <span className="text-sm text-muted-foreground w-6">3.</span>
                      <Input placeholder="Terceiro passo..." />
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar passo
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewTechniqueDialog(false)}>Cancelar</Button>
                <Button onClick={() => setShowNewTechniqueDialog(false)}>Criar Tecnica</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTechniques}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {allTechniques.filter((t) => t.modality === "Jiu-Jitsu").length}
                </p>
                <p className="text-xs text-muted-foreground">Jiu-Jitsu</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <BookOpen className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {allTechniques.filter((t) => t.modality === "Muay Thai").length}
                </p>
                <p className="text-xs text-muted-foreground">Muay Thai</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Video className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{techniquesWithVideo}</p>
                <p className="text-xs text-muted-foreground">Com video</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="library" className="space-y-4">
        <TabsList>
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculo por Faixa</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar tecnicas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterModality} onValueChange={setFilterModality}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Jiu-Jitsu">Jiu-Jitsu</SelectItem>
                <SelectItem value="Muay Thai">Muay Thai</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBelt} onValueChange={setFilterBelt}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Branca">Branca</SelectItem>
                <SelectItem value="Azul">Azul</SelectItem>
                <SelectItem value="Roxa">Roxa</SelectItem>
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediario">Intermediario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories with Techniques */}
          <Accordion type="multiple" defaultValue={["guard", "muay-basics"]} className="space-y-4">
            {filteredCategories.map((category) => {
              const filteredTechniques = category.techniques.filter((tech) => {
                const matchesSearch = tech.name.toLowerCase().includes(search.toLowerCase())
                const matchesBelt = filterBelt === "all" || tech.belt === filterBelt
                return matchesSearch && matchesBelt
              })

              return (
                <AccordionItem key={category.id} value={category.id} className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <p className="font-semibold">{category.name}</p>
                        <p className="text-sm text-muted-foreground font-normal">
                          {category.modality} | {filteredTechniques.length} tecnica{filteredTechniques.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {filteredTechniques.map((technique) => (
                        <div
                          key={technique.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                          draggable
                          onDragStart={() => setDraggedItem(technique.id)}
                          onDragEnd={() => setDraggedItem(null)}
                          onClick={() => setSelectedTechnique({ ...technique, category: category.name, modality: category.modality })}
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <div>
                              <p className="font-medium">{technique.name}</p>
                              <p className="text-sm text-muted-foreground">{technique.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {technique.hasVideo && (
                              <Badge variant="outline" className="gap-1">
                                <Video className="h-3 w-3" />
                                Video
                              </Badge>
                            )}
                            <Badge className={beltColors[technique.belt]}>{technique.belt}</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Defina quais tecnicas sao obrigatorias para cada graduacao
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {beltRequirements.map((req) => {
              const requiredTechs = allTechniques.filter((t) => 
                req.requiredTechniques.includes(t.id)
              )
              
              return (
                <Card key={req.belt}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className={`w-6 h-3 rounded ${req.color.split(" ")[0]}`} />
                        Faixa {req.belt}
                      </CardTitle>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>{req.modality}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {requiredTechs.map((tech) => (
                        <div key={tech.id} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{tech.name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {requiredTechs.length} tecnica{requiredTechs.length !== 1 ? "s" : ""} obrigatoria{requiredTechs.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Atribuir Tecnicas ao Curriculo</CardTitle>
              <CardDescription>
                Arraste tecnicas da biblioteca ou selecione para adicionar aos requisitos de cada faixa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg text-muted-foreground">
                <div className="text-center">
                  <Award className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Arraste tecnicas aqui para atribuir a uma faixa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Technique Detail Dialog */}
      <Dialog open={!!selectedTechnique} onOpenChange={(open) => !open && setSelectedTechnique(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTechnique && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedTechnique.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{selectedTechnique.category}</Badge>
                      <Badge variant="secondary">{selectedTechnique.modality}</Badge>
                      <Badge className={beltColors[selectedTechnique.belt]}>{selectedTechnique.belt}</Badge>
                    </DialogDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Duplicar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {selectedTechnique.hasVideo && (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-12 w-12 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Video tutorial</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Descricao</h4>
                  <p className="text-muted-foreground">{selectedTechnique.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Passos para Execucao</h4>
                  <div className="space-y-3">
                    {Array.from({ length: selectedTechnique.steps }).map((_, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {i + 1}
                        </div>
                        <p className="text-sm flex-1">
                          {i === 0 && "Posicione-se corretamente na posicao inicial"}
                          {i === 1 && "Controle as pegas e estabeleca dominio"}
                          {i === 2 && "Execute o movimento principal da tecnica"}
                          {i === 3 && "Finalize com controle adequado"}
                          {i === 4 && "Mantenha a pressao ate a finalizacao"}
                          {i > 4 && `Passo ${i + 1} da execucao`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Assistir Video
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
