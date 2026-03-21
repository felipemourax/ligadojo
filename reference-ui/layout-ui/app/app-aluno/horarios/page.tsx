"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const aulas = {
  seg: [
    { id: 1, modalidade: "Jiu-Jitsu", tipo: "Adulto", horario: "07:00", duracao: "60 min", professor: "Prof. Carlos", sala: "Sala 1", vagas: 8, inscritos: 6 },
    { id: 2, modalidade: "Jiu-Jitsu Kids", tipo: "Kids", horario: "10:00", duracao: "45 min", professor: "Prof. Ana", sala: "Sala 2", vagas: 15, inscritos: 12 },
    { id: 3, modalidade: "Jiu-Jitsu", tipo: "Adulto", horario: "12:00", duracao: "60 min", professor: "Prof. Carlos", sala: "Sala 1", vagas: 10, inscritos: 8 },
    { id: 4, modalidade: "No-Gi", tipo: "Adulto", horario: "19:00", duracao: "60 min", professor: "Prof. Ricardo", sala: "Sala 1", vagas: 12, inscritos: 10 },
    { id: 5, modalidade: "Jiu-Jitsu", tipo: "Adulto", horario: "20:30", duracao: "60 min", professor: "Prof. Carlos", sala: "Sala 1", vagas: 12, inscritos: 11 },
  ],
  ter: [
    { id: 6, modalidade: "Jiu-Jitsu", tipo: "Adulto", horario: "07:00", duracao: "60 min", professor: "Prof. Carlos", sala: "Sala 1", vagas: 8, inscritos: 5 },
    { id: 7, modalidade: "Muay Thai", tipo: "Adulto", horario: "19:00", duracao: "60 min", professor: "Prof. André", sala: "Sala 2", vagas: 15, inscritos: 13 },
    { id: 8, modalidade: "Jiu-Jitsu", tipo: "Adulto", horario: "20:30", duracao: "60 min", professor: "Prof. Ricardo", sala: "Sala 1", vagas: 12, inscritos: 9 },
  ],
  qua: [
    { id: 9, modalidade: "Jiu-Jitsu", tipo: "Adulto", horario: "07:00", duracao: "60 min", professor: "Prof. Carlos", sala: "Sala 1", vagas: 8, inscritos: 7 },
    { id: 10, modalidade: "Jiu-Jitsu Kids", tipo: "Kids", horario: "10:00", duracao: "45 min", professor: "Prof. Ana", sala: "Sala 2", vagas: 15, inscritos: 14 },
    { id: 11, modalidade: "No-Gi", tipo: "Adulto", horario: "19:00", duracao: "60 min", professor: "Prof. Ricardo", sala: "Sala 1", vagas: 12, inscritos: 8 },
    { id: 12, modalidade: "Jiu-Jitsu", tipo: "Adulto", horario: "20:30", duracao: "60 min", professor: "Prof. Carlos", sala: "Sala 1", vagas: 12, inscritos: 10 },
  ],
  qui: [
    { id: 13, modalidade: "Jiu-Jitsu", tipo: "Adulto", horario: "07:00", duracao: "60 min", professor: "Prof. Carlos", sala: "Sala 1", vagas: 8, inscritos: 4 },
    { id: 14, modalidade: "Muay Thai", tipo: "Adulto", horario: "19:00", duracao: "60 min", professor: "Prof. André", sala: "Sala 2", vagas: 15, inscritos: 11 },
    { id: 15, modalidade: "Jiu-Jitsu", tipo: "Adulto", horario: "20:30", duracao: "60 min", professor: "Prof. Ricardo", sala: "Sala 1", vagas: 12, inscritos: 12 },
  ],
  sex: [
    { id: 16, modalidade: "Jiu-Jitsu", tipo: "Adulto", horario: "07:00", duracao: "60 min", professor: "Prof. Carlos", sala: "Sala 1", vagas: 8, inscritos: 6 },
    { id: 17, modalidade: "Jiu-Jitsu Kids", tipo: "Kids", horario: "10:00", duracao: "45 min", professor: "Prof. Ana", sala: "Sala 2", vagas: 15, inscritos: 10 },
    { id: 18, modalidade: "Open Mat", tipo: "Livre", horario: "19:00", duracao: "90 min", professor: "Sem professor", sala: "Sala 1", vagas: 20, inscritos: 15 },
  ],
  sab: [
    { id: 19, modalidade: "Open Mat", tipo: "Livre", horario: "10:00", duracao: "120 min", professor: "Sem professor", sala: "Sala 1", vagas: 25, inscritos: 18 },
  ],
  dom: [],
}

