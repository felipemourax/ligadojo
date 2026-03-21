"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const alertStudents = [
  {
    id: "1",
    name: "Fernando Lima",
    issue: "Sem treinar há 15 dias",
    type: "inativo",
    avatar: "",
  },
  {
    id: "2",
    name: "Carla Mendes",
    issue: "Mensalidade atrasada",
    type: "inadimplente",
    avatar: "",
  },
  {
    id: "3",
    name: "Roberto Alves",
    issue: "Sem treinar há 30 dias",
    type: "inativo",
    avatar: "",
  },
]

const alertStyles = {
  inativo: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  inadimplente: "bg-destructive/10 text-destructive border-destructive/20",
}

export function AlertStudents() {
  return (
    <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-chart-3" />
          <h3 className="font-semibold text-foreground">Atenção Necessária</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link href="/dashboard/retencao">
            Ver todos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {alertStudents.map((student) => (
          <Link
            key={student.id}
            href={`/dashboard/alunos/${student.id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={student.avatar} />
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
              {student.type}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
