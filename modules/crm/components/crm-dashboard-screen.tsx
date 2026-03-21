"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Star,
  Target,
  TrendingUp,
  UserPlus,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { fetchJson } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import type { ClassGroupEntity, ClassSessionEntity } from "@/apps/api/src/modules/classes/domain/class-group"
import type { CrmLeadEntity } from "@/apps/api/src/modules/crm/domain/lead"

type LeadStatus = "new" | "contacted" | "trial" | "negotiating" | "converted" | "lost"

interface LeadItem {
  id: string
  name: string
  email: string
  phone: string
  interest: string
  modalityId: string | null
  status: LeadStatus
  source: string
  createdAt: string
  lastContact: string | null
  notes: string
  score: number
  trialDate?: string
}

const pipelineStages = [
  { id: "new", name: "Novos", color: "bg-blue-500" },
  { id: "contacted", name: "Em conversa", color: "bg-yellow-500" },
  { id: "trial", name: "Aula Experimental", color: "bg-purple-500" },
  { id: "negotiating", name: "Negociando", color: "bg-orange-500" },
] as const

const activities = [
  { id: "1", leadId: "4", type: "call", description: "Ligação de follow-up", date: "2024-01-15 14:30", user: "João" },
  { id: "2", leadId: "3", type: "trial", description: "Aula experimental agendada", date: "2024-01-13 10:00", user: "Sistema" },
  { id: "3", leadId: "2", type: "message", description: "WhatsApp enviado", date: "2024-01-14 09:15", user: "Maria" },
  { id: "4", leadId: "6", type: "email", description: "Email de apresentação enviado", date: "2024-01-16 11:00", user: "João" },
]

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  trial: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  negotiating: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  converted: "bg-green-500/10 text-green-500 border-green-500/20",
  lost: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  trial: "Aula Exp.",
  negotiating: "Negociando",
  converted: "Convertido",
  lost: "Perdido",
}

const sourceColors: Record<string, string> = {
  Instagram: "bg-pink-500/10 text-pink-500",
  Facebook: "bg-blue-600/10 text-blue-600",
  Google: "bg-green-500/10 text-green-500",
  Site: "bg-primary/10 text-primary",
  "Indicação": "bg-yellow-500/10 text-yellow-500",
}

