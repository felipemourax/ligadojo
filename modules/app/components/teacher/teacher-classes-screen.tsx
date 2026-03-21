"use client"

import { useMemo, useState } from "react"
import {
  Calendar,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  GraduationCap,
  MoreVertical,
  Search,
  Users,
} from "lucide-react"
import type { TeacherAppClassesData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type ClassItem = TeacherAppClassesData["classes"][number]
type StudentItem = ClassItem["students"][number] & {
  classIds: string[]
}

function getBeltColor(belt: string) {
  const colors: Record<string, string> = {
    Branca: "bg-white text-black border border-gray-300",
    Azul: "bg-blue-600 text-white",
    Roxa: "bg-purple-600 text-white",
    Marrom: "bg-amber-800 text-white",
    Preta: "bg-black text-white border border-white/20",
  }
  return colors[belt] ?? "bg-gray-500 text-white"
}

function getClassColor(modalityLabel: string) {
  const normalized = modalityLabel.toLowerCase()
  if (normalized.includes("no-gi")) return "bg-purple-500"
  if (normalized.includes("muay")) return "bg-red-500"
  if (normalized.includes("jud")) return "bg-amber-500"
  return "bg-blue-500"
}

export function TeacherClassesScreen({ data }: { data: TeacherAppClassesData }) {
  const [activeTab, setActiveTab] = useState("classes")
  const [search, setSearch] = useState("")
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null)

  const classesFiltered = useMemo(() => {
    const term = search.toLowerCase()
    return data.classes.filter(
      (item) =>
        item.name.toLowerCase().includes(term) || item.modalityLabel.toLowerCase().includes(term)
    )
  }, [data.classes, search])

  const studentsFlat = useMemo(() => {
    const byId = new Map<string, StudentItem>()
    for (const classItem of data.classes) {
      for (const student of classItem.students) {
        const existing = byId.get(student.id)
        if (existing) {
          existing.classIds.push(classItem.id)
          continue
        }
        byId.set(student.id, {
          ...student,
          classIds: [classItem.id],
        })
      }
    }
    return Array.from(byId.values())
  }, [data.classes])

  const studentsFiltered = useMemo(() => {
    const term = search.toLowerCase()
    return studentsFlat.filter(
      (student) =>
        student.name.toLowerCase().includes(term) || student.belt.toLowerCase().includes(term)
    )
  }, [studentsFlat, search])

  const getStudentsByClass = (classId: string) => {
    return studentsFlat.filter((student) => student.classIds.includes(classId))
  }

  const getClassesByStudent = (classIds: string[]) => {
    return data.classes.filter((classItem) => classIds.includes(classItem.id))
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Turmas</h1>
        <p className="text-muted-foreground">Gerencie suas turmas e alunos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classes">
            <Users className="mr-2 h-4 w-4" />
            Turmas
          </TabsTrigger>
          <TabsTrigger value="students">
            <GraduationCap className="mr-2 h-4 w-4" />
            Alunos
          </TabsTrigger>
        </TabsList>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={activeTab === "classes" ? "Buscar turma..." : "Buscar aluno..."}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        <TabsContent value="classes" className="mt-4 space-y-3">
          {classesFiltered.length === 0 ? (
            <AppEmptyState message="Nenhuma turma encontrada." />
          ) : (
            classesFiltered.map((classItem) => (
              <Card
                key={classItem.id}
                className="cursor-pointer transition-colors hover:bg-secondary/50"
                onClick={() => setSelectedClass(classItem)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("h-full min-h-[60px] w-1 rounded-full", getClassColor(classItem.modalityLabel))} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{classItem.name}</p>
                          <p className="text-sm text-muted-foreground">{classItem.modalityLabel}</p>
                        </div>
                        <Badge variant="outline">
                          <Users className="mr-1 h-3 w-3" />
                          {classItem.students.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {classItem.startTime}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="mr-1 h-3 w-3" />
                          {classItem.dayLabel}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="students" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {studentsFiltered.length} alunos matriculados nas suas turmas
            </p>
            <Badge variant="outline">Somente vínculos ativos</Badge>
          </div>

          {studentsFiltered.length === 0 ? (
            <AppEmptyState message="Nenhum aluno encontrado." />
          ) : (
            studentsFiltered.map((student) => (
              <Card
                key={student.id}
                className="cursor-pointer transition-colors hover:bg-secondary/50"
                onClick={() => setSelectedStudent(student)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {student.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((value) => value[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{student.name}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge className={cn("px-1.5 text-xs", getBeltColor(student.belt))}>{student.belt}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {student.classIds.length} turma(s)
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selectedClass)} onOpenChange={() => setSelectedClass(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {selectedClass ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedClass.name}</DialogTitle>
                <DialogDescription>{selectedClass.modalityLabel}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p className="font-medium">{selectedClass.students.length} alunos</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-medium">{selectedClass.startTime} - {selectedClass.endTime}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Agenda</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedClass.dayLabel}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">
                    Alunos ({getStudentsByClass(selectedClass.id).length})
                  </p>
                  <div className="max-h-[220px] space-y-2 overflow-y-auto">
                    {getStudentsByClass(selectedClass.id).length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                        Esta turma ainda não possui alunos matriculados.
                      </div>
                    ) : (
                      getStudentsByClass(selectedClass.id).map((student) => (
                        <div key={student.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/20 text-xs text-primary">
                              {student.name
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((value) => value[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 text-sm">{student.name}</span>
                          <Badge className={cn("px-1.5 text-xs", getBeltColor(student.belt))}>{student.belt}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    A presença considera somente os alunos matriculados de forma fixa nesta turma.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedClass(null)}>
                  Fechar
                </Button>
                <Button>
                  <Edit className="mr-1 h-4 w-4" />
                  Editar turma
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedStudent)} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent>
          {selectedStudent ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedStudent.name}</DialogTitle>
                <DialogDescription>Dados do aluno na sua carteira</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-sm text-muted-foreground">Faixa</p>
                    <Badge className={cn("mt-2 px-1.5 text-xs", getBeltColor(selectedStudent.belt))}>
                      {selectedStudent.belt}
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-sm text-muted-foreground">Frequência média</p>
                    <p className="font-medium">{selectedStudent.attendance}%</p>
                  </div>
                </div>

                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-sm text-muted-foreground">Modalidade principal</p>
                  <p className="mt-1 font-medium">{selectedStudent.modalityName}</p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Turmas</p>
                  <div className="space-y-2">
                    {getClassesByStudent(selectedStudent.classIds).map((classItem) => (
                      <div key={classItem.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2">
                        <div className="h-8 w-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{classItem.name}</p>
                          <p className="text-xs text-muted-foreground">{classItem.modalityLabel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                  Fechar
                </Button>
                <Button>
                  <Edit className="mr-1 h-4 w-4" />
                  Editar aluno
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
