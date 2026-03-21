"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  Star,
  Target,
  Trash2,
  User,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { Textarea } from "@/components/ui/textarea"
import type {
  GraduationDashboardData,
  GraduationExamRecord,
  GraduationTrackInput,
  GraduationTrackRecord,
} from "@/apps/api/src/modules/graduations/domain/graduation-dashboard"
import { resolveBeltBadgeStyle } from "@/lib/ui/belt-badges"
import {
  addGraduationExamCandidate,
  createGraduationExam,
  fetchGraduationDashboard,
  replaceGraduationTracks,
  removeGraduationExamCandidate,
  updateGraduationEligibility,
  updateGraduationExamStatus,
} from "@/modules/graduations/services"

type EditableTrackState = GraduationTrackInput

function createExamForm() {
  return {
    title: "",
    selectedTrackIds: [] as string[],
    allTracks: false,
    date: "",
    time: "",
    location: "",
    selectedEvaluators: [] as string[],
    allEvaluators: false,
    notes: "",
  }
}

function toEditableTracks(tracks: GraduationTrackRecord[]): EditableTrackState[] {
  return tracks.map((track) => ({
    id: track.id,
    modalityId: track.modalityId,
    name: track.name,
    branch: track.branch,
    progression: track.progression,
    levels: track.levels.map((level) => ({
      id: level.id,
      name: level.name,
      colorHex: level.colorHex,
      stripes: level.stripes,
      minTimeMonths: level.minTimeMonths,
    })),
  }))
}

const statusColors = {
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
} as const

const statusLabels = {
  scheduled: "Agendado",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
} as const

function formatTrackBranchLabel(branch: GraduationTrackRecord["branch"]) {
  return branch === "adult" ? "Adulto" : "Kids"
}

