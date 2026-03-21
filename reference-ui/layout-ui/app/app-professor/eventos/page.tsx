"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  Medal,
  GraduationCap,
  Swords,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Shirt,
  DollarSign,
  FileText,
} from "lucide-react"

// Dados simulados
const eventosProximos = [
  {
    id: 1,
    nome: "Campeonato Estadual de Jiu-Jitsu",
    tipo: "competicao",
    data: "05/04/2026",
    horario: "08:00",
    local: "Ginásio Municipal",
    endereco: "Av. Principal, 1000 - Centro",
    responsavel: true,
    alunosInscritos: 8,
    alunosConfirmados: 6,
    status: "inscricao_aberta",
    instrucoes: {
      uniforme: "Kimono branco ou azul (oficial da federação)",
      taxa: "R$ 120,00 por categoria",
      documentos: "RG, atestado médico, carteirinha da federação",
      horarioLimite: "Chegar às 07:00 para pesagem",
    },
  },
  {
    id: 2,
    nome: "Seminário com Mestre João",
    tipo: "seminario",
    data: "12/04/2026",
    horario: "14:00",
    local: "Dojo Centro",
    endereco: "Rua das Artes, 500",
    responsavel: true,
    alunosInscritos: 25,
    alunosConfirmados: 22,
    status: "inscricao_aberta",
    instrucoes: {
      uniforme: "Kimono da academia",
      taxa: "R$ 80,00",
      documentos: "Nenhum",
      horarioLimite: "Chegar 15 minutos antes",
    },
  },
  {
    id: 3,
    nome: "Exame de Graduação - Abril",
    tipo: "exame",
    data: "25/04/2026",
    horario: "10:00",
    local: "Dojo Centro",
    endereco: "Rua das Artes, 500",
    responsavel: true,
    alunosInscritos: 12,
    alunosConfirmados: 12,
    status: "confirmado",
    instrucoes: {
      uniforme: "Kimono branco",
      taxa: "R$ 50,00 (taxa de faixa)",
      documentos: "Ficha de graduação preenchida",
      horarioLimite: "Chegar 30 minutos antes",
    },
  },
]

const eventosParticipando = [
  {
    id: 4,
    nome: "Congresso de Professores",
    tipo: "seminario",
    data: "20/04/2026",
    horario: "09:00",
    local: "Hotel Central",
    endereco: "Av. Central, 2000",
    responsavel: false,
    status: "confirmado",
    minhaParticipacao: "confirmada",
  },
]

const eventosPassados = [
  {
    id: 5,
    nome: "Campeonato Interno",
    tipo: "competicao",
    data: "15/03/2026",
    local: "Dojo Centro",
    alunosParticiparam: 15,
    resultados: "3 ouros, 5 pratas, 4 bronzes",
  },
  {
    id: 6,
    nome: "Seminário de Defesa Pessoal",
    tipo: "seminario",
    data: "01/03/2026",
    local: "Dojo Centro",
    alunosParticiparam: 30,
  },
]

