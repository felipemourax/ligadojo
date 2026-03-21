"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreVertical, Users, Calendar, Award, CreditCard, TrendingUp, Mail, Phone, MapPin, User, ChevronRight, History, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data
const students = [
  {
    id: "1",
    name: "Carlos Silva",
    email: "carlos@email.com",
    phone: "(11) 99999-0001",
    belt: "Azul",
    stripes: 2,
    modality: "Jiu-Jitsu",
    status: "active",
    avatar: null,
    birthDate: "1995-05-15",
    address: "Rua das Flores, 123 - SP",
    plan: "Mensal Completo",
    planValue: 250,
    paymentStatus: "paid",
    lastPayment: "2024-01-05",
    nextPayment: "2024-02-05",
    enrolledClasses: ["Jiu-Jitsu Iniciante", "Jiu-Jitsu Avançado"],
    attendanceRate: 85,
    totalClasses: 48,
    startDate: "2023-03-10",
    emergencyContact: "Maria Silva - (11) 98888-0001",
    notes: "Competidor em treinamento. Foco em campeonatos regionais.",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(11) 99999-0002",
    belt: "Roxa",
    stripes: 3,
    modality: "Jiu-Jitsu",
    status: "active",
    avatar: null,
    birthDate: "1990-08-22",
    address: "Av. Brasil, 456 - SP",
    plan: "Trimestral",
    planValue: 600,
    paymentStatus: "paid",
    lastPayment: "2024-01-01",
    nextPayment: "2024-04-01",
    enrolledClasses: ["Jiu-Jitsu Avançado"],
    attendanceRate: 92,
    totalClasses: 120,
    startDate: "2021-06-15",
    emergencyContact: "João Santos - (11) 98888-0002",
    notes: "Instrutora assistente aos sábados.",
  },
  {
    id: "3",
    name: "João Oliveira",
    email: "joao@email.com",
    phone: "(11) 99999-0003",
    belt: "Branca",
    stripes: 4,
    modality: "Muay Thai",
    status: "inactive",
    avatar: null,
    birthDate: "1988-12-03",
    address: "Rua do Comércio, 789 - SP",
    plan: "Mensal Básico",
    planValue: 180,
    paymentStatus: "overdue",
    lastPayment: "2023-11-15",
    nextPayment: "2023-12-15",
    enrolledClasses: ["Muay Thai"],
    attendanceRate: 45,
    totalClasses: 15,
    startDate: "2023-09-01",
    emergencyContact: "Ana Oliveira - (11) 98888-0003",
    notes: "Inativo por motivos de saúde. Retorno previsto em fevereiro.",
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana@email.com",
    phone: "(11) 99999-0004",
    belt: "Marrom",
    stripes: 1,
    modality: "Jiu-Jitsu",
    status: "active",
    avatar: null,
    birthDate: "1992-04-18",
    address: "Rua Principal, 321 - SP",
    plan: "Anual",
    planValue: 2400,
    paymentStatus: "paid",
    lastPayment: "2024-01-01",
    nextPayment: "2025-01-01",
    enrolledClasses: ["Jiu-Jitsu Avançado", "Boxe"],
    attendanceRate: 95,
    totalClasses: 200,
    startDate: "2019-02-20",
    emergencyContact: "Pedro Costa - (11) 98888-0004",
    notes: "Candidata a faixa preta. Exame previsto para junho.",
  },
  {
    id: "5",
    name: "Pedro Lima",
    email: "pedro@email.com",
    phone: "(11) 99999-0005",
    belt: "Azul",
    stripes: 0,
    modality: "Jiu-Jitsu",
    status: "active",
    avatar: null,
    birthDate: "2000-09-25",
    address: "Av. Central, 567 - SP",
    plan: "Mensal Completo",
    planValue: 250,
    paymentStatus: "pending",
    lastPayment: "2024-01-03",
    nextPayment: "2024-02-03",
    enrolledClasses: ["Jiu-Jitsu Iniciante"],
    attendanceRate: 78,
    totalClasses: 32,
    startDate: "2023-08-15",
    emergencyContact: "Rosa Lima - (11) 98888-0005",
    notes: "",
  },
  {
    id: "6",
    name: "Fernanda Rodrigues",
    email: "fernanda@email.com",
    phone: "(11) 99999-0006",
    belt: "Branca",
    stripes: 2,
    modality: "Muay Thai",
    status: "active",
    avatar: null,
    birthDate: "1997-11-30",
    address: "Rua Nova, 890 - SP",
    plan: "Mensal Básico",
    planValue: 180,
    paymentStatus: "paid",
    lastPayment: "2024-01-10",
    nextPayment: "2024-02-10",
    enrolledClasses: ["Muay Thai", "Boxe"],
    attendanceRate: 88,
    totalClasses: 24,
    startDate: "2023-10-01",
    emergencyContact: "Carlos Rodrigues - (11) 98888-0006",
    notes: "Interesse em competições de Muay Thai.",
  },
]

