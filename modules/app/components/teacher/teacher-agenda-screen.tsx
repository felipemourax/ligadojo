"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react"
import type { TeacherAppAgendaData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const weekDays = [
  { key: "dom", short: "Dom", full: "Domingo" },
  { key: "seg", short: "Seg", full: "Segunda" },
  { key: "ter", short: "Ter", full: "Terça" },
  { key: "qua", short: "Qua", full: "Quarta" },
  { key: "qui", short: "Qui", full: "Quinta" },
  { key: "sex", short: "Sex", full: "Sexta" },
  { key: "sab", short: "Sáb", full: "Sábado" },
] as const

const modalityColorByLabel: Record<string, string> = {
  "Jiu-Jitsu": "bg-blue-500",
  "No-Gi": "bg-purple-500",
  Muay: "bg-red-500",
  Judô: "bg-amber-500",
}

function toWeekDayKey(dayLabel: string) {
  const normalized = dayLabel.toLowerCase()
  if (normalized.includes("segunda")) return "seg"
  if (normalized.includes("terça") || normalized.includes("terca")) return "ter"
  if (normalized.includes("quarta")) return "qua"
  if (normalized.includes("quinta")) return "qui"
  if (normalized.includes("sexta")) return "sex"
  if (normalized.includes("sábado") || normalized.includes("sabado")) return "sab"
  return "dom"
}

function getClassColor(classLabel: string) {
  const normalized = classLabel.toLowerCase()
  if (normalized.includes("no-gi")) return "bg-purple-500"
  if (normalized.includes("muay")) return "bg-red-500"
  if (normalized.includes("jud")) return "bg-amber-500"
  return "bg-blue-500"
}

export function TeacherAgendaScreen({ data }: { data: TeacherAppAgendaData }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<(typeof weekDays)[number]["key"]>(
    weekDays[new Date().getDay()]?.key ?? "seg"
  )

  const classesByDay = useMemo(() => {
    const byDay = new Map<string, string[]>()
    for (const item of data.schedule) {
      byDay.set(toWeekDayKey(item.day), item.classes)
    }
    return byDay
  }, [data.schedule])

  const weekDates = useMemo(() => {
    const today = new Date()
    const firstDay = new Date(today)
    firstDay.setDate(today.getDate() - today.getDay() + weekOffset * 7)
    return weekDays.map((_, index) => {
      const date = new Date(firstDay)
      date.setDate(firstDay.getDate() + index)
      return date
    })
  }, [weekOffset])

  const selectedFullDay = weekDays.find((day) => day.key === selectedDay)?.full ?? "Dia"
  const selectedDayClasses = classesByDay.get(selectedDay) ?? []
  const totalWeekClasses = Array.from(classesByDay.values()).reduce(
    (total, classes) => total + classes.length,
    0
  )
  const monthLabel = weekDates[0]?.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((current) => current - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((current) => current + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="capitalize text-muted-foreground">{monthLabel}</p>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => {
          const date = weekDates[index]
          const isToday = date?.toDateString() === new Date().toDateString()
          const isSelected = selectedDay === day.key
          const hasClasses = (classesByDay.get(day.key) ?? []).length > 0

          return (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={cn(
                "flex flex-col items-center rounded-lg py-2 transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-primary/20 text-primary" : "hover:bg-secondary"
              )}
              type="button"
            >
              <span className="text-xs font-medium">{day.short}</span>
              <span className={cn("text-lg font-bold", !hasClasses && !isSelected && "text-muted-foreground")}>
                {date?.getDate() ?? "-"}
              </span>
              {hasClasses ? (
                <div
                  className={cn(
                    "mt-0.5 h-1.5 w-1.5 rounded-full",
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  )}
                />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(modalityColorByLabel).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn("h-3 w-3 rounded-full", color)} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {selectedFullDay}
            <span className="ml-2 font-normal text-muted-foreground">
              {selectedDayClasses.length} {selectedDayClasses.length === 1 ? "aula" : "aulas"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedDayClasses.length === 0 ? (
            <AppEmptyState message="Nenhuma aula neste dia." />
          ) : (
            selectedDayClasses.map((classLabel) => {
              const [timeLabel, className] = classLabel.split(" - ")
              const [startTime, endTime] = (timeLabel ?? "").split(" às ")
              return (
                <div
                  key={classLabel}
                  className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary"
                >
                  <div className={cn("h-full min-h-[60px] w-1 rounded-full", getClassColor(className ?? classLabel))} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{className ?? classLabel}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{startTime ?? "--:--"} - {endTime ?? "--:--"}</span>
                        </div>
                      </div>
                      <Badge variant="outline">
                        <Users className="mr-1 h-3 w-3" />
                        Turma ativa
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Sala principal</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Resumo da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-secondary/50 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{totalWeekClasses}</p>
              <p className="text-sm text-muted-foreground">Total de aulas</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 text-center">
              <p className="text-2xl font-bold">{data.schedule.length}</p>
              <p className="text-sm text-muted-foreground">Dias com agenda</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
