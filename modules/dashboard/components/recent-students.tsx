"use client"

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DashboardOverviewData } from "@/apps/api/src/modules/dashboard/domain/dashboard-overview"
import { resolveBeltBadgeStyle } from "@/lib/ui/belt-badges"
import { studentRoutes } from "@/modules/students/routes"

export function RecentStudents({
  students,
}: {
  students: DashboardOverviewData["recentStudents"]
}) {
  return (
    <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Novos Alunos</h3>
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
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
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
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={resolveBeltBadgeStyle({ beltName: student.belt, colorHex: student.beltColorHex })}
                >
                  {student.belt}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {student.modality}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {student.joinedAtLabel}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        )) : (
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Nenhum aluno recente encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
