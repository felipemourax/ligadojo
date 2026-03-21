"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  Search,
  Users,
  Clock,
  Calendar,
  ChevronRight,
  MoreVertical,
  Edit,
  Eye,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  GraduationCap,
} from "lucide-react"

// Dados simulados
const turmas = [
  { 
    id: 1, 
    nome: "Jiu-Jitsu Adulto", 
    modalidade: "Jiu-Jitsu",
    faixaEtaria: "Adulto",
    horarios: ["Seg, Qua, Sex - 08:00", "Ter, Qui - 19:00"],
    alunos: 28,
    capacidade: 30,
    sala: "Sala Principal",
    cor: "bg-blue-500"
  },
  { 
    id: 2, 
    nome: "Jiu-Jitsu Kids", 
    modalidade: "Jiu-Jitsu",
    faixaEtaria: "Kids (7-12 anos)",
    horarios: ["Seg, Qua, Sex - 10:00", "Sáb - 11:00"],
    alunos: 18,
    capacidade: 20,
    sala: "Sala 2",
    cor: "bg-green-500"
  },
  { 
    id: 3, 
    nome: "No-Gi", 
    modalidade: "No-Gi",
    faixaEtaria: "Adulto",
    horarios: ["Seg, Qua, Sex - 14:00"],
    alunos: 12,
    capacidade: 16,
    sala: "Sala Principal",
    cor: "bg-purple-500"
  },
  { 
    id: 4, 
    nome: "Jiu-Jitsu Avançado", 
    modalidade: "Jiu-Jitsu",
    faixaEtaria: "Adulto (Azul+)",
    horarios: ["Seg, Qua, Sex - 19:00"],
    alunos: 10,
    capacidade: 12,
    sala: "Sala Principal",
    cor: "bg-orange-500"
  },
  { 
    id: 5, 
    nome: "Competição", 
    modalidade: "Jiu-Jitsu",
    faixaEtaria: "Competidores",
    horarios: ["Ter, Qui - 20:00", "Sáb - 09:00"],
    alunos: 8,
    capacidade: 10,
    sala: "Sala Principal",
    cor: "bg-red-500"
  },
]

const alunos = [
  { id: 1, nome: "Pedro Santos", faixa: "Azul", turmas: [1, 3], email: "pedro@email.com", telefone: "(11) 99999-1111", status: "ativo" },
  { id: 2, nome: "Ana Costa", faixa: "Branca", turmas: [1], email: "ana@email.com", telefone: "(11) 99999-2222", status: "ativo" },
  { id: 3, nome: "Lucas Oliveira", faixa: "Azul", turmas: [1, 4], email: "lucas@email.com", telefone: "(11) 99999-3333", status: "ativo" },
  { id: 4, nome: "Maria Silva", faixa: "Roxa", turmas: [4, 5], email: "maria@email.com", telefone: "(11) 99999-4444", status: "ativo" },
  { id: 5, nome: "João Pereira", faixa: "Branca", turmas: [1], email: "joao@email.com", telefone: "(11) 99999-5555", status: "ativo" },
  { id: 6, nome: "Carla Souza", faixa: "Azul", turmas: [1, 3], email: "carla@email.com", telefone: "(11) 99999-6666", status: "ativo" },
  { id: 7, nome: "Rafael Lima", faixa: "Branca", turmas: [1], email: "rafael@email.com", telefone: "(11) 99999-7777", status: "inativo" },
  { id: 8, nome: "Miguel Junior", faixa: "Branca", turmas: [2], email: "miguel@email.com", telefone: "(11) 99999-8888", status: "ativo" },
  { id: 9, nome: "Sofia Santos", faixa: "Cinza", turmas: [2], email: "sofia@email.com", telefone: "(11) 99999-9999", status: "ativo" },
  { id: 10, nome: "Gabriel Lima", faixa: "Amarela", turmas: [2], email: "gabriel@email.com", telefone: "(11) 99999-0000", status: "ativo" },
]

