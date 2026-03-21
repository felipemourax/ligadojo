"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertTriangle } from "lucide-react"
import type { DashboardOverviewData } from "@/apps/api/src/modules/dashboard/domain/dashboard-overview"
import { cn } from "@/lib/utils"
import { studentRoutes } from "@/modules/students/routes"

type AlertStudentType = DashboardOverviewData["alerts"][number]["type"]

const alertStyles: Record<AlertStudentType, string> = {
  inactive: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
}

const alertLabels: Record<AlertStudentType, string> = {
  inactive: "inativo",
  overdue: "inadimplente",
}

export function AlertStudents({
  students,
}: {
  students: DashboardOverviewData["alerts"]
}) {
  return (
    <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-chart-3" />
          <h3 className="font-semibold text-foreground">Atenção Necessária</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link href={studentRoutes.list}>
            Ver todos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1 md:pr-2">
        {students.length > 0 ? students.map((student) => (
          <Link
            key={student.id}
            href={studentRoutes.list}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {student.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {student.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {student.issue}
              </p>
            </div>
            <Badge 
              variant="outline"
              className={cn("text-[10px] shrink-0 capitalize", alertStyles[student.type])}
            >
              {alertLabels[student.type]}
            </Badge>
          </Link>
        )) : (
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Nenhum alerta operacional no momento.
          </div>
        )}
      </div>
    </div>
  )
}
