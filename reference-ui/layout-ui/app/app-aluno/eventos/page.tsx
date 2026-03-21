"use client"

import { useState } from "react"
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hourglass,
  Info,
  Shirt,
  DollarSign,
  FileText,
  Timer,
  CalendarDays,
  Medal,
  Swords,
  GraduationCap,
  History,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"

type EventStatus = "open" | "enrolled" | "waiting" | "full" | "closed" | "cancelled"
type EnrollmentStatus = "confirmed" | "pending" | "waiting" | "cancelled"
type EventType = "competition" | "seminar" | "graduation" | "internal"

interface Event {
  id: string
  title: string
  type: EventType
  date: string
  time: string
  location: string
  description: string
  status: EventStatus
  enrollmentStatus?: EnrollmentStatus
  spotsTotal: number
  spotsTaken: number
  waitingList: number
  modality: string
  price?: number
  uniform?: string
  documents?: string[]
  deadline?: string
  instructions?: string
  isPast?: boolean
}

const eventTypeLabels: Record<EventType, { label: string; icon: typeof Trophy }> = {
  competition: { label: "Competição", icon: Swords },
  seminar: { label: "Seminário", icon: GraduationCap },
  graduation: { label: "Graduação", icon: Medal },
  internal: { label: "Evento Interno", icon: Trophy },
}

const statusConfig: Record<EventStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
  open: { label: "Aberto para inscrição", variant: "default", icon: CheckCircle2 },
  enrolled: { label: "Inscrito", variant: "default", icon: CheckCircle2 },
  waiting: { label: "Lista de espera", variant: "secondary", icon: Hourglass },
  full: { label: "Vagas esgotadas", variant: "outline", icon: AlertCircle },
  closed: { label: "Encerrado", variant: "outline", icon: XCircle },
  cancelled: { label: "Cancelado", variant: "destructive", icon: XCircle },
}

const enrollmentStatusConfig: Record<EnrollmentStatus, { label: string; color: string }> = {
  confirmed: { label: "Confirmado", color: "text-green-500" },
  pending: { label: "Pendente", color: "text-yellow-500" },
  waiting: { label: "Lista de espera", color: "text-blue-500" },
  cancelled: { label: "Cancelado", color: "text-red-500" },
}

// Mock data - eventos relacionados ao aluno
const mockEvents: Event[] = [
  // Próximos eventos
  {
    id: "1",
    title: "Campeonato Estadual de Jiu-Jitsu",
    type: "competition",
    date: "2026-04-15",
    time: "08:00",
    location: "Ginásio Municipal - Centro",
    description: "Campeonato estadual com todas as faixas e categorias de peso.",
    status: "open",
    spotsTotal: 200,
    spotsTaken: 156,
    waitingList: 0,
    modality: "Jiu-Jitsu",
    price: 120,
    uniform: "Kimono branco oficial (sem patches não autorizados)",
    documents: ["RG ou CNH", "Atestado médico (até 30 dias)", "Comprovante de graduação"],
    deadline: "2026-04-10",
    instructions: "Chegue com 1 hora de antecedência. Pesagem será realizada no local. Trazer documento com foto.",
  },
  {
    id: "2",
    title: "Seminário de Guarda com Prof. Marcos",
    type: "seminar",
    date: "2026-04-05",
    time: "14:00",
    location: "Dojo Centro - Sala Principal",
    description: "Seminário técnico focado em passagens de guarda e defesas.",
    status: "enrolled",
    enrollmentStatus: "confirmed",
    spotsTotal: 30,
    spotsTaken: 28,
    waitingList: 5,
    modality: "Jiu-Jitsu",
    price: 80,
    uniform: "Kimono (qualquer cor)",
    deadline: "2026-04-03",
    instructions: "Traga caderno para anotações. Intervalo de 15 min no meio do seminário.",
  },
  {
    id: "3",
    title: "Exame de Graduação - Abril",
    type: "graduation",
    date: "2026-04-20",
    time: "10:00",
    location: "Dojo Centro - Sala Principal",
    description: "Exame de faixa para alunos elegíveis da turma de Jiu-Jitsu Adulto.",
    status: "enrolled",
    enrollmentStatus: "pending",
    spotsTotal: 15,
    spotsTaken: 12,
    waitingList: 0,
    modality: "Jiu-Jitsu",
    price: 0,
    uniform: "Kimono branco limpo",
    documents: ["Formulário de avaliação preenchido pelo professor"],
    deadline: "2026-04-18",
    instructions: "Mínimo de 75% de frequência nos últimos 3 meses. Revisão do conteúdo na semana anterior.",
  },
  {
    id: "4",
    title: "Treino Aberto de Competição",
    type: "internal",
    date: "2026-03-28",
    time: "19:00",
    location: "Dojo Centro - Tatame 2",
    description: "Treino preparatório para atletas que vão competir no estadual.",
    status: "open",
    spotsTotal: 20,
    spotsTaken: 8,
    waitingList: 0,
    modality: "Jiu-Jitsu",
    uniform: "Kimono de treino",
  },
  {
    id: "5",
    title: "Copa Inverno de Jiu-Jitsu",
    type: "competition",
    date: "2026-05-20",
    time: "09:00",
    location: "Arena Esportiva - Zona Sul",
    description: "Competição regional com premiação em todas as categorias.",
    status: "full",
    spotsTotal: 150,
    spotsTaken: 150,
    waitingList: 23,
    modality: "Jiu-Jitsu",
    price: 100,
    uniform: "Kimono oficial",
    deadline: "2026-05-15",
  },
  // Eventos passados
  {
    id: "6",
    title: "Open de Verão",
    type: "competition",
    date: "2026-02-10",
    time: "08:00",
    location: "Centro de Convenções",
    description: "Competição aberta de verão.",
    status: "closed",
    enrollmentStatus: "confirmed",
    spotsTotal: 180,
    spotsTaken: 180,
    waitingList: 0,
    modality: "Jiu-Jitsu",
    isPast: true,
  },
  {
    id: "7",
    title: "Seminário de Quedas",
    type: "seminar",
    date: "2026-01-25",
    time: "15:00",
    location: "Dojo Centro",
    description: "Técnicas de quedas e projeções.",
    status: "closed",
    enrollmentStatus: "confirmed",
    spotsTotal: 25,
    spotsTaken: 25,
    waitingList: 0,
    modality: "Jiu-Jitsu",
    isPast: true,
  },
]

