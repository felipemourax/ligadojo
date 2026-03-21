"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
} from "lucide-react"

// Dados simulados
const turmasData = [
  { id: 1, nome: "Jiu-Jitsu Adulto", cor: "bg-blue-500" },
  { id: 2, nome: "Jiu-Jitsu Kids", cor: "bg-green-500" },
  { id: 3, nome: "No-Gi", cor: "bg-purple-500" },
  { id: 4, nome: "Jiu-Jitsu Avançado", cor: "bg-orange-500" },
  { id: 5, nome: "Competição", cor: "bg-red-500" },
]

const aulasSemanais: Record<string, Array<{
  id: number
  turmaId: number
  horarioInicio: string
  horarioFim: string
  sala: string
  alunos: number
  capacidade: number
}>> = {
  "seg": [
    { id: 1, turmaId: 1, horarioInicio: "08:00", horarioFim: "09:00", sala: "Sala Principal", alunos: 14, capacidade: 20 },
    { id: 2, turmaId: 2, horarioInicio: "10:00", horarioFim: "10:45", sala: "Sala 2", alunos: 12, capacidade: 15 },
    { id: 3, turmaId: 3, horarioInicio: "14:00", horarioFim: "15:00", sala: "Sala Principal", alunos: 8, capacidade: 16 },
    { id: 4, turmaId: 4, horarioInicio: "19:00", horarioFim: "20:30", sala: "Sala Principal", alunos: 10, capacidade: 12 },
  ],
  "ter": [
    { id: 5, turmaId: 1, horarioInicio: "08:00", horarioFim: "09:00", sala: "Sala Principal", alunos: 16, capacidade: 20 },
    { id: 6, turmaId: 2, horarioInicio: "10:00", horarioFim: "10:45", sala: "Sala 2", alunos: 14, capacidade: 15 },
    { id: 7, turmaId: 5, horarioInicio: "20:00", horarioFim: "21:30", sala: "Sala Principal", alunos: 8, capacidade: 10 },
  ],
  "qua": [
    { id: 8, turmaId: 1, horarioInicio: "08:00", horarioFim: "09:00", sala: "Sala Principal", alunos: 14, capacidade: 20 },
    { id: 9, turmaId: 2, horarioInicio: "10:00", horarioFim: "10:45", sala: "Sala 2", alunos: 12, capacidade: 15 },
    { id: 10, turmaId: 3, horarioInicio: "14:00", horarioFim: "15:00", sala: "Sala Principal", alunos: 10, capacidade: 16 },
    { id: 11, turmaId: 4, horarioInicio: "19:00", horarioFim: "20:30", sala: "Sala Principal", alunos: 11, capacidade: 12 },
  ],
  "qui": [
    { id: 12, turmaId: 1, horarioInicio: "08:00", horarioFim: "09:00", sala: "Sala Principal", alunos: 15, capacidade: 20 },
    { id: 13, turmaId: 2, horarioInicio: "10:00", horarioFim: "10:45", sala: "Sala 2", alunos: 13, capacidade: 15 },
    { id: 14, turmaId: 5, horarioInicio: "20:00", horarioFim: "21:30", sala: "Sala Principal", alunos: 9, capacidade: 10 },
  ],
  "sex": [
    { id: 15, turmaId: 1, horarioInicio: "08:00", horarioFim: "09:00", sala: "Sala Principal", alunos: 12, capacidade: 20 },
    { id: 16, turmaId: 2, horarioInicio: "10:00", horarioFim: "10:45", sala: "Sala 2", alunos: 10, capacidade: 15 },
    { id: 17, turmaId: 3, horarioInicio: "14:00", horarioFim: "15:00", sala: "Sala Principal", alunos: 8, capacidade: 16 },
    { id: 18, turmaId: 4, horarioInicio: "19:00", horarioFim: "20:30", sala: "Sala Principal", alunos: 10, capacidade: 12 },
  ],
  "sab": [
    { id: 19, turmaId: 1, horarioInicio: "09:00", horarioFim: "10:30", sala: "Sala Principal", alunos: 18, capacidade: 20 },
    { id: 20, turmaId: 2, horarioInicio: "11:00", horarioFim: "11:45", sala: "Sala 2", alunos: 14, capacidade: 15 },
  ],
  "dom": [],
}

