"use client"

import { Award, ChevronRight, ShieldCheck } from "lucide-react"
import type { StudentAppProgressData } from "@/apps/api/src/modules/app/domain/student-app"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"

export function StudentProgressScreen({ data }: { data: StudentAppProgressData }) {
  const totalHistory = data.activities.reduce(
    (sum, activity) => sum + activity.graduationHistory.length,
    0
  )

  return (
    <div className="space-y-6 p-4">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Evolução</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe faixas, graus e o histórico técnico das suas atividades principais.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Histórico</p>
          <p className="font-semibold text-foreground">{totalHistory}</p>
        </div>
      </section>

      {data.activities.length === 0 ? (
        <Card>
          <CardContent className="p-4">
            <AppEmptyState message="Nenhum histórico de evolução encontrado." />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.activities.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <p className="truncate font-medium text-foreground">{item.activityLabel}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.belt} • {item.stripes} grau(s)
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Frequência atual: {item.attendanceRate}%
                    </p>
                    {item.practicedModalities.length > 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Modalidades praticadas: {item.practicedModalities.join(", ")}
                      </p>
                    ) : null}
                    {item.enrolledClasses.length > 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Turmas: {item.enrolledClasses.join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                    Atual
                  </Badge>
                </div>

                <div className="mt-4 space-y-2">
                  {item.graduationHistory.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                      Sem promoções registradas nesta atividade ainda.
                    </div>
                  ) : (
                    item.graduationHistory.map((historyItem) => (
                      <div
                        key={historyItem.id}
                        className="flex items-start gap-3 rounded-xl border border-border px-3 py-3"
                      >
                        <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {historyItem.from ? `${historyItem.from} → ${historyItem.to}` : historyItem.to}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {historyItem.date} • Avaliador: {historyItem.evaluator}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
