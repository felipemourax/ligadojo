"use client"

import { Calendar, Users } from "lucide-react"
import type { StudentAppClassesData } from "@/apps/api/src/modules/app/domain/student-app"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"

interface StudentClassesScreenProps {
  data: StudentAppClassesData
  savingClassId: string | null
  notice: string | null
  error: string | null
  onToggleEnrollment: (classId: string, joined: boolean) => void
}

export function StudentClassesScreen({
  data,
  savingClassId,
  notice,
  error,
  onToggleEnrollment,
}: StudentClassesScreenProps) {
  return (
    <div className="space-y-6 p-4">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Turmas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulte horários, professor responsável e entre ou saia das turmas disponíveis.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Disponíveis</p>
          <p className="font-semibold text-foreground">{data.classes.length}</p>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </section>
      ) : null}

      {notice ? (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-700">{notice}</p>
        </section>
      ) : null}
      {data.classes.length === 0 ? (
        <Card>
          <CardContent className="p-4">
            <AppEmptyState message="Nenhuma turma disponível para este aluno agora." />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.classes.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {item.modalityName}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.teacherName}</p>
                    <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.dayLabel} • {item.timeLabel}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {item.currentStudents}/{item.maxStudents} alunos • frequência {item.attendanceRate}%
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={item.joined ? "outline" : "default"}
                    disabled={savingClassId === item.id}
                    onClick={() => onToggleEnrollment(item.id, item.joined)}
                  >
                    {savingClassId === item.id
                      ? "Salvando..."
                      : item.joined
                        ? "Sair"
                        : "Participar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