const attendanceHistory = [
  { date: "2024-01-15", class: "Jiu-Jitsu Iniciante", time: "19:00", status: "present" },
  { date: "2024-01-13", class: "Jiu-Jitsu Avançado", time: "20:30", status: "present" },
  { date: "2024-01-12", class: "Jiu-Jitsu Iniciante", time: "19:00", status: "absent" },
  { date: "2024-01-10", class: "Jiu-Jitsu Iniciante", time: "19:00", status: "present" },
  { date: "2024-01-08", class: "Jiu-Jitsu Avançado", time: "20:30", status: "present" },
  { date: "2024-01-06", class: "Jiu-Jitsu Iniciante", time: "19:00", status: "present" },
]

const graduationHistory = [
  { date: "2023-12-15", from: "Azul 1 grau", to: "Azul 2 graus", evaluator: "Mestre Ricardo" },
  { date: "2023-06-20", from: "Branca 4 graus", to: "Azul", evaluator: "Mestre Ricardo" },
  { date: "2023-03-15", from: "Branca 3 graus", to: "Branca 4 graus", evaluator: "Professor André" },
  { date: "2022-12-10", from: "Branca 2 graus", to: "Branca 3 graus", evaluator: "Professor André" },
]

const paymentHistory = [
  { date: "2024-01-05", description: "Mensalidade Janeiro", value: 250, status: "paid", method: "PIX" },
  { date: "2023-12-05", description: "Mensalidade Dezembro", value: 250, status: "paid", method: "Cartão" },
  { date: "2023-11-05", description: "Mensalidade Novembro", value: 250, status: "paid", method: "PIX" },
  { date: "2023-10-05", description: "Mensalidade Outubro", value: 250, status: "paid", method: "Boleto" },
]

const beltColors: Record<string, string> = {
  "Branca": "bg-white text-foreground border",
  "Azul": "bg-blue-500 text-white",
  "Roxa": "bg-purple-500 text-white",
  "Marrom": "bg-amber-700 text-white",
  "Preta": "bg-black text-white",
}

const paymentStatusColors: Record<string, string> = {
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  overdue: "bg-red-500/10 text-red-500 border-red-500/20",
}

const paymentStatusLabels: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
}

