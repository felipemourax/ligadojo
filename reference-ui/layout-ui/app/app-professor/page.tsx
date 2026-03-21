"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  Users,
  ClipboardCheck,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  Trophy,
  UserPlus,
  AlertCircle,
} from "lucide-react"

// Dados simulados
const aulasHoje = [
  {
    id: 1,
    turma: "Jiu-Jitsu Adulto",
    horario: "08:00",
    duracao: "60 min",
    alunos: 14,
    capacidade: 20,
    status: "proxima",
    sala: "Sala Principal",
  },
  {
    id: 2,
    turma: "Jiu-Jitsu Kids",
    horario: "10:00",
    duracao: "45 min",
    alunos: 12,
    capacidade: 15,
    status: "aguardando",
    sala: "Sala 2",
  },
  {
    id: 3,
    turma: "No-Gi",
    horario: "14:00",
    duracao: "60 min",
    alunos: 8,
    capacidade: 16,
    status: "aguardando",
    sala: "Sala Principal",
  },
  {
    id: 4,
    turma: "Jiu-Jitsu Avançado",
    horario: "19:00",
    duracao: "90 min",
    alunos: 10,
    capacidade: 12,
    status: "aguardando",
    sala: "Sala Principal",
  },
]

const proximasAulas = [
  {
    id: 1,
    turma: "Jiu-Jitsu Adulto",
    data: "Amanhã",
    horario: "08:00",
    alunos: 16,
  },
  {
    id: 2,
    turma: "Jiu-Jitsu Kids",
    data: "Amanhã",
    horario: "10:00",
    alunos: 14,
  },
  {
    id: 3,
    turma: "Competição",
    data: "Quarta",
    horario: "20:00",
    alunos: 8,
  },
]

const alunosElegiveis = [
  { id: 1, nome: "Pedro Santos", faixaAtual: "Branca", proximaFaixa: "Azul", aulas: 120 },
  { id: 2, nome: "Ana Costa", faixaAtual: "Azul", proximaFaixa: "Roxa", aulas: 200 },
  { id: 3, nome: "Lucas Oliveira", faixaAtual: "Branca", proximaFaixa: "Azul", aulas: 115 },
]

const alertas = [
  { id: 1, tipo: "aviso", mensagem: "3 alunos com frequência baixa esta semana", acao: "frequencia_baixa" },
  { id: 2, tipo: "info", mensagem: "Evento de competição em 5 dias", acao: null },
]

const alunosFrequenciaBaixa = [
  { 
    id: 1, 
    nome: "Marcos Vinícius", 
    turma: "Jiu-Jitsu Adulto",
    faixa: "Azul",
    presencasSemana: 1, 
    esperado: 4,
    ultimaPresenca: "Há 5 dias",
    telefone: "(11) 99999-1111"
  },
  { 
    id: 2, 
    nome: "Julia Fernandes", 
    turma: "No-Gi",
    faixa: "Branca",
    presencasSemana: 1, 
    esperado: 3,
    ultimaPresenca: "Há 6 dias",
    telefone: "(11) 99999-2222"
  },
  { 
    id: 3, 
    nome: "Rafael Souza", 
    turma: "Jiu-Jitsu Adulto",
    faixa: "Roxa",
    presencasSemana: 0, 
    esperado: 5,
    ultimaPresenca: "Há 8 dias",
    telefone: "(11) 99999-3333"
  },
]

