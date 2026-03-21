"use client"

import { useState } from "react"
import { Plus, GraduationCap, Calendar, Users, Search, ChevronRight, Award, Clock, CheckCircle2, XCircle, Edit, Trash2, User, Star, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
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

// Belt System Configuration
const beltSystem = {
  "Jiu-Jitsu": {
    adult: [
      { name: "Branca", stripes: 4, minTime: 0, color: "bg-white text-foreground border" },
      { name: "Azul", stripes: 4, minTime: 24, color: "bg-blue-500 text-white" },
      { name: "Roxa", stripes: 4, minTime: 42, color: "bg-purple-500 text-white" },
      { name: "Marrom", stripes: 4, minTime: 60, color: "bg-amber-700 text-white" },
      { name: "Preta", stripes: 10, minTime: 78, color: "bg-black text-white" },
    ],
    kids: [
      { name: "Branca", stripes: 4, color: "bg-white text-foreground border" },
      { name: "Cinza", stripes: 4, color: "bg-gray-400 text-white" },
      { name: "Amarela", stripes: 4, color: "bg-yellow-400 text-foreground" },
      { name: "Laranja", stripes: 4, color: "bg-orange-500 text-white" },
      { name: "Verde", stripes: 4, color: "bg-green-500 text-white" },
    ],
  },
  "Muay Thai": {
    adult: [
      { name: "Branca", stripes: 0, color: "bg-white text-foreground border" },
      { name: "Amarela", stripes: 0, color: "bg-yellow-400 text-foreground" },
      { name: "Laranja", stripes: 0, color: "bg-orange-500 text-white" },
      { name: "Verde", stripes: 0, color: "bg-green-500 text-white" },
      { name: "Azul", stripes: 0, color: "bg-blue-500 text-white" },
      { name: "Roxa", stripes: 0, color: "bg-purple-500 text-white" },
      { name: "Vermelha", stripes: 0, color: "bg-red-500 text-white" },
      { name: "Preta", stripes: 0, color: "bg-black text-white" },
    ],
  },
}

// Mock data
const upcomingExams = [
  {
    id: "1",
    date: "2024-02-15",
    time: "10:00",
    modality: "Jiu-Jitsu",
    location: "Sala Principal",
    evaluator: "Mestre Ricardo",
    status: "scheduled",
    candidates: [
      { id: "1", name: "Carlos Silva", from: "Branca", fromStripes: 4, to: "Azul", attendance: 92, techniques: 85, behavior: "Excelente" },
      { id: "2", name: "Maria Santos", from: "Azul", fromStripes: 4, to: "Roxa", attendance: 95, techniques: 90, behavior: "Excelente" },
      { id: "3", name: "Pedro Lima", from: "Branca", fromStripes: 3, to: "Branca 4 graus", attendance: 78, techniques: 72, behavior: "Bom" },
    ],
  },
  {
    id: "2",
    date: "2024-03-10",
    time: "14:00",
    modality: "Muay Thai",
    location: "Sala Principal",
    evaluator: "Professor André",
    status: "draft",
    candidates: [],
  },
]

const recentGraduations = [
  { id: "1", name: "Ana Costa", from: "Roxa", to: "Marrom", date: "2024-01-20", modality: "Jiu-Jitsu", evaluator: "Mestre Ricardo" },
  { id: "2", name: "Lucas Mendes", from: "Azul", to: "Roxa", date: "2024-01-20", modality: "Jiu-Jitsu", evaluator: "Mestre Ricardo" },
  { id: "3", name: "Julia Ferreira", from: "Branca", to: "Azul", date: "2024-01-15", modality: "Jiu-Jitsu", evaluator: "Mestre Ricardo" },
  { id: "4", name: "Roberto Santos", from: "Amarela", to: "Laranja", date: "2024-01-10", modality: "Muay Thai", evaluator: "Professor André" },
]

const eligibleStudents = [
  { id: "1", name: "Carlos Silva", belt: "Branca", stripes: 4, attendance: 92, techniques: 85, months: 14, eligible: true },
  { id: "2", name: "Maria Santos", belt: "Azul", stripes: 4, attendance: 95, techniques: 90, months: 26, eligible: true },
  { id: "3", name: "João Oliveira", belt: "Branca", stripes: 2, attendance: 65, techniques: 60, months: 8, eligible: false },
  { id: "4", name: "Pedro Lima", belt: "Branca", stripes: 3, attendance: 78, techniques: 72, months: 10, eligible: false },
  { id: "5", name: "Fernanda Costa", belt: "Roxa", stripes: 4, attendance: 88, techniques: 92, months: 48, eligible: true },
]

const beltColors: Record<string, string> = {
  "Branca": "bg-white text-foreground border",
  "Cinza": "bg-gray-400 text-white",
  "Amarela": "bg-yellow-400 text-foreground",
  "Laranja": "bg-orange-500 text-white",
  "Verde": "bg-green-500 text-white",
  "Azul": "bg-blue-500 text-white",
  "Roxa": "bg-purple-500 text-white",
  "Marrom": "bg-amber-700 text-white",
  "Vermelha": "bg-red-500 text-white",
  "Preta": "bg-black text-white",
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  draft: "Rascunho",
  completed: "Concluído",
  cancelled: "Cancelado",
}

export default function GraduationsPage() {
  const [selectedExam, setSelectedExam] = useState<typeof upcomingExams[0] | null>(null)
  const [showNewExamDialog, setShowNewExamDialog] = useState(false)
  const [searchEligible, setSearchEligible] = useState("")

  const filteredEligible = eligibleStudents.filter((s) =>
    s.name.toLowerCase().includes(searchEligible.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graduacao</h1>
          <p className="text-muted-foreground">Gerencie faixas, graus e exames de graduacao</p>
        </div>
        <Dialog open={showNewExamDialog} onOpenChange={setShowNewExamDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Agendar Exame</span>
              <span className="sm:hidden">Agendar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Agendar Exame de Graduacao</DialogTitle>
              <DialogDescription>
                Configure os detalhes do exame de graduacao
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Input type="date" />
                </div>
                <div className="grid gap-2">
                  <Label>Horario</Label>
                  <Input type="time" defaultValue="10:00" />
                </div>
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Avaliador</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Mestre Ricardo</SelectItem>
                      <SelectItem value="2">Professor André</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Local</Label>
                <Input placeholder="Ex: Sala Principal" />
              </div>
              <div className="grid gap-2">
                <Label>Observacoes</Label>
                <Textarea placeholder="Informacoes adicionais sobre o exame..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewExamDialog(false)}>Cancelar</Button>
              <Button onClick={() => setShowNewExamDialog(false)}>Criar Exame</Button>
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
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">48</p>
                <p className="text-xs text-muted-foreground">Graduacoes/ano</p>
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
                <p className="text-2xl font-bold">{upcomingExams.filter((e) => e.status === "scheduled").length}</p>
                <p className="text-xs text-muted-foreground">Exames agendados</p>
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
                <p className="text-2xl font-bold">{eligibleStudents.filter((s) => s.eligible).length}</p>
                <p className="text-xs text-muted-foreground">Aptos p/ graduacao</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">96%</p>
                <p className="text-xs text-muted-foreground">Taxa de aprovacao</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exams">Exames</TabsTrigger>
          <TabsTrigger value="eligible">Alunos Aptos</TabsTrigger>
          <TabsTrigger value="history">Historico</TabsTrigger>
          <TabsTrigger value="belts">Sistema de Faixas</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {upcomingExams.map((exam) => (
              <Card 
                key={exam.id}
                className={`cursor-pointer transition-all hover:bg-muted/50 ${selectedExam?.id === exam.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedExam(exam)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{exam.modality}</CardTitle>
                      <CardDescription>
                        {new Date(exam.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} as {exam.time}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[exam.status]}>{statusLabels[exam.status]}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Avaliador: {exam.evaluator}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>Local: {exam.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        {exam.candidates.length} candidato{exam.candidates.length !== 1 ? "s" : ""}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedExam && selectedExam.candidates.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Candidatos - {selectedExam.modality}</CardTitle>
                    <CardDescription>
                      {new Date(selectedExam.date).toLocaleDateString("pt-BR")} | {selectedExam.evaluator}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                    <Button size="sm">Iniciar Exame</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>De</TableHead>
                      <TableHead>Para</TableHead>
                      <TableHead className="text-center">Presenca</TableHead>
                      <TableHead className="text-center">Tecnicas</TableHead>
                      <TableHead>Comportamento</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedExam.candidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{candidate.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={beltColors[candidate.from]}>
                            {candidate.from} {candidate.fromStripes > 0 && `${candidate.fromStripes}°`}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={beltColors[candidate.to.split(" ")[0]]}>
                            {candidate.to}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={candidate.attendance >= 80 ? "text-green-500" : "text-yellow-500"}>
                              {candidate.attendance}%
                            </span>
                            {candidate.attendance >= 80 ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={candidate.techniques >= 75 ? "text-green-500" : "text-yellow-500"}>
                              {candidate.techniques}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{candidate.behavior}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                              <DropdownMenuItem>Editar avaliacao</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Remover</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="eligible" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Alunos Aptos para Graduacao</CardTitle>
                  <CardDescription>Alunos que atendem aos requisitos minimos</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar aluno..."
                    value={searchEligible}
                    onChange={(e) => setSearchEligible(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Faixa Atual</TableHead>
                    <TableHead className="text-center">Tempo (meses)</TableHead>
                    <TableHead className="text-center">Presenca</TableHead>
                    <TableHead className="text-center">Tecnicas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEligible.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={beltColors[student.belt]}>
                          {student.belt} {student.stripes > 0 && `${student.stripes}°`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{student.months}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={student.attendance >= 80 ? "text-green-500" : "text-red-500"}>
                            {student.attendance}%
                          </span>
                          <Progress value={student.attendance} className="w-16 h-1" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={student.techniques >= 75 ? "text-green-500" : "text-red-500"}>
                            {student.techniques}%
                          </span>
                          <Progress value={student.techniques} className="w-16 h-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.eligible ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Apto
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" disabled={!student.eligible}>
                          Adicionar ao Exame
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Requisitos para Graduacao</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Tempo Minimo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Varia conforme a faixa. Branca para Azul: 24 meses minimo.
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Presenca</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Minimo de 80% de presenca nas aulas nos ultimos 6 meses.
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Tecnicas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dominio de 75% das tecnicas exigidas para a proxima faixa.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Historico de Graduacoes</CardTitle>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="jiu-jitsu">Jiu-Jitsu</SelectItem>
                    <SelectItem value="muay-thai">Muay Thai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentGraduations.map((graduation) => (
                  <div
                    key={graduation.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {graduation.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{graduation.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {graduation.modality} | {graduation.evaluator}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge className={beltColors[graduation.from]}>{graduation.from}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Badge className={beltColors[graduation.to]}>{graduation.to}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                        {new Date(graduation.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="belts" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Jiu-Jitsu - Adulto</CardTitle>
                <CardDescription>Sistema de faixas para alunos acima de 16 anos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {beltSystem["Jiu-Jitsu"].adult.map((belt, index) => (
                    <div key={belt.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-4 rounded ${belt.color.split(" ")[0]}`}>
                          <div className="flex gap-0.5 p-0.5">
                            {Array.from({ length: Math.min(belt.stripes, 4) }).map((_, i) => (
                              <div key={i} className="w-0.5 h-3 bg-white/80 rounded-sm" />
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{belt.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {belt.stripes} graus | Min: {belt.minTime} meses
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{index + 1}a faixa</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Jiu-Jitsu - Kids</CardTitle>
                <CardDescription>Sistema de faixas para alunos de 4 a 15 anos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {beltSystem["Jiu-Jitsu"].kids.map((belt, index) => (
                    <div key={belt.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-4 rounded ${belt.color.split(" ")[0]}`}>
                          <div className="flex gap-0.5 p-0.5">
                            {Array.from({ length: Math.min(belt.stripes, 4) }).map((_, i) => (
                              <div key={i} className="w-0.5 h-3 bg-white/80 rounded-sm" />
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{belt.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {belt.stripes} graus
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{index + 1}a faixa</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-medium">Muay Thai</CardTitle>
                <CardDescription>Sistema de graduacao para Muay Thai</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {beltSystem["Muay Thai"].adult.map((belt, index) => (
                    <div key={belt.name} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`w-8 h-8 rounded-full ${belt.color.split(" ")[0]}`} />
                      <div>
                        <p className="font-medium">{belt.name}</p>
                        <p className="text-xs text-muted-foreground">{index + 1}o grau</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
