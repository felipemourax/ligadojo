"use client"

import { useState } from "react"
import { Plus, UserPlus, Phone, Mail, MoreVertical, Search, ChevronRight, Calendar, MessageSquare, Clock, Target, TrendingUp, ArrowRight, CheckCircle2, XCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - Pipeline de Vendas
const pipelineStages = [
  { id: "new", name: "Novos", color: "bg-blue-500" },
  { id: "contacted", name: "Contatados", color: "bg-yellow-500" },
  { id: "trial", name: "Aula Experimental", color: "bg-purple-500" },
  { id: "negotiating", name: "Negociando", color: "bg-orange-500" },
]

const leads = [
  {
    id: "1",
    name: "Roberto Almeida",
    email: "roberto@email.com",
    phone: "(11) 99999-2001",
    interest: "Jiu-Jitsu",
    status: "new",
    source: "Instagram",
    createdAt: "2024-01-15",
    lastContact: null,
    notes: "Viu nosso video de finalizacoes",
    score: 8,
  },
  {
    id: "2",
    name: "Fernanda Lima",
    email: "fernanda@email.com",
    phone: "(11) 99999-2002",
    interest: "Muay Thai",
    status: "contacted",
    source: "Indicacao",
    createdAt: "2024-01-12",
    lastContact: "2024-01-14",
    notes: "Indicada pela aluna Maria Santos. Interessada em perder peso.",
    score: 9,
  },
  {
    id: "3",
    name: "Lucas Martins",
    email: "lucas@email.com",
    phone: "(11) 99999-2003",
    interest: "Jiu-Jitsu Kids",
    status: "trial",
    source: "Google",
    createdAt: "2024-01-10",
    lastContact: "2024-01-13",
    trialDate: "2024-01-20",
    notes: "Filho de 8 anos. Quer desenvolver disciplina.",
    score: 7,
  },
  {
    id: "4",
    name: "Patricia Souza",
    email: "patricia@email.com",
    phone: "(11) 99999-2004",
    interest: "Muay Thai",
    status: "negotiating",
    source: "Facebook",
    createdAt: "2024-01-08",
    lastContact: "2024-01-15",
    notes: "Gostou da aula experimental. Pediu desconto no plano trimestral.",
    score: 10,
  },
  {
    id: "5",
    name: "Marcos Silva",
    email: "marcos@email.com",
    phone: "(11) 99999-2005",
    interest: "Boxe",
    status: "new",
    source: "Site",
    createdAt: "2024-01-16",
    lastContact: null,
    notes: "Preencheu formulario no site",
    score: 5,
  },
  {
    id: "6",
    name: "Juliana Costa",
    email: "juliana@email.com",
    phone: "(11) 99999-2006",
    interest: "Jiu-Jitsu",
    status: "contacted",
    source: "Indicacao",
    createdAt: "2024-01-11",
    lastContact: "2024-01-16",
    notes: "Respondeu mensagem. Quer agendar visita.",
    score: 8,
  },
]

const activities = [
  { id: "1", leadId: "4", type: "call", description: "Ligacao de follow-up", date: "2024-01-15 14:30", user: "Joao" },
  { id: "2", leadId: "3", type: "trial", description: "Aula experimental agendada", date: "2024-01-13 10:00", user: "Sistema" },
  { id: "3", leadId: "2", type: "message", description: "WhatsApp enviado", date: "2024-01-14 09:15", user: "Maria" },
  { id: "4", leadId: "6", type: "email", description: "Email de apresentacao enviado", date: "2024-01-16 11:00", user: "Joao" },
]

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  trial: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  negotiating: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  converted: "bg-green-500/10 text-green-500 border-green-500/20",
  lost: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  trial: "Aula Exp.",
  negotiating: "Negociando",
  converted: "Convertido",
  lost: "Perdido",
}

const sourceColors: Record<string, string> = {
  "Instagram": "bg-pink-500/10 text-pink-500",
  "Facebook": "bg-blue-600/10 text-blue-600",
  "Google": "bg-green-500/10 text-green-500",
  "Site": "bg-primary/10 text-primary",
  "Indicacao": "bg-yellow-500/10 text-yellow-500",
}

