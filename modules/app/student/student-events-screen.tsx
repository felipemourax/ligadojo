"use client"

import { useMemo, useState } from "react"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  MapPin,
  Medal,
  Swords,
  Trophy,
  Users,
  Wallet,
  XCircle,
} from "lucide-react"
import type {
  StudentAppEventItem,
  StudentAppEventsData,
} from "@/apps/api/src/modules/app/domain/student-app"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StudentEventsScreenProps {
  data: StudentAppEventsData
  feedback: string | null
  pendingEventId: string | null
  pendingAction: "enroll" | "confirmed" | "maybe" | "declined" | null
  isSaving: boolean
  onSelectEvent: (
    eventId: string | null,
    action: "enroll" | "confirmed" | "maybe" | "declined" | null
  ) => void
  onConfirm: () => void
  onChooseEnrollmentResponse: (status: "confirmed" | "maybe" | "declined") => void
}

const eventTypeLabels = {
  competition: { label: "Competição", icon: Swords },
  seminar: { label: "Seminário", icon: GraduationCap },
  graduation_exam: { label: "Graduação", icon: Medal },
  workshop: { label: "Workshop", icon: GraduationCap },
  festival: { label: "Festival", icon: Trophy },
  special_class: { label: "Aula especial", icon: Trophy },
} as const

