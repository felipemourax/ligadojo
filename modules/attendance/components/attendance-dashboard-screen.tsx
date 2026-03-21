"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit,
  QrCode,
  Search,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DateWeekCalendar } from "@/components/ui/date-week-calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  ClassGroupEntity,
  ClassSessionEntity,
} from "@/apps/api/src/modules/classes/domain/class-group"
import {
  calculateAttendanceRate,
  resolveSessionAttendanceStatus,
} from "@/apps/api/src/modules/classes/domain/session-attendance"
import { fetchJson } from "@/lib/api/client"

type AttendanceStatus = "present" | "absent" | "justified" | "unmarked"
type ClassStatus = "in_progress" | "upcoming" | "completed" | "cancelled"

interface ClassesResponse {
  classes: ClassGroupEntity[]
  sessions: ClassSessionEntity[]
}

interface StudentCandidatesResponse {
  students: Array<{
    id: string
    name: string
    email: string
    belt: string
    modalityIds: string[]
    modalities: Array<{
      modalityId: string
      modalityName: string
      belt: string
    }>
    attendance: number
  }>
}

interface TeachersResponse {
  teachers: Array<{
    id: string
    name: string
    email: string | null
    specialty: string | null
    status: string
  }>
}

interface AttendanceStudent {
  id: string
  name: string
  belt: string
  status: AttendanceStatus
  checkInTime: string | null
}

interface AttendanceClass {
  id: string
  classGroupId: string
  sessionDate: string
  weekday: number
  name: string
  time: string
  endTime: string
  teacher: string
  modality: string
  status: ClassStatus
  students: AttendanceStudent[]
}

interface HistoryDay {
  date: string
  day: string
  classes: number
  present: number
  absent: number
  justified: number
  rate: number
}

interface MonthlyStat {
  month: string
  present: number
  absent: number
  justified: number
  rate: number
}

interface LowAttendanceStudent {
  id: string
  name: string
  rate: number
  classes: number
}

interface AttendanceCounters {
  confirmed: number
  present: number
  absent: number
  justified: number
  pending: number
}

const beltColors: Record<string, string> = {
  Branca: "bg-white text-foreground border border-border",
  Azul: "bg-blue-500 text-white",
  Roxa: "bg-violet-500 text-white",
  Marrom: "bg-amber-700 text-white",
  Preta: "bg-black text-white",
  "-": "bg-muted text-muted-foreground",
}