export default function EventosProfessorPage() {
  const [tab, setTab] = useState("proximos")
  const [eventoSelecionado, setEventoSelecionado] = useState<typeof eventosProximos[0] | null>(null)

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "competicao":
        return <Trophy className="h-5 w-5" />
      case "seminario":
        return <GraduationCap className="h-5 w-5" />
      case "exame":
        return <Medal className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "competicao":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Competição</Badge>
      case "seminario":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Seminário</Badge>
      case "exame":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Exame</Badge>
      default:
        return <Badge variant="secondary">{tipo}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "inscricao_aberta":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Inscrições abertas</Badge>
      case "confirmado":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Confirmado</Badge>
      case "encerrado":
        return <Badge variant="secondary">Encerrado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Eventos</h1>
        <p className="text-muted-foreground">Eventos que você organiza ou participa</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{eventosProximos.length}</p>
            <p className="text-xs text-muted-foreground">Próximos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">
              {eventosProximos.filter(e => e.responsavel).length}
            </p>
            <p className="text-xs text-muted-foreground">Responsável</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">
              {eventosProximos.reduce((acc, e) => acc + (e.alunosInscritos || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Alunos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="proximos" className="text-xs">
            <Calendar className="h-4 w-4 mr-1" />
            Próximos
          </TabsTrigger>
          <TabsTrigger value="participando" className="text-xs">
            <Users className="h-4 w-4 mr-1" />
            Participando
          </TabsTrigger>
          <TabsTrigger value="passados" className="text-xs">
            <Trophy className="h-4 w-4 mr-1" />
            Passados
          </TabsTrigger>
        </TabsList>

        {/* Eventos Próximos */}
        <TabsContent value="proximos" className="space-y-3 mt-4">
          {eventosProximos.map((evento) => (
            <Card 
              key={evento.id}
              className="cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setEventoSelecionado(evento)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                    evento.tipo === "competicao" && "bg-red-500/20 text-red-400",
                    evento.tipo === "seminario" && "bg-blue-500/20 text-blue-400",
                    evento.tipo === "exame" && "bg-purple-500/20 text-purple-400",
                  )}>
                    {getTipoIcon(evento.tipo)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{evento.nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getTipoBadge(evento.tipo)}
                          {evento.responsavel && (
                            <Badge variant="outline" className="text-xs">
                              Responsável
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{evento.data}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{evento.horario}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{evento.alunosConfirmados}/{evento.alunosInscritos}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{evento.local}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Eventos Participando */}
        <TabsContent value="participando" className="space-y-3 mt-4">
          {eventosParticipando.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento como participante</p>
            </div>
          ) : (
            eventosParticipando.map((evento) => (
              <Card key={evento.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                      evento.tipo === "competicao" && "bg-red-500/20 text-red-400",
                      evento.tipo === "seminario" && "bg-blue-500/20 text-blue-400",
                      evento.tipo === "exame" && "bg-purple-500/20 text-purple-400",
                    )}>
                      {getTipoIcon(evento.tipo)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="font-medium">{evento.nome}</p>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Confirmado
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{evento.data}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{evento.horario}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{evento.local}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Eventos Passados */}
        <TabsContent value="passados" className="space-y-3 mt-4">
          {eventosPassados.map((evento) => (
            <Card key={evento.id} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center shrink-0 bg-secondary",
                    evento.tipo === "competicao" && "text-red-400",
                    evento.tipo === "seminario" && "text-blue-400",
                  )}>
                    {getTipoIcon(evento.tipo)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{evento.nome}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{evento.data}</span>
                      <span>{evento.local}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {evento.alunosParticiparam} alunos participaram
                      </span>
                      {evento.resultados && (
                        <Badge variant="secondary" className="text-xs">
                          <Medal className="h-3 w-3 mr-1" />
                          {evento.resultados}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Modal Detalhes do Evento */}
      <Dialog open={!!eventoSelecionado} onOpenChange={() => setEventoSelecionado(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {eventoSelecionado && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                    eventoSelecionado.tipo === "competicao" && "bg-red-500/20 text-red-400",
                    eventoSelecionado.tipo === "seminario" && "bg-blue-500/20 text-blue-400",
                    eventoSelecionado.tipo === "exame" && "bg-purple-500/20 text-purple-400",
                  )}>
                    {getTipoIcon(eventoSelecionado.tipo)}
                  </div>
                  <div>
                    <DialogTitle>{eventoSelecionado.nome}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getTipoBadge(eventoSelecionado.tipo)}
                      {getStatusBadge(eventoSelecionado.status)}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Info básica */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Data</span>
                    </div>
                    <p className="font-medium">{eventoSelecionado.data}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Horário</span>
                    </div>
                    <p className="font-medium">{eventoSelecionado.horario}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Local</span>
                  </div>
                  <p className="font-medium">{eventoSelecionado.local}</p>
                  <p className="text-sm text-muted-foreground">{eventoSelecionado.endereco}</p>
                </div>

                {/* Alunos */}
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">Alunos Inscritos</span>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {eventoSelecionado.alunosConfirmados}/{eventoSelecionado.alunosInscritos}
                    </Badge>
                  </div>
                </div>

                {/* Instruções */}
                {eventoSelecionado.instrucoes && (
                  <div className="space-y-3">
                    <p className="font-medium flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      Instruções
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        <Shirt className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Uniforme</p>
                          <p className="text-sm text-muted-foreground">
                            {eventoSelecionado.instrucoes.uniforme}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        <DollarSign className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Taxa</p>
                          <p className="text-sm text-muted-foreground">
                            {eventoSelecionado.instrucoes.taxa}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Documentos</p>
                          <p className="text-sm text-muted-foreground">
                            {eventoSelecionado.instrucoes.documentos}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-500">Atenção</p>
                          <p className="text-sm text-muted-foreground">
                            {eventoSelecionado.instrucoes.horarioLimite}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="w-full sm:w-auto">
                  Ver lista de alunos
                </Button>
                <Button className="w-full sm:w-auto">
                  Gerenciar inscrições
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