const getDatasDaSemana = (offset: number = 0) => {
  const hoje = new Date()
  const primeiroDia = new Date(hoje)
  primeiroDia.setDate(hoje.getDate() - hoje.getDay() + (offset * 7))
  
  return Array.from({ length: 7 }, (_, i) => {
    const data = new Date(primeiroDia)
    data.setDate(primeiroDia.getDate() + i)
    return data
  })
}

export default function HorariosPage() {
  const [semanaOffset, setSemanaOffset] = useState(0)
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDay())
  const [aulaConfirmar, setAulaConfirmar] = useState<typeof aulas.seg[0] | null>(null)
  const [aulasInscritas, setAulasInscritas] = useState<number[]>([1, 4])

  const datasSemana = getDatasDaSemana(semanaOffset)
  const hoje = new Date()

  const getDiaKey = (diaIndex: number): keyof typeof aulas => {
    const keys: (keyof typeof aulas)[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"]
    return keys[diaIndex]
  }

  const aulasHoje = aulas[getDiaKey(diaSelecionado)]

  const handleInscrever = (aula: typeof aulas.seg[0]) => {
    if (aulasInscritas.includes(aula.id)) {
      setAulasInscritas(aulasInscritas.filter((id) => id !== aula.id))
    } else {
      setAulaConfirmar(aula)
    }
  }

  const confirmarInscricao = () => {
    if (aulaConfirmar) {
      setAulasInscritas([...aulasInscritas, aulaConfirmar.id])
      setAulaConfirmar(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Horários</h1>
        <p className="text-sm text-muted-foreground">
          Confira os horários e inscreva-se nas aulas
        </p>
      </div>

      {/* Navegação de Semana */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSemanaOffset(semanaOffset - 1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-medium">
            {datasSemana[0].toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSemanaOffset(semanaOffset + 1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dias da Semana */}
        <div className="flex gap-2">
          {datasSemana.map((data, index) => {
            const isHoje =
              data.toDateString() === hoje.toDateString()
            const isSelecionado = index === diaSelecionado
            const temAulas = aulas[getDiaKey(index)].length > 0

            return (
              <button
                key={index}
                onClick={() => setDiaSelecionado(index)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-colors",
                  isSelecionado
                    ? "bg-primary text-primary-foreground"
                    : isHoje
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-secondary"
                )}
              >
                <span className="text-[10px] uppercase tracking-wide opacity-70">
                  {diasSemana[index]}
                </span>
                <span className="text-lg font-semibold">{data.getDate()}</span>
                {temAulas && !isSelecionado && (
                  <div className="h-1 w-1 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista de Aulas */}
      <div className="flex-1 overflow-auto p-4">
        {aulasHoje.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium">Sem aulas neste dia</p>
            <p className="text-sm text-muted-foreground mt-1">
              Aproveite para descansar!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {aulasHoje.map((aula) => {
              const inscrito = aulasInscritas.includes(aula.id)
              const lotada = aula.inscritos >= aula.vagas

              return (
                <Card
                  key={aula.id}
                  className={cn(inscrito && "border-primary/50 bg-primary/5")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{aula.modalidade}</h3>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px]",
                              aula.tipo === "Kids" && "bg-pink-500/20 text-pink-400",
                              aula.tipo === "Livre" && "bg-yellow-500/20 text-yellow-400"
                            )}
                          >
                            {aula.tipo}
                          </Badge>
                          {inscrito && (
                            <Badge className="text-[10px] bg-primary/20 text-primary">
                              Inscrito
                            </Badge>
                          )}
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
                        <div className="flex items-center gap-1 mt-2 text-sm">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span
                            className={cn(
                              lotada ? "text-destructive" : "text-muted-foreground"
                            )}
                          >
                            {aula.inscritos}/{aula.vagas} vagas
                          </span>
                        </div>
                      </div>
                      <Button
                        variant={inscrito ? "outline" : "default"}
                        size="sm"
                        disabled={lotada && !inscrito}
                        onClick={() => handleInscrever(aula)}
                        className={cn(inscrito && "border-primary text-primary")}
                      >
                        {inscrito ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Cancelar
                          </>
                        ) : lotada ? (
                          "Lotada"
                        ) : (
                          "Inscrever"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Dialog de Confirmação */}
      <Dialog open={!!aulaConfirmar} onOpenChange={() => setAulaConfirmar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar inscrição</DialogTitle>
            <DialogDescription>
              Você deseja se inscrever nesta aula?
            </DialogDescription>
          </DialogHeader>

          {aulaConfirmar && (
            <div className="p-4 rounded-lg bg-secondary">
              <h3 className="font-medium">{aulaConfirmar.modalidade}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {aulaConfirmar.professor}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {aulaConfirmar.horario}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {aulaConfirmar.sala}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAulaConfirmar(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarInscricao}>Confirmar inscrição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
