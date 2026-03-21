"use client"

import { useState } from "react"
import { 
  Lightbulb, 
  Video, 
  Camera, 
  Users, 
  Baby, 
  Trophy,
  GraduationCap,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Filter
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ContentIdea {
  id: string
  category: "training" | "kids" | "technique" | "motivation" | "event" | "behind"
  icon: typeof Video
  title: string
  description: string
  suggestedText: string
  difficulty: "easy" | "medium" | "hard"
  saved?: boolean
}

const ideas: ContentIdea[] = [
  {
    id: "1",
    category: "training",
    icon: Video,
    title: "Grave um aluno finalizando um treino",
    description: "Mostre a dedicação e evolução dos seus alunos",
    suggestedText: "Evolução não acontece do dia para a noite.\nEla acontece todos os dias no tatame.",
    difficulty: "easy",
  },
  {
    id: "2",
    category: "kids",
    icon: Baby,
    title: "Mostre o treino das crianças",
    description: "Destaque a turma kids e atraia novos pais",
    suggestedText: "Mais que um esporte.\nUm ambiente de disciplina e respeito.",
    difficulty: "easy",
  },
  {
    id: "3",
    category: "technique",
    icon: GraduationCap,
    title: "Mostre uma técnica simples",
    description: "Ensine algo básico para gerar engajamento",
    suggestedText: "Aprenda uma raspagem básica de jiu-jitsu.\nSalve para praticar depois!",
    difficulty: "medium",
  },
  {
    id: "4",
    category: "motivation",
    icon: Trophy,
    title: "Depoimento de aluno",
    description: "Peça para um aluno contar sua jornada",
    suggestedText: "O jiu-jitsu mudou minha vida.\nDescubra como pode mudar a sua.",
    difficulty: "medium",
  },
  {
    id: "5",
    category: "behind",
    icon: Camera,
    title: "Bastidores da academia",
    description: "Mostre o dia a dia e a estrutura",
    suggestedText: "Um tour pela nossa casa.\nConheça onde a magia acontece.",
    difficulty: "easy",
  },
  {
    id: "6",
    category: "training",
    icon: Users,
    title: "Treino em dupla",
    description: "Grave uma sequência de técnicas em dupla",
    suggestedText: "Parceiro de treino é parceiro de vida.\nJuntos somos mais fortes.",
    difficulty: "medium",
  },
  {
    id: "7",
    category: "event",
    icon: Trophy,
    title: "Preparação para campeonato",
    description: "Mostre a rotina antes de uma competição",
    suggestedText: "Faltam X dias para o campeonato.\nA preparação está a todo vapor!",
    difficulty: "hard",
  },
  {
    id: "8",
    category: "motivation",
    icon: Clock,
    title: "Antes e depois de um aluno",
    description: "Transformação física ou de habilidade",
    suggestedText: "6 meses de dedicação.\nO resultado fala por si só.",
    difficulty: "hard",
  },
  {
    id: "9",
    category: "kids",
    icon: GraduationCap,
    title: "Graduação infantil",
    description: "Celebre a conquista das crianças",
    suggestedText: "Parabéns pela nova faixa!\nDedicação desde cedo.",
    difficulty: "easy",
  },
  {
    id: "10",
    category: "technique",
    icon: Video,
    title: "Técnica da semana",
    description: "Série semanal de técnicas",
    suggestedText: "Técnica da semana:\n[Nome da técnica]\n\nSalve e pratique!",
    difficulty: "medium",
  },
  {
    id: "11",
    category: "behind",
    icon: Users,
    title: "Apresente os professores",
    description: "Conte a história de cada instrutor",
    suggestedText: "Conheça o professor [Nome].\nX anos de experiência no tatame.",
    difficulty: "easy",
  },
  {
    id: "12",
    category: "motivation",
    icon: Sparkles,
    title: "Frase motivacional",
    description: "Post com citação inspiradora",
    suggestedText: "O tatame é onde os fracos ficam fortes\ne os fortes ficam humildes.",
    difficulty: "easy",
  },
]

const categoryLabels = {
  training: { label: "Treino", color: "bg-blue-500/20 text-blue-400" },
  kids: { label: "Kids", color: "bg-pink-500/20 text-pink-400" },
  technique: { label: "Técnica", color: "bg-purple-500/20 text-purple-400" },
  motivation: { label: "Motivação", color: "bg-yellow-500/20 text-yellow-400" },
  event: { label: "Evento", color: "bg-red-500/20 text-red-400" },
  behind: { label: "Bastidores", color: "bg-green-500/20 text-green-400" },
}

const difficultyLabels = {
  easy: { label: "Fácil", color: "bg-green-500/20 text-green-400" },
  medium: { label: "Médio", color: "bg-yellow-500/20 text-yellow-400" },
  hard: { label: "Avançado", color: "bg-red-500/20 text-red-400" },
}

export default function MarketingIdeasPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [savedIdeas, setSavedIdeas] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  const filteredIdeas = ideas.filter((idea) => {
    if (showSavedOnly && !savedIdeas.has(idea.id)) return false
    if (selectedCategory === "all") return true
    return idea.category === selectedCategory
  })

  const toggleSaved = (id: string) => {
    setSavedIdeas((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ideias de conteúdo</h1>
        <p className="text-muted-foreground">
          Não sabe o que postar? Aqui estão ideias prontas para você usar hoje.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{ideas.length}</p>
              <p className="text-sm text-muted-foreground">Ideias disponíveis</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
              <BookmarkCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{savedIdeas.size}</p>
              <p className="text-sm text-muted-foreground">Ideias salvas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
              <Sparkles className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Novo</p>
              <p className="text-sm text-muted-foreground">Ideias diárias</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrar por:</span>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              <SelectItem value="training">Treino</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
              <SelectItem value="technique">Técnica</SelectItem>
              <SelectItem value="motivation">Motivação</SelectItem>
              <SelectItem value="event">Evento</SelectItem>
              <SelectItem value="behind">Bastidores</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={showSavedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={showSavedOnly ? "bg-primary text-primary-foreground" : ""}
          >
            <BookmarkCheck className="h-4 w-4 mr-2" />
            Salvas ({savedIdeas.size})
          </Button>
          <Button variant="outline" size="sm" className="ml-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Novas ideias
          </Button>
        </CardContent>
      </Card>

      {/* Ideas Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIdeas.map((idea) => (
          <Card
            key={idea.id}
            className={cn(
              "border-border bg-card transition-all hover:border-primary/30",
              savedIdeas.has(idea.id) && "border-primary/50"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <idea.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex gap-1">
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", categoryLabels[idea.category].color)}
                  >
                    {categoryLabels[idea.category].label}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", difficultyLabels[idea.difficulty].color)}
                  >
                    {difficultyLabels[idea.difficulty].label}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-base">{idea.title}</CardTitle>
              <CardDescription>{idea.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {idea.suggestedText}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => copyText(idea.id, idea.suggestedText)}
                >
                  {copiedId === idea.id ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button
                  variant={savedIdeas.has(idea.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSaved(idea.id)}
                  className={savedIdeas.has(idea.id) ? "bg-primary text-primary-foreground" : ""}
                >
                  {savedIdeas.has(idea.id) ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">Nenhuma ideia encontrada</h3>
            <p className="text-muted-foreground">
              Tente mudar os filtros ou gerar novas ideias.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