const diasSemana = [
  { key: "dom", label: "Dom", fullLabel: "Domingo" },
  { key: "seg", label: "Seg", fullLabel: "Segunda" },
  { key: "ter", label: "Ter", fullLabel: "Terça" },
  { key: "qua", label: "Qua", fullLabel: "Quarta" },
  { key: "qui", label: "Qui", fullLabel: "Quinta" },
  { key: "sex", label: "Sex", fullLabel: "Sexta" },
  { key: "sab", label: "Sáb", fullLabel: "Sábado" },
]

export default function AgendaProfessorPage() {
  const [semanaAtual, setSemanaAtual] = useState(0)
  const [diaSelecionado, setDiaSelecionado] = useState(
    diasSemana[new Date().getDay()].key
  )

  const getDatasDaSemana = (offset: number) => {
    const hoje = new Date()
    const primeiroDia = new Date(hoje)
    primeiroDia.setDate(hoje.getDate() - hoje.getDay() + (offset * 7))
    
    return diasSemana.map((_, index) => {
      const data = new Date(primeiroDia)
      data.setDate(primeiroDia.getDate() + index)
      return data
    })
  }

  const datasDaSemana = getDatasDaSemana(semanaAtual)
  const hoje = new Date()

  const getTurma = (turmaId: number) => {
    return turmasData.find(t => t.id === turmaId)
  }

  const aulasDodia = aulasSemanais[diaSelecionado] || []

  const getMesAno = () => {
    const primeiraData = datasDaSemana[0]
    const ultimaData = datasDaSemana[6]
    
    if (primeiraData.getMonth() === ultimaData.getMonth()) {
      return primeiraData.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    }
    return `${primeiraData.toLocaleDateString("pt-BR", { month: "short" })} - ${ultimaData.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSemanaAtual(s => s - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSemanaAtual(0)}
          >
            Hoje
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSemanaAtual(s => s + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mês/Ano */}
      <p className="text-muted-foreground capitalize">{getMesAno()}</p>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 gap-1">
        {diasSemana.map((dia, index) => {
          const data = datasDaSemana[index]
          const isHoje = data.toDateString() === hoje.toDateString()
          const isSelecionado = diaSelecionado === dia.key
          const temAulas = (aulasSemanais[dia.key] || []).length > 0

          return (
            <button
              key={dia.key}
              onClick={() => setDiaSelecionado(dia.key)}
              className={cn(
                "flex flex-col items-center py-2 rounded-lg transition-colors",
                isSelecionado 
                  ? "bg-primary text-primary-foreground" 
                  : isHoje 
                    ? "bg-primary/20 text-primary" 
                    : "hover:bg-secondary"
              )}
            >
              <span className="text-xs font-medium">{dia.label}</span>
              <span className={cn(
                "text-lg font-bold",
                !temAulas && !isSelecionado && "text-muted-foreground"
              )}>
                {data.getDate()}
              </span>
              {temAulas && (
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full mt-0.5",
                  isSelecionado ? "bg-primary-foreground" : "bg-primary"
                )} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legenda de Turmas */}
      <div className="flex flex-wrap gap-2">
        {turmasData.map((turma) => (
          <div key={turma.id} className="flex items-center gap-1.5">
            <div className={cn("h-3 w-3 rounded-full", turma.cor)} />
            <span className="text-xs text-muted-foreground">{turma.nome}</span>
          </div>
        ))}
      </div>

      {/* Aulas do Dia */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {diasSemana.find(d => d.key === diaSelecionado)?.fullLabel}
            <span className="text-muted-foreground font-normal ml-2">
              {aulasDodia.length} {aulasDodia.length === 1 ? "aula" : "aulas"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aulasDodia.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma aula neste dia</p>
            </div>
          ) : (
            aulasDodia.map((aula) => {
              const turma = getTurma(aula.turmaId)
              return (
                <div
                  key={aula.id}
                  className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className={cn("w-1 h-full min-h-[60px] rounded-full", turma?.cor)} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{turma?.nome}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{aula.horarioInicio} - {aula.horarioFim}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        <Users className="h-3 w-3 mr-1" />
                        {aula.alunos}/{aula.capacidade}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{aula.sala}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Resumo da Semana */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Resumo da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold text-primary">
                {Object.values(aulasSemanais).flat().length}
              </p>
              <p className="text-sm text-muted-foreground">Total de aulas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold">
                {Object.values(aulasSemanais).flat().reduce((acc, a) => acc + a.alunos, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Alunos esperados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
