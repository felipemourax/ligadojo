"use client"

import { useState } from "react"
import { ClipboardCheck, Calendar, Users, TrendingUp, QrCode, Search, ChevronLeft, ChevronRight, Download, History, CheckCircle2, XCircle, Clock, Filter, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
const todayClasses = [
  {
    id: "1",
    name: "Jiu-Jitsu Iniciante",
    time: "19:00",
    endTime: "20:30",
    teacher: "Mestre Ricardo",
    modality: "Jiu-Jitsu",
    status: "in_progress",
    students: [
      { id: "1", name: "Carlos Silva", belt: "Azul", present: true, checkInTime: "18:55" },
      { id: "2", name: "Maria Santos", belt: "Branca", present: true, checkInTime: "18:58" },
      { id: "3", name: "João Oliveira", belt: "Branca", present: false, checkInTime: null },
      { id: "4", name: "Ana Costa", belt: "Azul", present: true, checkInTime: "19:02" },
      { id: "5", name: "Pedro Lima", belt: "Branca", present: true, checkInTime: "19:05" },
    ],
  },
  {
    id: "2",
    name: "Jiu-Jitsu Avançado",
    time: "20:30",
    endTime: "22:00",
    teacher: "Mestre Ricardo",
    modality: "Jiu-Jitsu",
    status: "upcoming",
    students: [
      { id: "6", name: "Fernanda Costa", belt: "Roxa", present: null, checkInTime: null },
      { id: "7", name: "Lucas Mendes", belt: "Marrom", present: null, checkInTime: null },
      { id: "8", name: "Amanda Silva", belt: "Roxa", present: null, checkInTime: null },
    ],
  },
  {
    id: "3",
    name: "Boxe",
    time: "18:00",
    endTime: "19:00",
    teacher: "Professor André",
    modality: "Boxe",
    status: "completed",
    students: [
      { id: "9", name: "Roberto Santos", belt: "-", present: true, checkInTime: "17:55" },
      { id: "10", name: "Carla Oliveira", belt: "-", present: true, checkInTime: "17:58" },
      { id: "11", name: "Diego Lima", belt: "-", present: false, checkInTime: null },
    ],
  },
]

const weeklyHistory = [
  { date: "2024-01-15", day: "Segunda", classes: 4, present: 45, absent: 8, rate: 85 },
  { date: "2024-01-14", day: "Domingo", classes: 0, present: 0, absent: 0, rate: 0 },
  { date: "2024-01-13", day: "Sábado", classes: 3, present: 28, absent: 4, rate: 87 },
  { date: "2024-01-12", day: "Sexta", classes: 4, present: 42, absent: 10, rate: 81 },
  { date: "2024-01-11", day: "Quinta", classes: 3, present: 35, absent: 5, rate: 87 },
  { date: "2024-01-10", day: "Quarta", classes: 4, present: 48, absent: 6, rate: 89 },
  { date: "2024-01-09", day: "Terça", classes: 3, present: 32, absent: 7, rate: 82 },
]

const monthlyStats = [
  { month: "Janeiro", present: 380, absent: 52, rate: 88 },
  { month: "Dezembro", present: 365, absent: 58, rate: 86 },
  { month: "Novembro", present: 342, absent: 48, rate: 88 },
  { month: "Outubro", present: 358, absent: 62, rate: 85 },
]

const beltColors: Record<string, string> = {
  "Branca": "bg-white text-foreground border",
  "Azul": "bg-blue-500 text-white",
  "Roxa": "bg-purple-500 text-white",
  "Marrom": "bg-amber-700 text-white",
  "Preta": "bg-black text-white",
  "-": "bg-muted text-muted-foreground",
}

const statusColors: Record<string, string> = {
  in_progress: "bg-green-500/10 text-green-500 border-green-500/20",
  upcoming: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-muted text-muted-foreground",
}

const statusLabels: Record<string, string> = {
  in_progress: "Em andamento",
  upcoming: "Próxima",
  completed: "Finalizada",
}

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState(todayClasses[0].id)
  const [searchStudent, setSearchStudent] = useState("")
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  
  const currentClass = todayClasses.find((c) => c.id === selectedClass)
  
  const filteredStudents = currentClass?.students.filter((s) =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase())
  ) || []

  const todayPresent = todayClasses.reduce((acc, c) => acc + c.students.filter((s) => s.present === true).length, 0)
  const todayAbsent = todayClasses.reduce((acc, c) => acc + c.students.filter((s) => s.present === false).length, 0)
  const todayPending = todayClasses.reduce((acc, c) => acc + c.students.filter((s) => s.present === null).length, 0)

  const handleTogglePresence = (studentId: string) => {
    // In a real app, this would update the database
    console.log("Toggle presence for student:", studentId)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presença</h1>
          <p className="text-muted-foreground">Registre e acompanhe a presença dos alunos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">QR Code</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>QR Code para Check-in</DialogTitle>
                <DialogDescription>
                  Os alunos podem escanear este código para registrar presença automaticamente
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">QR Code da turma</p>
                    <p className="font-medium mt-1">{currentClass?.name}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Válido até</p>
                  <p className="font-medium">{currentClass?.time} - {currentClass?.endTime}</p>
                </div>
                <div className="flex gap-2 w-full">
                  <Button className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Tela Cheia
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Relatório</span>
          </Button>
        </div>
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
                <p className="text-2xl font-bold">{todayClasses.length}</p>
                <p className="text-xs text-muted-foreground">Aulas hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayPresent}</p>
                <p className="text-xs text-muted-foreground">Presentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayAbsent}</p>
                <p className="text-xs text-muted-foreground">Ausentes</p>
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
                  {todayPresent + todayAbsent > 0 
                    ? Math.round((todayPresent / (todayPresent + todayAbsent)) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Taxa hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {/* Class Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {todayClasses.map((cls) => (
              <Card 
                key={cls.id}
                className={`cursor-pointer transition-all ${selectedClass === cls.id ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
                onClick={() => setSelectedClass(cls.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">{cls.teacher}</p>
                    </div>
                    <Badge className={statusColors[cls.status]}>{statusLabels[cls.status]}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="h-4 w-4" />
                    <span>{cls.time} - {cls.endTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        {cls.students.filter((s) => s.present === true).length}
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle className="h-4 w-4" />
                        {cls.students.filter((s) => s.present === false).length}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {cls.students.filter((s) => s.present === null).length}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {cls.students.length} alunos
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Attendance List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-medium">{currentClass?.name}</CardTitle>
                  <CardDescription>{currentClass?.time} - {currentClass?.endTime} | {currentClass?.teacher}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar aluno..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setShowQRDialog(true)}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${beltColors[student.belt]}`}>{student.belt}</Badge>
                          {student.checkInTime && (
                            <span className="text-xs text-muted-foreground">
                              Check-in: {student.checkInTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {student.present === null ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleTogglePresence(student.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Falta
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleTogglePresence(student.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Presente
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant={student.present ? "default" : "secondary"}
                          className={`h-8 ${student.present ? "bg-green-500 hover:bg-green-600" : ""}`}
                          onClick={() => handleTogglePresence(student.id)}
                        >
                          {student.present ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Presente
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Ausente
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Marcar Todos Presentes
            </Button>
            <Button variant="outline" className="flex-1">
              Finalizar Chamada
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Histórico Semanal</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekOffset(w => w - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[120px] text-center">
                    Semana {currentWeekOffset === 0 ? "Atual" : `${Math.abs(currentWeekOffset)} semana${Math.abs(currentWeekOffset) > 1 ? "s" : ""} atrás`}
                  </span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekOffset(w => Math.min(0, w + 1))} disabled={currentWeekOffset === 0}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dia</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-center">Aulas</TableHead>
                    <TableHead className="text-center">Presentes</TableHead>
                    <TableHead className="text-center">Ausentes</TableHead>
                    <TableHead className="text-right">Taxa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyHistory.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">{day.day}</TableCell>
                      <TableCell>{new Date(day.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-center">{day.classes}</TableCell>
                      <TableCell className="text-center text-green-500">{day.present}</TableCell>
                      <TableCell className="text-center text-red-500">{day.absent}</TableCell>
                      <TableCell className="text-right">
                        {day.classes > 0 ? (
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={day.rate} className="w-16 h-2" />
                            <span className="w-10 text-right">{day.rate}%</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Resumo da Semana</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total de aulas</span>
                  <span className="font-bold">{weeklyHistory.reduce((acc, d) => acc + d.classes, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total de presenças</span>
                  <span className="font-bold text-green-500">{weeklyHistory.reduce((acc, d) => acc + d.present, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total de ausências</span>
                  <span className="font-bold text-red-500">{weeklyHistory.reduce((acc, d) => acc + d.absent, 0)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-muted-foreground">Taxa média</span>
                  <span className="font-bold text-primary">
                    {Math.round(weeklyHistory.filter((d) => d.classes > 0).reduce((acc, d) => acc + d.rate, 0) / weeklyHistory.filter((d) => d.classes > 0).length)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Alunos com Baixa Frequência</CardTitle>
                <CardDescription>Menos de 70% de presença na semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "João Oliveira", rate: 45, classes: 5 },
                    { name: "Diego Lima", rate: 60, classes: 4 },
                    { name: "Pedro Lima", rate: 65, classes: 6 },
                  ].map((student) => (
                    <div key={student.name} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                            {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.classes} aulas</p>
                        </div>
                      </div>
                      <Badge variant="destructive">{student.rate}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {monthlyStats.map((stat) => (
              <Card key={stat.month}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{stat.month}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stat.rate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.present} presenças / {stat.absent} faltas
                  </p>
                  <Progress value={stat.rate} className="mt-2 h-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Relatório Detalhado</CardTitle>
                  <CardDescription>Exporte relatórios de presença por período</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="month">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                      <SelectItem value="quarter">Último trimestre</SelectItem>
                      <SelectItem value="year">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-sm text-muted-foreground">Taxa média geral</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">1.432</p>
                    <p className="text-sm text-muted-foreground">Total de presenças</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Aulas realizadas</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
