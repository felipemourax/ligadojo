"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Search,
  GraduationCap,
  TrendingUp,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Award,
} from "lucide-react"

// Dados simulados
const alunosElegiveis = [
  { 
    id: 1, 
    nome: "Pedro Santos", 
    faixaAtual: "Branca", 
    proximaFaixa: "Azul",
    aulas: 120, 
    aulasNecessarias: 100,
    tempoFaixa: "14 meses",
    observacoes: "Excelente evolução técnica",
    status: "elegivel"
  },
  { 
    id: 2, 
    nome: "Ana Costa", 
    faixaAtual: "Azul", 
    proximaFaixa: "Roxa",
    aulas: 210, 
    aulasNecessarias: 200,
    tempoFaixa: "24 meses",
    observacoes: "Forte em competições",
    status: "elegivel"
  },
  { 
    id: 3, 
    nome: "Lucas Oliveira", 
    faixaAtual: "Branca", 
    proximaFaixa: "Azul",
    aulas: 115, 
    aulasNecessarias: 100,
    tempoFaixa: "13 meses",
    observacoes: "",
    status: "elegivel"
  },
  { 
    id: 4, 
    nome: "Carla Souza", 
    faixaAtual: "Branca", 
    proximaFaixa: "Azul",
    aulas: 85, 
    aulasNecessarias: 100,
    tempoFaixa: "10 meses",
    observacoes: "Precisa melhorar defesa",
    status: "em_progresso"
  },
  { 
    id: 5, 
    nome: "Bruno Martins", 
    faixaAtual: "Azul", 
    proximaFaixa: "Roxa",
    aulas: 150, 
    aulasNecessarias: 200,
    tempoFaixa: "18 meses",
    observacoes: "",
    status: "em_progresso"
  },
]

const examesAgendados = [
  {
    id: 1,
    data: "25/03/2026",
    horario: "10:00",
    local: "Sala Principal",
    alunos: [
      { id: 1, nome: "Pedro Santos", faixaAtual: "Branca", proximaFaixa: "Azul" },
      { id: 3, nome: "Lucas Oliveira", faixaAtual: "Branca", proximaFaixa: "Azul" },
    ],
    status: "agendado"
  },
  {
    id: 2,
    data: "02/04/2026",
    horario: "14:00",
    local: "Sala Principal",
    alunos: [
      { id: 2, nome: "Ana Costa", faixaAtual: "Azul", proximaFaixa: "Roxa" },
    ],
    status: "agendado"
  },
]

const historicoPromocoes = [
  {
    id: 1,
    aluno: "Maria Silva",
    faixaAnterior: "Azul",
    novaFaixa: "Roxa",
    data: "15/02/2026",
    avaliador: "Mestre Silva",
  },
  {
    id: 2,
    aluno: "João Pereira",
    faixaAnterior: "Branca",
    novaFaixa: "Azul",
    data: "10/02/2026",
    avaliador: "Mestre Silva",
  },
  {
    id: 3,
    aluno: "Fernanda Alves",
    faixaAnterior: "Branca",
    novaFaixa: "Azul",
    data: "10/02/2026",
    avaliador: "Mestre Silva",
  },
]

