"use client"

import { Plus, Trophy, Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data
const events = [
  {
    id: "1",
    name: "Campeonato Estadual de Jiu-Jitsu",
    type: "competition",
    date: "2024-03-15",
    location: "Ginásio Ibirapuera",
    participants: 8,
  },
  {
    id: "2",
    name: "Seminário com Mestre Marcos",
    type: "seminar",
    date: "2024-03-20",
    location: "Academia",
    participants: 25,
  },
  {
    id: "3",
    name: "Open de Muay Thai",
    type: "competition",
    date: "2024-04-10",
    location: "Arena Combat",
    participants: 5,
  },
  {
    id: "4",
    name: "Confraternização de Verão",
    type: "social",
    date: "2024-04-25",
    location: "Praia Grande",
    participants: 40,
  },
]

const typeColors: Record<string, string> = {
  competition: "bg-red-500/10 text-red-500",
  seminar: "bg-blue-500/10 text-blue-500",
  social: "bg-green-500/10 text-green-500",
  graduation: "bg-yellow-500/10 text-yellow-500",
}

const typeLabels: Record<string, string> = {
  competition: "Competição",
  seminar: "Seminário",
  social: "Social",
  graduation: "Graduação",
}

export default function EventsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">Gerencie competições e seminários</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Evento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-xs text-muted-foreground">Próximos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Trophy className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {events.filter((e) => e.type === "competition").length}
                </p>
                <p className="text-xs text-muted-foreground">Competições</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Trophy className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {events.filter((e) => e.type === "seminar").length}
                </p>
                <p className="text-xs text-muted-foreground">Seminários</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {events.reduce((acc, e) => acc + e.participants, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Inscritos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{event.name}</CardTitle>
                <Badge className={typeColors[event.type]}>{typeLabels[event.type]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(event.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{event.participants} participantes</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
