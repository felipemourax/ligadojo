"use client"

import { useState } from "react"
import { Plus, Calendar, Users, Clock, MoreVertical, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

// Mock data
const classes = [
  {
    id: "1",
    name: "Jiu-Jitsu Iniciante",
    teacher: "Mestre Ricardo",
    teacherId: "1",
    schedule: ["seg", "qua", "sex"],
    time: "19:00",
    endTime: "20:30",
    students: 15,
    maxStudents: 20,
    modality: "Jiu-Jitsu",
    ageGroup: "Adulto",
    beltRange: "Branca a Azul",
  },
  {
    id: "2",
    name: "Jiu-Jitsu Avançado",
    teacher: "Mestre Ricardo",
    teacherId: "1",
    schedule: ["seg", "qua", "sex"],
    time: "20:30",
    endTime: "22:00",
    students: 12,
    maxStudents: 15,
    modality: "Jiu-Jitsu",
    ageGroup: "Adulto",
    beltRange: "Roxa a Preta",
  },
  {
    id: "3",
    name: "Muay Thai",
    teacher: "Professor André",
    teacherId: "2",
    schedule: ["ter", "qui"],
    time: "19:00",
    endTime: "20:30",
    students: 18,
    maxStudents: 25,
    modality: "Muay Thai",
    ageGroup: "Adulto",
    beltRange: "Todos os níveis",
  },
  {
    id: "4",
    name: "Kids Jiu-Jitsu",
    teacher: "Professora Carla",
    teacherId: "3",
    schedule: ["sab"],
    time: "10:00",
    endTime: "11:00",
    students: 10,
    maxStudents: 15,
    modality: "Jiu-Jitsu",
    ageGroup: "Kids (6-12)",
    beltRange: "Todas as faixas",
  },
  {
    id: "5",
    name: "Boxe",
    teacher: "Professor André",
    teacherId: "2",
    schedule: ["seg", "qua", "sex"],
    time: "18:00",
    endTime: "19:00",
    students: 8,
    maxStudents: 20,
    modality: "Boxe",
    ageGroup: "Adulto",
    beltRange: "Todos os níveis",
  },
]

const enrolledStudents = [
  { id: "1", name: "Carlos Silva", belt: "Azul", attendance: 85 },
  { id: "2", name: "Maria Santos", belt: "Branca", attendance: 92 },
  { id: "3", name: "João Oliveira", belt: "Branca", attendance: 78 },
  { id: "4", name: "Ana Costa", belt: "Azul", attendance: 95 },
  { id: "5", name: "Pedro Lima", belt: "Branca", attendance: 65 },
]

const weekDays = ["seg", "ter", "qua", "qui", "sex", "sab"]
const weekDaysFull = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

const modalityColors: Record<string, string> = {
  "Jiu-Jitsu": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Muay Thai": "bg-red-500/10 text-red-500 border-red-500/20",
  "Boxe": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "Judô": "bg-orange-500/10 text-orange-500 border-orange-500/20",
}

const beltColors: Record<string, string> = {
  "Branca": "bg-white text-foreground border",
  "Azul": "bg-blue-500 text-white",
  "Roxa": "bg-purple-500 text-white",
  "Marrom": "bg-amber-700 text-white",
  "Preta": "bg-black text-white",
}

export default function ClassesPage() {
  const [search, setSearch] = useState("")
  const [selectedClass, setSelectedClass] = useState<typeof classes[0] | null>(null)
  const [view, setView] = useState<"grid" | "schedule">("grid")
  const [currentWeek, setCurrentWeek] = useState(0)

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher.toLowerCase().includes(search.toLowerCase()) ||
      c.modality.toLowerCase().includes(search.toLowerCase())
  )

  const getClassesForDay = (day: string) => {
    return classes
      .filter((c) => c.schedule.includes(day))
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const getWeekDates = () => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1 + currentWeek * 7)
    
    return weekDays.map((_, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return date
    })
  }

  const weekDates = getWeekDates()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Turmas</h1>
          <p className="text-muted-foreground">Gerencie as turmas e horários</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Turma</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Turma</DialogTitle>
              <DialogDescription>
                Crie uma nova turma para a academia. As turmas só podem ser criadas dentro dos horários de funcionamento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Turma</Label>
                <Input id="name" placeholder="Ex: Jiu-Jitsu Iniciante" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="judo">Judô</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Professor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Mestre Ricardo</SelectItem>
                      <SelectItem value="2">Professor André</SelectItem>
                      <SelectItem value="3">Professora Carla</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Faixa Etária</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kids">Kids (6-12)</SelectItem>
                      <SelectItem value="teens">Teens (13-17)</SelectItem>
                      <SelectItem value="adult">Adulto (18+)</SelectItem>
                      <SelectItem value="all">Todas as idades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Limite de Alunos</Label>
                  <Input type="number" placeholder="20" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Dias da Semana</Label>
                <div className="flex flex-wrap gap-2">
                  {weekDaysFull.map((day, i) => (
                    <Button key={day} variant="outline" size="sm" className="h-8">
                      {weekDays[i].toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Horário Início</Label>
                  <Input type="time" defaultValue="19:00" />
                </div>
                <div className="grid gap-2">
                  <Label>Horário Fim</Label>
                  <Input type="time" defaultValue="20:30" />
                </div>
              </div>
              <Button className="mt-2">Criar Turma</Button>
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
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-xs text-muted-foreground">Turmas</p>
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
                <p className="text-2xl font-bold">{classes.reduce((acc, c) => acc + c.students, 0)}</p>
                <p className="text-xs text-muted-foreground">Inscritos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">26</p>
                <p className="text-xs text-muted-foreground">Aulas/semana</p>
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
                <p className="text-2xl font-bold">
                  {Math.round(
                    (classes.reduce((acc, c) => acc + c.students, 0) /
                      classes.reduce((acc, c) => acc + c.maxStudents, 0)) *
                      100
                  )}
                  %
                </p>
                <p className="text-xs text-muted-foreground">Ocupação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "schedule")} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="grid">Cards</TabsTrigger>
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar turmas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((classItem) => (
            <Card 
              key={classItem.id} 
              className="overflow-hidden transition-all hover:bg-muted/50 cursor-pointer"
              onClick={() => setSelectedClass(classItem)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  <Badge className={modalityColors[classItem.modality]}>{classItem.modality}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {classItem.teacher.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{classItem.teacher}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{classItem.schedule.map(d => d.toUpperCase()).join(", ")} - {classItem.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{classItem.ageGroup} | {classItem.beltRange}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    {classItem.students}/{classItem.maxStudents} alunos
                  </span>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(classItem.students / classItem.maxStudents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Agenda Semanal</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentWeek(w => w - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[120px] text-center">
                  {weekDates[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} - {weekDates[5].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentWeek(w => w + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 min-w-[800px]">
                {weekDays.map((day, index) => (
                  <div key={day} className="border-r last:border-r-0 border-border">
                    <div className="p-3 border-b border-border bg-muted/50">
                      <p className="font-medium text-center">{weekDaysFull[index]}</p>
                      <p className="text-xs text-muted-foreground text-center">
                        {weekDates[index].toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </p>
                    </div>
                    <div className="p-2 space-y-2 min-h-[300px]">
                      {getClassesForDay(day).map((c) => (
                        <div
                          key={c.id}
                          className={`p-2 rounded-lg border cursor-pointer transition-colors hover:bg-muted/80 ${modalityColors[c.modality]}`}
                          onClick={() => setSelectedClass(c)}
                        >
                          <p className="font-medium text-sm truncate">{c.name}</p>
                          <p className="text-xs opacity-80">{c.time} - {c.endTime}</p>
                          <p className="text-xs opacity-60 truncate">{c.teacher}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Detail Dialog */}
      <Dialog open={!!selectedClass} onOpenChange={(open) => !open && setSelectedClass(null)}>
        <DialogContent className="max-w-2xl">
          {selectedClass && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedClass.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <Badge className={modalityColors[selectedClass.modality]}>{selectedClass.modality}</Badge>
                      <span>{selectedClass.ageGroup}</span>
                    </DialogDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar turma</DropdownMenuItem>
                      <DropdownMenuItem>Duplicar turma</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Desativar turma</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DialogHeader>
              
              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
                  <TabsTrigger value="students" className="flex-1">Alunos ({selectedClass.students})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Professor</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {selectedClass.teacher.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{selectedClass.teacher}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Faixa Etária</p>
                      <p className="font-medium">{selectedClass.ageGroup}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Nível de Faixa</p>
                      <p className="font-medium">{selectedClass.beltRange}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Capacidade</p>
                      <p className="font-medium">{selectedClass.students}/{selectedClass.maxStudents} alunos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Horários</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedClass.schedule.map((day, i) => (
                        <div key={day} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                          <span className="font-medium">{weekDaysFull[weekDays.indexOf(day)]}</span>
                          <span className="text-muted-foreground">{selectedClass.time} - {selectedClass.endTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex gap-2">
                    <Button className="flex-1">Registrar Presença</Button>
                    <Button variant="outline" className="flex-1">Ver Histórico</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="students" className="mt-4">
                  <div className="space-y-2">
                    {enrolledStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.attendance}% presença</p>
                          </div>
                        </div>
                        <Badge className={beltColors[student.belt]}>{student.belt}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Aluno
                  </Button>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
