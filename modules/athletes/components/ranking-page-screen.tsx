"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Medal,
  Search,
  Trophy,
  Users,
} from "lucide-react"
import type {
  AthleteTitleItem,
  RankingAcademyProfile,
  RankingAcademySummary,
  RankingDirectoryData,
} from "@/apps/api/src/modules/athletes/domain/athletes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { resolveBeltBadgeStyle } from "@/lib/ui/belt-badges"
import { resolveAthleteTitlePlacementStyle } from "@/lib/ui/title-placements"
import { cn } from "@/lib/utils"
import { fetchRankingAcademyProfile, fetchRankingDirectory } from "@/modules/athletes/services"

const modalityChips = [
  { value: "all", label: "Todas", icon: "trophy" },
  { value: "jiu-jitsu", label: "Jiu-Jitsu", icon: "🥋" },
  { value: "no-gi", label: "No-Gi", icon: "🤼" },
  { value: "muay-thai", label: "Muay Thai", icon: "🥊" },
  { value: "boxe", label: "Boxe", icon: "🥊" },
  { value: "mma", label: "MMA", icon: "🦾" },
  { value: "wrestling", label: "Wrestling", icon: "🤼" },
  { value: "judo", label: "Judô", icon: "🥋" },
  { value: "karate", label: "Karatê", icon: "🥋" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function toRgba(hex: string | null | undefined, alpha: number) {
  const normalized = hex?.trim()
  if (!normalized) return null

  const clean = normalized.replace("#", "")
  const full = clean.length === 3
    ? clean.split("").map((char) => `${char}${char}`).join("")
    : clean

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return null
  }

  const value = Number.parseInt(full, 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function getBannerStyle(input: { bannerUrl?: string | null; primaryColor?: string | null }) {
  const primary = input.primaryColor?.trim() || "#0f172a"
  const primarySoft = toRgba(primary, 0.68) ?? "rgba(15, 23, 42, 0.68)"
  const primaryStrong = toRgba(primary, 0.9) ?? "rgba(15, 23, 42, 0.9)"

  if (input.bannerUrl) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.12) 0%, ${primaryStrong} 100%), url(${input.bannerUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
  }

  return {
    backgroundImage: `linear-gradient(135deg, ${primarySoft} 0%, ${primaryStrong} 100%)`,
  }
}

function getTitleAccent(title: AthleteTitleItem) {
  const style = resolveAthleteTitlePlacementStyle(title.placement)
  return {
    textClassName: style.iconClassName,
    backgroundClassName: style.badgeClassName,
  }
}

function HighlightCard({
  academy,
  onSelect,
}: {
  academy: RankingAcademySummary
  onSelect: (academySlug: string) => void
}) {
  return (
    <Card
      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
      onClick={() => onSelect(academy.slug)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: academy.primaryColor || "hsl(var(--primary))" }}
          >
            {academy.logoUrl ? (
              <Avatar className="h-12 w-12 rounded-xl">
                <AvatarImage src={academy.logoUrl} alt={academy.name} />
                <AvatarFallback className="rounded-xl">{getInitials(academy.name)}</AvatarFallback>
              </Avatar>
            ) : (
              <Building2 className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium">{academy.name}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {academy.totalAthletes}
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-500" />
                {academy.totalTitles}
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function ResultCard({
  academy,
  onSelect,
}: {
  academy: RankingAcademySummary
  onSelect: (academySlug: string) => void
}) {
  return (
    <Card
      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
      onClick={() => onSelect(academy.slug)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: academy.primaryColor || "hsl(var(--primary))" }}
          >
            {academy.logoUrl ? (
              <Avatar className="h-14 w-14 rounded-xl">
                <AvatarImage src={academy.logoUrl} alt={academy.name} />
                <AvatarFallback className="rounded-xl">{getInitials(academy.name)}</AvatarFallback>
              </Avatar>
            ) : (
              <Building2 className="h-7 w-7" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold">{academy.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {[academy.city, academy.state].filter(Boolean).join(", ") || "Localização não informada"}
            </div>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <div className="text-center">
              <p className="text-lg font-bold">{academy.totalAthletes}</p>
              <p className="text-xs text-muted-foreground">atletas</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-yellow-500">{academy.totalTitles}</p>
              <p className="text-xs text-muted-foreground">títulos</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function AthleteCard({
  athlete,
}: {
  athlete: RankingAcademyProfile["athletes"][number]
}) {
  return (
    <Card className="group w-[280px] min-w-[280px] overflow-hidden sm:w-[304px] sm:min-w-[304px]">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),_transparent_45%)]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className="h-24 w-24 border border-white/20 bg-white/10">
            <AvatarFallback className="bg-transparent text-2xl font-semibold text-white">
              {getInitials(athlete.name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white">{athlete.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              className="border-0 text-xs"
              style={resolveBeltBadgeStyle({ beltName: athlete.belt })}
            >
              {athlete.belt}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{athlete.titles.length} títulos</span>
        </div>
        <div className="space-y-2">
          {athlete.titles.map((title) => {
            const accent = getTitleAccent(title)
            return (
              <div
                key={title.id}
                className={cn("flex items-center gap-2 rounded-lg p-2", accent.backgroundClassName)}
              >
                <Medal className={cn("h-4 w-4", accent.textClassName)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {title.title} - {title.competition}
                  </p>
                  <p className="text-xs text-muted-foreground">{title.year}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function RankingPageScreen() {
  const [directory, setDirectory] = useState<RankingDirectoryData | null>(null)
  const [selectedAcademy, setSelectedAcademy] = useState<RankingAcademyProfile | null>(null)
  const [search, setSearch] = useState("")
  const [selectedState, setSelectedState] = useState("all")
  const [selectedModality, setSelectedModality] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const athletesScrollRef = useRef<HTMLDivElement | null>(null)

  const showResults = Boolean(search.trim()) || selectedState !== "all" || selectedModality !== "all"

  async function loadDirectory() {
    setIsLoading(true)
    try {
      const response = await fetchRankingDirectory({
        search,
        state: selectedState === "all" ? "" : selectedState,
        modality: selectedModality,
      })
      setDirectory(response.data)
      setFeedback(null)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar o ranking.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDirectory()
  }, [search, selectedModality, selectedState])

  async function handleSelectAcademy(academySlug: string) {
    try {
      const response = await fetchRankingAcademyProfile(academySlug)
      setSelectedAcademy(response.data)
      setFeedback(null)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível abrir a academia.")
    }
  }

  useEffect(() => {
    if (!selectedAcademy || !athletesScrollRef.current) {
      return
    }

    athletesScrollRef.current.scrollTo({ left: 0, behavior: "auto" })
  }, [selectedAcademy])

  function scrollAthletes(direction: "left" | "right") {
    const container = athletesScrollRef.current
    if (!container) {
      return
    }

    container.scrollBy({
      left: direction === "left" ? -332 : 332,
      behavior: "smooth",
    })
  }

  if (selectedAcademy) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="relative h-64 overflow-hidden md:h-80" style={getBannerStyle(selectedAcademy)}>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={() => setSelectedAcademy(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background shadow-lg md:h-24 md:w-24">
                {selectedAcademy.logoUrl ? (
                  <img
                    src={selectedAcademy.logoUrl}
                    alt={selectedAcademy.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-primary md:h-12 md:w-12" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  {selectedAcademy.name}
                </h1>
                <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {[selectedAcademy.city, selectedAcademy.state].filter(Boolean).join(", ") ||
                      "Localização não informada"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6">
          <div className="mb-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{selectedAcademy.totalAthletes}</p>
                <p className="text-xs text-muted-foreground">Atletas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{selectedAcademy.totalTitles}</p>
                <p className="text-xs text-muted-foreground">Títulos</p>
              </div>
            </div>
          </div>

          {selectedAcademy.description ? (
            <p className="mb-6 max-w-4xl leading-relaxed text-muted-foreground">
              {selectedAcademy.description}
            </p>
          ) : null}

          <div className="mb-8 flex flex-wrap gap-2">
            {selectedAcademy.modalityLabels.map((label) => (
              <Badge key={label} variant="secondary" className="px-3 py-1">
                {label}
              </Badge>
            ))}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Medal className="h-5 w-5 text-primary" />
                Nossos Atletas
              </h2>
              {selectedAcademy.athletes.length > 1 ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => scrollAthletes("left")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => scrollAthletes("right")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>

            {selectedAcademy.athletes.length > 0 ? (
              <>
                <div
                  ref={athletesScrollRef}
                  className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-4 scroll-smooth"
                >
                  {selectedAcademy.athletes.map((athlete) => (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                Esta academia ainda não possui atletas com títulos publicados no ranking.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col p-4 md:p-6">
      <div className="mb-8 pt-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Ranking de Academias</h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Pesquise e descubra academias e seus atletas campeões cadastrados na plataforma
        </p>
      </div>

      <div className="mx-auto mb-6 w-full max-w-3xl">
        <div className="flex flex-wrap justify-center gap-2">
          {modalityChips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setSelectedModality(chip.value)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all hover:shadow-md",
                selectedModality === chip.value
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              )}
            >
              {chip.icon === "trophy" ? (
                <Trophy className="h-4 w-4" />
              ) : (
                <span className="text-base leading-none">{chip.icon}</span>
              )}
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mb-8 w-full max-w-2xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar academia ou atleta..."
              className="h-12 pl-12 text-base"
            />
          </div>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="h-12 w-full sm:w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {directory?.states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="mx-auto w-full max-w-2xl py-12 text-center text-sm text-muted-foreground">
          Carregando ranking...
        </div>
      ) : feedback ? (
        <section className="mx-auto w-full max-w-2xl space-y-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{feedback}</p>
          <Button type="button" variant="outline" onClick={() => void loadDirectory()}>
            Tentar novamente
          </Button>
        </section>
      ) : showResults ? (
        <div className="mx-auto w-full max-w-2xl">
          {directory?.results.length ? (
            <div className="space-y-3">
              <p className="mb-4 text-sm text-muted-foreground">
                {directory.results.length} academia{directory.results.length !== 1 ? "s" : ""} encontrada
                {directory.results.length !== 1 ? "s" : ""}
              </p>
              {directory.results.map((academy) => (
                <ResultCard key={academy.id} academy={academy} onSelect={handleSelectAcademy} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhuma academia encontrada</p>
              <p className="text-sm text-muted-foreground/70">Tente ajustar os termos de busca</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-2xl">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Ou selecione uma das academias em destaque
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {directory?.highlights.slice(0, 4).map((academy) => (
              <HighlightCard key={academy.id} academy={academy} onSelect={handleSelectAcademy} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
