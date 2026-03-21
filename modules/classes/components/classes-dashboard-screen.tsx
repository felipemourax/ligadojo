"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchJson } from "@/lib/api/client"
import type {
  ClassGroupEntity,
  ClassSessionEntity,
} from "@/apps/api/src/modules/classes/domain/class-group"
import {
  formatActivityCategory,
  type ActivityCategoryValue,
  type ModalityEntity,
} from "@/apps/api/src/modules/modalities/domain/modality"

type ViewMode = "grid" | "schedule"
type AgeGroupValue = "kids" | "juvenile" | "adult"
type ClassStatus = "active" | "archived"
type SessionStatus = "scheduled" | "cancelled"

interface ClassItem {
  id: string
  modalityId?: string | null
  enrolledStudentIds: string[]
  name: string
  teacher: string
  teacherId?: string | null
  schedule: string[]
  time: string
  endTime: string
  students: number
  maxStudents: number
  modality: string
  ageGroups: string[]
  beltRange: string
  status: ClassStatus
}

interface ClassSessionRecord {
  id: string
  classId: string
  dateKey: string
  day: string
  status: SessionStatus
  confirmedStudentIds: string[]
  presentStudentIds: string[]
  absentStudentIds: string[]
  justifiedStudentIds: string[]
}

interface SelectedSession {
  classItem: ClassItem
  dateKey: string
  day: string
  dateLabel: string
}

interface ModalitiesResponse {
  modalities: ModalityEntity[]
  activityCategories?: string[]
}

