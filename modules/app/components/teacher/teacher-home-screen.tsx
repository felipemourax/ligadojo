"use client"

import Link from "next/link"
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  ClipboardCheck,
  GraduationCap,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react"
import type { TeacherAppHomeData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSectionCard } from "@/modules/app/components/app-section-card"
import { routes } from "@/lib/routes"

export function TeacherHomeScreen({ data }: { data: TeacherAppHomeData }) {
  const greetingDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const stats = {
    classesToday: data.upcomingClasses.length,
    expectedStudents: data.upcomingClasses.reduce((total, item) => total + item.studentCount, 0),
    graduationEligible: Math.max(0, Math.min(data.upcomingClasses.length, 3)),
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Olá, {data.teacher.name}</h1>
        <p className="capitalize text-muted-foreground">{greetingDate}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-primary/20 bg-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.classesToday}</p>
                <p className="text-xs text-muted-foreground">Aulas hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expectedStudents}</p>
                <p className="text-xs text-muted-foreground">Alunos esperados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.graduationEligible}</p>
                <p className="text-xs text-muted-foreground">Elegíveis p/ exame</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Trophy className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Eventos próximos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-yellow-500" />
        <p className="text-sm flex-1">Revise presenças pendentes e finalize as chamadas do dia.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Aulas de Hoje
            </CardTitle>
            <Link href={routes.tenantAppTeacherAgenda}>
              <Button variant="ghost" size="sm" className="text-primary">
                Ver agenda
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.upcomingClasses.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
            >
              <div className="min-w-[50px] text-center">
                <span className="text-lg font-bold">{item.startTime}</span>
                <span className="block text-xs text-muted-foreground">90 min</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{item.name}</p>
                  <Badge variant="outline">{item.modalityLabel}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.dayLabel}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{item.studentCount}</span>
                </div>
              </div>
              <Link href={routes.tenantAppTeacherAttendance}>
                <Button size="sm" variant="outline">
                  <ClipboardCheck className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link href={routes.tenantAppTeacherAttendance}>
          <Card className="h-full cursor-pointer transition-colors hover:bg-secondary/50">
            <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">Registrar Presença</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={routes.tenantAppTeacherEvolution}>
          <Card className="h-full cursor-pointer transition-colors hover:bg-secondary/50">
            <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">Ver Evolução</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={routes.tenantAppTeacherClasses}>
          <Card className="h-full cursor-pointer transition-colors hover:bg-secondary/50">
            <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <UserPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Gerenciar Alunos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={routes.tenantAppTeacherClasses}>
          <Card className="h-full cursor-pointer transition-colors hover:bg-secondary/50">
            <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Gerenciar Turmas</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <AppSectionCard title="Elegíveis para Graduação" description="Alunos próximos da próxima faixa.">
        <div className="space-y-3">
          {data.upcomingClasses.slice(0, 3).map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20 text-primary">{(index + 1).toString()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.studentCount} alunos ativos</p>
              </div>
              <Badge variant="outline">Avaliar</Badge>
            </div>
          ))}
        </div>
      </AppSectionCard>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Próximas Aulas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.upcomingClasses.map((item) => (
            <div key={`next-${item.id}`} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
              <div className="flex items-center gap-3">
                <div className="min-w-[60px] text-center">
                  <p className="text-sm font-medium">{item.dayLabel}</p>
                  <p className="text-xs text-muted-foreground">{item.startTime}</p>
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.studentCount} alunos</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
