"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Award,
  ChevronDown,
  Medal,
  Plus,
  Search,
  Trash2,
  Trophy,
  Users,
} from "lucide-react"
import type { AthletesDashboardData } from "@/apps/api/src/modules/athletes/domain/athletes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { resolveBeltBadgeStyle } from "@/lib/ui/belt-badges"
import {
  athleteTitlePlacementOptions,
  resolveAthleteTitlePlacementStyle,
} from "@/lib/ui/title-placements"
import { addAthleteTitle, fetchAthletesDashboard, removeAthleteTitle } from "@/modules/athletes/services"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function createTitleForm() {
  return {
    placement: "",
    competition: "",
    year: String(new Date().getFullYear()),
  }
}

export function AthletesDashboardScreen() {
  const [data, setData] = useState<AthletesDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [beltFilter, setBeltFilter] = useState("all")
  const [activityFilter, setActivityFilter] = useState("all")
  const [expandedAthleteId, setExpandedAthleteId] = useState<string | null>(null)
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null)
  const [isTitleDialogOpen, setIsTitleDialogOpen] = useState(false)
  const [titleForm, setTitleForm] = useState(createTitleForm)
  const [isSaving, setIsSaving] = useState(false)
  const [removingTitleId, setRemovingTitleId] = useState<string | null>(null)

  async function load() {
    setIsLoading(true)
    try {
      const response = await fetchAthletesDashboard()
      setData(response)
      setFeedback(null)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar atletas e títulos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filteredAthletes = useMemo(() => {
    if (!data) return []

    const normalizedSearch = search.trim().toLowerCase()
    return data.athletes.filter((athlete) => {
      if (beltFilter !== "all" && athlete.belt !== beltFilter) {
        return false
      }

      if (activityFilter !== "all" && !athlete.activityLabels.includes(activityFilter)) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return athlete.name.toLowerCase().includes(normalizedSearch)
    })
  }, [activityFilter, beltFilter, data, search])

  const selectedAthlete = data?.athletes.find((athlete) => athlete.id === selectedAthleteId) ?? null
  const years = Array.from({ length: 41 }, (_, index) => String(new Date().getFullYear() - index))

  async function handleAddTitle() {
    if (!selectedAthlete) return
    setIsSaving(true)
    try {
      const response = await addAthleteTitle(selectedAthlete.id, {
        placement: titleForm.placement as "gold" | "silver" | "bronze" | "champion" | "runner_up",
        competition: titleForm.competition,
        year: Number(titleForm.year),
      })
      setData(response.data)
      setExpandedAthleteId(selectedAthlete.id)
      setIsTitleDialogOpen(false)
      setTitleForm(createTitleForm())
      toast({
        title: "Título adicionado",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao adicionar título",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRemoveTitle(athleteId: string, titleId: string) {
    setRemovingTitleId(titleId)
    try {
      const response = await removeAthleteTitle(athleteId, titleId)
      setData(response.data)
      toast({
        title: "Título removido",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao remover título",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setRemovingTitleId(null)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando atletas e títulos...</p>
  }

  if (feedback) {
    return (
      <section className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{feedback}</p>
        <Button type="button" variant="outline" onClick={() => void load()}>
          Tentar novamente
        </Button>
      </section>
    )
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Sem dados de atletas disponíveis.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Atletas e Títulos</h1>
        <p className="text-muted-foreground">
          Visualize seus atletas, acompanhe o ranking interno e gerencie os títulos da academia.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.stats.totalAthletes}</p>
              <p className="text-xs text-muted-foreground">Total de atletas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.stats.totalTitles}</p>
              <p className="text-xs text-muted-foreground">Total de títulos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.stats.averageTitlesPerAthlete}</p>
              <p className="text-xs text-muted-foreground">Média por atleta</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar atleta..."
                className="pl-9"
              />
            </div>
            <Select value={beltFilter} onValueChange={setBeltFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Faixa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as faixas</SelectItem>
                {data.filters.belts.map((belt) => (
                  <SelectItem key={belt} value={belt}>
                    {belt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as modalidades</SelectItem>
                {data.filters.activities.map((activity) => (
                  <SelectItem key={activity} value={activity}>
                    {activity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredAthletes.map((athlete) => {
              const isExpanded = expandedAthleteId === athlete.id
              return (
                <Card key={athlete.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      type="button"
                      className="flex w-full items-center gap-4 p-4 text-left"
                      onClick={() => setExpandedAthleteId(isExpanded ? null : athlete.id)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{getInitials(athlete.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold">{athlete.name}</h3>
                          <Badge style={resolveBeltBadgeStyle({ beltName: athlete.belt })}>{athlete.belt}</Badge>
                          <Badge variant="outline">{athlete.roleLabel}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{athlete.primaryActivityLabel}</span>
                          <span>•</span>
                          <span>{athlete.totalTitles} título(s)</span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded ? (
                      <div className="space-y-4 border-t bg-muted/20 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {athlete.activityLabels.map((activity) => (
                            <Badge key={activity} variant="secondary">
                              {activity}
                            </Badge>
                          ))}
                        </div>

                        <div className="space-y-3">
                          {athlete.titles.length === 0 ? (
                            <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                              Nenhum título cadastrado para este atleta.
                            </div>
                          ) : (
                            athlete.titles.map((title) => (
                              <div
                                key={title.id}
                                className="flex items-start justify-between gap-3 rounded-2xl border bg-background p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`mt-0.5 rounded-full p-2 ${resolveAthleteTitlePlacementStyle(title.placement).badgeClassName}`}
                                  >
                                    <Medal className={`h-4 w-4 ${resolveAthleteTitlePlacementStyle(title.placement).iconClassName}`} />
                                  </div>
                                  <div>
                                    <p className="font-medium">{title.title}</p>
                                  <p className="text-sm text-muted-foreground">{title.competition}</p>
                                  <p className="mt-1 text-xs font-medium text-primary">{title.year}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  disabled={removingTitleId === title.id}
                                  onClick={() => void handleRemoveTitle(athlete.id, title.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedAthleteId(athlete.id)
                            setIsTitleDialogOpen(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar título
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Medal className="h-5 w-5 text-primary" />
              Top atletas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topAthletes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum título cadastrado ainda.</p>
            ) : (
              data.topAthletes.map((athlete, index) => (
                <div key={athlete.athleteId} className="flex items-center gap-3 rounded-2xl bg-muted/30 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{athlete.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {athlete.primaryActivityLabel} • {athlete.belt}
                    </p>
                  </div>
                  <Badge variant="secondary">{athlete.totalTitles}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isTitleDialogOpen} onOpenChange={setIsTitleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar título</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="athlete-title-placement">Colocação</Label>
              <Select
                value={titleForm.placement}
                onValueChange={(value) =>
                  setTitleForm((current) => ({
                    ...current,
                    placement: value,
                  }))
                }
              >
                <SelectTrigger id="athlete-title-placement">
                  <SelectValue placeholder="Selecione a colocação" />
                </SelectTrigger>
                <SelectContent>
                  {athleteTitlePlacementOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="athlete-title-competition">Competição</Label>
              <Input
                id="athlete-title-competition"
                value={titleForm.competition}
                onChange={(event) =>
                  setTitleForm((current) => ({
                    ...current,
                    competition: event.target.value,
                  }))
                }
                placeholder="Mundial IBJJF 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="athlete-title-year">Ano</Label>
              <Select
                value={titleForm.year}
                onValueChange={(value) =>
                  setTitleForm((current) => ({
                    ...current,
                    year: value,
                  }))
                }
              >
                <SelectTrigger id="athlete-title-year">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTitleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => void handleAddTitle()} disabled={isSaving}>
              Salvar título
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
