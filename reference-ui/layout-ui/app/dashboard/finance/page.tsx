"use client"

import { useState } from "react"
import { Wallet, TrendingUp, TrendingDown, AlertCircle, Plus, Search, Filter, CreditCard, Receipt, Download, Send, Clock, CheckCircle2, XCircle, ChevronRight, Edit, MoreVertical, DollarSign, Users, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data
const stats = {
  revenue: 45850,
  pending: 3200,
  overdue: 1500,
  growth: 12,
  activeStudents: 63,
  avgTicket: 235,
}

const plans = [
  { id: "1", name: "Mensal Basico", price: 180, modalities: 1, description: "1 modalidade, 3x/semana", students: 12 },
  { id: "2", name: "Mensal Completo", price: 250, modalities: 2, description: "2 modalidades, livre", students: 28 },
  { id: "3", name: "Trimestral", price: 600, modalities: 2, description: "2 modalidades, livre (3 meses)", students: 15 },
  { id: "4", name: "Anual", price: 2400, modalities: 3, description: "Todas modalidades, livre (12 meses)", students: 8 },
]

const recentPayments = [
  { id: "1", name: "Carlos Silva", amount: 250, date: "2024-02-01", dueDate: "2024-02-05", status: "paid", method: "PIX", plan: "Mensal Completo" },
  { id: "2", name: "Maria Santos", amount: 600, date: "2024-02-01", dueDate: "2024-02-05", status: "paid", method: "Cartao", plan: "Trimestral" },
  { id: "3", name: "Joao Oliveira", amount: 180, date: null, dueDate: "2024-02-05", status: "pending", method: null, plan: "Mensal Basico" },
  { id: "4", name: "Ana Costa", amount: 250, date: null, dueDate: "2024-01-15", status: "overdue", method: null, plan: "Mensal Completo" },
  { id: "5", name: "Pedro Lima", amount: 250, date: "2024-02-03", dueDate: "2024-02-05", status: "paid", method: "Boleto", plan: "Mensal Completo" },
  { id: "6", name: "Fernanda Costa", amount: 180, date: null, dueDate: "2024-02-10", status: "pending", method: null, plan: "Mensal Basico" },
]

const monthlyRevenue = [
  { month: "Jan", revenue: 42500, target: 45000 },
  { month: "Fev", revenue: 45850, target: 46000 },
  { month: "Mar", revenue: 0, target: 48000 },
]

const paymentMethods = [
  { method: "PIX", count: 35, percentage: 55 },
  { method: "Cartao Credito", count: 18, percentage: 29 },
  { method: "Boleto", count: 8, percentage: 13 },
  { method: "Dinheiro", count: 2, percentage: 3 },
]

const statusColors: Record<string, string> = {
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  overdue: "bg-red-500/10 text-red-500 border-red-500/20",
  cancelled: "bg-muted text-muted-foreground",
}

const statusLabels: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
  cancelled: "Cancelado",
}

