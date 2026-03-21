"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Users } from "lucide-react"
import type { DashboardOverviewData } from "@/apps/api/src/modules/dashboard/domain/dashboard-overview"
import { cn } from "@/lib/utils"
import { attendanceRoutes } from "@/modules/attendance/routes"

type ClassStatus = DashboardOverviewData["todayClasses"][number]["status"]

const statusStyles: Record<ClassStatus, string> = {
  upcoming: "bg-primary/10 text-primary",
  ongoing: "bg-chart-3/20 text-chart-3",
  completed: "bg-secondary text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
}

const statusLabels: Record<ClassStatus, string> = {
  upcoming: "Em breve",
  ongoing: "Em andamento",
  completed: "Finalizada",
  cancelled: "Cancelada",
}

export function TodayClasses({
  classes,
}: {
  classes: DashboardOverviewData["todayClasses"]
}) {
  return (
    <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Aulas de Hoje</h3>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link href={attendanceRoutes.list}>
            Ver presença
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1 md:pr-2">
        {classes.length > 0 ? classes.map((classItem) => (
          <Link
            key={classItem.id}
            href={attendanceRoutes.list}
            className={cn(
              "block p-3 rounded-xl transition-colors",
              classItem.status === "completed" || classItem.status === "cancelled"
                ? "bg-secondary/30 opacity-60" 
                : "hover:bg-secondary/50"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {classItem.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {classItem.instructor}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className={cn("text-[10px] shrink-0", statusStyles[classItem.status])}
              >
                {statusLabels[classItem.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {classItem.time}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {classItem.students}/{classItem.maxStudents}
              </span>
            </div>
          </Link>
        )) : (
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Nenhuma aula agendada para hoje.
          </div>
        )}
      </div>
    </div>
  )
}