function formatDate(date: string) {
  const value = new Date(`${date}T12:00:00`)
  return value.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

function formatFullDate(date: string) {
  const value = new Date(`${date}T12:00:00`)
  return value.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function getStatusBadge(event: StudentAppEventItem) {
  if (event.enrollmentStatus === "confirmed") {
    return { label: "Confirmado", variant: "default" as const, icon: CheckCircle2 }
  }

  if (event.enrollmentStatus === "invited") {
    return { label: "Convite pendente", variant: "outline" as const, icon: Clock }
  }

  if (event.enrollmentStatus === "payment_pending") {
    return { label: "Pagar para confirmar", variant: "outline" as const, icon: Wallet }
  }

  if (event.enrollmentStatus === "maybe") {
    return { label: "Talvez", variant: "outline" as const, icon: AlertCircle }
  }

  if (event.enrollmentStatus === "declined") {
    return { label: "Não vai", variant: "outline" as const, icon: XCircle }
  }

  if (event.status === "full") {
    return { label: "Vagas esgotadas", variant: "outline" as const, icon: AlertCircle }
  }

  if (event.status === "closed") {
    return { label: "Inscrições fechadas", variant: "outline" as const, icon: XCircle }
  }

  if (event.status === "cancelled") {
    return { label: "Cancelado", variant: "destructive" as const, icon: XCircle }
  }

  return { label: "Aberto para inscrição", variant: "default" as const, icon: CheckCircle2 }
}

function EventCard({
  event,
  onOpenDetails,
  onPrimaryAction,
  primaryActionLabel,
  primaryActionDisabled,
}: {
  event: StudentAppEventItem
  onOpenDetails: () => void
  onPrimaryAction: () => void
  primaryActionLabel: string
  primaryActionDisabled: boolean
}) {
  const TypeIcon = eventTypeLabels[event.type].icon
  const statusBadge = getStatusBadge(event)
  const StatusIcon = statusBadge.icon
  const occupancy = event.capacity > 0 ? Math.round((event.participantCount / event.capacity) * 100) : 0

  return (
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <TypeIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{event.name}</p>
                <p className="text-xs text-muted-foreground">{eventTypeLabels[event.type].label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(event.date)}</span>
              <Clock className="ml-2 h-3.5 w-3.5" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{event.location}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline">{event.modalityName}</Badge>
            <Badge variant={statusBadge.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusBadge.label}
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-secondary/40 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Participantes</span>
            <span className="font-medium text-foreground">
              {event.participantCount}/{event.capacity}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-background">
            <div
              className="h-2 rounded-full bg-primary transition-[width]"
              style={{ width: `${Math.min(occupancy, 100)}%` }}
            />
          </div>
          {event.registrationFeeAmountLabel ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Taxa de inscrição: {event.registrationFeeAmountLabel}
            </p>
          ) : null}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onOpenDetails}>
            Ver detalhes
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={primaryActionDisabled}
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function StudentEventsScreen({
  data,
  feedback,
  pendingEventId,
  pendingAction,
  isSaving,
  onSelectEvent,
  onConfirm,
  onChooseEnrollmentResponse,
}: StudentEventsScreenProps) {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [detailsEventId, setDetailsEventId] = useState<string | null>(null)

  const allEvents = useMemo(
    () => [...data.upcomingEvents, ...data.myEvents, ...data.pastEvents],
    [data.myEvents, data.pastEvents, data.upcomingEvents]
  )
  const selectedEvent = useMemo(
    () => allEvents.find((event) => event.id === pendingEventId) ?? null,
    [allEvents, pendingEventId]
  )
  const detailsEvent = useMemo(
    () => allEvents.find((event) => event.id === detailsEventId) ?? null,
    [allEvents, detailsEventId]
  )
  const eventInvitesCount = useMemo(
    () => data.myEvents.filter((event) => event.enrollmentStatus === "invited").length,
    [data.myEvents]
  )

  function closeDetails() {
    setDetailsEventId(null)
  }

  function prepareAction(
    eventId: string,
    action: "enroll" | "confirmed" | "maybe" | "declined"
  ) {
    closeDetails()
    onSelectEvent(eventId, action)
  }

  function goToPayments() {
    window.location.href = "/app/student/payments"
  }

  function renderDetailsActions(event: StudentAppEventItem) {
    if (event.status === "cancelled") {
      return null
    }

    if (event.enrollmentStatus == null) {
      if (event.status !== "open") return null
      return (
        <Button type="button" onClick={() => prepareAction(event.id, "enroll")}>
          Inscrever-se
        </Button>
      )
    }

    if (event.enrollmentStatus === "payment_pending") {
      return (
        <>
          <Button type="button" variant="outline" onClick={() => prepareAction(event.id, "maybe")}>
            Talvez
          </Button>
          <Button type="button" variant="outline" onClick={() => prepareAction(event.id, "declined")}>
            Não vou
          </Button>
          <Button type="button" onClick={goToPayments}>
            Pagar para confirmar
          </Button>
        </>
      )
    }

    if (event.enrollmentStatus === "invited") {
      if (event.hasRegistrationFee) {
        return (
          <>
            <Button type="button" variant="outline" onClick={() => prepareAction(event.id, "maybe")}>
              Talvez
            </Button>
            <Button type="button" variant="outline" onClick={() => prepareAction(event.id, "declined")}>
              Não vou
            </Button>
            <Button type="button" onClick={() => prepareAction(event.id, "enroll")}>
              Pagar para confirmar
            </Button>
          </>
        )
      }

      return (
        <>
          <Button type="button" variant="outline" onClick={() => prepareAction(event.id, "maybe")}>
            Talvez
          </Button>
          <Button type="button" variant="outline" onClick={() => prepareAction(event.id, "declined")}>
            Não vou
          </Button>
          <Button type="button" onClick={() => prepareAction(event.id, "confirmed")}>
            Confirmar presença
          </Button>
        </>
      )
    }

    if (event.enrollmentStatus === "confirmed") {
      return (
        <>
          <Button type="button" variant="outline" onClick={() => prepareAction(event.id, "maybe")}>
            Talvez
          </Button>
          <Button type="button" variant="outline" onClick={() => prepareAction(event.id, "declined")}>
            Não vou
          </Button>
        </>
      )
    }

    if (event.enrollmentStatus === "maybe" || event.enrollmentStatus === "declined") {
      return (
        <>
          {event.enrollmentStatus === "declined" ? null : (
            <Button type="button" variant="outline" onClick={() => prepareAction(event.id, "declined")}>
              Não vou
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => prepareAction(event.id, "maybe")}>
            Talvez
          </Button>
          <Button
            type="button"
            onClick={() =>
              event.hasRegistrationFee
                ? prepareAction(event.id, "enroll")
                : prepareAction(event.id, "confirmed")
            }
          >
            {event.hasRegistrationFee ? "Pagar para confirmar" : "Confirmar presença"}
          </Button>
        </>
      )
    }

    return null
  }

  return (
    <div className="space-y-5 p-4">
      <section className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Eventos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe inscrições, convites, confirmações e o que já ficou no seu histórico.
        </p>
      </section>

      {feedback ? (
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          {feedback}
        </section>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-primary/20 bg-primary/10">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{data.upcomingEvents.length}</p>
            <p className="text-[10px] text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{data.myEvents.length}</p>
            <p className="text-[10px] text-muted-foreground">Meus eventos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{data.pastEvents.length}</p>
            <p className="text-[10px] text-muted-foreground">Histórico</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="gap-1.5">
            Próximos
            {data.upcomingEvents.length > 0 ? (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {data.upcomingEvents.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="gap-1.5">
            Inscrições
            {eventInvitesCount > 0 ? (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {eventInvitesCount}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="history">Passados</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {data.upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Nenhum evento disponível no momento.
              </CardContent>
            </Card>
          ) : (
            data.upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onOpenDetails={() => setDetailsEventId(event.id)}
                onPrimaryAction={() => onSelectEvent(event.id, "enroll")}
                primaryActionLabel="Inscrever-se"
                primaryActionDisabled={
                  isSaving || event.status === "full" || event.status === "closed" || event.status === "cancelled"
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-3">
          {data.myEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Você ainda não tem eventos vinculados.
              </CardContent>
            </Card>
          ) : (
            data.myEvents.map((event) => {
              const primaryLabel =
                event.enrollmentStatus === "payment_pending"
                  ? "Pagar para confirmar"
                  : event.enrollmentStatus === "invited"
                    ? "Responder convite"
                    : "Gerenciar resposta"

              return (
                <EventCard
                  key={event.id}
                  event={event}
                  onOpenDetails={() => setDetailsEventId(event.id)}
                  onPrimaryAction={() => setDetailsEventId(event.id)}
                  primaryActionLabel={primaryLabel}
                  primaryActionDisabled={false}
                />
              )
            })
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {data.pastEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Nenhum evento passado para mostrar.
              </CardContent>
            </Card>
          ) : (
            data.pastEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onOpenDetails={() => setDetailsEventId(event.id)}
                onPrimaryAction={() => setDetailsEventId(event.id)}
                primaryActionLabel="Ver detalhes"
                primaryActionDisabled={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={detailsEvent != null} onOpenChange={(open) => !open && closeDetails()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailsEvent?.name}</DialogTitle>
            <DialogDescription>
              {detailsEvent ? formatFullDate(detailsEvent.date) : null} {detailsEvent ? `às ${detailsEvent.time}` : null}
            </DialogDescription>
          </DialogHeader>
          {detailsEvent ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{detailsEvent.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {detailsEvent.participantCount}/{detailsEvent.capacity} participantes
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{detailsEvent.modalityName}</span>
              </div>
              {detailsEvent.registrationFeeAmountLabel ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-foreground">
                  Taxa de inscrição: {detailsEvent.registrationFeeAmountLabel}
                  {detailsEvent.enrollmentStatus === "payment_pending" ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Sua cobrança já foi gerada. Após o pagamento, sua participação fica confirmada.
                    </p>
                  ) : null}
                </div>
              ) : null}
              <p className="text-muted-foreground">
                {detailsEvent.description ?? "Os detalhes completos deste evento serão informados pela academia."}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDetails}>
              Fechar
            </Button>
            {detailsEvent ? renderDetailsActions(detailsEvent) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedEvent != null && pendingAction != null}
        onOpenChange={(open) => !open && onSelectEvent(null, null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "enroll"
                ? "Como você deseja responder?"
                : pendingAction === "confirmed"
                  ? "Confirmar presença"
                  : pendingAction === "maybe"
                    ? "Marcar como talvez"
                    : "Marcar como não vai"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === "enroll" ? (
                <>
                  Antes de entrar em <strong>Inscrições</strong>, escolha como deseja responder ao evento{" "}
                  <strong>{selectedEvent?.name}</strong>.
                  {selectedEvent?.registrationFeeAmountLabel ? (
                    <> Se você confirmar, a cobrança aparecerá na sua área financeira e sua confirmação ficará pendente até o pagamento.</>
                  ) : null}
                </>
              ) : pendingAction === "confirmed" ? (
                <>
                  Deseja confirmar sua presença em <strong>{selectedEvent?.name}</strong>?
                </>
              ) : pendingAction === "maybe" ? (
                <>
                  Deseja deixar sua resposta como <strong>talvez</strong> em <strong>{selectedEvent?.name}</strong>?
                </>
              ) : (
                <>
                  Deseja informar que <strong>não vai</strong> em <strong>{selectedEvent?.name}</strong>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {pendingAction === "enroll" ? (
              <>
                <Button type="button" variant="outline" onClick={() => onSelectEvent(null, null)}>
                  Voltar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onChooseEnrollmentResponse("declined")}
                  disabled={isSaving}
                >
                  {isSaving ? "Processando..." : "Não vou"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onChooseEnrollmentResponse("maybe")}
                  disabled={isSaving}
                >
                  {isSaving ? "Processando..." : "Talvez"}
                </Button>
                <Button
                  type="button"
                  onClick={() => onChooseEnrollmentResponse("confirmed")}
                  disabled={isSaving}
                >
                  {isSaving ? "Processando..." : "Confirmar"}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => onSelectEvent(null, null)}>
                  Voltar
                </Button>
                <Button type="button" onClick={onConfirm} disabled={isSaving}>
                  {isSaving
                    ? "Processando..."
                    : pendingAction === "confirmed"
                      ? "Confirmar presença"
                      : pendingAction === "maybe"
                        ? "Salvar como talvez"
                        : "Confirmar ausência"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