export default function CRMPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedLead, setSelectedLead] = useState<typeof leads[0] | null>(null)
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban")

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getLeadsByStage = (stageId: string) => {
    return filteredLeads.filter((lead) => lead.status === stageId)
  }

  const conversionRate = Math.round((leads.filter(l => l.status === "converted").length / leads.length) * 100) || 68

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM</h1>
          <p className="text-muted-foreground">Gerencie leads e oportunidades de vendas</p>
        </div>
        <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Lead</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Lead</DialogTitle>
              <DialogDescription>Cadastre um novo lead interessado na academia</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input placeholder="Nome do lead" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>E-mail</Label>
                  <Input type="email" placeholder="email@exemplo.com" />
                </div>
                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input placeholder="(11) 99999-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Interesse</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jiu-jitsu">Jiu-Jitsu</SelectItem>
                      <SelectItem value="muay-thai">Muay Thai</SelectItem>
                      <SelectItem value="boxe">Boxe</SelectItem>
                      <SelectItem value="kids">Jiu-Jitsu Kids</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Origem</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="site">Site</SelectItem>
                      <SelectItem value="indicacao">Indicacao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Observacoes</Label>
                <Textarea placeholder="Informacoes adicionais sobre o lead..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewLeadDialog(false)}>Cancelar</Button>
              <Button onClick={() => setShowNewLeadDialog(false)}>Cadastrar Lead</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.length}</p>
                <p className="text-xs text-muted-foreground">Total leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.filter((l) => l.status === "new").length}</p>
                <p className="text-xs text-muted-foreground">Novos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.filter((l) => l.status === "trial").length}</p>
                <p className="text-xs text-muted-foreground">Aulas agendadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversao</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <TabsContent value="pipeline" className="space-y-4">
          {/* Kanban Board */}
          <div className="grid gap-4 md:grid-cols-4">
            {pipelineStages.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id)
              return (
                <div key={stage.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <span className="font-medium">{stage.name}</span>
                    </div>
                    <Badge variant="secondary">{stageLeads.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[400px] p-2 bg-muted/30 rounded-lg">
                    {stageLeads.map((lead) => (
                      <Card 
                        key={lead.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-sm">{lead.name}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, Math.ceil(lead.score / 2)) }).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < Math.ceil(lead.score / 2) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{lead.interest}</p>
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${sourceColors[lead.source]}`}>{lead.source}</Badge>
                            {lead.lastContact && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(lead.lastContact).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Funil de Conversao</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {pipelineStages.map((stage, index) => {
                  const count = getLeadsByStage(stage.id).length
                  const percentage = Math.round((count / leads.length) * 100)
                  return (
                    <div key={stage.id} className="flex items-center">
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full ${stage.color} flex items-center justify-center text-white font-bold text-lg`}>
                          {count}
                        </div>
                        <p className="text-sm font-medium mt-2">{stage.name}</p>
                        <p className="text-xs text-muted-foreground">{percentage}%</p>
                      </div>
                      {index < pipelineStages.length - 1 && (
                        <ArrowRight className="h-6 w-6 text-muted-foreground mx-4" />
                      )}
                    </div>
                  )
                })}
                <div className="flex items-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground mx-4" />
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium mt-2">Convertido</p>
                    <p className="text-xs text-muted-foreground">{conversionRate}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-base font-medium">Atividades Recentes</CardTitle>
              <CardDescription>Historico de interacoes com leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => {
                  const lead = leads.find((l) => l.id === activity.leadId)
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === "call" ? "bg-green-500/10 text-green-500" :
                        activity.type === "email" ? "bg-blue-500/10 text-blue-500" :
                        activity.type === "message" ? "bg-purple-500/10 text-purple-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {activity.type === "call" && <Phone className="h-5 w-5" />}
                        {activity.type === "email" && <Mail className="h-5 w-5" />}
                        {activity.type === "message" && <MessageSquare className="h-5 w-5" />}
                        {activity.type === "trial" && <Calendar className="h-5 w-5" />}
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

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedLead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle>{selectedLead.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <Badge className={statusColors[selectedLead.status]}>{statusLabels[selectedLead.status]}</Badge>
                        <Badge className={sourceColors[selectedLead.source]}>{selectedLead.source}</Badge>
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Interesse</p>
                    <p className="font-medium">{selectedLead.interest}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.ceil(selectedLead.score / 2) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                      ))}
                      <span className="ml-1 font-medium">{selectedLead.score}/10</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedLead.phone}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Observacoes</p>
                  <p className="text-sm">{selectedLead.notes}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cadastro</p>
                    <p>{new Date(selectedLead.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ultimo contato</p>
                    <p>{selectedLead.lastContact ? new Date(selectedLead.lastContact).toLocaleDateString("pt-BR") : "Nenhum"}</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Aula
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