export default function FinancePage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showNewChargeDialog, setShowNewChargeDialog] = useState(false)
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<typeof recentPayments[0] | null>(null)

  const filteredPayments = recentPayments.filter((payment) => {
    const matchesSearch = payment.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie pagamentos, planos e cobrancas</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewChargeDialog} onOpenChange={setShowNewChargeDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Cobranca</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Cobranca</DialogTitle>
                <DialogDescription>
                  Gere uma cobranca avulsa ou mensalidade
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Aluno</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Carlos Silva</SelectItem>
                      <SelectItem value="2">Maria Santos</SelectItem>
                      <SelectItem value="3">Joao Oliveira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensalidade">Mensalidade</SelectItem>
                      <SelectItem value="matricula">Taxa de Matricula</SelectItem>
                      <SelectItem value="graduacao">Taxa de Graduacao</SelectItem>
                      <SelectItem value="evento">Inscricao em Evento</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valor</Label>
                    <Input type="number" placeholder="0,00" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Vencimento</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Descricao</Label>
                  <Textarea placeholder="Detalhes da cobranca..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewChargeDialog(false)}>Cancelar</Button>
                <Button onClick={() => setShowNewChargeDialog(false)}>Gerar Cobranca</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
                <p className="text-xs text-muted-foreground">Receita mensal</p>
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
                <p className="text-2xl font-bold">+{stats.growth}%</p>
                <p className="text-xs text-muted-foreground">Crescimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.pending)}</p>
                <p className="text-xs text-muted-foreground">Pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.overdue)}</p>
                <p className="text-xs text-muted-foreground">Atrasado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Cobrancas</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="reports">Relatorios</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cobrancas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="overdue">Atrasados</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-yellow-500/5 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {recentPayments.filter((p) => p.status === "pending").length}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Send className="h-4 w-4 mr-1" />
                    Enviar Lembrete
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-500/5 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Atrasados</p>
                    <p className="text-2xl font-bold text-red-500">
                      {recentPayments.filter((p) => p.status === "overdue").length}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Send className="h-4 w-4 mr-1" />
                    Cobrar
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Recebidos este mes</p>
                    <p className="text-2xl font-bold text-green-500">
                      {recentPayments.filter((p) => p.status === "paid").length}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Receipt className="h-4 w-4 mr-1" />
                    Relatorio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payments Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {filteredPayments.length} cobranca{filteredPayments.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow 
                      key={payment.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {payment.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{payment.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{payment.plan}</TableCell>
                      <TableCell>{new Date(payment.dueDate).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        {payment.date ? (
                          <span className="text-green-500">
                            {new Date(payment.date).toLocaleDateString("pt-BR")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[payment.status]}>
                          {statusLabels[payment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            {payment.status !== "paid" && (
                              <>
                                <DropdownMenuItem>Registrar pagamento</DropdownMenuItem>
                                <DropdownMenuItem>Enviar lembrete</DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Planos Disponiveis</h3>
              <p className="text-sm text-muted-foreground">Configure os planos oferecidos pela academia</p>
            </div>
            <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo Plano</DialogTitle>
                  <DialogDescription>
                    Crie um novo plano de mensalidade
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nome do Plano</Label>
                    <Input placeholder="Ex: Mensal Completo" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Valor (R$)</Label>
                      <Input type="number" placeholder="0,00" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Duracao (meses)</Label>
                      <Input type="number" placeholder="1" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Numero de Modalidades</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 modalidade</SelectItem>
                        <SelectItem value="2">2 modalidades</SelectItem>
                        <SelectItem value="3">Todas as modalidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Descricao</Label>
                    <Textarea placeholder="Beneficios do plano..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewPlanDialog(false)}>Cancelar</Button>
                  <Button onClick={() => setShowNewPlanDialog(false)}>Criar Plano</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-4">
                    {formatCurrency(plan.price)}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{plan.students} alunos</span>
                    </div>
                    <span>{plan.modalities} modalidade{plan.modalities > 1 ? "s" : ""}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Distribuicao por Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plans.map((plan) => {
                  const percentage = Math.round((plan.students / stats.activeStudents) * 100)
                  return (
                    <div key={plan.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{plan.name}</span>
                        <span className="font-medium">{plan.students} ({percentage}%)</span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Receita vs Meta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {monthlyRevenue.slice(0, 2).map((month) => {
                  const percentage = Math.round((month.revenue / month.target) * 100)
                  return (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{month.month}</span>
                        <span className={`font-medium ${percentage >= 100 ? "text-green-500" : "text-yellow-500"}`}>
                          {formatCurrency(month.revenue)} / {formatCurrency(month.target)}
                        </span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Formas de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{method.method}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{method.percentage}%</span>
                      <span className="text-xs text-muted-foreground">({method.count})</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Metricas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm">Ticket Medio</span>
                  </div>
                  <span className="font-bold">{formatCurrency(stats.avgTicket)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Alunos Ativos</span>
                  </div>
                  <span className="font-bold">{stats.activeStudents}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Taxa de Renovacao</span>
                  </div>
                  <span className="font-bold">92%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Relatorios Disponiveis</CardTitle>
                  <CardDescription>Exporte relatorios financeiros detalhados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Receitas", desc: "Todas as receitas do periodo", icon: TrendingUp },
                  { title: "Inadimplencia", desc: "Cobrancas atrasadas", icon: AlertCircle },
                  { title: "Fluxo de Caixa", desc: "Entradas e saidas", icon: BarChart3 },
                  { title: "Comissoes", desc: "Pagamentos a professores", icon: Users },
                ].map((report) => (
                  <Card key={report.title} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <report.icon className="h-8 w-8 text-primary mb-2" />
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">{report.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-md">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Cobranca</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedPayment.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedPayment.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPayment.plan}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`mt-1 ${statusColors[selectedPayment.status]}`}>
                      {statusLabels[selectedPayment.status]}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vencimento</span>
                    <span>{new Date(selectedPayment.dueDate).toLocaleDateString("pt-BR")}</span>
                  </div>
                  {selectedPayment.date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Data do Pagamento</span>
                      <span className="text-green-500">{new Date(selectedPayment.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                  )}
                  {selectedPayment.method && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Forma de Pagamento</span>
                      <span>{selectedPayment.method}</span>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                {selectedPayment.status !== "paid" ? (
                  <>
                    <Button variant="outline">Enviar Lembrete</Button>
                    <Button>Registrar Pagamento</Button>
                  </>
                ) : (
                  <Button variant="outline">
                    <Receipt className="h-4 w-4 mr-2" />
                    Gerar Recibo
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
