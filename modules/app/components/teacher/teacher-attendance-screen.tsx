"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  RotateCcw,
  Save,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react"
import type { TeacherAppAttendanceData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateWeekCalendar } from "@/components/ui/date-week-calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toDateKey } from "@/lib/date/to-date-key"
import { cn } from "@/lib/utils"

type AttendanceStatus = "present" | "absent" | "justified" | "unmarked"

export function TeacherAttendanceScreen({
  data,
  onSave,
}: {
  data: TeacherAppAttendanceData
  onSave: (payload: {
    classGroupId: string
    sessionDate: string
    weekday: number
    startTime: string
    endTime: string
    confirmedStudentIds: string[]
    confirmedStudentNames: string[]
    presentStudentIds: string[]
    absentStudentIds: string[]
    justifiedStudentIds: string[]
    isFinalized: boolean
  }) => Promise<void>
}) {
  const defaultDate = data.sessions[0]?.sessionDate ?? toDateKey(new Date())
  const [selectedDate, setSelectedDate] = useState(defaultDate)
  const [selectedSessionId, setSelectedSessionId] = useState(data.sessions[0]?.id ?? "")
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)
  const [showReopenDialog, setShowReopenDialog] = useState(false)
  const [localState, setLocalState] = useState<Record<string, AttendanceStatus>>(() =>
    buildLocalAttendanceState(data.sessions)
  )

  useEffect(() => {
    setLocalState(buildLocalAttendanceState(data.sessions))
  }, [data.sessions])

  useEffect(() => {
    if (data.sessions.length === 0) {
      setSelectedDate(toDateKey(new Date()))
      return
    }

    const hasCurrentDate = data.sessions.some((session) => session.sessionDate === selectedDate)
    if (!hasCurrentDate) {
      setSelectedDate(data.sessions[0].sessionDate)
    }
  }, [data.sessions, selectedDate])

  const filteredSessions = useMemo(
    () => data.sessions.filter((session) => session.sessionDate === selectedDate),
    [data.sessions, selectedDate]
  )

  useEffect(() => {
    if (filteredSessions.length === 0) {
      setSelectedSessionId("")
      return
    }

    const hasSelectedSession = filteredSessions.some((session) => session.id === selectedSessionId)
    if (!hasSelectedSession) {
      setSelectedSessionId(filteredSessions[0].id)
    }
  }, [filteredSessions, selectedSessionId])

  const selectedSession = useMemo(
    () => filteredSessions.find((session) => session.id === selectedSessionId) ?? filteredSessions[0] ?? null,
    [filteredSessions, selectedSessionId]
  )

  const countersBySession = useMemo(
    () =>
      Object.fromEntries(
        filteredSessions.map((session) => [session.id, summarizeAttendance(session, localState)])
      ),
    [filteredSessions, localState]
  )

  const counters = useMemo(() => {
    if (!selectedSession) {
      return { present: 0, absent: 0, justified: 0, pending: 0 }
    }

    return countersBySession[selectedSession.id] ?? { present: 0, absent: 0, justified: 0, pending: 0 }
  }, [countersBySession, selectedSession])

  const filteredStudents = useMemo(() => {
    if (!selectedSession) {
      return []
    }

    const term = search.trim().toLowerCase()
    if (!term) {
      return selectedSession.students
    }

    return selectedSession.students.filter((student) => student.name.toLowerCase().includes(term))
  }, [search, selectedSession])

  const hasMarkedStudents = useMemo(() => {
    if (!selectedSession) {
      return false
    }

    return selectedSession.students.some(
      (student) => (localState[`${selectedSession.id}:${student.id}`] ?? "unmarked") !== "unmarked"
    )
  }, [localState, selectedSession])

  function markAllPresent() {
    if (!selectedSession || selectedSession.isFinalized) {
      return
    }

    setLocalState((current) => {
      const next = { ...current }
      for (const student of selectedSession.students) {
        const key = `${selectedSession.id}:${student.id}`
        if ((next[key] ?? "unmarked") === "unmarked") {
          next[key] = "present"
        }
      }
      return next
    })
  }

  function clearAttendance() {
    if (!selectedSession || selectedSession.isFinalized) {
      return
    }

    setLocalState((current) => {
      const next = { ...current }
      for (const student of selectedSession.students) {
        next[`${selectedSession.id}:${student.id}`] = "unmarked"
      }
      return next
    })
  }

  async function handleSave(finalize: boolean) {
    if (!selectedSession) {
      return
    }

    setSaving(true)

    try {
      const presentStudentIds: string[] = []
      const absentStudentIds: string[] = []
      const justifiedStudentIds: string[] = []

      selectedSession.students.forEach((student) => {
        const value = localState[`${selectedSession.id}:${student.id}`] ?? "unmarked"
        if (value === "present") presentStudentIds.push(student.id)
        if (value === "absent") absentStudentIds.push(student.id)
        if (value === "justified") justifiedStudentIds.push(student.id)
      })

      const [startTime = "--:--", endTime = "--:--"] = selectedSession.timeLabel.split(" - ")

      await onSave({
        classGroupId: selectedSession.classGroupId,
        sessionDate: selectedSession.sessionDate,
        weekday: selectedSession.weekday,
        startTime,
        endTime,
        confirmedStudentIds: selectedSession.students.map((student) => student.id),
        confirmedStudentNames: selectedSession.students.map((student) => student.name),
        presentStudentIds,
        absentStudentIds,
        justifiedStudentIds,
        isFinalized: finalize,
      })

      setShowFinalizeDialog(false)
      setShowReopenDialog(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 p-4 pb-32 md:pb-4">
      <div>
        <h1 className="text-2xl font-bold">Presença</h1>
        <p className="text-muted-foreground">Registre a presença das suas turmas por dia.</p>
      </div>

      <DateWeekCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        hasItems={(dateKey) => data.sessions.some((session) => session.sessionDate === dateKey)}
      />

      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <AppEmptyState message="Você não possui turmas programadas neste dia." />
          </CardContent>
        </Card>
      ) : (
        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex min-w-full gap-4 px-1">
            {filteredSessions.map((session) => {
              const isSelected = selectedSession?.id === session.id
              const sessionCounters = countersBySession[session.id] ?? {
                present: 0,
                absent: 0,
                justified: 0,
                pending: 0,
              }

              return (
                <Card
                  key={session.id}
                  className={cn(
                    "w-[320px] min-w-[320px] cursor-pointer transition-all sm:w-[360px] sm:min-w-[360px]",
                    isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedSessionId(session.id)}
                >
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{session.className}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.dayLabel} | {session.dateLabel}
                        </p>
                      </div>
                      <Badge className={session.isFinalized ? finalizedBadgeClassName : openBadgeClassName}>
                        {session.isFinalized ? "Finalizada" : "Aberta"}
                      </Badge>
                    </div>

                    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{session.timeLabel}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="h-4 w-4" />
                          {sessionCounters.present}
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <XCircle className="h-4 w-4" />
                          {sessionCounters.absent}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-500">
                          <AlertCircle className="h-4 w-4" />
                          {sessionCounters.justified}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {sessionCounters.pending}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{session.students.length} alunos</span>
                    </div>

                    {isSelected ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {!session.isFinalized ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(event) => {
                              event.stopPropagation()
                              markAllPresent()
                            }}
                          >
                            Marcar todos
                          </Button>
                        ) : null}

                        {session.isFinalized ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(event) => {
                              event.stopPropagation()
                              setShowReopenDialog(true)
                            }}
                          >
                            Reabrir
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 bg-green-600 text-white hover:bg-green-700"
                            disabled={session.students.length === 0 || sessionCounters.pending > 0}
                            onClick={(event) => {
                              event.stopPropagation()
                              setShowFinalizeDialog(true)
                            }}
                          >
                            Finalizar chamada
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {selectedSession ? (
        <>
          {selectedSession.isFinalized ? (
            <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/10 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">Chamada finalizada</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowReopenDialog(true)}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Reabrir
              </Button>
            </div>
          ) : null}

          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-2 text-center">
              <p className="text-lg font-bold text-green-500">{counters.present}</p>
              <p className="text-[10px] text-muted-foreground">Presentes</p>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-center">
              <p className="text-lg font-bold text-red-500">{counters.absent}</p>
              <p className="text-[10px] text-muted-foreground">Faltas</p>
            </div>
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2 text-center">
              <p className="text-lg font-bold text-yellow-500">{counters.justified}</p>
              <p className="text-[10px] text-muted-foreground">Justificados</p>
            </div>
            <div className="rounded-lg bg-secondary p-2 text-center">
              <p className="text-lg font-bold text-muted-foreground">{counters.pending}</p>
              <p className="text-[10px] text-muted-foreground">Pendentes</p>
            </div>
          </div>

          {!selectedSession.isFinalized ? (
            <div className="hidden gap-2 md:flex">
              <Button variant="outline" size="sm" className="flex-1" onClick={markAllPresent}>
                <Check className="mr-1 h-4 w-4" />
                Marcar todos presentes
              </Button>
              <Button variant="outline" size="sm" onClick={clearAttendance}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                {selectedSession.className}
                <Badge variant="outline">{selectedSession.students.length} alunos</Badge>
              </CardTitle>
              <CardDescription>
                {selectedSession.dayLabel} | {selectedSession.dateLabel} | {selectedSession.timeLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredStudents.length === 0 ? (
                <AppEmptyState message="Nenhum aluno encontrado." />
              ) : (
                filteredStudents.map((student) => {
                  const key = `${selectedSession.id}:${student.id}`
                  const value = localState[key] ?? "unmarked"

                  return (
                    <div
                      key={student.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-3 transition-colors",
                        value === "present" && "border border-green-500/20 bg-green-500/10",
                        value === "absent" && "border border-red-500/20 bg-red-500/10",
                        value === "justified" && "border border-yellow-500/20 bg-yellow-500/10",
                        value === "unmarked" && "bg-secondary/50"
                      )}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className={cn(
                            "text-xs",
                            value === "present" && "bg-green-500/20 text-green-600",
                            value === "absent" && "bg-red-500/20 text-red-600",
                            value === "justified" && "bg-yellow-500/20 text-yellow-600",
                            value === "unmarked" && "bg-primary/20 text-primary"
                          )}
                        >
                          {student.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((item) => item[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{student.name}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {student.belt}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{student.modalityName}</p>
                      </div>

                      {!selectedSession.isFinalized ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant={value === "present" ? "default" : "outline"}
                            className={cn("h-9 w-9", value === "present" && "bg-green-600 hover:bg-green-700")}
                            onClick={() => setLocalState((current) => ({ ...current, [key]: "present" }))}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant={value === "absent" ? "default" : "outline"}
                            className={cn("h-9 w-9", value === "absent" && "bg-red-600 hover:bg-red-700")}
                            onClick={() => setLocalState((current) => ({ ...current, [key]: "absent" }))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant={value === "justified" ? "default" : "outline"}
                            className={cn("h-9 w-9", value === "justified" && "bg-yellow-600 hover:bg-yellow-700")}
                            onClick={() => setLocalState((current) => ({ ...current, [key]: "justified" }))}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {value === "present" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : null}
                          {value === "absent" ? <XCircle className="h-5 w-5 text-red-500" /> : null}
                          {value === "justified" ? <AlertCircle className="h-5 w-5 text-yellow-500" /> : null}
                          {value === "unmarked" ? <span className="text-sm text-muted-foreground">-</span> : null}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {!selectedSession.isFinalized && counters.pending === 0 ? (
            <Button
              className="hidden w-full md:flex"
              size="lg"
              onClick={() => setShowFinalizeDialog(true)}
              disabled={saving}
            >
              <Save className="mr-2 h-5 w-5" />
              Finalizar chamada
            </Button>
          ) : null}
        </>
      ) : null}

      {selectedSession && !selectedSession.isFinalized ? (
        <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
          <div className="mx-auto flex w-full max-w-[1680px] items-center gap-3">
            {hasMarkedStudents ? (
              <Button
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                onClick={() => setShowFinalizeDialog(true)}
                disabled={saving || counters.pending > 0 || selectedSession.students.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Finalizar chamada
              </Button>
            ) : (
              <Button variant="outline" className="flex-1" onClick={markAllPresent}>
                <Check className="mr-2 h-4 w-4" />
                Marcar todos presentes
              </Button>
            )}

            <Button variant="outline" size="icon" onClick={clearAttendance} disabled={saving}>
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Resetar chamada</span>
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Chamada</DialogTitle>
            <DialogDescription>
              Confirma a finalização da chamada para {selectedSession?.className}?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="rounded-lg bg-green-500/10 p-3 text-center">
              <p className="text-2xl font-bold text-green-500">{counters.present}</p>
              <p className="text-sm text-muted-foreground">Presentes</p>
            </div>
            <div className="rounded-lg bg-red-500/10 p-3 text-center">
              <p className="text-2xl font-bold text-red-500">{counters.absent}</p>
              <p className="text-sm text-muted-foreground">Faltas</p>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-3 text-center">
              <p className="text-2xl font-bold text-yellow-500">{counters.justified}</p>
              <p className="text-sm text-muted-foreground">Justificados</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSave(true)} disabled={saving}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reabrir Chamada</DialogTitle>
            <DialogDescription>Deseja reabrir a chamada para editar as presenças?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReopenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSave(false)} disabled={saving}>
              Reabrir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function buildLocalAttendanceState(sessions: TeacherAppAttendanceData["sessions"]) {
  return Object.fromEntries(
    sessions.flatMap((session) =>
      session.students.map((student) => [`${session.id}:${student.id}`, student.attendanceStatus as AttendanceStatus])
    )
  )
}

function summarizeAttendance(
  session: TeacherAppAttendanceData["sessions"][number],
  localState: Record<string, AttendanceStatus>
) {
  return session.students.reduce(
    (summary, student) => {
      const value = localState[`${session.id}:${student.id}`] ?? "unmarked"
      if (value === "present") summary.present += 1
      if (value === "absent") summary.absent += 1
      if (value === "justified") summary.justified += 1
      if (value === "unmarked") summary.pending += 1
      return summary
    },
    { present: 0, absent: 0, justified: 0, pending: 0 }
  )
}

const finalizedBadgeClassName =
  "border border-green-500/20 bg-green-500/10 text-green-700 hover:bg-green-500/10"

const openBadgeClassName =
  "border border-yellow-500/20 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/10"