export default function EvolucaoProfessorPage() {
  const [tab, setTab] = useState("elegiveis")
  const [busca, setBusca] = useState("")
  const [dialogExame, setDialogExame] = useState(false)
  const [alunoParaExame, setAlunoParaExame] = useState<typeof alunosElegiveis[0] | null>(null)
  const [dialogPromover, setDialogPromover] = useState(false)
  const [notasExame, setNotasExame] = useState("")

  const alunosFiltrados = alunosElegiveis.filter(a => 
    a.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const getFaixaColor = (faixa: string) => {
    const cores: Record<string, string> = {
      "Branca": "bg-white text-black border border-gray-300",
      "Cinza": "bg-gray-400 text-white",
      "Amarela": "bg-yellow-400 text-black",
      "Laranja": "bg-orange-500 text-white",
      "Verde": "bg-green-600 text-white",
      "Azul": "bg-blue-600 text-white",
      "Roxa": "bg-purple-600 text-white",
      "Marrom": "bg-amber-800 text-white",
      "Preta": "bg-black text-white border border-white/20",
    }
    return cores[faixa] || "bg-gray-500 text-white"
  }

  const agendarExame = (aluno: typeof alunosElegiveis[0]) => {
    setAlunoParaExame(aluno)
    setDialogExame(true)
  }

  const promoverAluno = (aluno: typeof alunosElegiveis[0]) => {
    setAlunoParaExame(aluno)
    setDialogPromover(true)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Evolução</h1>
        <p className="text-muted-foreground">Gerencie graduações e progresso dos alunos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {alunosElegiveis.filter(a => a.status === "elegivel").length}
            </p>
            <p className="text-xs text-muted-foreground">Elegíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{examesAgendados.length}</p>
            <p className="text-xs text-muted-foreground">Exames</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{historicoPromocoes.length}</p>
            <p className="text-xs text-muted-foreground">Promoções</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="elegiveis" className="text-xs">
            <GraduationCap className="h-4 w-4 mr-1" />
            Elegíveis
          </TabsTrigger>
          <TabsTrigger value="exames" className="text-xs">
            <Calendar className="h-4 w-4 mr-1" />
            Exames
          </TabsTrigger>
          <TabsTrigger value="historico" className="text-xs">
            <Award className="h-4 w-4 mr-1" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Busca */}
        {tab === "elegiveis" && (
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Alunos Elegíveis */}
        <TabsContent value="elegiveis" className="space-y-3 mt-4">
          {alunosFiltrados.map((aluno) => {
            const progresso = Math.min((aluno.aulas / aluno.aulasNecessarias) * 100, 100)
            const isElegivel = aluno.status === "elegivel"

            return (
              <Card key={aluno.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={cn(
                        "text-sm",
                        isElegivel ? "bg-primary/20 text-primary" : "bg-secondary"
                      )}>
                        {aluno.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{aluno.nome}</p>
                        {isElegivel && (
                          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                            <Star className="h-3 w-3 mr-1" />
                            Elegível
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn("text-xs", getFaixaColor(aluno.faixaAtual))}>
                          {aluno.faixaAtual}
                        </Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <Badge className={cn("text-xs", getFaixaColor(aluno.proximaFaixa))}>
                          {aluno.proximaFaixa}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progresso */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span>{aluno.aulas}/{aluno.aulasNecessarias} aulas</span>
                    </div>
                    <Progress value={progresso} className="h-2" />
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{aluno.tempoFaixa}</span>
                    </div>
                  </div>

                  {aluno.observacoes && (
                    <p className="text-sm text-muted-foreground italic">
                      "{aluno.observacoes}"
                    </p>
                  )}

                  {/* Ações */}
                  {isElegivel && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => agendarExame(aluno)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Agendar exame
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => promoverAluno(aluno)}
                      >
                        <GraduationCap className="h-4 w-4 mr-1" />
                        Promover
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Exames Agendados */}
        <TabsContent value="exames" className="space-y-3 mt-4">
          {examesAgendados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum exame agendado</p>
            </div>
          ) : (
            examesAgendados.map((exame) => (
              <Card key={exame.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {exame.data}
                    </CardTitle>
                    <Badge variant="outline">{exame.horario}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{exame.local}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {exame.alunos.map((aluno) => (
                    <div key={aluno.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/20 text-primary">
                          {aluno.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm">{aluno.nome}</span>
                      <div className="flex items-center gap-1">
                        <Badge className={cn("text-xs px-1.5", getFaixaColor(aluno.faixaAtual))}>
                          {aluno.faixaAtual}
                        </Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <Badge className={cn("text-xs px-1.5", getFaixaColor(aluno.proximaFaixa))}>
                          {aluno.proximaFaixa}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Histórico de Promoções */}
        <TabsContent value="historico" className="space-y-3 mt-4">
          {historicoPromocoes.map((promocao) => (
            <Card key={promocao.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{promocao.aluno}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-xs px-1.5", getFaixaColor(promocao.faixaAnterior))}>
                        {promocao.faixaAnterior}
                      </Badge>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <Badge className={cn("text-xs px-1.5", getFaixaColor(promocao.novaFaixa))}>
                        {promocao.novaFaixa}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{promocao.data}</p>
                    <p className="text-xs text-muted-foreground">{promocao.avaliador}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Dialog Agendar Exame */}
      <Dialog open={dialogExame} onOpenChange={setDialogExame}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Exame de Graduação</DialogTitle>
            <DialogDescription>
              Agende o exame para {alunoParaExame?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20 text-primary">
                  {alunoParaExame?.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{alunoParaExame?.nome}</p>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getFaixaColor(alunoParaExame?.faixaAtual || ""))}>
                    {alunoParaExame?.faixaAtual}
                  </Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <Badge className={cn("text-xs", getFaixaColor(alunoParaExame?.proximaFaixa || ""))}>
                    {alunoParaExame?.proximaFaixa}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Horário</label>
                <Input type="time" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Local</label>
              <Select defaultValue="sala-principal">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sala-principal">Sala Principal</SelectItem>
                  <SelectItem value="sala-2">Sala 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogExame(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setDialogExame(false)}>
              Agendar Exame
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Promover */}
      <Dialog open={dialogPromover} onOpenChange={setDialogPromover}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promover Aluno</DialogTitle>
            <DialogDescription>
              Confirme a promoção de {alunoParaExame?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="text-center">
                <div className={cn("h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-2", getFaixaColor(alunoParaExame?.faixaAtual || ""))}>
                  <span className="text-lg font-bold">{alunoParaExame?.faixaAtual?.slice(0, 2)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{alunoParaExame?.faixaAtual}</p>
              </div>
              <ChevronRight className="h-8 w-8 text-primary" />
              <div className="text-center">
                <div className={cn("h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-2", getFaixaColor(alunoParaExame?.proximaFaixa || ""))}>
                  <span className="text-lg font-bold">{alunoParaExame?.proximaFaixa?.slice(0, 2)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{alunoParaExame?.proximaFaixa}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observações do Exame</label>
              <Textarea 
                placeholder="Notas sobre o desempenho do aluno..."
                value={notasExame}
                onChange={(e) => setNotasExame(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPromover(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setDialogPromover(false)}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Confirmar Promoção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
