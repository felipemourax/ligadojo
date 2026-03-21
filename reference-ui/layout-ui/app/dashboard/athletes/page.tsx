"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Search,
  Users,
  Trophy,
  ChevronRight,
  Medal,
  Plus,
  Trash2,
  Edit,
  Filter,
  Star,
  Award,
  Calendar,
} from "lucide-react"

// Dados simulados dos atletas da academia com seus títulos
const atletasData = [
  {
    id: "1",
    nome: "Carlos Silva",
    faixa: "Azul",
    grau: "2º Grau",
    modalidade: "Jiu-Jitsu",
    status: "active",
    avatar: null,
    idade: 28,
    tempoTreino: "2 anos",
    titulos: [
      { id: 1, titulo: "Ouro", competicao: "Campeonato Paulista de Jiu-Jitsu", ano: "2024" },
      { id: 2, titulo: "Prata", competicao: "Copa São Paulo", ano: "2023" },
      { id: 3, titulo: "Bronze", competicao: "Campeonato Brasileiro CBJJ", ano: "2023" },
    ],
  },
  {
    id: "2",
    nome: "Maria Santos",
    faixa: "Roxa",
    grau: "3º Grau",
    modalidade: "Jiu-Jitsu",
    status: "active",
    avatar: null,
    idade: 32,
    tempoTreino: "5 anos",
    titulos: [
      { id: 4, titulo: "Ouro", competicao: "Campeonato Brasileiro CBJJ (Feminino)", ano: "2024" },
      { id: 5, titulo: "Ouro", competicao: "Pan American (Feminino)", ano: "2024" },
      { id: 6, titulo: "Prata", competicao: "Campeonato Mundial IBJJF (Feminino)", ano: "2023" },
    ],
  },
  {
    id: "3",
    nome: "João Oliveira",
    faixa: "Branca",
    grau: "4º Grau",
    modalidade: "Jiu-Jitsu",
    status: "active",
    avatar: null,
    idade: 19,
    tempoTreino: "1 ano",
    titulos: [
      { id: 7, titulo: "Ouro", competicao: "Copa Kids de Jiu-Jitsu", ano: "2024" },
    ],
  },
  {
    id: "4",
    nome: "Ana Costa",
    faixa: "Marrom",
    grau: "1º Grau",
    modalidade: "Jiu-Jitsu",
    status: "active",
    avatar: null,
    idade: 30,
    tempoTreino: "7 anos",
    titulos: [
      { id: 8, titulo: "Ouro", competicao: "Campeonato Mundial IBJJF (Feminino)", ano: "2024" },
      { id: 9, titulo: "Ouro", competicao: "Pan American (Feminino)", ano: "2024" },
      { id: 10, titulo: "Ouro", competicao: "Campeonato Brasileiro CBJJ (Feminino)", ano: "2023" },
      { id: 11, titulo: "Prata", competicao: "ADCC Trials", ano: "2023" },
    ],
  },
  {
    id: "5",
    nome: "Pedro Lima",
    faixa: "Azul",
    grau: "0",
    modalidade: "Jiu-Jitsu",
    status: "active",
    avatar: null,
    idade: 24,
    tempoTreino: "1 ano",
    titulos: [],
  },
  {
    id: "6",
    nome: "Fernanda Rodrigues",
    faixa: "Branca",
    grau: "2º Grau",
    modalidade: "Muay Thai",
    status: "active",
    avatar: null,
    idade: 26,
    tempoTreino: "6 meses",
    titulos: [
      { id: 12, titulo: "Bronze", competicao: "Copa Paulista de Muay Thai", ano: "2024" },
    ],
  },
]

type Atleta = typeof atletasData[0]
type Titulo = Atleta["titulos"][0]