const statusColors: Record<ClassStatus, string> = {
  in_progress: "bg-green-500/10 text-green-500 border-green-500/20",
  upcoming: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<ClassStatus, string> = {
  in_progress: "Em andamento",
  upcoming: "Próxima",
  completed: "Finalizada",
  cancelled: "Cancelada",
}

export function AttendanceDashboardScreen() {
  const [classGroups, setClassGroups] = useState<ClassGroupEntity[]>([])
  const [sessionRecords, setSessionRecords] = useState<ClassSessionEntity[]>([])
  const [studentCandidates, setStudentCandidates] = useState<StudentCandidatesResponse["students"]>([])
  const [teachers, setTeachers] = useState<TeachersResponse["teachers"]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [searchStudent, setSearchStudent] = useState("")
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [reportPeriod, setReportPeriod] = useState("month")
  const [filterModality, setFilterModality] = useState("all")
  const [filterTeacher, setFilterTeacher] = useState("all")
  const [showTeacherDialog, setShowTeacherDialog] = useState(false)
  const [editingTeacherClassId, setEditingTeacherClassId] = useState<string | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("")
  const [pendingCancelClass, setPendingCancelClass] = useState<AttendanceClass | null>(null)
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false)
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const [selectedDate, setSelectedDate] = useState(todayKey)

  useEffect(() => {
    let active = true

    async function loadAttendance() {
      try {
        const [classesResponse, studentsResponse, teachersResponse] = await Promise.all([
          fetchJson<ClassesResponse>("/api/attendance"),
          fetchJson<StudentCandidatesResponse>("/api/students/candidates"),
          fetchJson<TeachersResponse>("/api/teachers"),
        ])

        if (!active) {
          return
        }

        setClassGroups(classesResponse.classes)
        setSessionRecords(classesResponse.sessions)
        setStudentCandidates(studentsResponse.students)
        setTeachers(teachersResponse.teachers)
      } catch (error) {
        if (!active) {
          return
        }

        setFeedback(error instanceof Error ? error.message : "Não foi possível carregar a presença.")
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadAttendance()

    return () => {
      active = false
    }
  }, [])

  const filteredClassGroups = useMemo(
    () =>
      classGroups.filter((item) => {
        const matchesModality = filterModality === "all" || item.modalityId === filterModality
        const matchesTeacher = filterTeacher === "all" || item.teacherName === filterTeacher
        return matchesModality && matchesTeacher
      }),
    [classGroups, filterModality, filterTeacher]
  )

  const selectedDateClasses = useMemo(
    () =>
      buildClassesForDate({
        classGroups: filteredClassGroups,
        sessionRecords,
        studentCandidates,
        dateKey: selectedDate,
      }),
    [filteredClassGroups, selectedDate, sessionRecords, studentCandidates]
  )

  useEffect(() => {
    if (selectedDateClasses.length === 0) {
      setSelectedClass("")
      return
    }

    setSelectedClass((current) =>
      current && selectedDateClasses.some((item) => item.id === current) ? current : selectedDateClasses[0].id
    )
  }, [selectedDateClasses])

  const currentClass = useMemo(
    () => selectedDateClasses.find((item) => item.id === selectedClass) ?? null,
    [selectedClass, selectedDateClasses]
  )

  const currentClassGroup = useMemo(
    () => classGroups.find((item) => item.id === currentClass?.classGroupId) ?? null,
    [classGroups, currentClass]
  )

  const filteredStudents = useMemo(
    () =>
      (currentClass?.students ?? []).filter((student) =>
        student.name.toLowerCase().includes(searchStudent.toLowerCase())
      ),
    [currentClass, searchStudent]
  )

  const selectedDatePresent = useMemo(
    () =>
      selectedDateClasses.reduce(
        (acc, item) => acc + item.students.filter((student) => student.status === "present").length,
        0
      ),
    [selectedDateClasses]
  )
  const selectedDateAbsent = useMemo(
    () =>
      selectedDateClasses.reduce(
        (acc, item) => acc + item.students.filter((student) => student.status === "absent").length,
        0
      ),
    [selectedDateClasses]
  )
  const selectedDateJustified = useMemo(
    () =>
      selectedDateClasses.reduce(
        (acc, item) => acc + item.students.filter((student) => student.status === "justified").length,
        0
      ),
    [selectedDateClasses]
  )
  const filteredSessionRecords = useMemo(() => {
    const allowedClassGroupIds = new Set(filteredClassGroups.map((item) => item.id))
    return sessionRecords.filter((item) => allowedClassGroupIds.has(item.classGroupId))
  }, [filteredClassGroups, sessionRecords])

  const weeklyHistory = useMemo(
    () => buildWeeklyHistory(filteredSessionRecords, currentWeekOffset),
    [filteredSessionRecords, currentWeekOffset]
  )
  const monthlyStats = useMemo(() => buildMonthlyStats(filteredSessionRecords), [filteredSessionRecords])
  const lowAttendanceStudents = useMemo(
    () => buildLowAttendanceStudents(filteredSessionRecords, studentCandidates),
    [filteredSessionRecords, studentCandidates]
  )

  async function handleSetAttendanceStatus(studentId: string, nextStatus: Exclude<AttendanceStatus, "unmarked">) {
    if (!currentClass) {
      return
    }

    const currentSession =
      sessionRecords.find(
        (item) =>
          item.classGroupId === currentClass.classGroupId &&
          item.sessionDate.slice(0, 10) === currentClass.sessionDate
      ) ?? null

    const presentStudentIds = new Set(currentSession?.presentStudentIds ?? [])
    const absentStudentIds = new Set(currentSession?.absentStudentIds ?? [])
    const justifiedStudentIds = new Set(currentSession?.justifiedStudentIds ?? [])

    presentStudentIds.delete(studentId)
    absentStudentIds.delete(studentId)
    justifiedStudentIds.delete(studentId)

    if (nextStatus === "present") {
      presentStudentIds.add(studentId)
    } else if (nextStatus === "absent") {
      absentStudentIds.add(studentId)
    } else {
      justifiedStudentIds.add(studentId)
    }

    await saveSessionAttendance(currentClass, {
      confirmedStudentIds: currentClass.students.map((student) => student.id),
      confirmedStudentNames: currentClass.students.map((student) => student.name),
      presentStudentIds: [...presentStudentIds],
      absentStudentIds: [...absentStudentIds],
      justifiedStudentIds: [...justifiedStudentIds],
      fallbackStatus: currentSession?.status === "cancelled" ? "cancelled" : "scheduled",
      isFinalized: currentSession?.finalizedAt != null,
    })
  }

  async function handleMarkAllPresent(attendanceClass: AttendanceClass) {
    if (attendanceClass.students.length === 0) {
      return
    }

    const currentSession =
      sessionRecords.find(
        (item) =>
          item.classGroupId === attendanceClass.classGroupId &&
          item.sessionDate.slice(0, 10) === attendanceClass.sessionDate
      ) ?? null

    await saveSessionAttendance(attendanceClass, {
      confirmedStudentIds: attendanceClass.students.map((student) => student.id),
      confirmedStudentNames: attendanceClass.students.map((student) => student.name),
      presentStudentIds: attendanceClass.students.map((student) => student.id),
      absentStudentIds: [],
      justifiedStudentIds: [],
      fallbackStatus: currentSession?.status === "cancelled" ? "cancelled" : "scheduled",
      isFinalized: currentSession?.finalizedAt != null,
    })
  }

  async function handleFinalizeAttendance(attendanceClass: AttendanceClass) {
    if (attendanceClass.students.length === 0) {
      return
    }

    const currentSession =
      sessionRecords.find(
        (item) =>
          item.classGroupId === attendanceClass.classGroupId &&
          item.sessionDate.slice(0, 10) === attendanceClass.sessionDate
      ) ?? null

    const presentStudentIds = new Set(currentSession?.presentStudentIds ?? [])
    const absentStudentIds = new Set(currentSession?.absentStudentIds ?? [])
    const justifiedStudentIds = new Set(currentSession?.justifiedStudentIds ?? [])

    for (const student of attendanceClass.students) {
      if (
        !presentStudentIds.has(student.id) &&
        !absentStudentIds.has(student.id) &&
        !justifiedStudentIds.has(student.id)
      ) {
        absentStudentIds.add(student.id)
      }
    }

    await saveSessionAttendance(attendanceClass, {
      confirmedStudentIds: attendanceClass.students.map((student) => student.id),
      confirmedStudentNames: attendanceClass.students.map((student) => student.name),
      presentStudentIds: [...presentStudentIds],
      absentStudentIds: [...absentStudentIds],
      justifiedStudentIds: [...justifiedStudentIds],
      fallbackStatus: currentSession?.status === "cancelled" ? "cancelled" : "scheduled",
      isFinalized: true,
    })

    setFeedback("Chamada finalizada. Alunos sem marcação foram registrados como falta.")
  }

  async function saveSessionAttendance(
    attendanceClass: AttendanceClass,
    payload: {
      confirmedStudentIds: string[]
      confirmedStudentNames: string[]
      presentStudentIds: string[]
      absentStudentIds: string[]
      justifiedStudentIds: string[]
      fallbackStatus: "scheduled" | "cancelled"
      isFinalized?: boolean
    }
  ) {
    try {
      const currentSession =
        sessionRecords.find(
          (item) =>
            item.classGroupId === attendanceClass.classGroupId &&
            item.sessionDate.slice(0, 10) === attendanceClass.sessionDate
        ) ?? null

      const response = await fetchJson<{ session: ClassSessionEntity; message: string }>(
        `/api/attendance/sessions/${currentSession?.id ?? "new"}`,
        {
          method: "PUT",
          body: JSON.stringify({
            classGroupId: attendanceClass.classGroupId,
            sessionDate: attendanceClass.sessionDate,
            weekday: attendanceClass.weekday,
            startTime: attendanceClass.time,
            endTime: attendanceClass.endTime,
            status: payload.fallbackStatus,
            confirmedStudentIds: payload.confirmedStudentIds,
            confirmedStudentNames: payload.confirmedStudentNames,
            presentStudentIds: payload.presentStudentIds,
            absentStudentIds: payload.absentStudentIds,
            justifiedStudentIds: payload.justifiedStudentIds,
            isFinalized: payload.isFinalized ?? false,
          }),
        }
      )

      setSessionRecords((current) => upsertSession(current, response.session))
      setFeedback(response.message)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível atualizar a presença.")
    }
  }

  const reportSummary = useMemo(() => {
    const selectedStats =
      reportPeriod === "week"
        ? filteredSessionRecords.filter((item) => isWithinLastDays(item.sessionDate, 7))
        : reportPeriod === "quarter"
          ? filteredSessionRecords.filter((item) => isWithinLastMonths(item.sessionDate, 3))
          : reportPeriod === "year"
            ? filteredSessionRecords.filter((item) => isWithinLastMonths(item.sessionDate, 12))
            : filteredSessionRecords.filter((item) => isWithinLastMonths(item.sessionDate, 1))

    const present = selectedStats.reduce((acc, item) => acc + (item.presentStudentIds?.length ?? 0), 0)
    const absent = selectedStats.reduce((acc, item) => acc + (item.absentStudentIds?.length ?? 0), 0)

    return {
      rate: calculateAttendanceRate({ presentCount: present, absentCount: absent }),
      present,
      classes: selectedStats.length,
    }
  }, [filteredSessionRecords, reportPeriod])
  const currentClassEligibleCandidates = useMemo(() => {
    if (!currentClassGroup?.modalityId) {
      return []
    }

    return studentCandidates.filter((student) =>
      student.modalityIds.includes(currentClassGroup.modalityId as string)
    )
  }, [currentClassGroup, studentCandidates])
  const currentSessionRecord = useMemo(
    () =>
      currentClass
        ? sessionRecords.find(
            (item) =>
              item.classGroupId === currentClass.classGroupId &&
              item.sessionDate.slice(0, 10) === currentClass.sessionDate
          ) ?? null
        : null,
    [currentClass, sessionRecords]
  )
  const activeSelectedDateClasses = useMemo(
    () => selectedDateClasses.filter((item) => item.status !== "cancelled"),
    [selectedDateClasses]
  )
  const cancelledSelectedDateClasses = useMemo(
    () => selectedDateClasses.filter((item) => item.status === "cancelled"),
    [selectedDateClasses]
  )
  const isSelectedDateToday = selectedDate === todayKey
  const selectedDateLabel = formatDashboardDate(selectedDate)
  const currentSessionSummary = useMemo(() => {
    if (!currentClass) {
      return { confirmed: 0, present: 0, absent: 0, justified: 0, pending: 0 }
    }

    return summarizeAttendanceStudents(currentClass.students)
  }, [currentClass])
  const activeFilterCount = [filterModality !== "all", filterTeacher !== "all"].filter(Boolean).length

  function getSessionRecordForClass(attendanceClass: AttendanceClass) {
    return (
      sessionRecords.find(
        (item) =>
          item.classGroupId === attendanceClass.classGroupId &&
          item.sessionDate.slice(0, 10) === attendanceClass.sessionDate
      ) ?? null
    )
  }

  function openTeacherDialog(classGroupId: string) {
    const classGroup = classGroups.find((item) => item.id === classGroupId) ?? null
    setEditingTeacherClassId(classGroupId)
    setSelectedTeacherId(classGroup?.teacherProfileId ?? "")
    setShowTeacherDialog(true)
  }

  async function handleReopenAttendance(attendanceClass: AttendanceClass) {
    if (!attendanceClass) {
      return
    }

    const currentSession = getSessionRecordForClass(attendanceClass)

    await saveSessionAttendance(attendanceClass, {
      confirmedStudentIds: attendanceClass.students.map((student) => student.id),
      confirmedStudentNames: attendanceClass.students.map((student) => student.name),
      presentStudentIds: attendanceClass.students.filter((student) => student.status === "present").map((student) => student.id),
      absentStudentIds: attendanceClass.students.filter((student) => student.status === "absent").map((student) => student.id),
      justifiedStudentIds: attendanceClass.students
        .filter((student) => student.status === "justified")
        .map((student) => student.id),
      fallbackStatus: currentSession?.status === "cancelled" ? "cancelled" : "scheduled",
      isFinalized: false,
    })

    setFeedback("Chamada reaberta para edição.")
  }

  async function handleReactivateClass(attendanceClass: AttendanceClass) {
    const currentSession = getSessionRecordForClass(attendanceClass)

    await saveSessionAttendance(attendanceClass, {
      confirmedStudentIds: attendanceClass.students.map((student) => student.id),
      confirmedStudentNames: attendanceClass.students.map((student) => student.name),
      presentStudentIds: currentSession?.presentStudentIds ?? [],
      absentStudentIds: currentSession?.absentStudentIds ?? [],
      justifiedStudentIds: currentSession?.justifiedStudentIds ?? [],
      fallbackStatus: "scheduled",
      isFinalized: currentSession?.finalizedAt != null,
    })

    setFeedback("A aula foi reativada para a operação do dia.")
  }

  async function handleTeacherUpdate() {
    if (!editingTeacherClassId || !selectedTeacherId) {
      setFeedback("Selecione um professor para continuar.")
      return
    }

    const classGroup = classGroups.find((item) => item.id === editingTeacherClassId) ?? null
    const teacher = teachers.find((item) => item.id === selectedTeacherId) ?? null

    if (!classGroup || !teacher) {
      setFeedback("Não foi possível localizar a turma ou o professor.")
      return
    }

    try {
      const response = await fetchJson<{ classGroup: ClassGroupEntity; message: string }>(
        `/api/classes/${editingTeacherClassId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            id: classGroup.id,
            modalityId: classGroup.modalityId ?? undefined,
            modalityName: classGroup.modalityName,
            teacherProfileId: teacher.id,
            teacherName: teacher.name,
            name: classGroup.name,
            ageGroups: classGroup.ageGroups,
            beltRange: classGroup.beltRange,
            maxStudents: classGroup.maxStudents,
            currentStudents: classGroup.currentStudents,
            schedules: classGroup.schedules.map((schedule) => ({
              weekday: schedule.weekday,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            })),
            status: classGroup.status,
          }),
        }
      )

      setClassGroups((current) =>
        current.map((item) => (item.id === editingTeacherClassId ? response.classGroup : item))
      )
      setFeedback(response.message)
      setShowTeacherDialog(false)
      setEditingTeacherClassId(null)
      setSelectedTeacherId("")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível alterar o professor.")
    }
  }

  async function handleCancelClass(attendanceClass: AttendanceClass) {
    await saveSessionAttendance(attendanceClass, {
      confirmedStudentIds: attendanceClass.students.map((student) => student.id),
      confirmedStudentNames: attendanceClass.students.map((student) => student.name),
      presentStudentIds: [],
      absentStudentIds: [],
      justifiedStudentIds: [],
      fallbackStatus: "cancelled",
      isFinalized: false,
    })

    setPendingCancelClass(null)
    setFeedback("A aula foi cancelada.")
  }

  async function saveCurrentClassEnrollments(studentUserIds: string[]) {
    if (!currentClassGroup) {
      return
    }

    try {
      const response = await fetchJson<{ classGroup: ClassGroupEntity; message: string }>(
        `/api/classes/${currentClassGroup.id}/students`,
        {
          method: "PUT",
          body: JSON.stringify({ studentUserIds }),
        }
      )

      setClassGroups((current) =>
        current.map((item) => (item.id === response.classGroup.id ? response.classGroup : item))
      )
      setFeedback(response.message)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível atualizar os alunos da turma.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Dialog open={Boolean(pendingCancelClass)} onOpenChange={(open) => !open && setPendingCancelClass(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar aula</DialogTitle>
            <DialogDescription>
              Essa ação marca a aula do dia como cancelada e retira ela da operação principal.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPendingCancelClass(null)}>
              Voltar
            </Button>
            <Button
              variant="outline"
              onClick={() => pendingCancelClass && void handleCancelClass(pendingCancelClass)}
            >
              Confirmar cancelamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTeacherDialog} onOpenChange={setShowTeacherDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar professor</DialogTitle>
            <DialogDescription>Selecione o novo professor responsável pela turma.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Label>Professor</Label>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o professor" />
              </SelectTrigger>
              <SelectContent>
                {teachers.filter((teacher) => teacher.status === "active").map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTeacherDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleTeacherUpdate()}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEnrollmentDialog} onOpenChange={setShowEnrollmentDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {currentClassGroup ? (
            <>
              <DialogHeader>
                <DialogTitle>Alunos da turma</DialogTitle>
                <DialogDescription>
                  Esses alunos ficam vinculados à turma até alguém removê-los ou até eles saírem.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {currentClassEligibleCandidates.length === 0 ? (
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                    Nenhum aluno elegível foi encontrado para a modalidade desta turma.
                  </div>
                ) : (
                  currentClassEligibleCandidates.map((student) => {
                    const checked = currentClassGroup.enrolledStudentIds.includes(student.id)

                    return (
                      <label
                        key={student.id}
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background px-3 py-3 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(nextChecked) => {
                              const currentIds = currentClassGroup.enrolledStudentIds
                              const nextIds = nextChecked
                                ? [...currentIds, student.id]
                                : currentIds.filter((item) => item !== student.id)
                              void saveCurrentClassEnrollments(nextIds)
                            }}
                          />
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {student.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        <Badge className={`text-xs ${beltColors[student.belt] ?? beltColors["-"]}`}>
                          {student.belt}
                        </Badge>
                      </label>
                    )
                  })
                )}
              </div>
            </>
          ) : null}
      </DialogContent>
      </Dialog>

      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code para check-in</DialogTitle>
            <DialogDescription>
              Os alunos podem escanear este código para registrar presença automaticamente
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
              <div className="text-center">
                <QrCode className="mx-auto mb-4 h-24 w-24 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">QR Code da turma</p>
                <p className="mt-1 font-medium">{currentClass?.name ?? "Selecione uma aula"}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Válido até</p>
              <p className="font-medium">
                {currentClass ? `${currentClass.time} - ${currentClass.endTime}` : "--:--"}
              </p>
            </div>
            <div className="flex w-full gap-2">
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Baixar
              </Button>
              <Button variant="outline" className="flex-1">
                Tela cheia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presença</h1>
          <p className="text-muted-foreground">Registre e acompanhe a presença dos alunos</p>
        </div>
      </div>

      {feedback ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 text-sm text-primary">{feedback}</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard title="Aulas no dia" value={selectedDateClasses.length} icon={Calendar} tone="primary" />
        <MetricCard title="Presentes" value={selectedDatePresent} icon={CheckCircle2} tone="success" />
        <MetricCard title="Ausentes" value={selectedDateAbsent} icon={XCircle} tone="danger" />
        <MetricCard title="Justificadas" value={selectedDateJustified} icon={AlertCircle} tone="warning" />
        <MetricCard
          title="Taxa no dia"
          value={`${calculateAttendanceRate({ presentCount: selectedDatePresent, absentCount: selectedDateAbsent })}%`}
          icon={TrendingUp}
          tone="info"
        />
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Dia</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Select value={filterModality} onValueChange={setFilterModality}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as modalidades</SelectItem>
                {Array.from(
                  new Map(
                    classGroups
                      .filter((item) => item.modalityId)
                      .map((item) => [item.modalityId as string, item.modalityName])
                  ).entries()
                ).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os professores</SelectItem>
                {Array.from(new Set(classGroups.map((item) => item.teacherName)))
                  .filter(Boolean)
                  .map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <DateWeekCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            hasItems={(dateKey) => hasClassesOnDate(filteredClassGroups, sessionRecords, dateKey)}
          />

          {cancelledSelectedDateClasses.length > 0 ? (
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">
                  Aulas canceladas {isSelectedDateToday ? "hoje" : "neste dia"}
                </CardTitle>
                <CardDescription>Separadas da operação principal para não poluir a chamada ativa.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {cancelledSelectedDateClasses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.time} - {item.endTime} | {item.teacher}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openTeacherDialog(item.classGroupId)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => void handleReactivateClass(item)}>
                        Reativar aula
                      </Button>
                      <Badge className={statusColors.cancelled}>{statusLabels.cancelled}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <div className="-mx-1 overflow-x-auto pb-2">
            <div className="flex min-w-full gap-4 px-1">
              {activeSelectedDateClasses.map((item) => (
                (() => {
                  const itemSessionRecord = getSessionRecordForClass(item)
                  const itemPendingCount = item.students.filter((student) => student.status === "unmarked").length
                  const isSelected = selectedClass === item.id
                  return (
                <Card
                  key={item.id}
                  className={`w-[320px] min-w-[320px] cursor-pointer transition-all sm:w-[360px] sm:min-w-[360px] ${isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
                  onClick={() => setSelectedClass(item.id)}
                >
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.teacher}</p>
                      </div>
                      <Badge className={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                    </div>
                    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {item.time} - {item.endTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="h-4 w-4" />
                          {item.students.filter((student) => student.status === "present").length}
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <XCircle className="h-4 w-4" />
                          {item.students.filter((student) => student.status === "absent").length}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-500">
                          <AlertCircle className="h-4 w-4" />
                          {item.students.filter((student) => student.status === "justified").length}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {itemPendingCount}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.students.length} alunos</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation()
                          openTeacherDialog(item.classGroupId)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {isSelected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(event) => {
                              event.stopPropagation()
                              void handleMarkAllPresent(item)
                            }}
                            disabled={itemSessionRecord?.finalizedAt != null}
                          >
                            Marcar todos
                          </Button>
                          {itemSessionRecord?.finalizedAt ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(event) => {
                                event.stopPropagation()
                                void handleReopenAttendance(item)
                              }}
                            >
                              Reabrir
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 bg-green-600 text-white hover:bg-green-700"
                              disabled={item.students.length === 0}
                              onClick={(event) => {
                                event.stopPropagation()
                                void handleFinalizeAttendance(item)
                              }}
                            >
                              Finalizar chamada
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-red-500/40 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={(event) => {
                              event.stopPropagation()
                              setPendingCancelClass(item)
                            }}
                          >
                            Cancelar aula
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
                  )
                })()
              ))}
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Carregando aulas e presença...
              </CardContent>
            </Card>
          ) : currentClass ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base font-medium">{currentClass.name}</CardTitle>
                      <CardDescription>
                        {currentClass.time} - {currentClass.endTime} | {currentClass.teacher}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentSessionRecord?.finalizedAt ? (
                        <Badge variant="outline">Chamada finalizada</Badge>
                      ) : null}
                      <div className="relative flex-1 sm:w-48">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Buscar aluno..."
                          value={searchStudent}
                          onChange={(event) => setSearchStudent(event.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Button variant="outline" size="icon" onClick={() => setShowQRDialog(true)}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowEnrollmentDialog(true)}
                        disabled={!currentClassGroup}
                      >
                        Gerenciar alunos
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="border-b border-border/60 px-6 py-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    <SessionSummaryCard label="Confirmados" value={currentSessionSummary.confirmed} />
                    <SessionSummaryCard label="Presentes" value={currentSessionSummary.present} valueClassName="text-green-500" />
                    <SessionSummaryCard label="Faltas" value={currentSessionSummary.absent} valueClassName="text-red-500" />
                    <SessionSummaryCard label="Justificadas" value={currentSessionSummary.justified} valueClassName="text-yellow-500" />
                    <SessionSummaryCard label="Pendentes" value={currentSessionSummary.pending} valueClassName="text-muted-foreground" />
                  </div>
                </CardContent>
                <p className="px-6 pt-1 text-xs text-muted-foreground">
                  Presença só considera alunos matriculados nesta turma; os demais permanecem apenas como candidatos.
                </p>
                <CardContent className="p-0">
                  {filteredStudents.length > 0 ? (
                    <div className="divide-y divide-border">
                      {filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {student.name
                                  .split(" ")
                                  .map((part) => part[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${beltColors[student.belt] ?? beltColors["-"]}`}>
                                  {student.belt}
                                </Badge>
                                {student.checkInTime ? (
                                  <span className="text-xs text-muted-foreground">
                                    Check-in: {student.checkInTime}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={student.status === "absent" ? "secondary" : "outline"}
                              className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => void handleSetAttendanceStatus(student.id, "absent")}
                              disabled={currentSessionRecord?.finalizedAt != null}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Falta
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === "justified" ? "secondary" : "outline"}
                              className="h-8 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                              onClick={() => void handleSetAttendanceStatus(student.id, "justified")}
                              disabled={currentSessionRecord?.finalizedAt != null}
                            >
                              <AlertCircle className="mr-1 h-4 w-4" />
                              Justificada
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === "present" ? "default" : "outline"}
                              className={`h-8 ${student.status === "present" ? "bg-green-500 hover:bg-green-600" : ""}`}
                              onClick={() => void handleSetAttendanceStatus(student.id, "present")}
                              disabled={currentSessionRecord?.finalizedAt != null}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Presente
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-sm text-muted-foreground">
                      Nenhum aluno está vinculado a esta turma ainda. Vincule os participantes para registrar a chamada.
                    </div>
                  )}
                </CardContent>
              </Card>

            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Nenhuma aula programada para {isSelectedDateToday ? "hoje" : selectedDateLabel}.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Histórico semanal</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentWeekOffset((value) => value - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[120px] text-center text-sm text-muted-foreground">
                    Semana {currentWeekOffset === 0 ? "Atual" : `${Math.abs(currentWeekOffset)} semana${Math.abs(currentWeekOffset) > 1 ? "s" : ""} atrás`}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentWeekOffset((value) => Math.min(0, value + 1))}
                    disabled={currentWeekOffset === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dia</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-center">Aulas</TableHead>
                    <TableHead className="text-center">Presentes</TableHead>
                    <TableHead className="text-center">Ausentes</TableHead>
                    <TableHead className="text-right">Taxa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyHistory.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">{day.day}</TableCell>
                      <TableCell>{new Date(`${day.date}T12:00:00`).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-center">{day.classes}</TableCell>
                      <TableCell className="text-center text-green-500">{day.present}</TableCell>
                      <TableCell className="text-center text-red-500">{day.absent}</TableCell>
                      <TableCell className="text-right">
                        {day.classes > 0 ? (
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={day.rate} className="h-2 w-16" />
                            <span className="w-10 text-right">{day.rate}%</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Resumo da semana</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SummaryRow label="Total de aulas" value={weeklyHistory.reduce((acc, item) => acc + item.classes, 0)} />
                <SummaryRow
                  label="Total de presenças"
                  value={weeklyHistory.reduce((acc, item) => acc + item.present, 0)}
                  valueClassName="text-green-500"
                />
                <SummaryRow
                  label="Total de ausências"
                  value={weeklyHistory.reduce((acc, item) => acc + item.absent, 0)}
                  valueClassName="text-red-500"
                />
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-muted-foreground">Taxa média</span>
                  <span className="font-bold text-primary">
                    {weeklyHistory.filter((item) => item.classes > 0).length > 0
                      ? Math.round(
                          weeklyHistory
                            .filter((item) => item.classes > 0)
                            .reduce((acc, item) => acc + item.rate, 0) /
                            weeklyHistory.filter((item) => item.classes > 0).length
                        )
                      : 0}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Alunos com baixa frequência</CardTitle>
                <CardDescription>Menos de 70% de presença no período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowAttendanceStudents.length > 0 ? (
                    lowAttendanceStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between rounded-lg bg-red-50 p-2 dark:bg-red-950/20"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-red-100 text-xs text-red-600">
                              {student.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.classes} aulas</p>
                          </div>
                        </div>
                        <Badge variant="destructive">{student.rate}%</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Nenhum aluno com baixa frequência no período.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {monthlyStats.map((stat) => (
              <Card key={stat.month}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{stat.month}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stat.rate}%</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.present} presenças / {stat.absent} faltas
                  </p>
                  <Progress value={stat.rate} className="mt-2 h-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-medium">Relatório detalhado</CardTitle>
                  <CardDescription>Exporte relatórios de presença por período</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={reportPeriod} onValueChange={setReportPeriod}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                      <SelectItem value="quarter">Último trimestre</SelectItem>
                      <SelectItem value="year">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <ReportCard icon={BarChart3} value={`${reportSummary.rate}%`} label="Taxa média geral" tone="primary" />
                <ReportCard icon={Users} value={String(reportSummary.present)} label="Total de presenças" tone="success" />
                <ReportCard icon={Calendar} value={String(reportSummary.classes)} label="Aulas realizadas" tone="info" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function buildClassesForDate(input: {
  classGroups: ClassGroupEntity[]
  sessionRecords: ClassSessionEntity[]
  studentCandidates: StudentCandidatesResponse["students"]
  dateKey: string
}): AttendanceClass[] {
  const selectedDate = parseDateKey(input.dateKey)
  const selectedWeekday = Math.max(0, selectedDate.getDay() - 1)
  const studentMap = new Map(input.studentCandidates.map((student) => [student.id, student]))

  return input.classGroups
    .filter((item) => item.status === "active")
    .flatMap((item) => {
      const matchingSchedule = item.schedules.find((schedule) => schedule.weekday === selectedWeekday) ?? null
      const session =
        input.sessionRecords.find(
          (record) => record.classGroupId === item.id && record.sessionDate.slice(0, 10) === input.dateKey
        ) ?? null

      if (!matchingSchedule && !session) {
        return []
      }

      const startTime = session?.startTime ?? matchingSchedule?.startTime ?? "00:00"
      const endTime = session?.endTime ?? matchingSchedule?.endTime ?? "00:00"
      const confirmedStudentIds = item.enrolledStudentIds
      const confirmedStudentNames = item.enrolledStudentIds.map(
        (studentId) => studentMap.get(studentId)?.name ?? "Aluno"
      )

      const students = confirmedStudentIds.map((studentId, index) => {
        const candidate = studentMap.get(studentId)
        const modalitySnapshot = item.modalityId
          ? candidate?.modalities.find((modality) => modality.modalityId === item.modalityId) ?? null
          : candidate?.modalities[0] ?? null
        const status = resolveSessionAttendanceStatus(session, studentId)

        return {
          id: studentId,
          name: candidate?.name ?? confirmedStudentNames[index] ?? `Aluno ${index + 1}`,
          belt: modalitySnapshot?.belt ?? candidate?.belt ?? "-",
          status,
          checkInTime: status === "present" ? startTime : null,
        }
      })

      return [
        {
          id: `${item.id}:${input.dateKey}`,
          classGroupId: item.id,
          sessionDate: input.dateKey,
          weekday: matchingSchedule?.weekday ?? session?.weekday ?? selectedWeekday,
          name: item.name,
          time: startTime,
          endTime,
          teacher: item.teacherName,
          modality: item.modalityName,
          status: getClassStatus({
            sessionStatus: session?.status ?? "scheduled",
            startTime,
            endTime,
            dateKey: input.dateKey,
          }),
          students,
        },
      ]
    })
    .sort((left, right) => left.time.localeCompare(right.time))
}

function buildWeeklyHistory(sessionRecords: ClassSessionEntity[], currentWeekOffset: number): HistoryDay[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  today.setDate(today.getDate() + currentWeekOffset * 7)

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - index)
    return date
  }).reverse()

  return days.map((date) => {
    const dateKey = toDateKey(date)
    const sessions = sessionRecords.filter((item) => item.sessionDate.slice(0, 10) === dateKey)
    const present = sessions.reduce((acc, item) => acc + (item.presentStudentIds?.length ?? 0), 0)
    const absent = sessions.reduce((acc, item) => acc + (item.absentStudentIds?.length ?? 0), 0)
    const justified = sessions.reduce((acc, item) => acc + (item.justifiedStudentIds?.length ?? 0), 0)

    return {
      date: dateKey,
      day: date.toLocaleDateString("pt-BR", { weekday: "long" }).replace(/^\w/, (value) => value.toUpperCase()),
      classes: sessions.length,
      present,
      absent,
      justified,
      rate: calculateAttendanceRate({ presentCount: present, absentCount: absent }),
    }
  })
}

function buildMonthlyStats(sessionRecords: ClassSessionEntity[]): MonthlyStat[] {
  const today = new Date()

  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1)
    const month = date.toLocaleDateString("pt-BR", { month: "long" }).replace(/^\w/, (value) => value.toUpperCase())
    const sessions = sessionRecords.filter((item) => {
      const sessionDate = new Date(item.sessionDate)
      return (
        sessionDate.getFullYear() === date.getFullYear() &&
        sessionDate.getMonth() === date.getMonth()
      )
    })
    const present = sessions.reduce((acc, item) => acc + (item.presentStudentIds?.length ?? 0), 0)
    const absent = sessions.reduce((acc, item) => acc + (item.absentStudentIds?.length ?? 0), 0)
    const justified = sessions.reduce((acc, item) => acc + (item.justifiedStudentIds?.length ?? 0), 0)

    return {
      month,
      present,
      absent,
      justified,
      rate: calculateAttendanceRate({ presentCount: present, absentCount: absent }),
    }
  })
}

function buildLowAttendanceStudents(
  sessionRecords: ClassSessionEntity[],
  students: StudentCandidatesResponse["students"]
): LowAttendanceStudent[] {
  const stats = new Map<string, { name: string; present: number; absent: number }>()
  const studentMap = new Map(students.map((student) => [student.id, student]))

  for (const session of sessionRecords) {
    for (const studentId of session.presentStudentIds ?? []) {
      const current = stats.get(studentId) ?? {
        name: studentMap.get(studentId)?.name ?? "Aluno",
        present: 0,
        absent: 0,
      }
      current.present += 1
      stats.set(studentId, current)
    }

    for (const studentId of session.absentStudentIds ?? []) {
      const current = stats.get(studentId) ?? {
        name: studentMap.get(studentId)?.name ?? "Aluno",
        present: 0,
        absent: 0,
      }
      current.absent += 1
      stats.set(studentId, current)
    }
  }

  return [...stats.entries()]
    .map(([id, value]) => {
      const classes = value.present + value.absent
      const rate = calculateAttendanceRate({ presentCount: value.present, absentCount: value.absent })
      return {
        id,
        name: value.name,
        rate,
        classes,
      }
    })
    .filter((student) => student.classes > 0 && student.rate < 70)
    .sort((left, right) => left.rate - right.rate)
    .slice(0, 5)
}

function upsertSession(
  sessions: ClassSessionEntity[],
  nextSession: ClassSessionEntity
): ClassSessionEntity[] {
  const nextKey = `${nextSession.classGroupId}:${nextSession.sessionDate.slice(0, 10)}`
  const filtered = sessions.filter(
    (item) => `${item.classGroupId}:${item.sessionDate.slice(0, 10)}` !== nextKey
  )
  return [...filtered, nextSession].sort((left, right) => left.sessionDate.localeCompare(right.sessionDate))
}

function getClassStatus(input: {
  sessionStatus: "scheduled" | "cancelled"
  startTime: string
  endTime: string
  dateKey: string
}): ClassStatus {
  if (input.sessionStatus === "cancelled") {
    return "cancelled"
  }

  const now = new Date()
  const todayKey = toDateKey(now)

  if (input.dateKey < todayKey) {
    return "completed"
  }

  if (input.dateKey > todayKey) {
    return "upcoming"
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = toMinutes(input.startTime)
  const endMinutes = toMinutes(input.endTime)

  if (currentMinutes < startMinutes) {
    return "upcoming"
  }
  if (currentMinutes <= endMinutes) {
    return "in_progress"
  }
  return "completed"
}

function toMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":")
  return Number(hours) * 60 + Number(minutes)
}

function toDateKey(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateKey(value: string) {
  const [year = "0", month = "1", day = "1"] = value.split("-")
  return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0)
}

function hasClassesOnDate(
  classGroups: ClassGroupEntity[],
  sessionRecords: ClassSessionEntity[],
  dateKey: string
) {
  const selectedDate = parseDateKey(dateKey)
  const selectedWeekday = Math.max(0, selectedDate.getDay() - 1)

  return classGroups.some((item) => {
    if (item.status !== "active") {
      return false
    }

    const hasSchedule = item.schedules.some((schedule) => schedule.weekday === selectedWeekday)
    const hasSession = sessionRecords.some(
      (record) => record.classGroupId === item.id && record.sessionDate.slice(0, 10) === dateKey
    )

    return hasSchedule || hasSession
  })
}

function formatDashboardDate(dateKey: string) {
  return parseDateKey(dateKey).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  })
}

function isWithinLastDays(value: string, days: number) {
  const now = new Date()
  const limit = new Date(now)
  limit.setDate(now.getDate() - days)
  return new Date(value) >= limit
}

function isWithinLastMonths(value: string, months: number) {
  const now = new Date()
  const limit = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
  return new Date(value) >= limit
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: string | number
  icon: typeof Users
  tone: "primary" | "success" | "danger" | "info" | "warning"
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-500",
    danger: "bg-red-500/10 text-red-500",
    info: "bg-blue-500/10 text-blue-500",
    warning: "bg-yellow-500/10 text-yellow-600",
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function summarizeAttendanceStudents(students: AttendanceStudent[]): AttendanceCounters {
  return students.reduce<AttendanceCounters>(
    (summary, student) => {
      summary.confirmed += 1

      if (student.status === "present") {
        summary.present += 1
      } else if (student.status === "absent") {
        summary.absent += 1
      } else if (student.status === "justified") {
        summary.justified += 1
      } else {
        summary.pending += 1
      }

      return summary
    },
    {
      confirmed: 0,
      present: 0,
      absent: 0,
      justified: 0,
      pending: 0,
    }
  )
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string | number
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${valueClassName ?? ""}`}>{value}</span>
    </div>
  )
}

function SessionSummaryCard({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: number
  valueClassName?: string
}) {
  return (
    <div className="rounded-xl border border-border/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueClassName ?? "text-foreground"}`}>{value}</p>
    </div>
  )
}

function ReportCard({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Users
  value: string
  label: string
  tone: "primary" | "success" | "info"
}) {
  const toneClasses = {
    primary: "text-primary",
    success: "text-green-500",
    info: "text-blue-500",
  }

  return (
    <Card>
      <CardContent className="p-4 text-center">
        <Icon className={`mx-auto mb-2 h-8 w-8 ${toneClasses[tone]}`} />
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