export default function StudentsPage() {
  const [search, setSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterModality, setFilterModality] = useState<string>("all")

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === "all" || student.status === filterStatus
    const matchesModality = filterModality === "all" || student.modality === filterModality
    return matchesSearch && matchesStatus && matchesModality
  })

  const getAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getTimeSinceStart = (startDate: string) => {
    const start = new Date(startDate)
    const today = new Date()
    const months = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth())
    if (months < 12) {
      return `${months} meses`
    }
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    return remainingMonths > 0 ? `${years}a ${remainingMonths}m` : `${years} anos`
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-muted-foreground">Gerencie os alunos da sua academia</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Aluno</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Aluno</DialogTitle>
              <DialogDescription>
                Cadastre um novo aluno na academia
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="studentName">Nome Completo</Label>
                <Input id="studentName" placeholder="Nome do aluno" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="studentEmail">E-mail</Label>
                  <Input id="studentEmail" type="email" placeholder="email@exemplo.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="studentPhone">Telefone</Label>
                  <Input id="studentPhone" placeholder="(11) 99999-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="studentBirth">Data de Nascimento</Label>
                  <Input id="studentBirth" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label>Modalidade</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jiu-jitsu">Jiu-Jitsu</SelectItem>
                      <SelectItem value="muay-thai">Muay Thai</SelectItem>
                      <SelectItem value="boxe">Boxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="studentAddress">Endereço</Label>
                <Input id="studentAddress" placeholder="Rua, número - Cidade" />
              </div>
              <div className="grid gap-2">
                <Label>Plano</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal-basico">Mensal Básico - R$ 180</SelectItem>
                    <SelectItem value="mensal-completo">Mensal Completo - R$ 250</SelectItem>
                    <SelectItem value="trimestral">Trimestral - R$ 600</SelectItem>
                    <SelectItem value="anual">Anual - R$ 2.400</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="studentEmergency">Contato de Emergência</Label>
                <Input id="studentEmergency" placeholder="Nome - Telefone" />
              </div>
              <Button className="mt-2">Cadastrar Aluno</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.filter((s) => s.status === "active").length}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <CreditCard className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.filter((s) => s.paymentStatus === "pending" || s.paymentStatus === "overdue").length}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / students.length)}%
                </p>
                <p className="text-xs text-muted-foreground">Presença média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos..."
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
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterModality} onValueChange={setFilterModality}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Modalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Jiu-Jitsu">Jiu-Jitsu</SelectItem>
            <SelectItem value="Muay Thai">Muay Thai</SelectItem>
            <SelectItem value="Boxe">Boxe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            {filteredStudents.length} aluno{filteredStudents.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{student.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{student.modality} - {student.plan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Badge className={beltColors[student.belt]}>
                        {student.belt}
                        {student.stripes > 0 && ` ${student.stripes}°`}
                      </Badge>
                    </div>
                    <Badge className={paymentStatusColors[student.paymentStatus]}>
                      {paymentStatusLabels[student.paymentStatus]}
                    </Badge>
                  </div>
                  <Badge
                    variant={student.status === "active" ? "default" : "secondary"}
                    className="hidden sm:inline-flex"
                  >
                    {student.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Sheet */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedStudent.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {selectedStudent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">{selectedStudent.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <Badge className={beltColors[selectedStudent.belt]}>
                          Faixa {selectedStudent.belt}
                          {selectedStudent.stripes > 0 && ` - ${selectedStudent.stripes} grau${selectedStudent.stripes > 1 ? "s" : ""}`}
                        </Badge>
                        <Badge variant={selectedStudent.status === "active" ? "default" : "secondary"}>
                          {selectedStudent.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </DialogDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar cadastro</DropdownMenuItem>
                      <DropdownMenuItem>Enviar mensagem</DropdownMenuItem>
                      <DropdownMenuItem>Registrar presença</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Graduar aluno</DropdownMenuItem>
                      <DropdownMenuItem>Gerar cobrança</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        {selectedStudent.status === "active" ? "Desativar" : "Reativar"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="info">Dados</TabsTrigger>
                  <TabsTrigger value="attendance">Presença</TabsTrigger>
                  <TabsTrigger value="graduation">Graduação</TabsTrigger>
                  <TabsTrigger value="financial">Financeiro</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>E-mail</span>
                      </div>
                      <p className="font-medium">{selectedStudent.email}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>Telefone</span>
                      </div>
                      <p className="font-medium">{selectedStudent.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Idade</span>
                      </div>
                      <p className="font-medium">{getAge(selectedStudent.birthDate)} anos</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Na academia há</span>
                      </div>
                      <p className="font-medium">{getTimeSinceStart(selectedStudent.startDate)}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Endereço</span>
                      </div>
                      <p className="font-medium">{selectedStudent.address}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Turmas Matriculadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.enrolledClasses.map((c) => (
                        <Badge key={c} variant="secondary">{c}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Contato de Emergência</h4>
                    <p className="text-sm text-muted-foreground">{selectedStudent.emergencyContact}</p>
                  </div>

                  {selectedStudent.notes && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Observações</h4>
                      <p className="text-sm text-muted-foreground">{selectedStudent.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary">{selectedStudent.attendanceRate}%</p>
                        <p className="text-sm text-muted-foreground">Taxa de presença</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold">{selectedStudent.totalClasses}</p>
                        <p className="text-sm text-muted-foreground">Aulas totais</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-500">
                          {Math.round(selectedStudent.totalClasses * (selectedStudent.attendanceRate / 100))}
                        </p>
                        <p className="text-sm text-muted-foreground">Presenças</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Meta mensal: 12 aulas</span>
                      <span className="font-medium">8/12</span>
                    </div>
                    <Progress value={67} />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Histórico Recente
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Turma</TableHead>
                          <TableHead>Horário</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceHistory.map((record, i) => (
                          <TableRow key={i}>
                            <TableCell>{new Date(record.date).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>{record.class}</TableCell>
                            <TableCell>{record.time}</TableCell>
                            <TableCell>
                              <Badge variant={record.status === "present" ? "default" : "secondary"}>
                                {record.status === "present" ? "Presente" : "Falta"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="graduation" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Graduação Atual</p>
                          <p className="text-xl font-bold mt-1">
                            Faixa {selectedStudent.belt}
                            {selectedStudent.stripes > 0 && ` - ${selectedStudent.stripes} grau${selectedStudent.stripes > 1 ? "s" : ""}`}
                          </p>
                        </div>
                        <div className={`w-16 h-4 rounded ${beltColors[selectedStudent.belt].split(" ")[0]}`}>
                          <div className="flex gap-0.5 p-0.5">
                            {Array.from({ length: selectedStudent.stripes }).map((_, i) => (
                              <div key={i} className="w-1 h-3 bg-white/80 rounded-sm" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Histórico de Graduações
                    </h4>
                    <div className="space-y-3">
                      {graduationHistory.map((grad, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          <div className="flex-1">
                            <p className="font-medium">{grad.from} para {grad.to}</p>
                            <p className="text-sm text-muted-foreground">Avaliador: {grad.evaluator}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(grad.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">
                    <Award className="h-4 w-4 mr-2" />
                    Registrar Nova Graduação
                  </Button>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Plano Atual</p>
                        <p className="text-lg font-bold mt-1">{selectedStudent.plan}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {selectedStudent.planValue.toLocaleString("pt-BR")}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="mt-1">
                          <Badge className={paymentStatusColors[selectedStudent.paymentStatus]}>
                            {paymentStatusLabels[selectedStudent.paymentStatus]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Vence em {new Date(selectedStudent.nextPayment).toLocaleDateString("pt-BR")}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Histórico de Pagamentos
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((payment, i) => (
                          <TableRow key={i}>
                            <TableCell>{new Date(payment.date).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>{payment.description}</TableCell>
                            <TableCell>{payment.method}</TableCell>
                            <TableCell className="text-right font-medium">
                              R$ {payment.value.toLocaleString("pt-BR")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Gerar Cobrança
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Alterar Plano
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
