"use client"

import Link from "next/link"
import {
  Calendar,
  ChevronRight,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"
import type { StudentAppHomeData } from "@/apps/api/src/modules/app/domain/student-app"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"
import { routes } from "@/lib/routes"

const statIcons = [CreditCard, TrendingUp, Calendar] as const

export function StudentHomeScreen({ data }: { data: StudentAppHomeData }) {
  return (
    <div className="space-y-6 p-4">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Olá, {data.student.name}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe seu plano, sua frequência e as próximas atividades da academia.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Plano</p>
          <p className="font-semibold text-foreground">
            {data.student.planName ?? "Sem plano ativo"}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {data.stats.map((item, index) => {
          const Icon = statIcons[index] ?? Users

          return (
            <Card key={item.title}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold text-primary">{item.value}</span>
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Situação do aluno</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Seu acesso, frequência e pagamentos refletem sempre os dados reais da academia.
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={routes.tenantAppStudentPlans}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
            >
              Ver planos
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href={routes.tenantAppStudentPayments}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
            >
              Ver cobranças
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Minhas turmas</h2>
          <Link
            href={routes.tenantAppStudentClasses}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Ver todas
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {data.classes.length === 0 ? (
          <Card>
            <CardContent className="p-4">
              <AppEmptyState message="Você ainda não possui turmas vinculadas nesta academia." />
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
                          Matriculado
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.modalityName} • {item.teacherName}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.dayLabel} • {item.timeLabel}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Frequência: {item.attendanceRate}% • {item.currentStudents}/{item.maxStudents} alunos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
