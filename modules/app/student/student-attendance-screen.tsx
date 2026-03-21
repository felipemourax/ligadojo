"use client"

import { useMemo, useState } from "react"
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  ShieldAlert,
  XCircle,
} from "lucide-react"
import type { StudentAppAttendanceData } from "@/apps/api/src/modules/app/domain/student-app"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"
import { cn } from "@/lib/utils"

function attendanceStatusLabel(status: StudentAppAttendanceData["attendance"][number]["status"]) {
  switch (status) {
    case "present":
      return "Presente"
    case "absent":
      return "Falta"
    case "justified":
      return "Justificada"
  }
}

function attendanceBadgeVariant(status: StudentAppAttendanceData["attendance"][number]["status"]) {
  switch (status) {
    case "present":
      return "default" as const
    case "absent":
      return "destructive" as const
    case "justified":
      return "secondary" as const
  }
}

function attendanceIcon(status: StudentAppAttendanceData["attendance"][number]["status"]) {
  switch (status) {
    case "present":
      return CheckCircle2
    case "absent":
      return XCircle
    case "justified":
      return ShieldAlert
  }
}

function attendanceIconTone(status: StudentAppAttendanceData["attendance"][number]["status"]) {
  switch (status) {
    case "present":
      return "bg-primary/20 text-primary"
    case "absent":
      return "bg-destructive/20 text-destructive"
    case "justified":
      return "bg-amber-500/20 text-amber-700"
  }
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) {
    return value
  }

  return `${day}/${month}/${year}`
}

export function StudentAttendanceScreen({ data }: { data: StudentAppAttendanceData }) {
  const [activityFilter, setActivityFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<
    StudentAppAttendanceData["attendance"][number]["status"] | null
  >(null)

  const activityOptions = useMemo(
    () => Array.from(new Set(data.attendance.map((item) => item.activityLabel))).sort(),
    [data.attendance]
  )

  const filteredAttendance = useMemo(
    () =>
      data.attendance.filter((item) => {
        if (activityFilter && item.activityLabel !== activityFilter) {
          return false
        }

        if (statusFilter && item.status !== statusFilter) {
          return false
        }

        return true
      }),
    [activityFilter, data.attendance, statusFilter]
  )

  return (
    <div className="space-y-4 p-4">
      <section className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Presença</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe suas últimas aulas e filtre seu histórico de presença.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium text-foreground">Últimas aulas</h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {activityFilter ?? "Atividades"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por atividade</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActivityFilter(null)}>
                  Todas as atividades
                </DropdownMenuItem>
                {activityOptions.map((activity) => (
                  <DropdownMenuItem key={activity} onClick={() => setActivityFilter(activity)}>
                    {activity}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {statusFilter ? attendanceStatusLabel(statusFilter) : "Status"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  Todos os status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("present")}>Presente</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("justified")}>Justificada</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("absent")}>Falta</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {filteredAttendance.length === 0 ? (
          <Card>
            <CardContent className="p-4">
              <AppEmptyState message="Nenhum registro encontrado para os filtros selecionados." />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredAttendance.map((item) => {
              const StatusIcon = attendanceIcon(item.status)

              return (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                          attendanceIconTone(item.status)
                        )}
                      >
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-foreground">{item.className}</p>
                          <Badge
                            variant={attendanceBadgeVariant(item.status)}
                            className="shrink-0 text-[10px]"
                          >
                            {attendanceStatusLabel(item.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.activityLabel}</p>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDisplayDate(item.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
