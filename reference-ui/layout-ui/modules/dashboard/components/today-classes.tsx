"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const todayClasses = [
  {
    id: "1",
    name: "Jiu-Jitsu Iniciante",
    time: "17:00 - 18:30",
    instructor: "Prof. Carlos",
    students: 12,
    maxStudents: 20,
    status: "upcoming",
  },
  {
    id: "2",
    name: "Muay Thai Avançado",
    time: "18:30 - 20:00",
    instructor: "Prof. Ricardo",
    students: 8,
    maxStudents: 15,
    status: "upcoming",
  },
  {
    id: "3",
    name: "Judô Kids",
    time: "14:00 - 15:00",
    instructor: "Prof. Amanda",
    students: 15,
    maxStudents: 18,
    status: "completed",
  },
  {
    id: "4",
    name: "Jiu-Jitsu Competição",
    time: "20:00 - 21:30",
    instructor: "Prof. Carlos",
    students: 6,
    maxStudents: 12,
    status: "upcoming",
  },
]

const statusStyles = {
  upcoming: "bg-primary/10 text-primary",
  ongoing: "bg-chart-3/20 text-chart-3",
  completed: "bg-secondary text-muted-foreground",
}

const statusLabels = {
  upcoming: "Em breve",
  ongoing: "Em andamento",
  completed: "Finalizada",
}

export function TodayClasses() {
  return (
    <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Aulas de Hoje</h3>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link href="/dashboard/turmas">
            Ver agenda
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {todayClasses.map((classItem) => (
          <Link
            key={classItem.id}
            href={`/dashboard/turmas/${classItem.id}`}
            className={cn(
              "block p-3 rounded-xl transition-colors",
              classItem.status === "completed" 
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
        ))}
      </div>
    </div>
  )
}