export default function AthletesPage() {
  const [search, setSearch] = useState("")
  const [filterFaixa, setFilterFaixa] = useState<string>("all")
  const [filterModalidade, setFilterModalidade] = useState<string>("all")
  const [atletaSelecionado, setAtletaSelecionado] = useState<Atleta | null>(null)
  const [dialogNovoTitulo, setDialogNovoTitulo] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState({ titulo: "", competicao: "", ano: "" })
  const [atletas, setAtletas] = useState(atletasData)

  const getFaixaColor = (faixa: string) => {
    const cores: Record<string, string> = {
      "Branca": "bg-white text-foreground border border-border",
      "Azul": "bg-blue-600 text-white",
      "Roxa": "bg-purple-600 text-white",
      "Marrom": "bg-amber-800 text-white",
      "Preta": "bg-black text-white",
    }
    return cores[faixa] || "bg-muted text-muted-foreground"
  }

  const getTituloColor = (titulo: string) => {
    const cores: Record<string, string> = {
      "Ouro": "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
      "Prata": "bg-gray-400/10 text-gray-600 border-gray-400/30",
      "Bronze": "bg-amber-600/10 text-amber-700 border-amber-600/30",
      "Campeão": "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    }
    return cores[titulo] || "bg-primary/10 text-primary border-primary/30"
  }

  const atletasFiltrados = atletas.filter((atleta) => {
    const matchesSearch = atleta.nome.toLowerCase().includes(search.toLowerCase())
    const matchesFaixa = filterFaixa === "all" || atleta.faixa === filterFaixa
    const matchesModalidade = filterModalidade === "all" || atleta.modalidade === filterModalidade
    return matchesSearch && matchesFaixa && matchesModalidade
  })

  const totalAtletas = atletas.length
  const totalTitulos = atletas.reduce((acc, a) => acc + a.titulos.length, 0)
  const atletasComTitulos = atletas.filter((a) => a.titulos.length > 0).length
  const ouros = atletas.reduce(
    (acc, a) => acc + a.titulos.filter((t) => t.titulo === "Ouro").length,
    0
  )

  const adicionarTitulo = () => {
    if (atletaSelecionado && novoTitulo.titulo && novoTitulo.competicao && novoTitulo.ano) {
      const novoTituloObj = {
        id: Date.now(),
        titulo: novoTitulo.titulo,
        competicao: novoTitulo.competicao,
        ano: novoTitulo.ano,
      }
      setAtletas(
        atletas.map((a) =>
          a.id === atletaSelecionado.id
            ? { ...a, titulos: [...a.titulos, novoTituloObj] }
            : a
        )
      )
      setAtletaSelecionado({
        ...atletaSelecionado,
        titulos: [...atletaSelecionado.titulos, novoTituloObj],
      })
      setNovoTitulo({ titulo: "", competicao: "", ano: "" })
      setDialogNovoTitulo(false)
    }
  }

  const removerTitulo = (tituloId: number) => {
    if (atletaSelecionado) {
      const titulosAtualizados = atletaSelecionado.titulos.filter((t) => t.id !== tituloId)
      setAtletas(
        atletas.map((a) =>
          a.id === atletaSelecionado.id ? { ...a, titulos: titulosAtualizados } : a
        )
      )
      setAtletaSelecionado({ ...atletaSelecionado, titulos: titulosAtualizados })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Atletas e Títulos</h1>
        <p className="text-muted-foreground">
          Gerencie os atletas da sua academia e seus títulos em competições
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAtletas}</p>
                <p className="text-xs text-muted-foreground">Total de Atletas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Medal className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{atletasComTitulos}</p>
                <p className="text-xs text-muted-foreground">Com Títulos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTitulos}</p>
                <p className="text-xs text-muted-foreground">Total de Títulos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ouros}</p>
                <p className="text-xs text-muted-foreground">Medalhas de Ouro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar atleta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterFaixa} onValueChange={setFilterFaixa}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Faixa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Branca">Branca</SelectItem>
            <SelectItem value="Azul">Azul</SelectItem>
            <SelectItem value="Roxa">Roxa</SelectItem>
            <SelectItem value="Marrom">Marrom</SelectItem>
            <SelectItem value="Preta">Preta</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterModalidade} onValueChange={setFilterModalidade}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Modalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Jiu-Jitsu">Jiu-Jitsu</SelectItem>
            <SelectItem value="Muay Thai">Muay Thai</SelectItem>
            <SelectItem value="Boxe">Boxe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Atletas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Atletas ({atletasFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {atletasFiltrados.map((atleta) => (
              <div
                key={atleta.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => setAtletaSelecionado(atleta)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={atleta.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {atleta.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{atleta.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {atleta.modalidade} - {atleta.tempoTreino}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getFaixaColor(atleta.faixa)}>
                    {atleta.faixa}
                    {atleta.grau !== "0" && ` ${atleta.grau}`}
                  </Badge>
                  {atleta.titulos.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="h-3 w-3 text-yellow-500" />
                      {atleta.titulos.length}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
            {atletasFiltrados.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Nenhum atleta encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Atletas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Top Atletas (por número de títulos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {atletas
              .filter((a) => a.titulos.length > 0)
              .sort((a, b) => b.titulos.length - a.titulos.length)
              .slice(0, 5)
              .map((atleta, index) => (
                <div
                  key={atleta.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0
                        ? "bg-yellow-500 text-white"
                        : index === 1
                        ? "bg-gray-400 text-white"
                        : index === 2
                        ? "bg-amber-600 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {atleta.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{atleta.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {atleta.faixa} - {atleta.modalidade}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{atleta.titulos.length}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog - Detalhes do Atleta */}
      <Dialog
        open={!!atletaSelecionado}
        onOpenChange={(open) => {
          if (!open) {
            setAtletaSelecionado(null)
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {atletaSelecionado && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {atletaSelecionado.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">
                      {atletaSelecionado.nome}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getFaixaColor(atletaSelecionado.faixa)}>
                        {atletaSelecionado.faixa}
                        {atletaSelecionado.grau !== "0" && ` - ${atletaSelecionado.grau}`}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {atletaSelecionado.modalidade} - {atletaSelecionado.idade} anos -{" "}
                      {atletaSelecionado.tempoTreino} de treino
                    </p>
                  </div>
                </div>
              </DialogHeader>

              {/* Títulos */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Títulos ({atletaSelecionado.titulos.length})
                  </p>
                  <Button size="sm" onClick={() => setDialogNovoTitulo(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {atletaSelecionado.titulos.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Nenhum título cadastrado</p>
                      <p className="text-sm">
                        Adicione títulos conquistados em competições
                      </p>
                    </div>
                  ) : (
                    atletaSelecionado.titulos.map((titulo) => (
                      <div
                        key={titulo.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <Medal className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getTituloColor(titulo.titulo)}>
                              {titulo.titulo}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {titulo.ano}
                            </span>
                          </div>
                          <p className="text-sm font-medium mt-0.5">
                            {titulo.competicao}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removerTitulo(titulo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog - Adicionar Título */}
      <Dialog open={dialogNovoTitulo} onOpenChange={setDialogNovoTitulo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Título</DialogTitle>
            <DialogDescription>
              Registre um título conquistado pelo atleta em uma competição
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Colocação</label>
              <Select
                value={novoTitulo.titulo}
                onValueChange={(value) =>
                  setNovoTitulo({ ...novoTitulo, titulo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a colocação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ouro">Ouro (1º lugar)</SelectItem>
                  <SelectItem value="Prata">Prata (2º lugar)</SelectItem>
                  <SelectItem value="Bronze">Bronze (3º lugar)</SelectItem>
                  <SelectItem value="Campeão">Campeão</SelectItem>
                  <SelectItem value="Vice-Campeão">Vice-Campeão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Competição</label>
              <Input
                placeholder="Ex: Campeonato Brasileiro de Jiu-Jitsu"
                value={novoTitulo.competicao}
                onChange={(e) =>
                  setNovoTitulo({ ...novoTitulo, competicao: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Input
                placeholder="Ex: 2024"
                value={novoTitulo.ano}
                onChange={(e) =>
                  setNovoTitulo({ ...novoTitulo, ano: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogNovoTitulo(false)}>
              Cancelar
            </Button>
            <Button onClick={adicionarTitulo}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