export function CrmDashboardScreen() {
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null)
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [leadForm, setLeadForm] = useState(createLeadFormState())
  const [modalityOptions, setModalityOptions] = useState<Array<{ id: string; name: string }>>([])
  const [planOptions, setPlanOptions] = useState<Array<{ id: string; name: string }>>([])
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [convertForm, setConvertForm] = useState(createConvertFormState())
  const [attendanceSummary, setAttendanceSummary] = useState<{
    present: number
    absent: number
    confirmed: number
    classesToday: number
  } | null>(null)

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = filterStatus === "all" || lead.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [filterStatus, leads, search])

  function getLeadsByStage(stageId: string) {
    return filteredLeads.filter((lead) => lead.status === stageId)
  }

  const conversionRate =
    Math.round((leads.filter((lead) => lead.status === "converted").length / leads.length) * 100) || 68

  useEffect(() => {
    let active = true
    const todayKey = toDateKey(new Date())

    async function loadData() {
      try {
        const [classesResponse, crmResponse] = await Promise.all([
          fetchJson<{ classes: ClassGroupEntity[]; sessions: ClassSessionEntity[] }>("/api/classes"),
          fetchJson<{
            leads: CrmLeadEntity[]
            references: {
              modalities: Array<{ id: string; name: string; activityCategory: string | null }>
              plans: Array<{ id: string; name: string }>
            }
          }>("/api/crm"),
        ])
        if (!active) {
          return
        }

        const todaySessions = classesResponse.sessions.filter(
          (session) => session.sessionDate.slice(0, 10) === todayKey
        )
        const present = todaySessions.reduce((acc, session) => acc + (session.presentStudentIds?.length ?? 0), 0)
        const absent = todaySessions.reduce((acc, session) => acc + (session.absentStudentIds?.length ?? 0), 0)
        const confirmed = todaySessions.reduce((acc, session) => acc + (session.confirmedStudentIds?.length ?? 0), 0)

        setAttendanceSummary({
          present,
          absent,
          confirmed,
          classesToday: todaySessions.length,
        })
        setLeads(crmResponse.leads.map(toLeadItem))
        setModalityOptions(crmResponse.references.modalities.map((item) => ({ id: item.id, name: item.name })))
        setPlanOptions(crmResponse.references.plans)
      } catch {
        // ignore
      }
    }

    void loadData()
    return () => {
      active = false
    }
  }, [])

  async function submitLead() {
    const response = await fetchJson<{ lead: CrmLeadEntity }>("/api/crm", {
      method: "POST",
      body: JSON.stringify({
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        modalityId: leadForm.modalityId || null,
        source: leadForm.source,
        notes: leadForm.notes,
      }),
    })

    setLeads((current) => [toLeadItem(response.lead), ...current])
    setShowNewLeadDialog(false)
    setLeadForm(createLeadFormState())
  }

  async function updateLeadStatus(leadId: string, status: CrmLeadEntity["status"]) {
    const response = await fetchJson<{ lead: CrmLeadEntity }>(`/api/crm/${leadId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })

    const nextLead = toLeadItem(response.lead)
    setLeads((current) => current.map((lead) => (lead.id === leadId ? nextLead : lead)))
    setSelectedLead((current) => (current?.id === leadId ? nextLead : current))
  }

  async function convertLead() {
    if (!selectedLead) return

    try {
      setIsConverting(true)
      const response = await fetchJson<{ lead: CrmLeadEntity; message: string }>(`/api/crm/${selectedLead.id}/convert`, {
        method: "POST",
        body: JSON.stringify(convertForm),
      })

      const nextLead = toLeadItem(response.lead)
      setLeads((current) => current.map((lead) => (lead.id === nextLead.id ? nextLead : lead)))
      setSelectedLead(nextLead)
      setShowConvertDialog(false)
      toast({
        title: "Lead convertido com sucesso",
        description: "O lead foi cadastrado como aluno na academia.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível converter o lead",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsConverting(false)
    }
  }

  function openConvertDialog(lead: LeadItem) {
    setSelectedLead(lead)
    setConvertForm({
      email: lead.email,
      birthDate: "",
      address: "",
      emergencyContact: "",
      notes: lead.notes,
      planId: "",
      modalityId: lead.modalityId ?? "",
    })
    setShowConvertDialog(true)
  }

  function whatsappLink(phone: string) {
    return `https://wa.me/55${phone.replace(/\D/g, "")}`
  }

  return (
    <>
      <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo lead</DialogTitle>
            <DialogDescription>Cadastre um novo lead interessado na academia</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome completo</Label>
              <Input
                placeholder="Nome do lead"
                value={leadForm.name}
                onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={leadForm.email}
                  onChange={(event) => setLeadForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="(11) 99999-0000"
                  value={leadForm.phone}
                  onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Interesse</Label>
                <Select
                  value={leadForm.modalityId || "none"}
                  onValueChange={(value) => setLeadForm((current) => ({ ...current, modalityId: value === "none" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não definido</SelectItem>
                    {modalityOptions.map((modality) => (
                      <SelectItem key={modality.id} value={modality.id}>
                        {modality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Origem</Label>
                <Select
                  value={leadForm.source}
                  onValueChange={(value) => setLeadForm((current) => ({ ...current, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Site">Site</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Informações adicionais sobre o lead..."
                value={leadForm.notes}
                onChange={(event) => setLeadForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewLeadDialog(false)}>Cancelar</Button>
            <Button onClick={() => void submitLead()}>Cadastrar lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedLead)} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          {selectedLead ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedLead.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle>{selectedLead.name}</DialogTitle>
                      <DialogDescription className="mt-1 flex items-center gap-2">
                        <Badge className={statusColors[selectedLead.status]}>{statusLabels[selectedLead.status]}</Badge>
                        <Badge className={sourceColors[selectedLead.source]}>{selectedLead.source}</Badge>
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoBlock label="Interesse" value={selectedLead.interest} />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < Math.ceil(selectedLead.score / 2)
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted"
                          }`}
                        />
                      ))}
                      <span className="ml-1 font-medium">{selectedLead.score}/10</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InfoBlock label="Email" value={selectedLead.email} />
                  <InfoBlock label="Telefone" value={selectedLead.phone} />
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="text-sm">{selectedLead.notes}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoBlock label="Cadastro" value={formatDate(selectedLead.createdAt)} />
                  <InfoBlock
                    label="Último contato"
                    value={selectedLead.lastContact ? formatDate(selectedLead.lastContact) : "Nenhum"}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="flex-1" asChild>
                  <a href={whatsappLink(selectedLead.phone)} target="_blank" rel="noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => void updateLeadStatus(selectedLead.id, "contacted")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Marcar contato
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => void updateLeadStatus(selectedLead.id, "trial_scheduled")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar aula
                </Button>
              </DialogFooter>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => void updateLeadStatus(selectedLead.id, "negotiating")}>
                  Negociando
                </Button>
                {selectedLead.status === "negotiating" ? (
                  <Button size="sm" onClick={() => openConvertDialog(selectedLead)}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Fechou negócio
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => void updateLeadStatus(selectedLead.id, "lost")}>
                  Perder lead
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar como aluno</DialogTitle>
            <DialogDescription>
              Complete os dados restantes para gerar o aluno a partir deste lead.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={convertForm.email}
                  onChange={(event) => setConvertForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={convertForm.birthDate}
                  onChange={(event) => setConvertForm((current) => ({ ...current, birthDate: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Modalidade</Label>
                <Select
                  value={convertForm.modalityId || "none"}
                  onValueChange={(value) => setConvertForm((current) => ({ ...current, modalityId: value === "none" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione</SelectItem>
                    {modalityOptions.map((modality) => (
                      <SelectItem key={modality.id} value={modality.id}>
                        {modality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Plano</Label>
                <Select
                  value={convertForm.planId || "none"}
                  onValueChange={(value) => setConvertForm((current) => ({ ...current, planId: value === "none" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem plano</SelectItem>
                    {planOptions.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Endereço</Label>
              <Input
                value={convertForm.address}
                onChange={(event) => setConvertForm((current) => ({ ...current, address: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Contato de emergência</Label>
              <Input
                value={convertForm.emergencyContact}
                onChange={(event) => setConvertForm((current) => ({ ...current, emergencyContact: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea
                value={convertForm.notes}
                onChange={(event) => setConvertForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
              Cancelar
            </Button>
            <Button disabled={isConverting} onClick={() => void convertLead()}>
              Confirmar cadastro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">CRM</h1>
            <p className="text-muted-foreground">Gerencie leads e oportunidades de vendas</p>
          </div>
          <Button className="gap-2" onClick={() => setShowNewLeadDialog(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo lead</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard title="Total leads" value={String(leads.length)} icon={UserPlus} tone="primary" />
          <MetricCard title="Novos" value={String(leads.filter((lead) => lead.status === "new").length)} icon={Target} tone="info" />
          <MetricCard title="Aulas agendadas" value={String(leads.filter((lead) => lead.status === "trial").length)} icon={Calendar} tone="trial" />
          <MetricCard title="Conversão" value={`${conversionRate}%`} icon={TrendingUp} tone="success" />
          {attendanceSummary ? (
            <MetricCard
              title="Presença hoje"
              value={`${attendanceSummary.present}/${attendanceSummary.confirmed}`}
              icon={CheckCircle2}
              tone="success"
            />
          ) : (
            <MetricCard title="Presença hoje" value="—" icon={CheckCircle2} tone="success" />
          )}
        </div>

        <Tabs defaultValue="pipeline" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar leads..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <TabsContent value="pipeline" className="space-y-4">
            <div className="overflow-x-auto pb-2">
              <div className="grid min-w-[960px] gap-4 md:grid-cols-4">
                {pipelineStages.map((stage) => {
                  const stageLeads = getLeadsByStage(stage.id)
                  return (
                    <div key={stage.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                          <span className="font-medium">{stage.name}</span>
                        </div>
                        <Badge variant="secondary">{stageLeads.length}</Badge>
                      </div>
                      <div
                        className="min-h-[400px] space-y-2 rounded-lg bg-muted/30 p-2"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          const leadId = event.dataTransfer.getData("text/plain")
                          const targetStatus: CrmLeadEntity["status"] =
                            stage.id === "trial"
                              ? "trial_scheduled"
                              : stage.id === "new"
                                ? "new"
                                : stage.id === "contacted"
                                  ? "contacted"
                                  : "negotiating"
                          if (leadId) {
                            void updateLeadStatus(leadId, targetStatus)
                          }
                          setDraggingLeadId(null)
                        }}
                      >
                        {stageLeads.map((lead) => (
                          <Card
                            key={lead.id}
                            className="cursor-pointer transition-colors hover:bg-muted/50"
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.setData("text/plain", lead.id)
                              setDraggingLeadId(lead.id)
                            }}
                            onDragEnd={() => setDraggingLeadId(null)}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <CardContent className={cn("p-3", draggingLeadId === lead.id && "opacity-60")}>
                              <div className="mb-2 flex items-start justify-between">
                                <p className="text-sm font-medium">{lead.name}</p>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: Math.min(5, Math.ceil(lead.score / 2)) }).map((_, index) => (
                                    <Star
                                      key={index}
                                      className={`h-3 w-3 ${
                                        index < Math.ceil(lead.score / 2)
                                          ? "fill-yellow-500 text-yellow-500"
                                          : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="mb-2 text-xs text-muted-foreground">{lead.interest}</p>
                              <div className="flex items-center justify-between gap-2">
                                <Badge className={`text-xs ${sourceColors[lead.source]}`}>{lead.source}</Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    window.open(whatsappLink(lead.phone), "_blank", "noopener,noreferrer")
                                  }}
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">{filteredLeads.length} leads</CardTitle>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="new">Novos</SelectItem>
                      <SelectItem value="contacted">Contatados</SelectItem>
                      <SelectItem value="trial">Aula Exp.</SelectItem>
                      <SelectItem value="negotiating">Negociando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {lead.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.interest} | {lead.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[lead.status]}>{statusLabels[lead.status]}</Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={whatsappLink(lead.phone)} target="_blank" rel="noreferrer">
                              <MessageSquare className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Atividades recentes</CardTitle>
                <CardDescription>Histórico de interações com leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const lead = leads.find((item) => item.id === activity.leadId)
                    return (
                      <div key={activity.id} className="flex items-start gap-4 rounded-lg bg-muted/50 p-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            activity.type === "call"
                              ? "bg-green-500/10 text-green-500"
                              : activity.type === "email"
                                ? "bg-blue-500/10 text-blue-500"
                                : activity.type === "message"
                                  ? "bg-purple-500/10 text-purple-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {activity.type === "call" ? <Phone className="h-5 w-5" /> : null}
                          {activity.type === "email" ? <Mail className="h-5 w-5" /> : null}
                          {activity.type === "message" ? <MessageSquare className="h-5 w-5" /> : null}
                          {activity.type === "trial" ? <Calendar className="h-5 w-5" /> : null}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{activity.description}</p>
                            <span className="text-xs text-muted-foreground">{activity.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Lead: {lead?.name} | Por: {activity.user}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  icon: typeof UserPlus
  tone: "primary" | "info" | "trial" | "success"
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    info: "bg-blue-500/10 text-blue-500",
    trial: "bg-purple-500/10 text-purple-500",
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

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function createLeadFormState() {
  return {
    name: "",
    email: "",
    phone: "",
    modalityId: "",
    source: "",
    notes: "",
  }
}

function createConvertFormState() {
  return {
    email: "",
    birthDate: "",
    address: "",
    emergencyContact: "",
    notes: "",
    planId: "",
    modalityId: "",
  }
}

function toLeadItem(lead: CrmLeadEntity): LeadItem {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email ?? "",
    phone: lead.phone,
    interest: lead.interestLabel ?? "Lead sem interesse definido",
    modalityId: lead.modalityId,
    status: mapLeadStatus(lead.status),
    source: mapLeadSource(lead.source),
    createdAt: lead.createdAt.slice(0, 10),
    lastContact: lead.status === "new" ? null : lead.updatedAt.slice(0, 10),
    notes: lead.notes ?? "",
    score: lead.source === "website" ? 7 : 6,
    trialDate: lead.status === "trial_scheduled" ? lead.updatedAt.slice(0, 10) : undefined,
  }
}

function mapLeadStatus(status: CrmLeadEntity["status"]): LeadStatus {
  switch (status) {
    case "trial_scheduled":
    case "trial_completed":
      return "trial"
    default:
      return status as Exclude<LeadStatus, "trial">
  }
}

function mapLeadSource(source: CrmLeadEntity["source"]) {
  switch (source) {
    case "website":
      return "Site"
    case "instagram":
      return "Instagram"
    case "facebook":
      return "Facebook"
    case "google":
      return "Google"
    case "referral":
      return "Indicação"
    default:
      return "Site"
  }
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR")
}

function toDateKey(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
