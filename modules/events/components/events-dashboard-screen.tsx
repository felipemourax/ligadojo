"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit,
  Loader2,
  MapPin,
  Plus,
  Search,
  Target,
  Trash2,
  Trophy,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateWeekCalendar } from "@/components/ui/date-week-calendar"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type {
  EventDashboardData,
  EventDashboardEventRecord,
  EventDashboardParticipantRecord,
  EventDashboardStatus,
  EventDashboardType,
} from "@/apps/api/src/modules/events/domain/event-dashboard"
import {
  addEventParticipant,
  confirmEventParticipantPayment,
  createEvent,
  deleteEvent,
  getEventsDashboard,
  removeEventParticipant,
  updateEvent,
  updateEventParticipantStatus,
  updateEventRegistrationsState,
} from "@/modules/events/services"

const statusColors: Record<EventDashboardStatus, string> = {
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<EventDashboardStatus, string> = {
  scheduled: "Agendado",
  completed: "Realizado",
  cancelled: "Cancelado",
}

const typeColors: Record<EventDashboardType, string> = {
  competition: "bg-red-500/10 text-red-500 border-red-500/20",
  seminar: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  graduation_exam: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  workshop: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  festival: "bg-green-500/10 text-green-500 border-green-500/20",
  special_class: "bg-primary/10 text-primary border-primary/20",
}

const typeLabels: Record<EventDashboardType, string> = {
  competition: "Competição",
  seminar: "Seminário",
  graduation_exam: "Exame de Graduação",
  workshop: "Workshop",
  festival: "Festival",
  special_class: "Aula Especial",
}

const participantRoleLabels: Record<EventDashboardParticipantRecord["role"], string> = {
  athlete: "Atleta",
  staff: "Equipe",
}

const participantStatusLabels: Record<EventDashboardParticipantRecord["status"], string> = {
  invited: "Convidado",
  confirmed: "Confirmado",
  maybe: "Talvez",
  declined: "Não vai",
  payment_pending: "Pagamento pendente",
}

function createEventFormState() {
  return {
    name: "",
    type: "competition" as EventDashboardType,
    date: "",
    time: "",
    modalityId: "all",
    location: "",
    organizerName: "",
    teacherProfileId: "none",
    capacity: "20",
    hasRegistrationFee: "no",
    registrationFeeAmount: "",
    registrationFeeDueDays: "0",
    notes: "",
  }
}

function toFormState(event: EventDashboardEventRecord) {
  return {
    name: event.name,
    type: event.type,
    date: event.date,
    time: event.time,
    modalityId: event.modalityId ?? "all",
    location: event.location,
    organizerName: event.organizer ?? "",
    teacherProfileId: event.teacherProfileId ?? "none",
    capacity: String(event.capacity),
    hasRegistrationFee: event.hasRegistrationFee ? "yes" : "no",
    registrationFeeAmount: event.registrationFeeAmount != null ? String(event.registrationFeeAmount) : "",
    registrationFeeDueDays: String(event.registrationFeeDueDays ?? 0),
    notes: event.notes ?? "",
  }
}

export function EventsDashboardScreen() {
  const [dashboard, setDashboard] = useState<EventDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CARD" | "BOLETO" | "CASH">("PIX")
  const [paymentParticipant, setPaymentParticipant] = useState<{ id: string; name: string } | null>(null)
  const [searchParticipant, setSearchParticipant] = useState("")
  const [participantSearch, setParticipantSearch] = useState("")
  const [eventForm, setEventForm] = useState(createEventFormState())
  const [saving, setSaving] = useState(false)
  const [updatingParticipantId, setUpdatingParticipantId] = useState<string | null>(null)
  const [updatingRegistrations, setUpdatingRegistrations] = useState(false)
  const [runningEventAction, setRunningEventAction] = useState<string | null>(null)
  const todayKey = toDateKey(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const response = await getEventsDashboard()
        if (!active) return
        setDashboard(response.dashboard)
        setSelectedEventId((current) => current ?? response.dashboard.events[0]?.id ?? null)
      } catch (loadError) {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os eventos.")
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const events = dashboard?.events ?? []
  const pastEvents = dashboard?.pastEvents ?? []
  const availableParticipants = dashboard?.availableParticipants ?? []
  const effectiveSelectedDate = selectedDate ?? todayKey
  const filteredEvents = useMemo(
    () => events.filter((event) => event.date === effectiveSelectedDate),
    [effectiveSelectedDate, events]
  )
  const selectedEvent = filteredEvents.find((event) => event.id === selectedEventId) ?? filteredEvents[0] ?? null

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(events[0]?.date ?? todayKey)
      return
    }

    if (filteredEvents.length === 0) {
      setSelectedEventId(null)
      return
    }

    if (!selectedEvent) {
      setSelectedEventId(filteredEvents[0].id)
    }
  }, [events, filteredEvents, selectedDate, selectedEvent, todayKey])

  const filteredAvailableParticipants = useMemo(
    () =>
      availableParticipants.filter((participant) =>
        participant.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
        participant.email?.toLowerCase().includes(participantSearch.toLowerCase())
      ),
    [availableParticipants, participantSearch]
  )

  const filteredParticipants = useMemo(
    () =>
      (selectedEvent?.participants ?? []).filter((participant) =>
        participant.name.toLowerCase().includes(searchParticipant.toLowerCase())
      ),
    [searchParticipant, selectedEvent]
  )

  function openCreateDialog() {
    setEditingEventId(null)
    setEventForm(createEventFormState())
    setShowEventDialog(true)
  }

  function openEditDialog() {
    if (!selectedEvent) return
    setEditingEventId(selectedEvent.id)
    setEventForm(toFormState(selectedEvent))
    setShowEventDialog(true)
  }

  async function submitEvent() {
    if (!eventForm.name || !eventForm.date || !eventForm.time || !eventForm.location) {
      setError("Preencha nome, data, horário e local.")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const payload = {
        name: eventForm.name,
        type: eventForm.type,
        date: eventForm.date,
        time: eventForm.time,
        modalityId: eventForm.modalityId === "all" ? null : eventForm.modalityId,
        location: eventForm.location,
        organizerName: eventForm.organizerName || null,
        teacherProfileId: eventForm.teacherProfileId === "none" ? null : eventForm.teacherProfileId,
        capacity: Number.parseInt(eventForm.capacity || "0", 10) || 0,
        hasRegistrationFee: eventForm.hasRegistrationFee === "yes",
        registrationFeeAmount:
          eventForm.hasRegistrationFee === "yes" && eventForm.registrationFeeAmount
            ? Number(eventForm.registrationFeeAmount)
            : null,
        registrationFeeDueDays:
          eventForm.hasRegistrationFee === "yes"
            ? Number.parseInt(eventForm.registrationFeeDueDays || "0", 10) || 0
            : null,
        registrationsOpen: selectedEvent?.registrationsOpen ?? true,
        notes: eventForm.notes || null,
      }

      let dashboardResponse: Awaited<ReturnType<typeof updateEvent>>["dashboard"]
      let nextSelectedEventId: string | null = selectedEventId

      if (editingEventId) {
        const response = await updateEvent(editingEventId, {
          ...payload,
          status: selectedEvent?.status ?? "scheduled",
        })
        dashboardResponse = response.dashboard
        nextSelectedEventId = editingEventId
      } else {
        const response = await createEvent(payload)
        dashboardResponse = response.dashboard
        nextSelectedEventId = response.createdEventId
      }

      setDashboard(dashboardResponse)
      setSelectedDate(payload.date)
      setSelectedEventId(nextSelectedEventId)
      setShowEventDialog(false)
      setEditingEventId(null)
      setEventForm(createEventFormState())
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível salvar o evento.")
    } finally {
      setSaving(false)
    }
  }

  async function onAddParticipant(userId: string) {
    if (!selectedEvent) return

    try {
      setUpdatingParticipantId(userId)
      setError(null)
      const response = await addEventParticipant(selectedEvent.id, userId)
      setDashboard(response.dashboard)
    } catch (participantError) {
      setError(participantError instanceof Error ? participantError.message : "Não foi possível adicionar o participante.")
    } finally {
      setUpdatingParticipantId(null)
    }
  }

  async function onRemoveParticipant(participantId: string) {
    if (!selectedEvent) return

    try {
      setUpdatingParticipantId(participantId)
      setError(null)
      const response = await removeEventParticipant(selectedEvent.id, participantId)
      setDashboard(response.dashboard)
    } catch (participantError) {
      setError(participantError instanceof Error ? participantError.message : "Não foi possível remover o participante.")
    } finally {
      setUpdatingParticipantId(null)
    }
  }

  async function onUpdateParticipantStatus(
    participantId: string,
    status: "invited" | "confirmed" | "maybe" | "declined"
  ) {
    if (!selectedEvent) return

    try {
      setUpdatingParticipantId(participantId)
      setError(null)
      const response = await updateEventParticipantStatus(selectedEvent.id, participantId, status)
      setDashboard(response.dashboard)
    } catch (participantError) {
      setError(participantError instanceof Error ? participantError.message : "Não foi possível atualizar o status.")
    } finally {
      setUpdatingParticipantId(null)
    }
  }

  async function onConfirmPayment() {
    if (!selectedEvent || !paymentParticipant) return

    try {
      setUpdatingParticipantId(paymentParticipant.id)
      setError(null)
      const response = await confirmEventParticipantPayment(
        selectedEvent.id,
        paymentParticipant.id,
        paymentMethod
      )
      setDashboard(response.dashboard)
      setShowPaymentDialog(false)
      setPaymentParticipant(null)
    } catch (participantError) {
      setError(participantError instanceof Error ? participantError.message : "Não foi possível registrar o pagamento.")
    } finally {
      setUpdatingParticipantId(null)
    }
  }

  async function onToggleRegistrations() {
    if (!selectedEvent) return

    try {
      setUpdatingRegistrations(true)
      setError(null)
      const response = await updateEventRegistrationsState(selectedEvent.id, !selectedEvent.registrationsOpen)
      setDashboard(response.dashboard)
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Não foi possível atualizar as inscrições.")
    } finally {
      setUpdatingRegistrations(false)
    }
  }

  async function runEventStatusAction(status: "completed" | "cancelled") {
    if (!selectedEvent) return

    try {
      setRunningEventAction(status)
      setError(null)
      const response = await updateEvent(selectedEvent.id, {
        ...basePayloadFromEvent(selectedEvent),
        status,
        registrationsOpen: false,
      })
      setDashboard(response.dashboard)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Não foi possível atualizar o evento.")
    } finally {
      setRunningEventAction(null)
    }
  }

  async function runDeleteAction() {
    if (!selectedEvent) return

    try {
      setRunningEventAction("delete")
      setError(null)
      const response = await deleteEvent(selectedEvent.id)
      setDashboard(response.dashboard)
      setSelectedEventId(response.dashboard.events[0]?.id ?? null)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Não foi possível excluir o evento.")
    } finally {
      setRunningEventAction(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEventId ? "Editar evento" : "Novo evento"}</DialogTitle>
            <DialogDescription>
              Configure o evento da academia e deixe a lista pronta para confirmações.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-name">Nome do evento</Label>
              <Input id="event-name" value={eventForm.name} onChange={(event) => setEventForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-date">Data</Label>
                <Input id="event-date" type="date" value={eventForm.date} onChange={(event) => setEventForm((current) => ({ ...current, date: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-time">Horário</Label>
                <Input id="event-time" type="time" value={eventForm.time} onChange={(event) => setEventForm((current) => ({ ...current, time: event.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={eventForm.type} onValueChange={(value) => setEventForm((current) => ({ ...current, type: value as EventDashboardType }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="competition">Competição</SelectItem>
                    <SelectItem value="seminar">Seminário</SelectItem>
                    <SelectItem value="graduation_exam">Exame de Graduação</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="special_class">Aula Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Modalidade</Label>
                <Select value={eventForm.modalityId} onValueChange={(value) => setEventForm((current) => ({ ...current, modalityId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Misto</SelectItem>
                    {(dashboard?.references.modalities ?? []).map((modality) => (
                      <SelectItem key={modality.id} value={modality.id}>{modality.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-location">Local</Label>
              <Input id="event-location" value={eventForm.location} onChange={(event) => setEventForm((current) => ({ ...current, location: event.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-organizer">Responsável</Label>
                <Input id="event-organizer" value={eventForm.organizerName} onChange={(event) => setEventForm((current) => ({ ...current, organizerName: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-capacity">Capacidade</Label>
                <Input id="event-capacity" type="number" min="1" value={eventForm.capacity} onChange={(event) => setEventForm((current) => ({ ...current, capacity: event.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Professor responsável</Label>
              <Select value={eventForm.teacherProfileId} onValueChange={(value) => setEventForm((current) => ({ ...current, teacherProfileId: value }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não vincular</SelectItem>
                  {(dashboard?.references.teachers ?? []).map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Evento com taxa?</Label>
                <Select value={eventForm.hasRegistrationFee} onValueChange={(value) => setEventForm((current) => ({ ...current, hasRegistrationFee: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Não</SelectItem>
                    <SelectItem value="yes">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-fee">Valor da taxa</Label>
                <Input
                  id="event-fee"
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={eventForm.hasRegistrationFee !== "yes"}
                  value={eventForm.registrationFeeAmount}
                  onChange={(event) => setEventForm((current) => ({ ...current, registrationFeeAmount: event.target.value }))}
                />
              </div>
            </div>
            {eventForm.hasRegistrationFee === "yes" ? (
              <div className="grid gap-2">
                <Label htmlFor="event-fee-due-days">Dias para vencimento da cobrança</Label>
                <Input
                  id="event-fee-due-days"
                  type="number"
                  min="0"
                  value={eventForm.registrationFeeDueDays}
                  onChange={(event) => setEventForm((current) => ({ ...current, registrationFeeDueDays: event.target.value }))}
                />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="event-notes">Observações</Label>
              <Textarea id="event-notes" value={eventForm.notes} onChange={(event) => setEventForm((current) => ({ ...current, notes: event.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>Cancelar</Button>
            <Button onClick={submitEvent} disabled={saving}>{saving ? "Salvando..." : editingEventId ? "Salvar evento" : "Criar evento"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddParticipantDialog} onOpenChange={setShowAddParticipantDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar participante</DialogTitle>
            <DialogDescription>Inclua atletas ou equipe no evento selecionado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar pessoa..." value={participantSearch} onChange={(event) => setParticipantSearch(event.target.value)} className="pl-9" />
            </div>
            {selectedEvent && !selectedEvent.registrationsOpen ? (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-700">
                Inscrições fechadas para este evento. Reabra as inscrições para incluir novos participantes.
              </div>
            ) : (
              <div className="max-h-[320px] space-y-2 overflow-y-auto">
                {filteredAvailableParticipants.map((participant) => (
                  <button
                    key={participant.id}
                    type="button"
                    onClick={() => onAddParticipant(participant.userId)}
                    disabled={
                      Boolean(selectedEvent?.participants.some((item) => item.userId === participant.userId)) ||
                      updatingParticipantId === participant.userId
                    }
                    className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {participantRoleLabels[participant.role]} | {participant.modality}
                      </p>
                      {participant.email ? (
                        <p className="text-xs text-muted-foreground">{participant.email}</p>
                      ) : null}
                    </div>
                    {updatingParticipantId === participant.userId ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddParticipantDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
            <DialogDescription>
              Confirme o pagamento de {paymentParticipant?.name ?? "participante"} para validar a presença no evento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label>Forma de pagamento</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "PIX" | "CARD" | "BOLETO" | "CASH")}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="CARD">Cartão</SelectItem>
                <SelectItem value="BOLETO">Boleto</SelectItem>
                <SelectItem value="CASH">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Voltar</Button>
            <Button onClick={onConfirmPayment} disabled={!paymentParticipant || Boolean(updatingParticipantId)}>
              {updatingParticipantId ? "Registrando..." : "Confirmar pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Eventos</h1>
            <p className="text-muted-foreground">Gerencie competições, seminários e eventos internos da academia.</p>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard title="Próximos eventos" value={String(events.length)} icon={Trophy} tone="primary" />
          <MetricCard title="Competições" value={String(events.filter((event) => event.type === "competition").length)} icon={Target} tone="danger" />
          <MetricCard title="Seminários" value={String(events.filter((event) => event.type === "seminar").length)} icon={Calendar} tone="info" />
          <MetricCard title="Participantes" value={String(events.reduce((total, event) => total + event.participants.length, 0))} icon={Users} tone="success" />
        </div>

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-start">
              <Button className="gap-2" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Novo evento
              </Button>
            </div>
            <DateWeekCalendar
              selectedDate={effectiveSelectedDate}
              onSelectDate={setSelectedDate}
              hasItems={(dateKey) => events.some((event) => event.date === dateKey)}
            />
            <div className="-mx-1 overflow-x-auto pb-2">
              <div className="flex min-w-full gap-4 px-1">
                {filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    className={`w-[320px] min-w-[320px] cursor-pointer transition-all hover:bg-muted/50 sm:w-[360px] sm:min-w-[360px] ${selectedEvent?.id === event.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          <CardDescription>
                            {formatDate(event.date)} às {event.time}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={statusColors[event.status]}>{statusLabels[event.status]}</Badge>
                          <Badge className={typeColors[event.type]}>{typeLabels[event.type]}</Badge>
                          {!event.registrationsOpen ? (
                            <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-700">
                              Fechado para inscrições
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Responsável: {event.organizer ?? "Não definido"}</span>
                        </div>
                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-sm text-muted-foreground">
                            {event.participants.length} participante{event.participants.length !== 1 ? "s" : ""} | {event.modality}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Nenhum evento agendado para {formatDate(effectiveSelectedDate)}.
                </CardContent>
              </Card>
            ) : null}

            {selectedEvent ? (
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle className="text-base font-medium">{selectedEvent.name}</CardTitle>
                      <CardDescription>
                        {selectedEvent.location} | {selectedEvent.organizer ?? "Responsável não definido"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openEditDialog}
                        disabled={selectedEvent.status !== "scheduled"}
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddParticipantDialog(true)}
                        disabled={!selectedEvent.registrationsOpen || selectedEvent.status !== "scheduled"}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Adicionar participante
                      </Button>
                      <Button size="sm" onClick={onToggleRegistrations} disabled={updatingRegistrations || selectedEvent.status !== "scheduled"}>
                        {updatingRegistrations
                          ? "Atualizando..."
                          : selectedEvent.registrationsOpen
                            ? "Fechar inscrições"
                            : "Abrir inscrições"}
                      </Button>
                      {selectedEvent.status === "scheduled" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void runEventStatusAction("completed")}
                          disabled={runningEventAction === "completed"}
                        >
                          {runningEventAction === "completed" ? "Salvando..." : "Marcar realizado"}
                        </Button>
                      ) : null}
                      {selectedEvent.status === "scheduled" && selectedEvent.participants.length > 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void runEventStatusAction("cancelled")}
                          disabled={runningEventAction === "cancelled"}
                        >
                          {runningEventAction === "cancelled" ? "Cancelando..." : "Cancelar evento"}
                        </Button>
                      ) : null}
                      {selectedEvent.status === "scheduled" && selectedEvent.participants.length === 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void runDeleteAction()}
                          disabled={runningEventAction === "delete"}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          {runningEventAction === "delete" ? "Excluindo..." : "Excluir evento"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedEvent.registrationsOpen ? (
                    <div className="mb-4">
                      <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-700">
                        Fechado para inscrições
                      </Badge>
                    </div>
                  ) : null}
                  <div className="grid gap-4 md:grid-cols-3">
                    <SummaryBlock label="Capacidade" value={`${selectedEvent.participants.length}/${selectedEvent.capacity}`} />
                    <SummaryBlock label="Confirmados" value={String(selectedEvent.participants.filter((item) => item.status === "confirmed").length)} />
                    <SummaryBlock label="Modalidade" value={selectedEvent.modality} />
                  </div>
                  {selectedEvent.hasRegistrationFee ? (
                    <div className="mt-4 rounded-lg border p-4 text-sm text-muted-foreground">
                      Taxa de inscrição: <span className="font-medium text-foreground">{formatCurrency(selectedEvent.registrationFeeAmount ?? 0)}</span>
                    </div>
                  ) : null}
                  <div className="mt-4 rounded-lg border">
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-medium">Participantes do evento</p>
                    </div>
                    <div className="max-h-[320px] divide-y overflow-y-auto">
                      {selectedEvent.participants.length > 0 ? (
                        selectedEvent.participants.map((participant) => (
                          <div key={participant.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{participant.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {participantRoleLabels[participant.role]} | {participant.modality}
                              </p>
                              {participant.paymentStatus ? (
                                <p className="text-xs text-muted-foreground">
                                  Financeiro: {mapPaymentStatusLabel(participant.paymentStatus)}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={participantStatusVariant(participant.status)}>
                                {participantStatusIcon(participant.status)}
                                {participantStatusLabels[participant.status]}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => onUpdateParticipantStatus(participant.id, "invited")}>
                                    Marcar como convidado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => onUpdateParticipantStatus(participant.id, "confirmed")}>
                                    Marcar como confirmado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => onUpdateParticipantStatus(participant.id, "maybe")}>
                                    Marcar como talvez
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => onUpdateParticipantStatus(participant.id, "declined")}>
                                    Marcar como não vai
                                  </DropdownMenuItem>
                                  {participant.canMarkAsPaid ? (
                                    <DropdownMenuItem
                                      onSelect={() => {
                                        setPaymentParticipant({ id: participant.id, name: participant.name })
                                        setShowPaymentDialog(true)
                                      }}
                                    >
                                      Registrar pagamento
                                    </DropdownMenuItem>
                                  ) : null}
                                  <DropdownMenuItem onSelect={() => onRemoveParticipant(participant.id)} disabled={updatingParticipantId === participant.id}>
                                    Remover do evento
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-sm text-muted-foreground">
                          Nenhum participante adicionado a este evento ainda.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Participantes do evento</CardTitle>
                    <CardDescription>Gerencie confirmação, pagamento e presença por evento.</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar participante..." value={searchParticipant} onChange={(event) => setSearchParticipant(event.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[420px] overflow-y-auto rounded-lg border">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        <TableHead>Participante</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Modalidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Financeiro</TableHead>
                        <TableHead className="text-right" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                  {participant.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{participant.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{participantRoleLabels[participant.role]}</TableCell>
                          <TableCell>{participant.modality}</TableCell>
                          <TableCell>
                            <Badge variant={participantStatusVariant(participant.status)}>
                              {participantStatusIcon(participant.status)}
                              {participantStatusLabels[participant.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>{participant.paymentStatus ? mapPaymentStatusLabel(participant.paymentStatus) : "-"}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => onUpdateParticipantStatus(participant.id, "invited")}>
                                  Marcar como convidado
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onUpdateParticipantStatus(participant.id, "confirmed")}>
                                  Marcar como confirmado
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onUpdateParticipantStatus(participant.id, "maybe")}>
                                  Marcar como talvez
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onUpdateParticipantStatus(participant.id, "declined")}>
                                  Marcar como não vai
                                </DropdownMenuItem>
                                {participant.canMarkAsPaid ? (
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      setPaymentParticipant({ id: participant.id, name: participant.name })
                                      setShowPaymentDialog(true)
                                    }}
                                  >
                                    Registrar pagamento
                                  </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuItem onSelect={() => onRemoveParticipant(participant.id)} disabled={updatingParticipantId === participant.id}>
                                  Remover do evento
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {selectedEvent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Resumo de participação</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4">
                  <ParticipationCard title="Confirmados" value={String(selectedEvent.participants.filter((participant) => participant.status === "confirmed").length)} />
                  <ParticipationCard title="Convidados" value={String(selectedEvent.participants.filter((participant) => participant.status === "invited").length)} />
                  <ParticipationCard title="Talvez" value={String(selectedEvent.participants.filter((participant) => participant.status === "maybe").length)} />
                  <ParticipationCard title="Pagamento pendente" value={String(selectedEvent.participants.filter((participant) => participant.status === "payment_pending").length)} />
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Histórico de eventos</CardTitle>
                <CardDescription>Eventos realizados e participação registrada pela academia.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pastEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {event.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-muted-foreground">{event.modality} | {formatDate(event.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={typeColors[event.type]}>{typeLabels[event.type]}</Badge>
                      <div className="min-w-[72px] text-right text-sm text-muted-foreground">
                        {event.participants} pessoas
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Indicadores do período</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <IndicatorCard title="Presença média" value={`${computeConfirmationRate(events)}%`} progress={computeConfirmationRate(events)} />
                <IndicatorCard title="Capacidade média ocupada" value={`${computeOccupancyRate(events)}%`} progress={computeOccupancyRate(events)} />
                <IndicatorCard title="Eventos realizados" value={String(pastEvents.length)} progress={100} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

function basePayloadFromEvent(event: EventDashboardEventRecord) {
  return {
    name: event.name,
    type: event.type,
    date: event.date,
    time: event.time,
    modalityId: event.modalityId,
    location: event.location,
    organizerName: event.organizer,
    teacherProfileId: event.teacherProfileId,
    capacity: event.capacity,
    hasRegistrationFee: event.hasRegistrationFee,
    registrationFeeAmount: event.registrationFeeAmount,
    registrationFeeDueDays: event.registrationFeeDueDays,
    registrationsOpen: event.registrationsOpen,
    notes: event.notes,
  }
}

function participantStatusVariant(status: EventDashboardParticipantRecord["status"]) {
  if (status === "confirmed") return "default" as const
  if (status === "declined") return "destructive" as const
  return "outline" as const
}

function participantStatusIcon(status: EventDashboardParticipantRecord["status"]) {
  if (status === "confirmed") return <CheckCircle2 className="mr-1 h-3 w-3" />
  if (status === "payment_pending") return <Wallet className="mr-1 h-3 w-3" />
  if (status === "declined") return <XCircle className="mr-1 h-3 w-3" />
  return <Clock className="mr-1 h-3 w-3" />
}

function mapPaymentStatusLabel(status: "pending" | "paid" | "overdue" | "cancelled") {
  if (status === "paid") return "Pago"
  if (status === "overdue") return "Vencido"
  if (status === "cancelled") return "Cancelado"
  return "Pendente"
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  icon: typeof Trophy
  tone: "primary" | "danger" | "info" | "success"
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    danger: "bg-red-500/10 text-red-500",
    info: "bg-blue-500/10 text-blue-500",
    success: "bg-green-500/10 text-green-500",
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}

function ParticipationCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}

function IndicatorCard({ title, value, progress }: { title: string; value: string; progress: number }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

function computeConfirmationRate(events: EventDashboardEventRecord[]) {
  const total = events.reduce((sum, event) => sum + event.participants.length, 0)
  const confirmed = events.reduce(
    (sum, event) => sum + event.participants.filter((participant) => participant.status === "confirmed").length,
    0
  )

  return total > 0 ? Math.round((confirmed / total) * 100) : 0
}

function computeOccupancyRate(events: EventDashboardEventRecord[]) {
  const capacity = events.reduce((sum, event) => sum + Math.max(event.capacity, 0), 0)
  const participants = events.reduce((sum, event) => sum + event.participants.length, 0)

  return capacity > 0 ? Math.round((participants / capacity) * 100) : 0
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function toDateKey(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
