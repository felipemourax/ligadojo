"use client"

import { useMemo, useState } from "react"
import {
  AlertCircle,
  Award,
  Calendar,
  GraduationCap,
  Search,
  Star,
} from "lucide-react"
import type { TeacherAppEvolutionData } from "@/apps/api/src/modules/app/domain/teacher-app"
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
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"

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

function mapExamStatusLabel(status: TeacherAppEvolutionData["exams"][number]["status"]) {
  if (status === "scheduled") return "Agendado"
  if (status === "in_progress") return "Em andamento"
  if (status === "completed") return "Concluído"
  if (status === "cancelled") return "Cancelado"
  return "Agendado"
}

export function TeacherEvolutionScreen({
  data,
  feedback,
  markingEligibleStudentId,
  addingExamCandidateKey,
  onMarkEligible,
  onAddStudentToExam,
}: {
  data: TeacherAppEvolutionData
  feedback: string | null
  markingEligibleStudentId: string | null
  addingExamCandidateKey: string | null
  onMarkEligible: (studentActivityId: string) => Promise<void>
  onAddStudentToExam: (examId: string, studentActivityId: string) => Promise<void>
}) {
  const [activeTab, setActiveTab] = useState("eligible")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudentActivityId, setSelectedStudentActivityId] = useState<string | null>(null)

  const filteredEligibleStudents = useMemo(
    () =>
      data.eligibleStudents.filter((student) =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [data.eligibleStudents, searchTerm]
  )
  const scheduledExams = useMemo(
    () => data.exams.filter((exam) => exam.status === "scheduled"),
    [data.exams]
  )
  const selectedStudent =
    data.eligibleStudents.find((student) => student.studentActivityId === selectedStudentActivityId) ?? null

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Evolução</h1>
        <p className="text-muted-foreground">Gerencie graduações e progresso dos alunos</p>
      </div>

      {feedback ? (
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-foreground">
          {feedback}
        </div>
      ) : null}

      {!data.permissions.manageGraduations ? (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-900">
          Seu perfil pode acompanhar evolução, mas não pode marcar aptidão nem incluir alunos em exames.
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-primary/20 bg-primary/10">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{data.metrics.eligibleStudents}</p>
            <p className="text-xs text-muted-foreground">Elegíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{data.metrics.scheduledExams}</p>
            <p className="text-xs text-muted-foreground">Exames</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{data.metrics.promotions}</p>
            <p className="text-xs text-muted-foreground">Promoções</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="eligible" className="text-xs">
            <GraduationCap className="mr-1 h-4 w-4" />
            Elegíveis
          </TabsTrigger>
          <TabsTrigger value="exams" className="text-xs">
            <Calendar className="mr-1 h-4 w-4" />
            Exames
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <Award className="mr-1 h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {activeTab === "eligible" ? (
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9"
            />
          </div>
        ) : null}

        <TabsContent value="eligible" className="mt-4 space-y-3">
          {filteredEligibleStudents.length === 0 ? (
            <AppEmptyState message="Nenhum aluno elegível encontrado." />
          ) : (
            filteredEligibleStudents.map((student) => {
              const targetAttendance = 75
              const attendanceProgress = Math.min((student.attendanceRate / targetAttendance) * 100, 100)
              return (
                <Card key={student.studentActivityId}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {student.studentName
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((value) => value[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{student.studentName}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge className={cn("text-xs", getBeltColor(student.currentBelt))}>{student.currentBelt}</Badge>
                          <span className="text-xs text-muted-foreground">→</span>
                          <Badge variant="outline" className="text-xs">
                            {student.nextBelt ?? "Próximo nível"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {student.monthsAtCurrentBelt} meses na faixa atual
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{student.activityLabel}</p>
                      </div>
                      {student.eligible ? (
                        <Badge className="border-green-500/30 bg-green-500/20 text-green-600">
                          {student.manualEligibleOverride ? "Apto confirmado" : "Apto"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Em progresso</Badge>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Frequência</span>
                        <span className="font-medium">{student.attendanceRate}%</span>
                      </div>
                      <Progress value={attendanceProgress} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={!data.permissions.manageGraduations || scheduledExams.length === 0}
                        onClick={() => setSelectedStudentActivityId(student.studentActivityId)}
                      >
                        Agendar exame
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={
                          !data.permissions.manageGraduations ||
                          student.manualEligibleOverride === true ||
                          markingEligibleStudentId === student.studentActivityId
                        }
                        onClick={() => void onMarkEligible(student.studentActivityId)}
                      >
                        {student.manualEligibleOverride
                          ? "Apto confirmado"
                          : markingEligibleStudentId === student.studentActivityId
                            ? "Salvando..."
                            : "Apto para graduar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="exams" className="mt-4 space-y-3">
          {data.exams.length === 0 ? (
            <AppEmptyState message="Nenhum exame encontrado para seu perfil." />
          ) : (
            data.exams.map((exam) => (
              <Card key={exam.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.date} às {exam.time}
                      </p>
                      {exam.location ? <p className="text-sm text-muted-foreground">{exam.location}</p> : null}
                    </div>
                    <div className="text-right">
                      <Badge>{mapExamStatusLabel(exam.status)}</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">{exam.candidateCount} candidatos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {data.history.length === 0 ? (
            <AppEmptyState message="Sem histórico de promoções para este professor." />
          ) : (
            data.history.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.fromBelt ?? "Faixa anterior"} → {item.toBelt}
                      </p>
                    </div>
                    <Badge variant="outline">{item.date}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-primary" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-2xl font-bold text-primary">{data.metrics.promotions}</p>
                <p className="text-xs text-muted-foreground">Promoções</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-2xl font-bold">{data.metrics.eligibleStudents}</p>
                <p className="text-xs text-muted-foreground">Elegíveis atuais</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <span>Use critérios oficiais no exame antes de confirmar promoções.</span>
      </div>

      <Dialog open={selectedStudent != null} onOpenChange={(open) => !open && setSelectedStudentActivityId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Incluir em exame agendado</DialogTitle>
            <DialogDescription>
              Selecione um dos exames agendados pela academia para incluir {selectedStudent?.studentName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg bg-secondary/50 p-3 text-sm">
              <p className="font-medium text-foreground">{selectedStudent?.studentName}</p>
              <p className="text-muted-foreground">
                {selectedStudent?.currentBelt} → {selectedStudent?.nextBelt ?? "Próximo nível"}
              </p>
            </div>

            {scheduledExams.length === 0 ? (
              <AppEmptyState message="Nenhum exame agendado disponível no momento." />
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {scheduledExams.map((exam) => {
                  const isAdding =
                    selectedStudent != null &&
                    addingExamCandidateKey === `${exam.id}:${selectedStudent.studentActivityId}`

                  return (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{exam.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {exam.date} às {exam.time}
                        </p>
                        {exam.location ? (
                          <p className="text-xs text-muted-foreground">{exam.location}</p>
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                          {exam.candidateCount} candidato{exam.candidateCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isAdding || selectedStudent == null}
                        onClick={async () => {
                          if (!selectedStudent) return
                          await onAddStudentToExam(exam.id, selectedStudent.studentActivityId)
                          setSelectedStudentActivityId(null)
                        }}
                      >
                        {isAdding ? "Incluindo..." : "Incluir"}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedStudentActivityId(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
