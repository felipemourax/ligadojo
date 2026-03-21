"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const weekDays = [
  { key: "dom", short: "Dom" },
  { key: "seg", short: "Seg" },
  { key: "ter", short: "Ter" },
  { key: "qua", short: "Qua" },
  { key: "qui", short: "Qui" },
  { key: "sex", short: "Sex" },
  { key: "sab", short: "Sáb" },
] as const

interface DateWeekCalendarProps {
  selectedDate: string
  onSelectDate: (dateKey: string) => void
  hasItems: (dateKey: string) => boolean
}

export function DateWeekCalendar({
  selectedDate,
  onSelectDate,
  hasItems,
}: DateWeekCalendarProps) {
  const selectedDateValue = parseDateKey(selectedDate)
  const today = new Date()
  const todayKey = toDateKey(today)
  const weekStart = startOfWeek(selectedDateValue)
  const monthLabel = selectedDateValue.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  const weekDates = weekDays.map((_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    return date
  })

  function shiftWeek(days: number) {
    const nextDate = new Date(selectedDateValue)
    nextDate.setDate(nextDate.getDate() + days)
    onSelectDate(toDateKey(nextDate))
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="capitalize text-sm text-muted-foreground">{monthLabel}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shiftWeek(-7)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onSelectDate(todayKey)}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={() => shiftWeek(7)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => {
          const date = weekDates[index]
          const dateKey = toDateKey(date)
          const isSelected = dateKey === selectedDate
          const isToday = dateKey === todayKey
          const dateHasItems = hasItems(dateKey)

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={cn(
                "flex flex-col items-center rounded-lg py-2 transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isToday
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-muted"
              )}
            >
              <span className="text-xs font-medium">{day.short}</span>
              <span
                className={cn(
                  "text-lg font-bold",
                  !dateHasItems && !isSelected && "text-muted-foreground"
                )}
              >
                {date.getDate()}
              </span>
              {dateHasItems ? (
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
    </div>
  )
}

function parseDateKey(value: string) {
  const [year = "0", month = "1", day = "1"] = value.split("-")
  return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0)
}

function startOfWeek(value: Date) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - date.getDay())
  return date
}

function toDateKey(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
