"use client"

import { useMemo, useState } from "react"
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  MapPin,
  Search,
  Trophy,
  Users,
  Wallet,
  XCircle,
} from "lucide-react"
import type { TeacherAppEventsData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"

function mapTypeLabel(type: TeacherAppEventsData["upcomingEvents"][number]["type"]) {
  if (type === "competition") return "Competição"
  if (type === "seminar") return "Seminário"
  if (type === "graduation_exam") return "Exame"
  if (type === "festival") return "Festival"
  if (type === "special_class") return "Aula especial"
  return "Workshop"
}

function mapStatusLabel(status: TeacherAppEventsData["upcomingEvents"][number]["status"]) {
  if (status === "scheduled") return "Agendado"
  if (status === "completed") return "Realizado"
  return "Cancelado"
}

function mapParticipantStatusLabel(
  status: TeacherAppEventsData["upcomingEvents"][number]["participants"][number]["status"]
) {
  if (status === "confirmed") return "Confirmado"
  if (status === "invited") return "Convidado"
  if (status === "maybe") return "Talvez"
  if (status === "declined") return "Não vai"
  return "Pagamento pendente"
}

function participantStatusTone(
  status: TeacherAppEventsData["upcomingEvents"][number]["participants"][number]["status"]
) {
  if (status === "confirmed") return "default" as const
  if (status === "declined") return "destructive" as const
  return "outline" as const
}

export function TeacherEventsScreen({
  data,
  feedback,
  isSavingParticipant,
  onAddParticipant,
}: {
  data: TeacherAppEventsData
  feedback: string | null
  isSavingParticipant: boolean
  onAddParticipant: (eventId: string, userId: string) => void
}) {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [search, setSearch] = useState("")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const selectedEvent =
    data.upcomingEvents.find((event) => event.id === selectedEventId) ?? null

  const filteredParticipants = useMemo(
    () =>
      data.availableParticipants.filter((participant) =>
        participant.name.toLowerCase().includes(search.toLowerCase()) ||
        participant.email?.toLowerCase().includes(search.toLowerCase())
      ),
    [data.availableParticipants, search]
  )

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Eventos</h1>
        <p className="text-muted-foreground">Eventos que você organiza ou acompanha no seu escopo</p>
      </div>

      {feedback ? (
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-foreground">
          {feedback}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-primary/20 bg-primary/10">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{data.metrics.upcoming}</p>
            <p className="text-xs text-muted-foreground">Próximos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{data.metrics.coordinating}</p>
            <p className="text-xs text-muted-foreground">Responsável</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{data.metrics.studentsLinked}</p>
            <p className="text-xs text-muted-foreground">Participações</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="text-xs">
            <Calendar className="mr-1 h-4 w-4" />
            Próximos
          </TabsTrigger>
          <TabsTrigger value="participating" className="text-xs">
            <Users className="mr-1 h-4 w-4" />
            Participando
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <Trophy className="mr-1 h-4 w-4" />
            Passados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {data.upcomingEvents.length === 0 ? (
            <AppEmptyState message="Nenhum evento próximo vinculado ao seu perfil." />
          ) : (
            data.upcomingEvents.map((event) => (
              <Card key={event.id} className="transition-colors hover:bg-secondary/50">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{event.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{event.date} às {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <Badge variant="outline">{mapTypeLabel(event.type)}</Badge>
                      <Badge>{mapStatusLabel(event.status)}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-2">
                    <span className="text-sm text-muted-foreground">
                      {event.isCoordinator ? "Você é responsável" : "Você participa"}
                    </span>
                    <span className="text-sm font-medium">{event.participantCount}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="participating" className="mt-4 space-y-3">
          {data.participatingEvents.length === 0 ? (
            <AppEmptyState message="Sem eventos de participação no momento." />
          ) : (
            data.participatingEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date} às {event.time}
                      </p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                    <Badge>{mapStatusLabel(event.status)}</Badge>
                  </div>
                  <Button type="button" variant="outline" className="w-full" onClick={() => setSelectedEventId(event.id)}>
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {data.pastEvents.length === 0 ? (
            <AppEmptyState message="Sem eventos passados para mostrar." />
          ) : (
            data.pastEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                      <p className="text-sm text-muted-foreground">{event.modality}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{mapTypeLabel(event.type)}</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">{event.participantCount} participantes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm">
        <GraduationCap className="h-4 w-4 text-primary" />
        <span>Eventos e evolução podem ser acompanhados de forma coordenada pela academia.</span>
      </div>

      <Dialog open={selectedEvent != null} onOpenChange={(open) => !open && setSelectedEventId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.date} às {selectedEvent?.time}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border p-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {selectedEvent.participantCount}/{selectedEvent.capacity} participantes
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{selectedEvent.modality}</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    Responsável: {selectedEvent.organizer ?? "Não definido"}
                  </p>
                </div>
                <div className="rounded-lg border p-4 text-sm">
                  <p className="font-medium text-foreground">Detalhes</p>
                  <p className="mt-2 text-muted-foreground">
                    {selectedEvent.notes ?? "Sem observações adicionais para este evento."}
                  </p>
                  {selectedEvent.registrationFeeAmountLabel ? (
                    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-foreground">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>Taxa de inscrição: {selectedEvent.registrationFeeAmountLabel}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-medium">Participantes</p>
                </div>
                <div className="max-h-[240px] divide-y overflow-y-auto">
                  {selectedEvent.participants.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground">
                      Nenhum participante adicionado neste evento.
                    </div>
                  ) : (
                    selectedEvent.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {participant.role === "athlete" ? "Atleta" : "Equipe"} • {participant.modality}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={participantStatusTone(participant.status)}>
                            {participantStatusLabelIcon(participant.status)}
                            {mapParticipantStatusLabel(participant.status)}
                          </Badge>
                          {participant.paymentStatus ? (
                            <span className="text-xs text-muted-foreground">
                              Financeiro: {mapPaymentStatusLabel(participant.paymentStatus)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedEvent.isCoordinator && data.permissions.manageEvents ? (
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adicionar participante</label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="pl-9"
                        placeholder="Buscar por nome ou e-mail"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 space-y-2 overflow-y-auto">
                    {filteredParticipants.map((participant) => {
                      const alreadyAdded = Boolean(
                        selectedEvent.participants.some((item) => item.userId === participant.userId)
                      )

                      return (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium text-foreground">{participant.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {participant.role === "athlete" ? "Atleta" : "Equipe"} • {participant.modality}
                            </p>
                            {participant.email ? (
                              <p className="text-xs text-muted-foreground">{participant.email}</p>
                            ) : null}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            disabled={alreadyAdded || isSavingParticipant || !selectedEvent.registrationsOpen}
                            onClick={() => onAddParticipant(selectedEvent.id, participant.userId)}
                          >
                            {alreadyAdded ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Adicionado
                              </>
                            ) : (
                              "Adicionar"
                            )}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedEventId(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function participantStatusLabelIcon(
  status: TeacherAppEventsData["upcomingEvents"][number]["participants"][number]["status"]
) {
  if (status === "confirmed") {
    return <CheckCircle2 className="mr-1 h-3 w-3" />
  }

  if (status === "payment_pending") {
    return <Wallet className="mr-1 h-3 w-3" />
  }

  if (status === "declined") {
    return <XCircle className="mr-1 h-3 w-3" />
  }

  return <Clock className="mr-1 h-3 w-3" />
}

function mapPaymentStatusLabel(
  status: "pending" | "paid" | "overdue" | "cancelled"
) {
  if (status === "paid") return "Pago"
  if (status === "overdue") return "Vencido"
  if (status === "cancelled") return "Cancelado"
  return "Pendente"
}