interface ClassesResponse {
  classes: ClassGroupEntity[]
  sessions: ClassSessionEntity[]
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

interface OnboardingModalitiesFallbackResponse {
  onboarding: {
    classStructure?: {
      modalities: Array<{
        clientId: string
        activityCategory?: string
        name: string
        ageGroups?: Array<AgeGroupValue | "mixed">
        ageGroup?: AgeGroupValue | "mixed"
        defaultDurationMinutes: number
        defaultCapacity: number
      }>
    }
  } | null
}

const validActivityCategories: ActivityCategoryValue[] = [
  "jiu-jitsu",
  "muay-thai",
  "judo",
  "karate",
  "taekwondo",
  "boxe",
  "mma",
  "outras",
]

function normalizeActivityCategory(value: string | null | undefined): ActivityCategoryValue | null {
  return value && validActivityCategories.includes(value as ActivityCategoryValue)
    ? (value as ActivityCategoryValue)
    : null
}

const weekDays = ["seg", "ter", "qua", "qui", "sex", "sab"]
const weekDaysFull = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

const modalityColors: Record<string, string> = {
  "Jiu-Jitsu": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Muay Thai": "bg-red-500/10 text-red-500 border-red-500/20",
  Boxe: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "Judô": "bg-orange-500/10 text-orange-500 border-orange-500/20",
}

const beltColors: Record<string, string> = {
  Branca: "bg-white text-foreground border border-border",
  Azul: "bg-blue-500 text-white",
  Roxa: "bg-violet-500 text-white",
  Marrom: "bg-amber-700 text-white",
  Preta: "bg-black text-white",
}

const ageGroupLabels: Record<AgeGroupValue, string> = {
  kids: "Kids",
  juvenile: "Juvenil",
  adult: "Adulto",
}

function formatAgeGroup(value: AgeGroupValue) {
  return ageGroupLabels[value]
}

function toAgeGroupValueFromLabel(value: string): AgeGroupValue {
  switch (value) {
    case "Kids":
      return "kids"
    case "Juvenil":
      return "juvenile"
    case "Adulto":
    default:
      return "adult"
  }
}

function formatAgeGroups(values: string[]) {
  if (values.length === 0) {
    return "Selecione"
  }

  return values.join(", ")
}

export function ClassesDashboardScreen() {
  const [classRecords, setClassRecords] = useState<ClassItem[]>([])
  const [sessionRecords, setSessionRecords] = useState<ClassSessionRecord[]>([])
  const [modalities, setModalities] = useState<ModalityEntity[]>([])

  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const todaySessionsByClass = useMemo(() => {
    const map = new Map<string, ClassSessionRecord>()
    sessionRecords.forEach((session) => {
      if (session.dateKey === todayKey) {
        map.set(session.classId, session)
      }
    })
    return map
  }, [sessionRecords, todayKey])
  const [teachers, setTeachers] = useState<TeachersResponse["teachers"]>([])
  const [studentCandidates, setStudentCandidates] = useState<StudentCandidatesResponse["students"]>([])
  const [modalitiesLoaded, setModalitiesLoaded] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)
  const [selectedSession, setSelectedSession] = useState<SelectedSession | null>(null)
  const [view, setView] = useState<ViewMode>("grid")
  const [currentWeek, setCurrentWeek] = useState(0)
  const [isClassFormOpen, setIsClassFormOpen] = useState(false)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false)
  const [classForm, setClassForm] = useState(createClassFormState())
  const [feedback, setFeedback] = useState<{ tone: "success" | "warning"; text: string } | null>(
    null
  )

  useEffect(() => {
    let active = true

    async function loadModalities() {
      try {
        const response = await fetchJson<ModalitiesResponse>("/api/modalities")

        if (active && response.modalities.length > 0) {
          setModalities(response.modalities)
          setModalitiesLoaded(true)
          return
        }
      } catch {
      }

      try {
        const response = await fetchJson<OnboardingModalitiesFallbackResponse>(
          "/api/onboarding/academy-setup"
        )

        const fallbackFromOnboarding =
          response.onboarding?.classStructure?.modalities.map((item, index) => ({
            id: item.clientId,
            tenantId: "onboarding",
            activityCategory: normalizeActivityCategory(item.activityCategory),
            name: item.name,
            ageGroups:
              item.ageGroups && item.ageGroups.length > 0
                ? item.ageGroups
                : item.ageGroup
                  ? [item.ageGroup]
                  : ["adult" as const],
            defaultDurationMinutes: item.defaultDurationMinutes,
            defaultCapacity: item.defaultCapacity,
            sortOrder: index,
            isActive: true,
            createdAt: "",
            updatedAt: "",
          })) ?? []

        if (active) {
          setModalities(fallbackFromOnboarding)
          setModalitiesLoaded(true)
        }
      } catch {
        if (active) {
          setModalities([])
          setModalitiesLoaded(true)
        }
      }
    }

    void loadModalities()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadClasses() {
      try {
        const [classesResponse, teachersResponse, studentCandidatesResponse] = await Promise.all([
          fetchJson<ClassesResponse>("/api/classes"),
          fetchJson<TeachersResponse>("/api/teachers"),
          fetchJson<StudentCandidatesResponse>("/api/students/candidates"),
        ])
        if (!active) {
          return
        }

        setClassRecords(classesResponse.classes.map(mapClassGroupToItem))
        setSessionRecords(classesResponse.sessions.map(mapSessionEntityToRecord))
        setTeachers(teachersResponse.teachers)
        setStudentCandidates(studentCandidatesResponse.students)
      } catch {
      }
    }

    void loadClasses()

    return () => {
      active = false
    }
  }, [])

  const activeClassRecords = useMemo(
    () => classRecords.filter((item) => item.status === "active"),
    [classRecords]
  )

  const filteredClasses = useMemo(() => {
    return activeClassRecords.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.teacher.toLowerCase().includes(search.toLowerCase()) ||
        item.modality.toLowerCase().includes(search.toLowerCase()),
    )
  }, [activeClassRecords, search])

  const totalStudents = activeClassRecords.reduce((acc, item) => acc + item.students, 0)
  const weeklyLessons = activeClassRecords.reduce((acc, item) => acc + item.schedule.length, 0)
  const occupancy = Math.round(
    (totalStudents / activeClassRecords.reduce((acc, item) => acc + item.maxStudents, 0)) * 100,
  )

  function getClassesForDay(day: string) {
    return activeClassRecords
      .filter((item) => item.schedule.includes(day))
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  function getWeekDates() {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1 + currentWeek * 7)

    return weekDays.map((_, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return date
    })
  }

  const weekDates = getWeekDates()

  function openCreateClass() {
    setSelectedClass(null)
    setSelectedSession(null)
    setEditingClassId(null)
    setClassForm(createClassFormState())
    setIsClassFormOpen(true)
  }

  function openEditClass(item: ClassItem) {
    setSelectedClass(null)
    setEditingClassId(item.id)
    setClassForm({
      name: item.name,
      modality: item.modality,
      teacher: item.teacher,
      modalityId: item.modalityId ?? "",
      teacherId: item.teacherId ?? "",
      ageGroups: item.ageGroups,
      maxStudents: String(item.maxStudents),
      schedule: item.schedule,
      time: item.time,
      endTime: item.endTime,
      beltRange: item.beltRange,
    })
    setIsClassFormOpen(true)
  }

  function handleModalityChange(value: string) {
    const nextModality = modalities.find((item) => item.id === value) ?? null

    setClassForm((current) => ({
      ...current,
      modality: nextModality?.name ?? current.modality,
      modalityId: nextModality?.id ?? "",
      maxStudents:
        nextModality && !current.maxStudents ? String(nextModality.defaultCapacity) : current.maxStudents,
    }))
  }

  function handleTeacherChange(value: string) {
    const nextTeacher = teachers.find((item) => item.id === value) ?? null

    setClassForm((current) => ({
      ...current,
      teacherId: value,
      teacher: nextTeacher?.name ?? current.teacher,
    }))
  }

  const modalityOptions = useMemo(
    () =>
      modalities.map((item) => ({
        value: item.id,
        label: `${formatActivityCategory(item.activityCategory)} > ${item.name}`,
        entity: item,
      })),
    [modalities]
  )

  const teacherOptions = useMemo(
    () =>
      teachers
        .filter((item) => item.status === "active")
        .map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [teachers]
  )

  function toggleAgeGroup(value: AgeGroupValue) {
    const label = formatAgeGroup(value)

    setClassForm((current) => ({
      ...current,
      ageGroups: current.ageGroups.includes(label)
        ? current.ageGroups.filter((item) => item !== label)
        : [...current.ageGroups, label],
    }))
  }

  function toggleDay(day: string) {
    setClassForm((current) => ({
      ...current,
      schedule: current.schedule.includes(day)
        ? current.schedule.filter((item) => item !== day)
        : [...current.schedule, day],
    }))
  }

  function getSessionRecord(classId: string, dateKey: string) {
    return sessionRecords.find((item) => item.classId === classId && item.dateKey === dateKey) ?? null
  }

  function openSession(item: ClassItem, day: string, date: Date) {
    setSelectedSession({
      classItem: item,
      day,
      dateKey: date.toISOString().slice(0, 10),
      dateLabel: date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
    })
  }

  async function submitClassForm() {
    const previous = editingClassId
      ? classRecords.find((item) => item.id === editingClassId)
      : null

      const payload = {
      id: editingClassId ?? undefined,
      name: classForm.name,
      modalityId: classForm.modalityId || undefined,
      modalityName: classForm.modality,
      teacherProfileId: classForm.teacherId || undefined,
      teacherName: classForm.teacher,
      ageGroups: classForm.ageGroups.map(toAgeGroupValueFromLabel),
      beltRange: classForm.beltRange,
      maxStudents: Number(classForm.maxStudents || 0),
      currentStudents: previous?.students ?? 0,
      schedules: classForm.schedule.map((day) => ({
        weekday: weekDays.indexOf(day),
        startTime: classForm.time,
        endTime: classForm.endTime,
      })),
      status: previous?.status ?? "active",
    }

    try {
      const response = editingClassId
        ? await fetchJson<{ classGroup: ClassGroupEntity; message: string }>(
            `/api/classes/${editingClassId}`,
            {
              method: "PATCH",
              body: JSON.stringify(payload),
            }
          )
        : await fetchJson<{ classGroup: ClassGroupEntity; message: string }>("/api/classes", {
            method: "POST",
            body: JSON.stringify(payload),
          })

      const record = mapClassGroupToItem(response.classGroup)

      setClassRecords((current) =>
        editingClassId
          ? current.map((item) => (item.id === editingClassId ? record : item))
          : [record, ...current]
      )

      if (selectedClass?.id === record.id) {
        setSelectedClass(record)
      }

      setFeedback({
        tone: "success",
        text: editingClassId ? "Turma atualizada com sucesso." : "Turma criada com sucesso.",
      })

      setIsClassFormOpen(false)
      setEditingClassId(null)
      setClassForm(createClassFormState())
    } catch (error) {
      setFeedback({
        tone: "warning",
        text: error instanceof Error ? error.message : "Não foi possível salvar a turma.",
      })
    }
  }

  async function deleteClass(item: ClassItem) {
    try {
      const response = await fetchJson<{
        mode: "archived" | "deleted"
        classGroup?: ClassGroupEntity
        message: string
      }>(`/api/classes/${item.id}`, {
        method: "DELETE",
      })

      if (response.mode === "archived" && response.classGroup) {
        const archived = mapClassGroupToItem(response.classGroup)
        setClassRecords((current) =>
          current.map((currentItem) => (currentItem.id === item.id ? archived : currentItem))
        )
        setFeedback({
          tone: "warning",
          text: response.message,
        })
      } else {
        setClassRecords((current) => current.filter((currentItem) => currentItem.id !== item.id))
        setFeedback({
          tone: "success",
          text: response.message,
        })
      }

      if (selectedClass?.id === item.id) {
        setSelectedClass(null)
      }
    } catch (error) {
      setFeedback({
        tone: "warning",
        text: error instanceof Error ? error.message : "Não foi possível excluir a turma.",
      })
    }
  }

  async function saveSelectedClassEnrollments(studentUserIds: string[]) {
    if (!selectedClass) {
      return
    }

    try {
      const response = await fetchJson<{ classGroup: ClassGroupEntity; message: string }>(
        `/api/classes/${selectedClass.id}/students`,
        {
          method: "PUT",
          body: JSON.stringify({ studentUserIds }),
        }
      )

      const updated = mapClassGroupToItem(response.classGroup)
      setClassRecords((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
      setSelectedClass(updated)

      if (selectedSession?.classItem.id === updated.id) {
        setSelectedSession((current) =>
          current
            ? {
                ...current,
                classItem: updated,
              }
            : current
        )
      }

      setFeedback({
        tone: "success",
        text: response.message,
      })
    } catch (error) {
      setFeedback({
        tone: "warning",
        text: error instanceof Error ? error.message : "Não foi possível atualizar os alunos da turma.",
      })
    }
  }

  async function toggleStudentConfirmation(studentId: string) {
    if (!selectedSession) {
      return
    }

    const currentRecord = getSessionRecord(selectedSession.classItem.id, selectedSession.dateKey)
    const nextConfirmedStudentIds = currentRecord?.confirmedStudentIds.includes(studentId)
      ? currentRecord.confirmedStudentIds.filter((item) => item !== studentId)
      : [...(currentRecord?.confirmedStudentIds ?? []), studentId]

    const confirmedStudentNames = eligibleStudentCandidates
      .filter((item) => nextConfirmedStudentIds.includes(item.id))
      .map((item) => item.name)

    try {
      const response = await fetchJson<{ session: ClassSessionEntity }>("/api/classes/sessions", {
        method: "PUT",
        body: JSON.stringify({
          classGroupId: selectedSession.classItem.id,
          sessionDate: selectedSession.dateKey,
          weekday: weekDays.indexOf(selectedSession.day),
          startTime: selectedSession.classItem.time,
          endTime: selectedSession.classItem.endTime,
          status: currentRecord?.status ?? "scheduled",
          confirmedStudentIds: nextConfirmedStudentIds,
          confirmedStudentNames,
        }),
      })

      const nextRecord = mapSessionEntityToRecord(response.session)
      setSessionRecords((current) => {
        const withoutCurrent = current.filter((item) => item.id !== nextRecord.id)
        return [...withoutCurrent, nextRecord]
      })
    } catch (error) {
      setFeedback({
        tone: "warning",
        text: error instanceof Error ? error.message : "Não foi possível atualizar os confirmados.",
      })
    }
  }

  async function toggleSessionCancellation() {
    if (!selectedSession) {
      return
    }

    const currentRecord = getSessionRecord(selectedSession.classItem.id, selectedSession.dateKey)

    try {
      const response = await fetchJson<{ session: ClassSessionEntity }>("/api/classes/sessions", {
        method: "PUT",
        body: JSON.stringify({
          classGroupId: selectedSession.classItem.id,
          sessionDate: selectedSession.dateKey,
          weekday: weekDays.indexOf(selectedSession.day),
          startTime: selectedSession.classItem.time,
          endTime: selectedSession.classItem.endTime,
          status: currentRecord?.status === "cancelled" ? "scheduled" : "cancelled",
          confirmedStudentIds: currentRecord?.confirmedStudentIds ?? [],
          confirmedStudentNames:
            eligibleStudentCandidates
              .filter((item) => (currentRecord?.confirmedStudentIds ?? []).includes(item.id))
              .map((item) => item.name),
        }),
      })

      const nextRecord = mapSessionEntityToRecord(response.session)
      setSessionRecords((current) => {
        const withoutCurrent = current.filter((item) => item.id !== nextRecord.id)
        return [...withoutCurrent, nextRecord]
      })
    } catch (error) {
      setFeedback({
        tone: "warning",
        text: error instanceof Error ? error.message : "Não foi possível atualizar a aula.",
      })
    }
  }

  const currentSessionRecord = selectedSession
    ? getSessionRecord(selectedSession.classItem.id, selectedSession.dateKey)
    : null
  const selectedClassEnrolledStudents = useMemo(() => {
    if (!selectedClass) {
      return []
    }

    return studentCandidates.filter((student) => selectedClass.enrolledStudentIds.includes(student.id))
  }, [selectedClass, studentCandidates])

  const selectedClassEligibleCandidates = useMemo(() => {
    if (!selectedClass?.modalityId) {
      return studentCandidates
    }

    return studentCandidates.filter((student) =>
      student.modalityIds.includes(selectedClass.modalityId as string)
    )
  }, [selectedClass, studentCandidates])

  const eligibleStudentCandidates = useMemo(() => {
    if (!selectedSession) {
      return []
    }

    return studentCandidates.filter((student) =>
      selectedSession.classItem.enrolledStudentIds.includes(student.id)
    )
  }, [selectedSession, studentCandidates])
  const classHasStudents = (selectedClass?.students ?? 0) > 0

  const classIsFull = (selectedClass?.students ?? 0) >= (selectedClass?.maxStudents ?? 0)

  return (
    <>
      <Dialog open={isClassFormOpen} onOpenChange={setIsClassFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClassId ? "Editar turma" : "Nova turma"}</DialogTitle>
            <DialogDescription>
              {editingClassId
                ? "Atualize horários, capacidade e posicionamento da turma."
                : "Crie uma nova turma para a academia. As turmas só podem ser criadas dentro dos horários de funcionamento."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="className">Nome da turma</Label>
              <Input
                id="className"
                placeholder="Ex: Jiu-Jitsu Iniciante"
                value={classForm.name}
                onChange={(event) =>
                  setClassForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Modalidade</Label>
                <Select
                  value={classForm.modalityId}
                  onValueChange={handleModalityChange}
                  disabled={modalitiesLoaded && modalityOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        modalitiesLoaded && modalityOptions.length === 0
                          ? "Cadastre uma modalidade"
                          : "Selecione"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {modalityOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {modalitiesLoaded && modalityOptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma modalidade foi cadastrada na academia ainda.
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label>Professor</Label>
                <Select
                  value={classForm.teacherId}
                  onValueChange={handleTeacherChange}
                  disabled={teacherOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={teacherOptions.length === 0 ? "Cadastre um professor" : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {teacherOptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhum professor foi cadastrado na academia ainda.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Faixas etárias</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" className="justify-between">
                      <span className="truncate">{formatAgeGroups(classForm.ageGroups)}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {(["kids", "juvenile", "adult"] as const).map((ageGroup) => (
                      <DropdownMenuCheckboxItem
                        key={ageGroup}
                        checked={classForm.ageGroups.includes(formatAgeGroup(ageGroup))}
                        onCheckedChange={() => toggleAgeGroup(ageGroup)}
                      >
                        {formatAgeGroup(ageGroup)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid gap-2">
                <Label>Limite de alunos</Label>
                <Input
                  type="number"
                  placeholder="20"
                  value={classForm.maxStudents}
                  onChange={(event) =>
                    setClassForm((current) => ({ ...current, maxStudents: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Nível de faixa</Label>
              <Input
                placeholder="Ex: Branca a Azul"
                value={classForm.beltRange}
                onChange={(event) =>
                  setClassForm((current) => ({ ...current, beltRange: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {weekDaysFull.map((day, index) => {
                  const shortDay = weekDays[index]
                  const active = classForm.schedule.includes(shortDay)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(shortDay)}
                      className={`h-8 rounded-md border px-3 text-sm transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {shortDay.toUpperCase()}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Horário início</Label>
                <Input
                  type="time"
                  value={classForm.time}
                  onChange={(event) =>
                    setClassForm((current) => ({ ...current, time: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Horário fim</Label>
                <Input
                  type="time"
                  value={classForm.endTime}
                  onChange={(event) =>
                    setClassForm((current) => ({ ...current, endTime: event.target.value }))
                  }
                />
              </div>
            </div>
            <Button
              className="mt-2"
              onClick={submitClassForm}
              disabled={!classForm.name || !classForm.modality || !classForm.teacher || classForm.schedule.length === 0}
            >
              {editingClassId ? "Salvar alterações" : "Criar turma"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-6">
        {feedback ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                : "border-amber-500/30 bg-amber-500/10 text-amber-600"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Turmas</h1>
            <p className="text-muted-foreground">Gerencie as turmas e horários</p>
          </div>
          <Button className="gap-2" onClick={openCreateClass}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova turma</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard title="Turmas" value={activeClassRecords.length} subtitle="Em operação" icon={Calendar} tone="primary" />
          <MetricCard title="Inscritos" value={totalStudents} subtitle="Alunos ativos" icon={Users} tone="success" />
          <MetricCard title="Aulas/semana" value={weeklyLessons} subtitle="Carga semanal" icon={Clock} tone="info" />
          <MetricCard title="Ocupação" value={`${occupancy}%`} subtitle="Capacidade média" icon={Users} tone="warning" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="grid">Cards</TabsTrigger>
              <TabsTrigger value="schedule">Agenda</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar turmas..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((item) => {
          const todaysSession = todaySessionsByClass.get(item.id) ?? null
          const attendance = getAttendanceCounts(todaysSession)
          return (
            <Card
              key={item.id}
              className="cursor-pointer overflow-hidden transition-all hover:bg-muted/50"
              onClick={() => setSelectedClass(item)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge className={modalityColors[item.modality]}>{item.modality}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          setSelectedClass(item)
                        }}
                      >
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          openEditClass(item)
                        }}
                      >
                        Editar turma
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(event) => {
                          event.preventDefault()
                          deleteClass(item)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir turma
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {teacherInitials(item.teacher)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{item.teacher}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{item.schedule.map((day) => day.toUpperCase()).join(", ")} - {item.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{item.ageGroups.join(", ")} | {item.beltRange}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    {attendance.present}
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <XCircle className="h-4 w-4" />
                    {attendance.absent}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    {attendance.justified}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {attendance.pending} pendentes
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    {attendance.confirmed} confirmados · {item.students}/{item.maxStudents} alunos vinculados
                  </span>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(item.students / item.maxStudents) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Agenda semanal</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentWeek((value) => value - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[120px] text-center text-sm text-muted-foreground">
                    {weekDates[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} - {weekDates[5].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentWeek((value) => value + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="grid min-w-[800px] grid-cols-6">
                  {weekDays.map((day, index) => (
                    <div key={day} className="border-r border-border last:border-r-0">
                      <div className="border-b border-border bg-muted/50 p-3">
                        <p className="text-center font-medium">{weekDaysFull[index]}</p>
                        <p className="text-center text-xs text-muted-foreground">
                          {weekDates[index].toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="max-h-[360px] min-h-[300px] space-y-2 overflow-y-auto p-2">
                        {getClassesForDay(day).map((item) => (
                          <div
                            key={item.id}
                            className={`cursor-pointer rounded-lg border p-2 transition-colors hover:bg-muted/80 ${modalityColors[item.modality]}`}
                            onClick={() => openSession(item, day, weekDates[index])}
                          >
                            <p className="truncate text-sm font-medium">{item.name}</p>
                            <p className="text-xs opacity-80">{item.time} - {item.endTime}</p>
                            <p className="truncate text-xs opacity-60">{item.teacher}</p>
                            {(() => {
                              const sessionRecord = getSessionRecord(
                                item.id,
                                weekDates[index].toISOString().slice(0, 10)
                              )

                              if (!sessionRecord) {
                                return null
                              }

                              const present = sessionRecord.presentStudentIds.length
                              const absent = sessionRecord.absentStudentIds.length
                              const justified = sessionRecord.justifiedStudentIds.length
                              const confirmed = sessionRecord.confirmedStudentIds.length
                              return (
                                <div className="mt-2 flex items-center justify-between text-[11px] opacity-75">
                                  <span>
                                    {confirmed} confirmados · {present} presentes · {absent} ausentes · {justified} justificadas
                                  </span>
                                  <span>
                                    {sessionRecord.status === "cancelled"
                                      ? "Aula cancelada"
                                      : "Aula confirmada"}
                                  </span>
                                </div>
                              )
                            })()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={Boolean(selectedClass)} onOpenChange={(open) => !open && setSelectedClass(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {selectedClass ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedClass.name}</DialogTitle>
                    <DialogDescription className="mt-1 flex items-center gap-2">
                      <Badge className={modalityColors[selectedClass.modality]}>{selectedClass.modality}</Badge>
                      <span>{selectedClass.ageGroups.join(", ")}</span>
                    </DialogDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          openEditClass(selectedClass)
                        }}
                      >
                        Editar turma
                      </DropdownMenuItem>
                      <DropdownMenuItem>Duplicar turma</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(event) => {
                          event.preventDefault()
                          deleteClass(selectedClass)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir turma
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
                  <TabsTrigger value="students" className="flex-1">Alunos ({selectedClass.students})</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Professor</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {teacherInitials(selectedClass.teacher)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{selectedClass.teacher}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Faixa etária</p>
                      <p className="font-medium">{selectedClass.ageGroups.join(", ")}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Nível de faixa</p>
                      <p className="font-medium">{selectedClass.beltRange}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Capacidade</p>
                      <p className="font-medium">{selectedClass.students}/{selectedClass.maxStudents} alunos</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Horários</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedClass.schedule.map((day) => (
                        <div key={day} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                          <span className="font-medium">{weekDaysFull[weekDays.indexOf(day)]}</span>
                          <span className="text-muted-foreground">
                            {selectedClass.time} - {selectedClass.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1" disabled={(selectedClass?.students ?? 0) === 0}>
                      Registrar presença
                    </Button>
                    <Button variant="outline" className="flex-1">Ver histórico</Button>
                  </div>
                </TabsContent>

                <TabsContent value="students" className="mt-4">
                    <div className="border-t pt-4">
                      <div className="mb-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Alunos da turma</h4>
                          <Button
                            variant={classHasStudents ? "outline" : "secondary"}
                            size="sm"
                            className={classHasStudents ? "" : "border-red-400"}
                            onClick={() => setIsEnrollmentDialogOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Gerenciar alunos
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Capacidade {selectedClass?.students ?? 0}/{selectedClass?.maxStudents ?? 0} — alunos
                          matriculados ocupam a vaga fixa.
                        </p>
                      </div>
                    <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                      {selectedClassEnrolledStudents.length === 0 ? (
                        <div className="rounded-lg border border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                          Nenhum aluno foi vinculado a esta turma ainda.
                        </div>
                      ) : (
                        selectedClassEnrolledStudents.map((student) => (
                          <div key={student.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {student.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">{student.attendance}% presença</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <Badge className={beltColors[student.belt]}>{student.belt}</Badge>
                              <span className="text-xs text-muted-foreground mt-1">Matriculado</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedSession)} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedSession ? (
            <>
              <DialogHeader>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={modalityColors[selectedSession.classItem.modality]}>
                      {selectedSession.classItem.modality}
                    </Badge>
                    <Badge variant="outline">
                      {selectedSession.classItem.ageGroups.join(", ")}
                    </Badge>
                    <Badge variant="outline">{selectedSession.classItem.beltRange}</Badge>
                  </div>
                  <div>
                    <DialogTitle>{selectedSession.classItem.name}</DialogTitle>
                    <DialogDescription>
                      {selectedSession.dateLabel} · {selectedSession.classItem.time} -{" "}
                      {selectedSession.classItem.endTime}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Professor responsável
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {teacherInitials(selectedSession.classItem.teacher)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedSession.classItem.teacher}</p>
                        <p className="text-sm text-muted-foreground">Turma ativa da agenda</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Capacidade da turma
                    </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold">
                      {selectedSession.classItem.students}/{selectedSession.classItem.maxStudents}
                    </p>
                    <p className="text-sm text-muted-foreground">alunos vinculados</p>
                  </div>
                  <Badge variant="outline">
                    {currentSessionRecord?.confirmedStudentIds.length ?? 0} confirmados
                  </Badge>
                </div>
                {currentSessionRecord ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {currentSessionRecord.presentStudentIds.length} presentes · {currentSessionRecord.absentStudentIds.length} ausentes · {currentSessionRecord.justifiedStudentIds.length} justificadas
                  </p>
                ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <div>
                    <p className="font-medium">Status da aula</p>
                    <p className="text-sm text-muted-foreground">
                      {currentSessionRecord?.status === "cancelled"
                        ? "Esta aula foi cancelada para este dia."
                        : "A aula está programada normalmente."}
                    </p>
                  </div>
                  <Button
                    variant={currentSessionRecord?.status === "cancelled" ? "outline" : "destructive"}
                    className="gap-2"
                    onClick={toggleSessionCancellation}
                  >
                    <Ban className="h-4 w-4" />
                    {currentSessionRecord?.status === "cancelled" ? "Reativar aula" : "Cancelar aula"}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Confirmar alunos na aula</p>
                      <p className="text-sm text-muted-foreground">
                        Escolha os alunos já confirmados para esta aula.
                      </p>
                    </div>
                    <Badge variant="outline">
                      {currentSessionRecord?.confirmedStudentIds.length ?? 0} confirmados
                    </Badge>
                  </div>

                {currentSessionRecord?.status === "cancelled" ? (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600">
                      Esta aula está cancelada. Reative a aula para confirmar presença de alunos.
                    </div>
                  ) : null}

                  <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                    {eligibleStudentCandidates.map((student) => {
                      const checked = currentSessionRecord?.confirmedStudentIds.includes(student.id) ?? false

                      return (
                        <label
                          key={student.id}
                          className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background px-3 py-3 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleStudentConfirmation(student.id)}
                              disabled={currentSessionRecord?.status === "cancelled"}
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
                              <p className="text-sm text-muted-foreground">
                                {student.attendance}% presença geral
                              </p>
                            </div>
                          </div>
                          <Badge className={beltColors[student.belt]}>{student.belt}</Badge>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isEnrollmentDialogOpen} onOpenChange={setIsEnrollmentDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedClass ? (
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle>Alunos da turma</DialogTitle>
                <DialogDescription>
                  Selecione quem permanece vinculado de forma fixa a {selectedClass.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Turma com capacidade máxima de {selectedClass?.maxStudents ?? 0} alunos. Marque apenas quem deve ficar fixo.
                </div>
                {classIsFull && (
                  <p className="text-xs text-amber-500">
                    A turma chegou ao limite. Desmarque alguém antes de incluir outro aluno fixo.
                  </p>
                )}
                <div className="space-y-3">
                  {selectedClassEligibleCandidates.length === 0 ? (
                    <div className="rounded-lg border border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                      Nenhum aluno elegível foi encontrado para a modalidade desta turma.
                    </div>
                  ) : (
                    selectedClassEligibleCandidates.map((student) => {
                      const checked = selectedClass.enrolledStudentIds.includes(student.id)

                      return (
                        <label
                          key={student.id}
                          className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background px-3 py-3 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={checked}
                              disabled={!checked && classIsFull}
                              onCheckedChange={(nextChecked) => {
                                const currentIds = selectedClass.enrolledStudentIds
                                const nextIds = nextChecked
                                  ? [...currentIds, student.id]
                                  : currentIds.filter((item) => item !== student.id)
                                void saveSelectedClassEnrollments(nextIds)
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
                          <Badge className={beltColors[student.belt]}>{student.belt}</Badge>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

    </>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: typeof Users
  tone: "primary" | "success" | "warning" | "info"
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    info: "bg-sky-500/10 text-sky-600",
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
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function createClassFormState() {
  return {
    name: "",
    modality: "",
    modalityId: "",
    teacher: "",
    teacherId: "",
    ageGroups: [] as string[],
    maxStudents: "",
    schedule: [] as string[],
    time: "19:00",
    endTime: "20:30",
    beltRange: "",
  }
}

function mapClassGroupToItem(item: ClassGroupEntity): ClassItem {
  const primarySchedule = item.schedules[0]

  return {
    id: item.id,
    modalityId: item.modalityId,
    enrolledStudentIds: item.enrolledStudentIds,
    name: item.name,
    teacher: item.teacherName,
    teacherId: item.teacherProfileId,
    schedule: item.schedules
      .slice()
      .sort((left, right) => left.weekday - right.weekday)
      .map((schedule) => weekDays[schedule.weekday] ?? "seg"),
    time: primarySchedule?.startTime ?? "19:00",
    endTime: primarySchedule?.endTime ?? "20:30",
    students: item.currentStudents,
    maxStudents: item.maxStudents,
    modality: item.activityCategory
      ? `${formatActivityCategory(item.activityCategory)} > ${item.modalityName}`
      : item.modalityName,
    ageGroups: item.ageGroups.map((value) => formatAgeGroup(value as AgeGroupValue)),
    beltRange: item.beltRange,
    status: item.status,
  }
}

function mapSessionEntityToRecord(item: ClassSessionEntity): ClassSessionRecord {
  return {
    id: item.id,
    classId: item.classGroupId,
    dateKey: item.sessionDate.slice(0, 10),
    day: weekDays[item.weekday] ?? "seg",
    status: item.status,
    confirmedStudentIds: item.confirmedStudentIds,
    presentStudentIds: item.presentStudentIds,
    absentStudentIds: item.absentStudentIds,
    justifiedStudentIds: item.justifiedStudentIds,
  }
}

function teacherInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function toDateKey(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getAttendanceCounts(session: ClassSessionRecord | null | undefined) {
  const confirmed = session?.confirmedStudentIds.length ?? 0
  const present = session?.presentStudentIds?.length ?? 0
  const absent = session?.absentStudentIds?.length ?? 0
  const justified = session?.justifiedStudentIds?.length ?? 0
  const pending = Math.max(0, confirmed - present - absent - justified)
  return { confirmed, present, absent, justified, pending }
}