export default function ResumoProfessorPage() {
  const [dataAtual] = useState(new Date())
  const [modalFrequenciaAberto, setModalFrequenciaAberto] = useState(false)
  
  const formatarData = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "proxima":
        return <Badge className="bg-primary text-primary-foreground">Próxima</Badge>
      case "em_andamento":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Em andamento</Badge>
      case "concluida":
        return <Badge variant="secondary">Concluída</Badge>
      default:
        return <Badge variant="outline">Aguardando</Badge>
    }
  }

  const getFaixaColor = (faixa: string) => {
    const cores: Record<string, string> = {
      "Branca": "bg-white text-black",
      "Azul": "bg-blue-600 text-white",
      "Roxa": "bg-purple-600 text-white",
      "Marrom": "bg-amber-800 text-white",
      "Preta": "bg-black text-white border border-white/20",
    }
    return cores[faixa] || "bg-gray-500 text-white"
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Olá, Mestre Silva</h1>
        <p className="text-muted-foreground capitalize">{formatarData(dataAtual)}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{aulasHoje.length}</p>
                <p className="text-xs text-muted-foreground">Aulas hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">44</p>
                <p className="text-xs text-muted-foreground">Alunos esperados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Elegíveis p/ exame</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Trophy className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Eventos próximos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                alerta.tipo === "aviso" 
                  ? "bg-yellow-500/10 border border-yellow-500/20" 
                  : "bg-blue-500/10 border border-blue-500/20"
              }`}
            >
              <AlertCircle className={`h-5 w-5 shrink-0 ${
                alerta.tipo === "aviso" ? "text-yellow-500" : "text-blue-500"
              }`} />
              <p className="text-sm flex-1">{alerta.mensagem}</p>
              {alerta.acao === "frequencia_baixa" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="shrink-0 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                  onClick={() => setModalFrequenciaAberto(true)}
                >
                  Ver alunos
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Alunos com Frequência Baixa */}
      <Dialog open={modalFrequenciaAberto} onOpenChange={setModalFrequenciaAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Alunos com Frequência Baixa
            </DialogTitle>
            <DialogDescription>
              Alunos que estão abaixo do esperado esta semana
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {alunosFrequenciaBaixa.map((aluno) => (
              <div key={aluno.id} className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-yellow-500/20 text-yellow-500">
                      {aluno.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{aluno.nome}</p>
                    <p className="text-sm text-muted-foreground">{aluno.turma}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{aluno.faixa}</Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Presenças na semana</span>
                    <span className="font-medium text-yellow-500">{aluno.presencasSemana}/{aluno.esperado}</span>
                  </div>
                  <Progress 
                    value={(aluno.presencasSemana / aluno.esperado) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Última presença:</span>
                  <span>{aluno.ultimaPresenca}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(`https://wa.me/55${aluno.telefone.replace(/\D/g, '')}`, '_blank')}
                  >
                    Enviar mensagem
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Aulas de Hoje */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Aulas de Hoje
            </CardTitle>
            <Link href="/app-professor/agenda">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver agenda
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {aulasHoje.map((aula) => (
            <div
              key={aula.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex flex-col items-center justify-center min-w-[50px]">
                <span className="text-lg font-bold">{aula.horario}</span>
                <span className="text-xs text-muted-foreground">{aula.duracao}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{aula.turma}</p>
                  {getStatusBadge(aula.status)}
                </div>
                <p className="text-sm text-muted-foreground">{aula.sala}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{aula.alunos}/{aula.capacidade}</span>
                </div>
              </div>
              <Link href={`/app-professor/presenca?turma=${aula.id}`}>
                <Button size="sm" variant="outline">
                  <ClipboardCheck className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Atalhos Rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/app-professor/presenca">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">Registrar Presença</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app-professor/evolucao">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">Gerenciar Graduações</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app-professor/turmas?tab=alunos">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Gerenciar Alunos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app-professor/turmas">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Gerenciar Turmas</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alunos Elegíveis para Graduação */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Elegíveis para Graduação
            </CardTitle>
            <Link href="/app-professor/evolucao">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {alunosElegiveis.map((aluno) => (
            <div
              key={aluno.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20 text-primary">
                  {aluno.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{aluno.nome}</p>
                <p className="text-sm text-muted-foreground">{aluno.aulas} aulas</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getFaixaColor(aluno.faixaAtual)} variant="outline">
                  {aluno.faixaAtual}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Badge className={getFaixaColor(aluno.proximaFaixa)} variant="outline">
                  {aluno.proximaFaixa}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Próximas Aulas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximas Aulas
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {proximasAulas.map((aula) => (
            <div
              key={aula.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className="text-center min-w-[60px]">
                  <p className="text-sm font-medium">{aula.data}</p>
                  <p className="text-xs text-muted-foreground">{aula.horario}</p>
                </div>
                <div>
                  <p className="font-medium">{aula.turma}</p>
                  <p className="text-sm text-muted-foreground">{aula.alunos} alunos</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
