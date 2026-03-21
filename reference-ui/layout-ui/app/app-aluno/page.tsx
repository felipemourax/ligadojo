"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
  Users,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Dados mockados
const proximasAulas = [
  {
    id: 1,
    modalidade: "Jiu-Jitsu",
    professor: "Prof. Carlos",
    horario: "19:00",
    duracao: "60 min",
    sala: "Sala 1",
    tipo: "Adulto",
    vagas: 8,
  },
  {
    id: 2,
    modalidade: "No-Gi",
    professor: "Prof. Ricardo",
    horario: "20:30",
    duracao: "60 min",
    sala: "Sala 1",
    tipo: "Adulto",
    vagas: 12,
  },
]

const conquistas = [
  { id: 1, nome: "Primeira Aula", icon: Star, conquistado: true },
  { id: 2, nome: "10 Presenças", icon: Flame, conquistado: true },
  { id: 3, nome: "Mês Completo", icon: Target, conquistado: false },
  { id: 4, nome: "Competidor", icon: Trophy, conquistado: false },
]

export default function AppAlunoHomePage() {
  const [checkingIn, setCheckingIn] = useState(false)

  const handleCheckIn = () => {
    setCheckingIn(true)
    setTimeout(() => setCheckingIn(false), 2000)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header com saudação */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Olá, João!</h1>
          <p className="text-sm text-muted-foreground">
            Pronto para mais um treino?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">15</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              dias seguidos
            </p>
          </div>
          <Flame className="h-8 w-8 text-orange-500" />
        </div>
      </div>

      {/* Card de Graduação */}
      <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-4 rounded-full bg-blue-500" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Graduação atual</p>
              <p className="text-lg font-bold">Faixa Azul - 2 graus</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    Progresso para próxima graduação
                  </span>
                  <span className="text-primary">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Rápido */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Check-in disponível</p>
              <p className="text-sm text-muted-foreground">
                Jiu-Jitsu Adulto - 19:00
              </p>
            </div>
            <Button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="gap-2"
            >
              {checkingIn ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmado!
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Check-in
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">42</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Presenças
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">85%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Frequência
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">2</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Eventos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Aulas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Próximas aulas</h2>
          <Link
            href="/app-aluno/horarios"
            className="text-sm text-primary flex items-center gap-1"
          >
            Ver todas
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {proximasAulas.map((aula) => (
            <Card key={aula.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{aula.modalidade}</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {aula.tipo}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {aula.professor}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {aula.horario} ({aula.duracao})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {aula.sala}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {aula.vagas}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Conquistas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Conquistas</h2>
          <Link
            href="/app-aluno/perfil"
            className="text-sm text-primary flex items-center gap-1"
          >
            Ver todas
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {conquistas.map((conquista) => (
            <div
              key={conquista.id}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl min-w-[80px]",
                conquista.conquistado
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary opacity-50"
              )}
            >
              <conquista.icon
                className={cn(
                  "h-6 w-6",
                  conquista.conquistado ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className="text-[10px] text-center font-medium">
                {conquista.nome}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Avisos da Academia */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="font-medium">Campeonato Estadual</p>
              <p className="text-sm text-muted-foreground mt-1">
                Inscrições abertas até 20/04. Não perca a chance de competir!
              </p>
              <Button variant="link" className="p-0 h-auto text-primary mt-2">
                Saiba mais
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