export default function TurmasProfessorPage() {
  const [tab, setTab] = useState("turmas")
  const [busca, setBusca] = useState("")
  const [turmaSelecionada, setTurmaSelecionada] = useState<typeof turmas[0] | null>(null)
  const [alunoSelecionado, setAlunoSelecionado] = useState<typeof alunos[0] | null>(null)

  const turmasFiltradas = turmas.filter(t => 
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    t.modalidade.toLowerCase().includes(busca.toLowerCase())
  )

  const alunosFiltrados = alunos.filter(a => 
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.faixa.toLowerCase().includes(busca.toLowerCase())
  )

  const getAlunosDaTurma = (turmaId: number) => {
    return alunos.filter(a => a.turmas.includes(turmaId))
  }

  const getTurmasDoAluno = (turmaIds: number[]) => {
    return turmas.filter(t => turmaIds.includes(t.id))
  }

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

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Turmas</h1>
        <p className="text-muted-foreground">Gerencie suas turmas e alunos</p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="turmas">
            <Users className="h-4 w-4 mr-2" />
            Turmas
          </TabsTrigger>
          <TabsTrigger value="alunos">
            <GraduationCap className="h-4 w-4 mr-2" />
            Alunos
          </TabsTrigger>
        </TabsList>

        {/* Busca */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tab === "turmas" ? "Buscar turma..." : "Buscar aluno..."}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista de Turmas */}
        <TabsContent value="turmas" className="space-y-3 mt-4">
          {turmasFiltradas.map((turma) => (
            <Card 
              key={turma.id} 
              className="cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setTurmaSelecionada(turma)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-1 h-full min-h-[60px] rounded-full", turma.cor)} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{turma.nome}</p>
                        <p className="text-sm text-muted-foreground">{turma.faixaEtaria}</p>
                      </div>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {turma.alunos}/{turma.capacidade}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {turma.horarios.map((horario, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {horario}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Lista de Alunos */}
        <TabsContent value="alunos" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {alunosFiltrados.length} alunos
            </p>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-1" />
              Novo aluno
            </Button>
          </div>

          {alunosFiltrados.map((aluno) => (
            <Card 
              key={aluno.id} 
              className="cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setAlunoSelecionado(aluno)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {aluno.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{aluno.nome}</p>
                      {aluno.status === "inativo" && (
                        <Badge variant="secondary" className="text-xs">Inativo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-xs px-1.5", getFaixaColor(aluno.faixa))}>
                        {aluno.faixa}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {aluno.turmas.length} turma(s)
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setAlunoSelecionado(aluno)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Modal Detalhes da Turma */}
      <Dialog open={!!turmaSelecionada} onOpenChange={() => setTurmaSelecionada(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {turmaSelecionada && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-12 rounded-full", turmaSelecionada.cor)} />
                  <div>
                    <DialogTitle>{turmaSelecionada.nome}</DialogTitle>
                    <DialogDescription>{turmaSelecionada.modalidade} - {turmaSelecionada.faixaEtaria}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p className="font-medium">{turmaSelecionada.alunos}/{turmaSelecionada.capacidade} alunos</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">{turmaSelecionada.sala}</p>
                  </div>
                </div>

                {/* Horários */}
                <div>
                  <p className="text-sm font-medium mb-2">Horários</p>
                  <div className="space-y-2">
                    {turmaSelecionada.horarios.map((horario, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{horario}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alunos */}
                <div>
                  <p className="text-sm font-medium mb-2">
                    Alunos ({getAlunosDaTurma(turmaSelecionada.id).length})
                  </p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {getAlunosDaTurma(turmaSelecionada.id).map((aluno) => (
                      <div key={aluno.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/20 text-primary">
                            {aluno.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-sm">{aluno.nome}</span>
                        <Badge className={cn("text-xs px-1.5", getFaixaColor(aluno.faixa))}>
                          {aluno.faixa}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setTurmaSelecionada(null)}>
                  Fechar
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar turma
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes do Aluno */}
      <Dialog open={!!alunoSelecionado} onOpenChange={() => setAlunoSelecionado(null)}>
        <DialogContent>
          {alunoSelecionado && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">
                      {alunoSelecionado.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{alunoSelecionado.nome}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-xs", getFaixaColor(alunoSelecionado.faixa))}>
                        {alunoSelecionado.faixa}
                      </Badge>
                      <Badge variant={alunoSelecionado.status === "ativo" ? "default" : "secondary"}>
                        {alunoSelecionado.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Contato */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Contato</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{alunoSelecionado.email}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{alunoSelecionado.telefone}</span>
                    </div>
                  </div>
                </div>

                {/* Turmas */}
                <div>
                  <p className="text-sm font-medium mb-2">Turmas</p>
                  <div className="space-y-2">
                    {getTurmasDoAluno(alunoSelecionado.turmas).map((turma) => (
                      <div key={turma.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                        <div className={cn("w-2 h-8 rounded-full", turma.cor)} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{turma.nome}</p>
                          <p className="text-xs text-muted-foreground">{turma.faixaEtaria}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAlunoSelecionado(null)}>
                  Fechar
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar aluno
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