export default function EventosPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [waitlistDialogOpen, setWaitlistDialogOpen] = useState(false)

  const upcomingEvents = mockEvents.filter(e => !e.isPast && e.status !== "enrolled" && e.enrollmentStatus !== "confirmed" && e.enrollmentStatus !== "pending" && e.enrollmentStatus !== "waiting")
  const myEnrollments = mockEvents.filter(e => !e.isPast && (e.enrollmentStatus === "confirmed" || e.enrollmentStatus === "pending" || e.enrollmentStatus === "waiting"))
  const pastEvents = mockEvents.filter(e => e.isPast)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    })
  }

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    })
  }

  const handleOpenDetails = (event: Event) => {
    setSelectedEvent(event)
    setDetailsOpen(true)
  }

  const handleEnroll = (event: Event) => {
    setSelectedEvent(event)
    setConfirmDialogOpen(true)
  }

  const handleJoinWaitlist = (event: Event) => {
    setSelectedEvent(event)
    setWaitlistDialogOpen(true)
  }

  const handleCancelEnrollment = (event: Event) => {
    setSelectedEvent(event)
    setCancelDialogOpen(true)
  }

  const EventCard = ({ event, showEnrollmentStatus = false }: { event: Event; showEnrollmentStatus?: boolean }) => {
    const TypeIcon = eventTypeLabels[event.type].icon
    const StatusIcon = statusConfig[event.status].icon
    const spotsLeft = event.spotsTotal - event.spotsTaken

    return (
      <Card 
        className="cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => handleOpenDetails(event)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
              event.type === "competition" && "bg-red-500/20 text-red-500",
              event.type === "seminar" && "bg-blue-500/20 text-blue-500",
              event.type === "graduation" && "bg-yellow-500/20 text-yellow-500",
              event.type === "internal" && "bg-primary/20 text-primary",
            )}>
              <TypeIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm line-clamp-2">{event.title}</h3>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              </div>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(event.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location.split(" - ")[0]}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {showEnrollmentStatus && event.enrollmentStatus ? (
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", enrollmentStatusConfig[event.enrollmentStatus].color)}
                  >
                    {enrollmentStatusConfig[event.enrollmentStatus].label}
                  </Badge>
                ) : (
                  <Badge 
                    variant={statusConfig[event.status].variant}
                    className="text-xs"
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[event.status].label}
                  </Badge>
                )}

                {event.status === "open" && (
                  <span className="text-xs text-muted-foreground">
                    <Users className="h-3 w-3 inline mr-1" />
                    {spotsLeft} vagas
                  </span>
                )}
                {event.status === "full" && event.waitingList > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {event.waitingList} na fila
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Eventos</h1>
        <p className="text-muted-foreground text-sm">
          Competições, seminários e eventos da sua academia
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{myEnrollments.length}</p>
            <p className="text-xs text-muted-foreground">Inscrições</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{upcomingEvents.length}</p>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{pastEvents.length}</p>
            <p className="text-xs text-muted-foreground">Participados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="upcoming" className="text-xs">
            Próximos
          </TabsTrigger>
          <TabsTrigger value="enrolled" className="text-xs">
            Minhas Inscrições
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs">
            Passados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhum evento disponível no momento</p>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="mt-4 space-y-3">
          {myEnrollments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Você não está inscrito em nenhum evento</p>
              </CardContent>
            </Card>
          ) : (
            myEnrollments.map(event => (
              <EventCard key={event.id} event={event} showEnrollmentStatus />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhum evento participado ainda</p>
              </CardContent>
            </Card>
          ) : (
            pastEvents.map(event => (
              <EventCard key={event.id} event={event} showEnrollmentStatus />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                    selectedEvent.type === "competition" && "bg-red-500/20 text-red-500",
                    selectedEvent.type === "seminar" && "bg-blue-500/20 text-blue-500",
                    selectedEvent.type === "graduation" && "bg-yellow-500/20 text-yellow-500",
                    selectedEvent.type === "internal" && "bg-primary/20 text-primary",
                  )}>
                    {(() => {
                      const TypeIcon = eventTypeLabels[selectedEvent.type].icon
                      return <TypeIcon className="h-6 w-6" />
                    })()}
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs">
                      {eventTypeLabels[selectedEvent.type].label}
                    </Badge>
                    <DialogTitle className="text-left">{selectedEvent.title}</DialogTitle>
                  </div>
                </div>
                <DialogDescription className="text-left mt-2">
                  {selectedEvent.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatFullDate(selectedEvent.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.time}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>

                {/* Spots */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedEvent.spotsTaken}/{selectedEvent.spotsTotal} vagas preenchidas
                    {selectedEvent.waitingList > 0 && ` (${selectedEvent.waitingList} na lista de espera)`}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <Badge 
                    variant={statusConfig[selectedEvent.status].variant}
                    className="text-sm"
                  >
                    {(() => {
                      const StatusIcon = statusConfig[selectedEvent.status].icon
                      return <StatusIcon className="h-4 w-4 mr-1" />
                    })()}
                    {statusConfig[selectedEvent.status].label}
                  </Badge>
                  {selectedEvent.enrollmentStatus && (
                    <Badge 
                      variant="outline" 
                      className={cn("ml-2 text-sm", enrollmentStatusConfig[selectedEvent.enrollmentStatus].color)}
                    >
                      Sua inscrição: {enrollmentStatusConfig[selectedEvent.enrollmentStatus].label}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Instructions Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Instruções
                  </h4>

                  {selectedEvent.price !== undefined && (
                    <div className="flex items-start gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Taxa: </span>
                        {selectedEvent.price > 0 ? `R$ ${selectedEvent.price.toFixed(2)}` : "Gratuito"}
                      </div>
                    </div>
                  )}

                  {selectedEvent.uniform && (
                    <div className="flex items-start gap-2 text-sm">
                      <Shirt className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Uniforme: </span>
                        {selectedEvent.uniform}
                      </div>
                    </div>
                  )}

                  {selectedEvent.documents && selectedEvent.documents.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Documentos necessários:</span>
                        <ul className="list-disc list-inside mt-1 text-muted-foreground">
                          {selectedEvent.documents.map((doc, i) => (
                            <li key={i}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedEvent.deadline && (
                    <div className="flex items-start gap-2 text-sm">
                      <Timer className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Prazo de inscrição: </span>
                        {formatFullDate(selectedEvent.deadline)}
                      </div>
                    </div>
                  )}

                  {selectedEvent.instructions && (
                    <div className="p-3 bg-secondary rounded-lg text-sm">
                      <p className="text-muted-foreground">{selectedEvent.instructions}</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 mt-6">
                {/* Actions based on status */}
                {selectedEvent.status === "open" && !selectedEvent.enrollmentStatus && (
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setDetailsOpen(false)
                      handleEnroll(selectedEvent)
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar Presença
                  </Button>
                )}

                {selectedEvent.status === "full" && !selectedEvent.enrollmentStatus && (
                  <Button 
                    variant="secondary"
                    className="w-full" 
                    onClick={() => {
                      setDetailsOpen(false)
                      handleJoinWaitlist(selectedEvent)
                    }}
                  >
                    <Hourglass className="h-4 w-4 mr-2" />
                    Entrar na Lista de Espera
                  </Button>
                )}

                {selectedEvent.enrollmentStatus && selectedEvent.enrollmentStatus !== "cancelled" && !selectedEvent.isPast && (
                  <Button 
                    variant="destructive"
                    className="w-full" 
                    onClick={() => {
                      setDetailsOpen(false)
                      handleCancelEnrollment(selectedEvent)
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Participação
                  </Button>
                )}

                <Button variant="outline" className="w-full" onClick={() => setDetailsOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Enrollment Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar presença</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja confirmar sua presença no evento "{selectedEvent?.title}"?
              {selectedEvent?.price && selectedEvent.price > 0 && (
                <span className="block mt-2 font-medium text-foreground">
                  Taxa de inscrição: R$ {selectedEvent.price.toFixed(2)}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => setConfirmDialogOpen(false)}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Join Waitlist Dialog */}
      <AlertDialog open={waitlistDialogOpen} onOpenChange={setWaitlistDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Entrar na lista de espera</AlertDialogTitle>
            <AlertDialogDescription>
              As vagas para "{selectedEvent?.title}" estão esgotadas. 
              Deseja entrar na lista de espera? Você será notificado caso uma vaga seja liberada.
              {selectedEvent?.waitingList && (
                <span className="block mt-2">
                  Posição na fila: {(selectedEvent.waitingList || 0) + 1}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => setWaitlistDialogOpen(false)}>
              Entrar na fila
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Enrollment Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar participação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar sua participação no evento "{selectedEvent?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setCancelDialogOpen(false)}
            >
              Cancelar participação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
