"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const recentStudents = [
  {
    id: "1",
    name: "Lucas Oliveira",
    belt: "Azul",
    modality: "Jiu-Jitsu",
    joinedAt: "Hoje",
    avatar: "",
  },
  {
    id: "2",
    name: "Maria Santos",
    belt: "Branca",
    modality: "Muay Thai",
    joinedAt: "Ontem",
    avatar: "",
  },
  {
    id: "3",
    name: "Pedro Costa",
    belt: "Amarela",
    modality: "Judô",
    joinedAt: "2 dias",
    avatar: "",
  },
  {
    id: "4",
    name: "Ana Rodrigues",
    belt: "Roxa",
    modality: "Jiu-Jitsu",
    joinedAt: "3 dias",
    avatar: "",
  },
]

const beltColors: Record<string, string> = {
  "Branca": "bg-secondary text-secondary-foreground",
  "Azul": "bg-blue-500/20 text-blue-400",
  "Roxa": "bg-purple-500/20 text-purple-400",
  "Marrom": "bg-amber-800/20 text-amber-600",
  "Preta": "bg-foreground/10 text-foreground",
  "Amarela": "bg-yellow-500/20 text-yellow-500",
}

export function RecentStudents() {
  return (
    <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Novos Alunos</h3>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link href="/dashboard/alunos">
            Ver todos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {recentStudents.map((student) => (
          <Link
            key={student.id}
            href={`/dashboard/alunos/${student.id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
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
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-[10px] px-1.5 py-0 ${beltColors[student.belt] || ""}`}
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
                {student.joinedAt}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