function formatTrackOptionLabel(track: GraduationTrackRecord) {
  return `${track.name} · ${formatTrackBranchLabel(track.branch)}`
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

export function GraduationsDashboardScreen() {
  const [dashboard, setDashboard] = useState<GraduationDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [showNewExamDialog, setShowNewExamDialog] = useState(false)
  const [showAddCandidateDialog, setShowAddCandidateDialog] = useState(false)
  const [addCandidateMode, setAddCandidateMode] = useState<"select_exam" | "select_student">("select_exam")
  const [showEditTrackDialog, setShowEditTrackDialog] = useState(false)
  const [editingTrackIndex, setEditingTrackIndex] = useState<number | null>(null)
  const [showEditLevelDialog, setShowEditLevelDialog] = useState(false)
  const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null)
  const [examForm, setExamForm] = useState(createExamForm())
  const [savingExam, setSavingExam] = useState(false)
  const [searchEligible, setSearchEligible] = useState("")
  const [searchCandidate, setSearchCandidate] = useState("")
  const [editableTracks, setEditableTracks] = useState<EditableTrackState[]>([])
  const [savingTracks, setSavingTracks] = useState(false)
  const [updatingEligibilityId, setUpdatingEligibilityId] = useState<string | null>(null)
  const [selectedStudentActivityId, setSelectedStudentActivityId] = useState<string>("")
  const [selectedTargetExamId, setSelectedTargetExamId] = useState<string>("")
  const [addingCandidate, setAddingCandidate] = useState(false)
  const [updatingExamStatus, setUpdatingExamStatus] = useState<string | null>(null)
  const [removingCandidateId, setRemovingCandidateId] = useState<string | null>(null)
  const [isTrackPickerOpen, setIsTrackPickerOpen] = useState(false)
  const [isEvaluatorPickerOpen, setIsEvaluatorPickerOpen] = useState(false)
  const [pendingExamAction, setPendingExamAction] = useState<{
    examId: string
    status: "completed" | "cancelled"
    title: string
  } | null>(null)
  const [showFullHistory, setShowFullHistory] = useState(false)
  const [eligibleActivityTab, setEligibleActivityTab] = useState<string>("")

  function handleAddCandidateDialogChange(open: boolean) {
    setShowAddCandidateDialog(open)
    if (!open) {
      setSearchCandidate("")
      setSelectedStudentActivityId("")
      setSelectedTargetExamId("")
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchGraduationDashboard()
        if (cancelled) return
        setDashboard(response.dashboard)
        setEditableTracks(toEditableTracks(response.dashboard.tracks))
        setSelectedExamId((current) => current ?? response.dashboard.exams[0]?.id ?? null)
      } catch (loadError) {
        if (cancelled) return
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar graduação.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const eligibleActivityOptions = useMemo(() => {
    if (!dashboard) return []

    return Array.from(
      new Set(
        dashboard.eligibleStudents
          .map((student) => student.activityLabel)
          .filter((value): value is string => Boolean(value))
      )
    ).sort((left, right) => left.localeCompare(right))
  }, [dashboard])

  useEffect(() => {
    if (eligibleActivityOptions.length === 0) {
      if (eligibleActivityTab !== "") {
        setEligibleActivityTab("")
      }
      return
    }

    if (!eligibleActivityOptions.includes(eligibleActivityTab)) {
      setEligibleActivityTab(eligibleActivityOptions[0])
    }
  }, [eligibleActivityOptions, eligibleActivityTab])

  const selectedExam = useMemo(
    () => dashboard?.exams.find((exam) => exam.id === selectedExamId) ?? null,
    [dashboard, selectedExamId]
  )

  const filteredEligible = useMemo(() => {
    if (!dashboard) return []
    const normalized = searchEligible.trim().toLowerCase()
    return dashboard.eligibleStudents.filter((student) => {
      if (eligibleActivityTab && student.activityLabel !== eligibleActivityTab) {
        return false
      }

      if (!normalized) return true
      return (
        student.studentName.toLowerCase().includes(normalized) ||
        student.activityLabel.toLowerCase().includes(normalized)
      )
    })
  }, [dashboard, eligibleActivityTab, searchEligible])

  const filteredCandidatesToAdd = useMemo(() => {
    if (!dashboard) return []
    const normalized = searchCandidate.trim().toLowerCase()
      return dashboard.studentDirectory.filter((student) => {
        if (!normalized) return true
        return (
          student.studentName.toLowerCase().includes(normalized) ||
          (student.activityLabel ?? "").toLowerCase().includes(normalized) ||
          (student.modalityName ?? "").toLowerCase().includes(normalized)
        )
      })
  }, [dashboard, searchCandidate])

  const editingTrack = editingTrackIndex !== null ? editableTracks[editingTrackIndex] ?? null : null
  const editingLevel =
    editingTrack && editingLevelIndex !== null ? editingTrack.levels[editingLevelIndex] ?? null : null

  function openExamActionDialog(examId: string, status: "completed" | "cancelled", title: string) {
    setPendingExamAction({ examId, status, title })
  }

  function toggleStringSelection(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  async function submitExam() {
    if (!dashboard) return
    if (!examForm.title || !examForm.date || !examForm.time) {
      setError("Preencha título, data e horário.")
      return
    }

    if (!examForm.allTracks && examForm.selectedTrackIds.length === 0) {
      setError("Selecione ao menos uma trilha ou marque todos.")
      return
    }

    if (!examForm.allEvaluators && examForm.selectedEvaluators.length === 0) {
      setError("Selecione ao menos um avaliador ou marque todos.")
      return
    }

    setSavingExam(true)
    setError(null)

    try {
      const primaryTrack = dashboard.tracks.find((track) => examForm.selectedTrackIds.includes(track.id)) ?? dashboard.tracks[0]
      const response = await createGraduationExam({
        title: examForm.title,
        trackIds: examForm.selectedTrackIds,
        allTracks: examForm.allTracks,
        modalityId: primaryTrack?.modalityId ?? null,
        date: examForm.date,
        time: examForm.time,
        location: examForm.location || null,
        evaluatorNames: examForm.selectedEvaluators,
        allEvaluators: examForm.allEvaluators,
        notes: examForm.notes || null,
      })

      setDashboard(response.dashboard)
      setEditableTracks(toEditableTracks(response.dashboard.tracks))
      setSelectedExamId(response.dashboard.exams[0]?.id ?? null)
      setShowNewExamDialog(false)
      setExamForm(createExamForm())
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível agendar o exame.")
    } finally {
      setSavingExam(false)
    }
  }

  async function toggleEligibility(studentActivityId: string, nextValue: boolean | null) {
    setUpdatingEligibilityId(studentActivityId)
    setError(null)
    try {
      const response = await updateGraduationEligibility(studentActivityId, nextValue)
      setDashboard(response.dashboard)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Não foi possível atualizar a aptidão.")
    } finally {
      setUpdatingEligibilityId(null)
    }
  }

  async function addCandidateToExam() {
    if (!selectedStudentActivityId || !selectedTargetExamId) {
      setError("Selecione o aluno e o exame.")
      return
    }

    setAddingCandidate(true)
    setError(null)
    try {
      const response = await addGraduationExamCandidate(selectedTargetExamId, {
        studentActivityId: selectedStudentActivityId,
      })
      setDashboard(response.dashboard)
      setSelectedExamId(selectedTargetExamId)
      setShowAddCandidateDialog(false)
      setSelectedStudentActivityId("")
      setSelectedTargetExamId("")
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Não foi possível adicionar ao exame.")
    } finally {
      setAddingCandidate(false)
    }
  }

  async function changeExamStatus(
    examId: string,
    status: "in_progress" | "completed" | "cancelled"
  ) {
    setUpdatingExamStatus(`${examId}:${status}`)
    setError(null)
    try {
      const response = await updateGraduationExamStatus(examId, status)
      setDashboard(response.dashboard)
      setSelectedExamId(examId)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Não foi possível atualizar o exame.")
    } finally {
      setUpdatingExamStatus(null)
    }
  }

  async function removeCandidate(examId: string, studentActivityId: string) {
    setRemovingCandidateId(studentActivityId)
    setError(null)
    try {
      const response = await removeGraduationExamCandidate(examId, studentActivityId)
      setDashboard(response.dashboard)
      setSelectedExamId(examId)
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Não foi possível remover o candidato.")
    } finally {
      setRemovingCandidateId(null)
    }
  }

  function updateEditingTrack(updater: (track: EditableTrackState) => EditableTrackState) {
    if (editingTrackIndex === null) return
    setEditableTracks((current) => current.map((track, index) => (index === editingTrackIndex ? updater(track) : track)))
  }

  function addLevelToTrack(trackIndex: number) {
    setEditableTracks((current) =>
      current.map((track, index) =>
        index === trackIndex
          ? {
              ...track,
              levels: [
                ...track.levels,
                {
                  name: track.progression === "belt" ? "Nova faixa" : "Novo nível",
                  colorHex: "#CBD5E1",
                  stripes: 0,
                  minTimeMonths: 0,
                },
              ],
            }
          : track
      )
    )
    setEditingTrackIndex(trackIndex)
    setEditingLevelIndex((editableTracks[trackIndex]?.levels.length ?? 0))
    setShowEditLevelDialog(true)
  }

  function updateLevel(trackIndex: number, levelIndex: number, updater: (level: EditableTrackState["levels"][number]) => EditableTrackState["levels"][number]) {
    setEditableTracks((current) =>
      current.map((track, index) =>
        index === trackIndex
          ? {
              ...track,
              levels: track.levels.map((level, currentLevelIndex) =>
                currentLevelIndex === levelIndex ? updater(level) : level
              ),
            }
          : track
      )
    )
  }

  function moveLevel(trackIndex: number, levelIndex: number, direction: -1 | 1) {
    setEditableTracks((current) =>
      current.map((track, index) => {
        if (index !== trackIndex) return track
        const nextIndex = levelIndex + direction
        if (nextIndex < 0 || nextIndex >= track.levels.length) return track
        const levels = [...track.levels]
        const [item] = levels.splice(levelIndex, 1)
        levels.splice(nextIndex, 0, item)
        return { ...track, levels }
      })
    )
  }

  function removeLevel(trackIndex: number, levelIndex: number) {
    setEditableTracks((current) =>
      current.map((track, index) =>
        index === trackIndex
          ? { ...track, levels: track.levels.filter((_, currentLevelIndex) => currentLevelIndex !== levelIndex) }
          : track
      )
    )
  }

  function openTrackEditor(trackIndex: number) {
    setEditingTrackIndex(trackIndex)
    setShowEditTrackDialog(true)
  }

  function openLevelEditor(trackIndex: number, levelIndex: number) {
    setEditingTrackIndex(trackIndex)
    setEditingLevelIndex(levelIndex)
    setShowEditLevelDialog(true)
  }

  function addTrack() {
    setEditableTracks((current) => [
      ...current,
      {
        name: "Novo bloco",
        modalityId: dashboard?.modalities[0]?.id ?? null,
        branch: "mixed",
        progression: "belt",
        levels: [
          {
            name: "Nova faixa",
            colorHex: "#CBD5E1",
            stripes: 0,
            minTimeMonths: 0,
          },
        ],
      },
    ])
  }

  async function saveTracks() {
    setSavingTracks(true)
    setError(null)
    try {
      const response = await replaceGraduationTracks(editableTracks)
      setDashboard(response.dashboard)
      setEditableTracks(toEditableTracks(response.dashboard.tracks))
      setShowEditTrackDialog(false)
      setEditingTrackIndex(null)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o sistema de faixas.")
    } finally {
      setSavingTracks(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!dashboard) {
    return <div className="py-10 text-sm text-muted-foreground">{error ?? "Falha ao carregar graduação."}</div>
  }

  return (
    <>
      <Dialog open={showNewExamDialog} onOpenChange={setShowNewExamDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agendar exame de graduação</DialogTitle>
            <DialogDescription>Configure os detalhes do exame de graduação.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Título</Label>
              <Input value={examForm.title} onChange={(event) => setExamForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input type="date" value={examForm.date} onChange={(event) => setExamForm((current) => ({ ...current, date: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Horário</Label>
                <Input type="time" value={examForm.time} onChange={(event) => setExamForm((current) => ({ ...current, time: event.target.value }))} />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Trilha</Label>
                <Button
                  type="button"
                  variant={examForm.allTracks ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExamForm((current) => ({ ...current, allTracks: !current.allTracks }))}
                >
                  Todos
                </Button>
              </div>
              <Popover open={isTrackPickerOpen} onOpenChange={setIsTrackPickerOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-between" disabled={examForm.allTracks}>
                    <span className="truncate text-left">
                      {examForm.allTracks
                        ? "Todos"
                        : examForm.selectedTrackIds.length
                          ? dashboard.tracks
                              .filter((track) => examForm.selectedTrackIds.includes(track.id))
                              .map((track) => formatTrackOptionLabel(track))
                              .join(", ")
                          : "Selecione as trilhas"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[340px] p-0">
                  <Command>
                    <CommandList>
                      <CommandEmpty>Nenhuma trilha disponível.</CommandEmpty>
                      <CommandGroup>
                        {dashboard.tracks.map((track) => {
                          const checked = examForm.selectedTrackIds.includes(track.id)
                          return (
                            <CommandItem
                              key={track.id}
                              onSelect={() =>
                                setExamForm((current) => ({
                                  ...current,
                                  selectedTrackIds: toggleStringSelection(current.selectedTrackIds, track.id),
                                }))
                              }
                            >
                              <Checkbox checked={checked} className="mr-2" />
                              <div className="flex flex-col">
                                <span>{formatTrackOptionLabel(track)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {track.modalityName ?? "Sem modalidade"}
                                </span>
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Avaliador</Label>
                <Button
                  type="button"
                  variant={examForm.allEvaluators ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExamForm((current) => ({ ...current, allEvaluators: !current.allEvaluators }))}
                >
                  Todos
                </Button>
              </div>
              <Popover open={isEvaluatorPickerOpen} onOpenChange={setIsEvaluatorPickerOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-between" disabled={examForm.allEvaluators}>
                    <span className="truncate text-left">
                      {examForm.allEvaluators
                        ? "Todos"
                        : examForm.selectedEvaluators.length
                          ? examForm.selectedEvaluators.join(", ")
                          : "Selecione os avaliadores"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[340px] p-0">
                  <Command>
                    <CommandList>
                      <CommandEmpty>Nenhum avaliador disponível.</CommandEmpty>
                      <CommandGroup>
                        {dashboard.teachers.map((teacher) => {
                          const checked = examForm.selectedEvaluators.includes(teacher.name)
                          return (
                            <CommandItem
                              key={teacher.id}
                              onSelect={() =>
                                setExamForm((current) => ({
                                  ...current,
                                  selectedEvaluators: toggleStringSelection(current.selectedEvaluators, teacher.name),
                                }))
                              }
                            >
                              <Checkbox checked={checked} className="mr-2" />
                              <span>{teacher.name}</span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Local</Label>
              <Input value={examForm.location} onChange={(event) => setExamForm((current) => ({ ...current, location: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea value={examForm.notes} onChange={(event) => setExamForm((current) => ({ ...current, notes: event.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewExamDialog(false)}>Cancelar</Button>
            <Button onClick={submitExam} disabled={savingExam}>
              {savingExam ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Criar exame
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddCandidateDialog} onOpenChange={handleAddCandidateDialogChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{addCandidateMode === "select_student" ? "Adicionar candidato" : "Adicionar ao exame"}</DialogTitle>
            <DialogDescription>
              {addCandidateMode === "select_student"
                ? "Busque um aluno vinculado à academia para incluir no exame selecionado."
                : "Selecione um exame agendado para incluir este aluno."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {addCandidateMode === "select_student" ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar aluno da academia..."
                    value={searchCandidate}
                    onChange={(event) => setSearchCandidate(event.target.value)}
                  />
                </div>
                <div className="max-h-[320px] overflow-auto rounded-lg border">
                  {filteredCandidatesToAdd.length > 0 ? (
                    filteredCandidatesToAdd.map((student) => (
                      <button
                        key={student.studentActivityId}
                        type="button"
                        className={`flex w-full items-center justify-between border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted/50 ${selectedStudentActivityId === student.studentActivityId ? "bg-muted" : ""}`}
                        onClick={() => setSelectedStudentActivityId(student.studentActivityId)}
                      >
                        <div>
                          <p className="font-medium">{student.studentName}</p>
                          <p className="text-xs text-muted-foreground">{student.activityLabel}</p>
                        </div>
                        <Badge variant="outline" style={resolveBeltBadgeStyle({ beltName: student.currentBelt, colorHex: student.beltColorHex })}>
                          {student.currentBelt}
                        </Badge>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-sm text-muted-foreground">
                      Nenhum aluno vinculado à academia foi encontrado para a busca informada.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="grid gap-2">
                <Label>Exame</Label>
                <Select value={selectedTargetExamId} onValueChange={setSelectedTargetExamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o exame" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboard.exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title} • {formatDate(exam.date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleAddCandidateDialogChange(false)}>Cancelar</Button>
            <Button
              onClick={addCandidateToExam}
              disabled={
                addingCandidate ||
                !selectedStudentActivityId ||
                !selectedTargetExamId
              }
            >
              {addingCandidate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditTrackDialog} onOpenChange={setShowEditTrackDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar bloco</DialogTitle>
            <DialogDescription>Edite apenas os dados gerais deste bloco.</DialogDescription>
          </DialogHeader>
          {editingTrack ? (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Nome do bloco</Label>
                <Input value={editingTrack.name} onChange={(event) => updateEditingTrack((track) => ({ ...track, name: event.target.value }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Faixa etária</Label>
                    <Select value={editingTrack.branch} onValueChange={(value) => updateEditingTrack((track) => ({ ...track, branch: value as EditableTrackState["branch"] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adult">Adulto</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Progressão</Label>
                  <Select value={editingTrack.progression} onValueChange={(value) => updateEditingTrack((track) => ({ ...track, progression: value as EditableTrackState["progression"] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="belt">Faixas</SelectItem>
                      <SelectItem value="skill_level">Níveis técnicos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTrackDialog(false)}>Cancelar</Button>
            <Button onClick={saveTracks} disabled={savingTracks}>
              {savingTracks ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditLevelDialog} onOpenChange={setShowEditLevelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar faixa</DialogTitle>
            <DialogDescription>Edite os dados desta faixa dentro do bloco.</DialogDescription>
          </DialogHeader>
          {editingTrack && editingLevel && editingTrackIndex !== null && editingLevelIndex !== null ? (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input
                  value={editingLevel.name}
                  onChange={(event) =>
                    updateLevel(editingTrackIndex, editingLevelIndex, (level) => ({
                      ...level,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="h-10 w-14 p-1"
                    value={editingLevel.colorHex}
                    onChange={(event) =>
                      updateLevel(editingTrackIndex, editingLevelIndex, (level) => ({
                        ...level,
                        colorHex: event.target.value,
                      }))
                    }
                  />
                  <Input
                    value={editingLevel.colorHex}
                    onChange={(event) =>
                      updateLevel(editingTrackIndex, editingLevelIndex, (level) => ({
                        ...level,
                        colorHex: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Graus</Label>
                  <Input
                    type="number"
                    min="0"
                    value={String(editingLevel.stripes)}
                    onChange={(event) =>
                      updateLevel(editingTrackIndex, editingLevelIndex, (level) => ({
                        ...level,
                        stripes: Number.parseInt(event.target.value || "0", 10) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Tempo mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    value={String(editingLevel.minTimeMonths ?? 0)}
                    onChange={(event) =>
                      updateLevel(editingTrackIndex, editingLevelIndex, (level) => ({
                        ...level,
                        minTimeMonths: Number.parseInt(event.target.value || "0", 10) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditLevelDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingExamAction)} onOpenChange={(open) => !open && setPendingExamAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingExamAction?.status === "completed" ? "Concluir exame" : "Cancelar exame"}
            </DialogTitle>
            <DialogDescription>
              {pendingExamAction?.status === "completed"
                ? "Ao concluir, os candidatos do exame serão efetivados com a graduação correspondente."
                : "Ao cancelar, o exame ficará marcado como cancelado e não efetivará nenhuma graduação."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingExamAction(null)}>
              Voltar
            </Button>
            <Button
              variant={pendingExamAction?.status === "cancelled" ? "outline" : "default"}
              disabled={
                pendingExamAction
                  ? updatingExamStatus === `${pendingExamAction.examId}:${pendingExamAction.status}`
                  : false
              }
              onClick={async () => {
                if (!pendingExamAction) return
                await changeExamStatus(pendingExamAction.examId, pendingExamAction.status)
                setPendingExamAction(null)
              }}
            >
              {pendingExamAction &&
              updatingExamStatus === `${pendingExamAction.examId}:${pendingExamAction.status}` ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {pendingExamAction?.status === "completed" ? "Confirmar conclusão" : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Graduação</h1>
          <p className="text-muted-foreground">Gerencie faixas, graus e exames de graduação</p>
          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard title="Graduações/ano" value={String(dashboard.metrics.yearGraduations)} icon={GraduationCap} tone="primary" />
          <MetricCard title="Exames agendados" value={String(dashboard.metrics.scheduledExams)} icon={Calendar} tone="info" />
          <MetricCard title="Aptos p/ graduação" value={String(dashboard.metrics.eligibleStudents)} icon={Users} tone="success" />
          <MetricCard title="Taxa de aprovação" value={`${dashboard.metrics.approvalRate}%`} icon={Star} tone="warning" />
        </div>

        <Tabs defaultValue="exams" className="space-y-4">
          <TabsList>
            <TabsTrigger value="exams">Exames</TabsTrigger>
            <TabsTrigger value="eligible">Alunos Aptos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="belts">Sistema de Faixas</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-4">
            <div className="flex justify-start">
              <Button className="gap-2" onClick={() => setShowNewExamDialog(true)}>
                <Plus className="h-4 w-4" />
                Agendar exame
              </Button>
            </div>

            <div className="-mx-1 overflow-x-auto pb-2">
              <div className="flex min-w-full gap-4 px-1">
                {dashboard.exams.map((exam) => (
                  <Card
                    key={exam.id}
                    className={`w-[320px] min-w-[320px] cursor-pointer transition-all hover:bg-muted/50 sm:w-[360px] sm:min-w-[360px] ${selectedExam?.id === exam.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedExamId(exam.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{exam.trackName}</CardTitle>
                          <CardDescription>
                            {formatDate(exam.date)} às {exam.time}
                          </CardDescription>
                        </div>
                        <Badge className={statusColors[exam.status]}>{statusLabels[exam.status]}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>
                            Avaliador: {exam.allEvaluators ? "Todos" : exam.evaluatorNames.join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="h-4 w-4" />
                          <span>Local: {exam.location || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-sm text-muted-foreground">
                            {exam.candidateCount} candidato{exam.candidateCount !== 1 ? "s" : ""}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedExam ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-medium">Candidatos - {selectedExam.trackName}</CardTitle>
                      <CardDescription>
                        {formatDate(selectedExam.date)} | {selectedExam.allEvaluators ? "Todos" : selectedExam.evaluatorNames.join(", ")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTargetExamId(selectedExam.id)
                          setAddCandidateMode("select_student")
                          setSelectedStudentActivityId("")
                          setSearchCandidate("")
                          setShowAddCandidateDialog(true)
                        }}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className={selectedExam.status === "scheduled" ? "" : "hidden"}
                        disabled={updatingExamStatus === `${selectedExam.id}:in_progress`}
                        onClick={() => changeExamStatus(selectedExam.id, "in_progress")}
                      >
                        Iniciar exame
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className={selectedExam.status === "in_progress" ? "" : "hidden"}
                        onClick={() =>
                          openExamActionDialog(selectedExam.id, "completed", selectedExam.title)
                        }
                      >
                        Concluir exame
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={
                          selectedExam.status === "completed" || selectedExam.status === "cancelled"
                            ? "hidden"
                            : ""
                        }
                        onClick={() =>
                          openExamActionDialog(selectedExam.id, "cancelled", selectedExam.title)
                        }
                      >
                        Cancelar exame
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>De</TableHead>
                        <TableHead>Para</TableHead>
                        <TableHead className="text-center">Presença</TableHead>
                        <TableHead className="text-center">Técnicas</TableHead>
                        <TableHead>Comportamento</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedExam.candidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                  {initials(candidate.studentName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{candidate.studentName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" style={resolveBeltBadgeStyle({ beltName: candidate.fromBelt, colorHex: candidate.fromBeltColorHex })}>
                              {candidate.fromBelt ?? "-"} {candidate.fromStripes > 0 ? `${candidate.fromStripes}°` : ""}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" style={resolveBeltBadgeStyle({ beltName: candidate.toBelt, colorHex: candidate.toBeltColorHex })}>
                              {candidate.toBelt ?? "Sem próxima faixa"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className={candidate.attendanceRate >= 80 ? "text-green-500" : "text-yellow-500"}>
                                {candidate.attendanceRate}%
                              </span>
                              {candidate.attendanceRate >= 80 ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={(candidate.techniquesScore ?? 0) >= 75 ? "text-green-500" : "text-muted-foreground"}>
                              {candidate.techniquesScore ?? "-"}
                              {candidate.techniquesScore != null ? "%" : ""}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{candidate.behavior ?? "Pendente"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              disabled={removingCandidateId === candidate.studentActivityId}
                              onClick={() => removeCandidate(selectedExam.id, candidate.studentActivityId)}
                            >
                              {removingCandidateId === candidate.studentActivityId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="eligible" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Alunos Aptos para Graduação</CardTitle>
                    <CardDescription>Alunos que atendem aos requisitos mínimos</CardDescription>
                  </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-9" placeholder="Buscar aluno..." value={searchEligible} onChange={(event) => setSearchEligible(event.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {eligibleActivityOptions.length > 1 ? (
                  <Tabs value={eligibleActivityTab} onValueChange={setEligibleActivityTab} className="mb-4">
                    <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                      {eligibleActivityOptions.map((activityLabel) => (
                        <TabsTrigger
                          key={activityLabel}
                          value={activityLabel}
                          className="rounded-full border border-border/60"
                        >
                          {activityLabel}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                ) : null}

                <div className="max-h-[420px] overflow-y-auto rounded-lg border">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Faixa Atual</TableHead>
                        <TableHead className="text-center">Tempo (meses)</TableHead>
                        <TableHead className="text-center">Presença</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Quem tornou apto</TableHead>
                        <TableHead className="text-right" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEligible.map((student) => (
                        <TableRow key={student.studentActivityId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                  {initials(student.studentName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.studentName}</p>
                                <p className="text-xs text-muted-foreground">{student.activityLabel}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" style={resolveBeltBadgeStyle({ beltName: student.currentBelt, colorHex: student.beltColorHex })}>
                              {student.currentBelt} {student.currentStripes > 0 ? `${student.currentStripes}°` : ""}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{student.monthsAtCurrentBelt}</TableCell>
                          <TableCell className="min-w-[180px]">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className={student.attendanceRate >= 80 ? "text-green-500" : "text-red-500"}>{student.attendanceRate}%</span>
                              </div>
                              <Progress value={student.attendanceRate} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={student.eligible ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-muted/60 bg-muted/70 text-muted-foreground"}>
                              {student.eligible ? "Apto" : "Pendente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[260px]">
                            <p className="text-sm text-muted-foreground">
                              {student.manualEligibleOverrideActors.length > 0
                                ? student.manualEligibleOverrideActors.map((actor) => actor.displayName).join(", ")
                                : "-"}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!student.eligible}
                                onClick={() => {
                                  setSelectedStudentActivityId(student.studentActivityId)
                                  setSelectedTargetExamId("")
                                  setAddCandidateMode("select_exam")
                                  setSearchCandidate("")
                                  setShowAddCandidateDialog(true)
                                }}
                              >
                                Adicionar ao Exame
                              </Button>
                              <Button
                                variant={student.eligible ? "outline" : "default"}
                                size="sm"
                                disabled={updatingEligibilityId === student.studentActivityId}
                                onClick={() => toggleEligibility(student.studentActivityId, !student.eligible)}
                              >
                                {updatingEligibilityId === student.studentActivityId ? <Loader2 className="h-4 w-4 animate-spin" /> : student.eligible ? "Marcar inapto" : "Marcar apto"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base font-medium">Histórico de graduações</CardTitle>
                  {dashboard.history.length > 10 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFullHistory((current) => !current)}
                    >
                      {showFullHistory ? "Ver menos" : "Ver mais"}
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className={showFullHistory ? "max-h-[420px] overflow-y-auto divide-y divide-border" : "divide-y divide-border"}>
                  {(showFullHistory ? dashboard.history : dashboard.history.slice(0, 10)).map((graduation) => (
                    <div key={graduation.id} className="overflow-x-auto">
                      <div className="flex min-w-[720px] items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">{initials(graduation.studentName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{graduation.studentName}</p>
                          <p className="text-sm text-muted-foreground">{graduation.modalityName} | {graduation.evaluatorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {graduation.fromBelt ? <Badge variant="outline">{graduation.fromBelt}</Badge> : null}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" style={resolveBeltBadgeStyle({ beltName: graduation.toBelt, colorHex: graduation.beltColorHex })}>
                          {graduation.toBelt} {graduation.toStripes > 0 ? `${graduation.toStripes}°` : ""}
                        </Badge>
                        <span className="min-w-[80px] text-right text-sm text-muted-foreground">{formatDate(graduation.date)}</span>
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="belts" className="space-y-4">
            <div className="flex justify-start">
              <Button
                className="gap-2"
                onClick={() => {
                  addTrack()
                  const nextIndex = editableTracks.length
                  setEditingTrackIndex(nextIndex)
                  setShowEditTrackDialog(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Criar bloco
              </Button>
            </div>

            <div className="-mx-1 overflow-x-auto pb-2">
              <div className="flex min-w-full gap-6 px-1">
              {editableTracks.map((track, index) => {
                const isGrid = track.branch !== "mixed"
                return (
                  <Card
                    key={`${track.id ?? "new"}-${index}`}
                    className="w-[calc(100vw-2rem)] min-w-[calc(100vw-2rem)] sm:w-[360px] sm:min-w-[360px]"
                  >
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="text-base font-medium">{track.name}</CardTitle>
                          <CardDescription>
                            {track.progression === "belt"
                              ? `Sistema de faixas para ${track.branch === "adult" ? "alunos acima de 16 anos" : track.branch === "kids" ? "alunos kids" : "faixas etárias mistas"}`
                              : `Sistema de graduação técnica para ${track.name}`}
                          </CardDescription>
                          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {track.branch === "adult" ? "Adulto" : "Kids"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => addLevelToTrack(index)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova faixa
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setEditableTracks((current) => current.filter((_, currentIndex) => currentIndex !== index))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => openTrackEditor(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isGrid ? (
                        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                          {track.levels.map((belt, levelIndex) => (
                            <div key={`${belt.id ?? "new"}-${levelIndex}`} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0 flex items-center gap-3">
                                <div
                                  className="h-4 w-12 rounded border"
                                  style={{
                                    backgroundColor: belt.colorHex,
                                    borderColor: belt.colorHex,
                                  }}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-medium">{belt.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {belt.stripes} graus{typeof belt.minTimeMonths === "number" ? ` | Min: ${belt.minTimeMonths} meses` : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                                <span className="mr-1 text-sm text-muted-foreground">{levelIndex + 1}a faixa</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => moveLevel(index, levelIndex, -1)}
                                  disabled={levelIndex === 0}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => moveLevel(index, levelIndex, 1)}
                                  disabled={levelIndex === track.levels.length - 1}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => openLevelEditor(index, levelIndex)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeLevel(index, levelIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                          {track.levels.map((belt, levelIndex) => (
                            <div key={`${belt.id ?? "new"}-${levelIndex}`} className="flex flex-col gap-3 rounded-lg border p-3">
                              <div className="min-w-0 flex items-center gap-3">
                                <div className="h-8 w-8 shrink-0 rounded-full border" style={{ backgroundColor: belt.colorHex, borderColor: belt.colorHex }} />
                                <div className="min-w-0">
                                  <p className="truncate font-medium">{belt.name}</p>
                                  <p className="text-xs text-muted-foreground">{levelIndex + 1}o nível</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => moveLevel(index, levelIndex, -1)}
                                  disabled={levelIndex === 0}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => moveLevel(index, levelIndex, 1)}
                                  disabled={levelIndex === track.levels.length - 1}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => openLevelEditor(index, levelIndex)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeLevel(index, levelIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  icon: typeof GraduationCap
  tone: "primary" | "info" | "success" | "warning"
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    info: "bg-blue-500/10 text-blue-500",
    success: "bg-green-500/10 text-green-500",
    warning: "bg-yellow-500/10 text-yellow-500",
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

function RequirementCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Clock
  title: string
  description: string
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
