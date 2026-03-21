"use client"

import { useState } from "react"
import { Plus, Search, MoreVertical, UserCheck, Calendar, Clock, Shield, Mail, Phone, Award, Users, ChevronRight, Settings, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data
const teachers = [
  {
    id: "1",
    name: "Mestre Ricardo Silva",
    email: "ricardo@academia.com",
    phone: "(11) 99999-1001",
    belt: "Preta",
    degree: "4° Grau",
    modalities: ["Jiu-Jitsu"],
    status: "active",
    role: "head_instructor",
    avatar: null,
    startDate: "2015-03-01",
    birthDate: "1978-06-15",
    address: "Rua dos Mestres, 100 - SP",
    students: 45,
    totalClasses: 1250,
    monthlyClasses: 48,
    specializations: ["Competição", "Defesa Pessoal", "Graduação"],
    schedule: [
      { day: "seg", classes: ["19:00 - Jiu-Jitsu Iniciante", "20:30 - Jiu-Jitsu Avançado"] },
      { day: "qua", classes: ["19:00 - Jiu-Jitsu Iniciante", "20:30 - Jiu-Jitsu Avançado"] },
      { day: "sex", classes: ["19:00 - Jiu-Jitsu Iniciante", "20:30 - Jiu-Jitsu Avançado"] },
    ],
    permissions: {
      manageStudents: true,
      manageGraduations: true,
      manageAttendance: true,
      viewFinancials: true,
      manageClasses: true,
      manageTechniques: true,
    },
    compensation: {
      type: "fixed",
      value: 4500,
      bonus: "R$ 50 por graduação realizada",
    },
  },
  {
    id: "2",
    name: "Professor André Santos",
    email: "andre@academia.com",
    phone: "(11) 99999-1002",
    belt: "Preta",
    degree: "2° Grau",
    modalities: ["Muay Thai", "Boxe"],
    status: "active",
    role: "instructor",
    avatar: null,
    startDate: "2018-08-15",
    birthDate: "1985-11-22",
    address: "Av. dos Lutadores, 456 - SP",
    students: 32,
    totalClasses: 680,
    monthlyClasses: 32,
    specializations: ["Muay Thai Tradicional", "Preparação Física"],
    schedule: [
      { day: "seg", classes: ["18:00 - Boxe"] },
      { day: "ter", classes: ["19:00 - Muay Thai"] },
      { day: "qua", classes: ["18:00 - Boxe"] },
      { day: "qui", classes: ["19:00 - Muay Thai"] },
      { day: "sex", classes: ["18:00 - Boxe"] },
    ],
    permissions: {
      manageStudents: true,
      manageGraduations: false,
      manageAttendance: true,
      viewFinancials: false,
      manageClasses: false,
      manageTechniques: true,
    },
    compensation: {
      type: "per_class",
      value: 120,
      bonus: "Nenhum",
    },
  },
  {
    id: "3",
    name: "Professora Carla Mendes",
    email: "carla@academia.com",
    phone: "(11) 99999-1003",
    belt: "Marrom",
    degree: "2° Grau",
    modalities: ["Jiu-Jitsu"],
    status: "active",
    role: "assistant",
    avatar: null,
    startDate: "2020-02-10",
    birthDate: "1992-04-08",
    address: "Rua das Artes, 789 - SP",
    students: 18,
    totalClasses: 320,
    monthlyClasses: 16,
    specializations: ["Kids", "Jiu-Jitsu Feminino"],
    schedule: [
      { day: "sab", classes: ["10:00 - Kids Jiu-Jitsu", "11:30 - Jiu-Jitsu Feminino"] },
    ],
    permissions: {
      manageStudents: false,
      manageGraduations: false,
      manageAttendance: true,
      viewFinancials: false,
      manageClasses: false,
      manageTechniques: false,
    },
    compensation: {
      type: "per_class",
      value: 100,
      bonus: "Nenhum",
    },
  },
]

const weekDaysFull: Record<string, string> = {
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sab: "Sábado",
}

const roleLabels: Record<string, string> = {
  head_instructor: "Instrutor Chefe",
  instructor: "Instrutor",
  assistant: "Assistente",
}

const roleColors: Record<string, string> = {
  head_instructor: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  instructor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  assistant: "bg-green-500/10 text-green-500 border-green-500/20",
}

const beltColors: Record<string, string> = {
  "Branca": "bg-white text-foreground border",
  "Azul": "bg-blue-500 text-white",
  "Roxa": "bg-purple-500 text-white",
  "Marrom": "bg-amber-700 text-white",
  "Preta": "bg-black text-white",
}

export default function TeachersPage() {
  const [search, setSearch] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<typeof teachers[0] | null>(null)

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email.toLowerCase().includes(search.toLowerCase()) ||
      teacher.modalities.some((m) => m.toLowerCase().includes(search.toLowerCase()))
  )

  const getYearsAtAcademy = (startDate: string) => {
    const start = new Date(startDate)
    const today = new Date()
    const years = today.getFullYear() - start.getFullYear()
    return years
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Professores</h1>
          <p className="text-muted-foreground">Gerencie o corpo docente da academia</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Professor</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Professor</DialogTitle>
              <DialogDescription>
                Cadastre um novo professor ou instrutor
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="teacherName">Nome Completo</Label>
                <Input id="teacherName" placeholder="Nome do professor" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="teacherEmail">E-mail</Label>
                  <Input id="teacherEmail" type="email" placeholder="email@academia.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacherPhone">Telefone</Label>
                  <Input id="teacherPhone" placeholder="(11) 99999-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Função</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head_instructor">Instrutor Chefe</SelectItem>
                      <SelectItem value="instructor">Instrutor</SelectItem>
                      <SelectItem value="assistant">Assistente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Graduação</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marrom">Faixa Marrom</SelectItem>
                      <SelectItem value="preta">Faixa Preta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Modalidades</Label>
                <div className="flex flex-wrap gap-2">
                  {["Jiu-Jitsu", "Muay Thai", "Boxe", "Judô"].map((mod) => (
                    <Badge key={mod} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {mod}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo de Remuneração</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Salário Fixo</SelectItem>
                      <SelectItem value="per_class">Por Aula</SelectItem>
                      <SelectItem value="percentage">Percentual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacherValue">Valor (R$)</Label>
                  <Input id="teacherValue" type="number" placeholder="0,00" />
                </div>
              </div>
              <Button className="mt-2">Cadastrar Professor</Button>
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
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.filter((t) => t.status === "active").length}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.reduce((acc, t) => acc + t.monthlyClasses, 0)}</p>
                <p className="text-xs text-muted-foreground">Aulas/mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Users className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.reduce((acc, t) => acc + t.students, 0)}</p>
                <p className="text-xs text-muted-foreground">Alunos atendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar professores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.map((teacher) => (
          <Card 
            key={teacher.id} 
            className="overflow-hidden transition-all hover:bg-muted/50 cursor-pointer"
            onClick={() => setSelectedTeacher(teacher)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={teacher.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {teacher.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold truncate">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.modalities.join(", ")}</p>
                    </div>
                    <Badge className={roleColors[teacher.role]}>{roleLabels[teacher.role]}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={beltColors[teacher.belt]}>
                      {teacher.belt} {teacher.degree}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{teacher.students} alunos</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{teacher.monthlyClasses} aulas/mês</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Teacher Detail Dialog */}
      <Dialog open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTeacher && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedTeacher.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {selectedTeacher.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">{selectedTeacher.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <Badge className={roleColors[selectedTeacher.role]}>
                          {roleLabels[selectedTeacher.role]}
                        </Badge>
                        <Badge className={beltColors[selectedTeacher.belt]}>
                          {selectedTeacher.belt} {selectedTeacher.degree}
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="info">Dados</TabsTrigger>
                  <TabsTrigger value="schedule">Agenda</TabsTrigger>
                  <TabsTrigger value="permissions">Permissoes</TabsTrigger>
                  <TabsTrigger value="compensation">Financeiro</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>E-mail</span>
                      </div>
                      <p className="font-medium">{selectedTeacher.email}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>Telefone</span>
                      </div>
                      <p className="font-medium">{selectedTeacher.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Na academia</span>
                      </div>
                      <p className="font-medium">{getYearsAtAcademy(selectedTeacher.startDate)} anos</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>Total de aulas</span>
                      </div>
                      <p className="font-medium">{selectedTeacher.totalClasses.toLocaleString("pt-BR")}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Modalidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeacher.modalities.map((mod) => (
                        <Badge key={mod} variant="secondary">{mod}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Especializacoes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeacher.specializations.map((spec) => (
                        <Badge key={spec} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{selectedTeacher.students}</p>
                        <p className="text-sm text-muted-foreground">Alunos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{selectedTeacher.monthlyClasses}</p>
                        <p className="text-sm text-muted-foreground">Aulas/mes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-500">{selectedTeacher.totalClasses}</p>
                        <p className="text-sm text-muted-foreground">Total aulas</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {selectedTeacher.schedule.map((daySchedule) => (
                      <div key={daySchedule.day} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">{weekDaysFull[daySchedule.day]}</span>
                        </div>
                        <div className="space-y-2 ml-6">
                          {daySchedule.classes.map((cls, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{cls}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Editar Agenda
                  </Button>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure as permissoes de acesso do professor no sistema
                  </p>
                  <div className="space-y-4">
                    {[
                      { key: "manageStudents", label: "Gerenciar Alunos", desc: "Cadastrar, editar e visualizar alunos" },
                      { key: "manageGraduations", label: "Gerenciar Graduacoes", desc: "Realizar exames e promover alunos" },
                      { key: "manageAttendance", label: "Registrar Presenca", desc: "Registrar e editar presencas" },
                      { key: "viewFinancials", label: "Ver Financeiro", desc: "Visualizar dados financeiros" },
                      { key: "manageClasses", label: "Gerenciar Turmas", desc: "Criar e editar turmas" },
                      { key: "manageTechniques", label: "Gerenciar Tecnicas", desc: "Criar e editar biblioteca de tecnicas" },
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {selectedTeacher.permissions[perm.key as keyof typeof selectedTeacher.permissions] ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">{perm.label}</p>
                            <p className="text-sm text-muted-foreground">{perm.desc}</p>
                          </div>
                        </div>
                        <Switch 
                          checked={selectedTeacher.permissions[perm.key as keyof typeof selectedTeacher.permissions]} 
                        />
                      </div>
                    ))}
                  </div>
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Salvar Permissoes
                  </Button>
                </TabsContent>

                <TabsContent value="compensation" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Tipo de Remuneracao</p>
                        <p className="text-lg font-bold mt-1">
                          {selectedTeacher.compensation.type === "fixed" ? "Salario Fixo" : "Por Aula"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Valor</p>
                        <p className="text-lg font-bold mt-1">
                          R$ {selectedTeacher.compensation.value.toLocaleString("pt-BR")}
                          {selectedTeacher.compensation.type === "per_class" && "/aula"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedTeacher.compensation.type === "per_class" && (
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Estimativa Mensal</p>
                        <p className="text-2xl font-bold mt-1 text-primary">
                          R$ {(selectedTeacher.compensation.value * selectedTeacher.monthlyClasses).toLocaleString("pt-BR")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedTeacher.monthlyClasses} aulas x R$ {selectedTeacher.compensation.value}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Bonus e Adicional</h4>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.compensation.bonus}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">Editar Remuneracao</Button>
                    <Button variant="outline" className="flex-1">Ver Historico</Button>
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
