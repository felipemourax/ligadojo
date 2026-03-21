"use client"

import { useState } from "react"
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  Instagram,
  Video,
  ImageIcon,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ScheduledPost {
  id: string
  title: string
  type: "reels" | "story" | "post" | "carousel"
  platform: "instagram" | "tiktok" | "facebook"
  date: string
  time: string
  status: "scheduled" | "published" | "draft"
}

const mockPosts: ScheduledPost[] = [
  {
    id: "1",
    title: "Treino da turma kids",
    type: "reels",
    platform: "instagram",
    date: "2026-03-18",
    time: "18:00",
    status: "scheduled",
  },
  {
    id: "2",
    title: "Técnica da semana",
    type: "carousel",
    platform: "instagram",
    date: "2026-03-19",
    time: "12:00",
    status: "scheduled",
  },
  {
    id: "3",
    title: "Bastidores do treino",
    type: "story",
    platform: "instagram",
    date: "2026-03-17",
    time: "10:00",
    status: "published",
  },
  {
    id: "4",
    title: "Promoção aula experimental",
    type: "post",
    platform: "instagram",
    date: "2026-03-20",
    time: "19:00",
    status: "draft",
  },
  {
    id: "5",
    title: "Depoimento de aluno",
    type: "reels",
    platform: "tiktok",
    date: "2026-03-21",
    time: "17:00",
    status: "scheduled",
  },
]

const typeIcons = {
  reels: Video,
  story: Instagram,
  post: ImageIcon,
  carousel: ImageIcon,
}

const typeLabels = {
  reels: "Reels",
  story: "Story",
  post: "Post",
  carousel: "Carrossel",
}

const statusColors = {
  scheduled: "bg-blue-500/20 text-blue-400",
  published: "bg-green-500/20 text-green-400",
  draft: "bg-yellow-500/20 text-yellow-400",
}

const statusLabels = {
  scheduled: "Agendado",
  published: "Publicado",
  draft: "Rascunho",
}

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function MarketingCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 17)) // March 2026
  const [posts, setPosts] = useState<ScheduledPost[]>(mockPosts)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getPostsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return posts.filter((post) => post.date === dateStr)
  }

  const formatDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const today = new Date()
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  // Generate calendar grid
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const upcomingPosts = posts
    .filter((post) => post.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendário de posts</h1>
          <p className="text-muted-foreground">
            Organize e agende suas publicações nas redes sociais.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Agendar post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agendar novo post</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do post que deseja agendar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do post</Label>
                <Input id="title" placeholder="Ex: Treino da turma kids" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reels">Reels</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="carousel">Carrossel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Plataforma</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea id="description" placeholder="Notas sobre o post..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => setIsDialogOpen(false)}
              >
                Agendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {posts.filter((p) => p.status === "scheduled").length}
              </p>
              <p className="text-xs text-muted-foreground">Agendados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <Instagram className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {posts.filter((p) => p.status === "published").length}
              </p>
              <p className="text-xs text-muted-foreground">Publicados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
              <ImageIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {posts.filter((p) => p.status === "draft").length}
              </p>
              <p className="text-xs text-muted-foreground">Rascunhos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{posts.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {months[month]} {year}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayPosts = day ? getPostsForDate(day) : []
                const dateStr = day ? formatDateStr(day) : ""

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[80px] rounded-lg border p-1 transition-colors",
                      day
                        ? "border-border bg-background hover:border-primary/30 cursor-pointer"
                        : "border-transparent",
                      isToday(day || 0) && "border-primary bg-primary/5",
                      selectedDate === dateStr && "border-primary"
                    )}
                    onClick={() => day && setSelectedDate(dateStr)}
                  >
                    {day && (
                      <>
                        <div
                          className={cn(
                            "text-xs font-medium mb-1",
                            isToday(day) ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayPosts.slice(0, 2).map((post) => {
                            const Icon = typeIcons[post.type]
                            return (
                              <div
                                key={post.id}
                                className={cn(
                                  "flex items-center gap-1 rounded px-1 py-0.5 text-xs truncate",
                                  statusColors[post.status]
                                )}
                              >
                                <Icon className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{post.title}</span>
                              </div>
                            )
                          })}
                          {dayPosts.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayPosts.length - 2} mais
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Posts */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximos posts
            </CardTitle>
            <CardDescription>Posts agendados para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPosts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhum post agendado
              </p>
            ) : (
              upcomingPosts.map((post) => {
                const Icon = typeIcons[post.type]
                const date = new Date(post.date + "T00:00:00")
                return (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{post.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                        <span>•</span>
                        <span>{post.time}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {typeLabels[post.type]}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={cn("text-xs", statusColors[post.status])}
                        >
                          {statusLabels[post.status]}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
