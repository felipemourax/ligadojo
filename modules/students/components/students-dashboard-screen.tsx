"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Award,
  Calendar,
  ChevronRight,
  CreditCard,
  GraduationCap,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Search,
  TrendingUp,
  User,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { fetchJson } from "@/lib/api/client"
import { resolveBeltBadgeStyle } from "@/lib/ui/belt-badges"
import { formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"
import type {
  StudentDashboardCollection,
  StudentDashboardRecord,
} from "@/apps/api/src/modules/students/domain/student-dashboard"
import {
  createStudent,
  createStudentGraduation,
  updateStudent,
  updateStudentStatus,
} from "@/modules/students/services"

const paymentStatusColors = {
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  overdue: "bg-red-500/10 text-red-500 border-red-500/20",
} as const

const paymentStatusLabels = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
} as const

interface StudentFormState {
  name: string
  email: string
  phone: string
  birthDate: string
  address: string
  emergencyContact: string
  notes: string
  planId: string
  markPlanAsPaid: boolean
  practiceAssignments: Array<{
    activityCategory: string
    classGroupId: string
    belt: string
    stripes: number
    startDate: string
    notes: string
  }>
}

function createStudentFormState(): StudentFormState {
  return {
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    emergencyContact: "",
    notes: "",
    planId: "",
    markPlanAsPaid: false,
    practiceAssignments: [
      {
        activityCategory: "",
        classGroupId: "",
        belt: "Branca",
        stripes: 0,
        startDate: new Date().toISOString().slice(0, 10),
        notes: "",
      },
    ],
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getAge(birthDate: string | null) {
  if (!birthDate) return "-"
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const month = today.getMonth() - birth.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return String(age)
}

function getTimeSinceStart(startDate: string) {
  const today = new Date()
  const start = new Date(startDate)
  const months =
    (today.getFullYear() - start.getFullYear()) * 12 +
    today.getMonth() -
    start.getMonth()

  if (months < 12) {
    return `${Math.max(months, 0)} mes${months === 1 ? "" : "es"}`
  }

  const years = Math.floor(months / 12)
  return `${years} ano${years === 1 ? "" : "s"}`
}

function formatCurrency(valueCents: number | null) {
  if (valueCents == null) return "-"
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueCents / 100)
}

function formatDisplayDate(value: string | null) {
  if (!value) return "-"
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

function StudentInfoBlock({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "-"}</p>
    </div>
  )
}

export function StudentsDashboardScreen() {
  const [data, setData] = useState<StudentDashboardCollection | null>(null)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterActivity, setFilterActivity] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<StudentDashboardRecord | null>(null)
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [originalStudentPlanId, setOriginalStudentPlanId] = useState("")
  const [studentForm, setStudentForm] = useState<StudentFormState>(createStudentFormState)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGraduationDialogOpen, setIsGraduationDialogOpen] = useState(false)
  const [studentDetailTab, setStudentDetailTab] = useState("dados")
  const [studentDetailActivityId, setStudentDetailActivityId] = useState("")
  const [graduationForm, setGraduationForm] = useState({
    studentActivityId: "",
    toBelt: "Branca",
    toStripes: 0,
    evaluatorName: "",
    graduatedAt: new Date().toISOString().slice(0, 10),
    notes: "",
  })

  const selectedGraduationActivity = useMemo(
    () =>
      selectedStudent?.activities.find((activity) => activity.id === graduationForm.studentActivityId) ?? null,
    [graduationForm.studentActivityId, selectedStudent]
  )

  useEffect(() => {
    if (!selectedGraduationActivity || selectedGraduationActivity.graduationLevels.length === 0) {
      return
    }

    if (
      selectedGraduationActivity.graduationLevels.some((level) => level.name === graduationForm.toBelt)
    ) {
      return
    }

    setGraduationForm((current) => ({
      ...current,
      toBelt: selectedGraduationActivity.graduationLevels[0].name,
      toStripes: 0,
    }))
  }, [graduationForm.toBelt, selectedGraduationActivity])

  async function loadStudents() {
    setIsLoading(true)
    try {
      const response = await fetchJson<StudentDashboardCollection>("/api/students")
      setData(response)
      setFeedback(null)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar os alunos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadStudents()
  }, [])

  useEffect(() => {
    if (!selectedStudent) {
      setStudentDetailTab("dados")
      setStudentDetailActivityId("")
      return
    }

    setStudentDetailTab("dados")
    setStudentDetailActivityId(selectedStudent.activities[0]?.id ?? "")
  }, [selectedStudent])

  const students = data?.students ?? []
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = filterStatus === "all" || student.status === filterStatus
      const matchesActivity =
        filterActivity === "all" ||
        student.activities.some((activity) => activity.activityCategory === filterActivity)
      return matchesSearch && matchesStatus && matchesActivity
    })
  }, [filterActivity, filterStatus, search, students])

  const totalStudents = students.length
  const activeStudents = students.filter((student) => student.status === "active").length
  const inactiveStudents = students.filter((student) => student.status !== "active").length
  const multiActivityStudents = students.filter((student) => student.activities.length > 1).length

  function openCreateStudent() {
    setSelectedStudent(null)
    setEditingStudentId(null)
    setOriginalStudentPlanId("")
    setStudentForm(createStudentFormState())
    setIsStudentFormOpen(true)
  }

  function openEditStudent(student: StudentDashboardRecord) {
    setSelectedStudent(null)
    setEditingStudentId(student.id)
    setOriginalStudentPlanId(student.planId ?? "")
    setStudentForm({
      name: student.name,
      email: student.email,
      phone: student.phone ?? "",
      birthDate: student.birthDate ?? "",
      address: student.address,
      emergencyContact: student.emergencyContact,
      notes: student.notes,
      planId: student.planId ?? "",
      markPlanAsPaid: false,
      practiceAssignments:
        student.practiceAssignments.length > 0
          ? student.practiceAssignments.map((assignment) => ({
              activityCategory: assignment.activityCategory ?? "",
              classGroupId: assignment.classGroupId ?? "",
              belt: assignment.belt,
              stripes: assignment.stripes,
              startDate: assignment.startDate,
              notes: assignment.notes,
            }))
          : createStudentFormState().practiceAssignments,
    })
    setIsStudentFormOpen(true)
  }

  async function submitStudentForm() {
    setIsSaving(true)
    try {
      const payload = {
        ...studentForm,
        planId: studentForm.planId || null,
        markPlanAsPaid: studentForm.planId ? studentForm.markPlanAsPaid : false,
        practiceAssignments: studentForm.practiceAssignments.filter((item) => item.activityCategory),
      }

      if (editingStudentId) {
        await updateStudent(editingStudentId, payload)
      } else {
        await createStudent(payload)
      }

      setIsStudentFormOpen(false)
      setEditingStudentId(null)
      setOriginalStudentPlanId("")
      setStudentForm(createStudentFormState())
      await loadStudents()
      setFeedback(editingStudentId ? "Aluno atualizado com sucesso." : "Aluno cadastrado com sucesso.")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar o aluno.")
    } finally {
      setIsSaving(false)
    }
  }

  async function submitGraduation() {
    if (!selectedStudent) {
      return
    }

    setIsSaving(true)
    try {
      await createStudentGraduation(selectedStudent.id, graduationForm)
      const response = await fetchJson<StudentDashboardCollection>("/api/students")
      setData(response)
      setSelectedStudent(
        response.students.find((student) => student.id === selectedStudent.id) ?? null
      )
      setIsGraduationDialogOpen(false)
      setGraduationForm({
        studentActivityId: "",
        toBelt: "Branca",
        toStripes: 0,
        evaluatorName: "",
        graduatedAt: new Date().toISOString().slice(0, 10),
        notes: "",
      })
      setFeedback("Graduação registrada com sucesso.")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível registrar a graduação.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(
    student: StudentDashboardRecord,
    status: "active" | "inactive" | "suspended"
  ) {
    setIsSaving(true)
    try {
      await updateStudentStatus(student.id, status)
      const response = await fetchJson<StudentDashboardCollection>("/api/students")
      setData(response)
      setSelectedStudent(
        response.students.find((item) => item.id === student.id) ?? null
      )
      setFeedback("Status do aluno atualizado com sucesso.")
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Não foi possível atualizar o status do aluno."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Dialog open={isStudentFormOpen} onOpenChange={setIsStudentFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingStudentId ? "Editar aluno" : "Novo aluno"}</DialogTitle>
            <DialogDescription>
              Cadastre o aluno pelas atividades principais da academia. A turma pode ser definida agora ou depois.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/*
              Direct admin plan linking follows the same finance rule as the student app:
              the plan only becomes active after payment confirmation.
            */}
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Nome completo</Label>
                <Input
                  value={studentForm.name}
                  onChange={(event) =>
                    setStudentForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={studentForm.email}
                  onChange={(event) =>
                    setStudentForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input
                  value={studentForm.phone}
                  onChange={(event) =>
                    setStudentForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={studentForm.birthDate}
                  onChange={(event) =>
                    setStudentForm((current) => ({ ...current, birthDate: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Plano</Label>
                <Select
                  value={studentForm.planId}
                  onValueChange={(value) =>
                    setStudentForm((current) => ({
                      ...current,
                      planId: value,
                      markPlanAsPaid: value ? current.markPlanAsPaid : false,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(data?.planOptions ?? []).map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - R$ {(plan.amountCents / 100).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {studentForm.planId && !originalStudentPlanId ? (
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="student-plan-paid"
                    checked={studentForm.markPlanAsPaid}
                    onCheckedChange={(checked) =>
                      setStudentForm((current) => ({
                        ...current,
                        markPlanAsPaid: checked === true,
                      }))
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="student-plan-paid" className="text-sm font-medium text-foreground">
                      Marcar plano como pago
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Se desmarcado, o plano ficará pendente até a academia confirmar o pagamento.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label>Endereço</Label>
              <Input
                value={studentForm.address}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, address: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Contato de emergência</Label>
                <Input
                  value={studentForm.emergencyContact}
                  onChange={(event) =>
                    setStudentForm((current) => ({
                      ...current,
                      emergencyContact: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Observações</Label>
                <Input
                  value={studentForm.notes}
                  onChange={(event) =>
                    setStudentForm((current) => ({ ...current, notes: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Atividades principais e turmas
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStudentForm((current) => ({
                      ...current,
                      practiceAssignments: [
                        ...current.practiceAssignments,
                        {
                          activityCategory: "",
                          classGroupId: "",
                          belt: "Branca",
                          stripes: 0,
                          startDate: new Date().toISOString().slice(0, 10),
                          notes: "",
                        },
                      ],
                    }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar atividade
                </Button>
              </div>

              {studentForm.practiceAssignments.map((assignment, index) => {
                const classOptionsForActivity = (data?.classOptions ?? []).filter(
                  (option) => option.activityCategory === assignment.activityCategory
                )

                return (
                <div key={`${assignment.classGroupId}-${index}`} className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Atividade principal</Label>
                    <Select
                      value={assignment.activityCategory}
                      onValueChange={(value) =>
                        setStudentForm((current) => ({
                          ...current,
                          practiceAssignments: current.practiceAssignments.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  activityCategory: value,
                                  classGroupId:
                                    item.activityCategory === value ? item.classGroupId : "",
                                }
                              : item
                          ),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {(data?.activityCategoryOptions ?? []).map((option) => (
                          <SelectItem key={option} value={option}>
                            {formatActivityCategory(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Turma (opcional)</Label>
                    <Select
                      value={assignment.classGroupId}
                      onValueChange={(value) =>
                        setStudentForm((current) => ({
                          ...current,
                          practiceAssignments: current.practiceAssignments.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, classGroupId: value } : item
                          ),
                        }))
                      }
                      disabled={!assignment.activityCategory}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            assignment.activityCategory
                              ? classOptionsForActivity.length > 0
                                ? "Selecione a turma"
                                : "Nenhuma turma disponível"
                              : "Escolha a atividade primeiro"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptionsForActivity.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name} • {option.currentStudents}/{option.maxStudents}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Iniciou em</Label>
                    <Input
                      type="date"
                      value={assignment.startDate}
                      onChange={(event) =>
                        setStudentForm((current) => ({
                          ...current,
                          practiceAssignments: current.practiceAssignments.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, startDate: event.target.value }
                              : item
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              )})}
            </div>

            <Button
              onClick={() => void submitStudentForm()}
              disabled={
                isSaving ||
                !studentForm.name.trim() ||
                !studentForm.email.trim() ||
                studentForm.practiceAssignments.filter((item) => item.activityCategory).length === 0
              }
            >
              {editingStudentId ? "Salvar alterações" : "Cadastrar aluno"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGraduationDialogOpen} onOpenChange={setIsGraduationDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar graduação</DialogTitle>
            <DialogDescription>
              Selecione a atividade e registre a nova graduação do aluno.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Atividade</Label>
              <Select
                value={graduationForm.studentActivityId}
                onValueChange={(value) =>
                  setGraduationForm((current) => {
                    const nextActivity =
                      selectedStudent?.activities.find((activity) => activity.id === value) ?? null

                    return {
                      ...current,
                      studentActivityId: value,
                      toBelt: nextActivity?.graduationLevels[0]?.name ?? current.toBelt,
                      toStripes: 0,
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {selectedStudent?.activities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.activityCategory ? formatActivityCategory(activity.activityCategory) : "Atividade principal"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Nova faixa</Label>
                <Select
                  value={graduationForm.toBelt}
                  onValueChange={(value) =>
                    setGraduationForm((current) => ({
                      ...current,
                      toBelt: value,
                      toStripes: 0,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedGraduationActivity?.graduationLevels ?? []).map((level) => (
                      <SelectItem key={`${level.name}-${level.stripes}`} value={level.name}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Graus</Label>
                <Select
                  value={String(graduationForm.toStripes)}
                  onValueChange={(value) =>
                    setGraduationForm((current) => ({
                      ...current,
                      toStripes: Number(value) || 0,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({
                      length:
                        (selectedGraduationActivity?.graduationLevels.find(
                          (level) => level.name === graduationForm.toBelt
                        )?.stripes ?? 0) + 1,
                    }).map((_, index) => (
                      <SelectItem key={index} value={String(index)}>
                        {index}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Avaliador</Label>
                <Input
                  value={graduationForm.evaluatorName}
                  onChange={(event) =>
                    setGraduationForm((current) => ({
                      ...current,
                      evaluatorName: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={graduationForm.graduatedAt}
                  onChange={(event) =>
                    setGraduationForm((current) => ({
                      ...current,
                      graduatedAt: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Observações</Label>
              <Input
                value={graduationForm.notes}
                onChange={(event) =>
                  setGraduationForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>

            <Button
              onClick={() => void submitGraduation()}
              disabled={
                isSaving ||
                !graduationForm.studentActivityId ||
                !graduationForm.toBelt.trim() ||
                !graduationForm.evaluatorName.trim() ||
                !graduationForm.graduatedAt
              }
            >
              Registrar graduação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Alunos</h1>
            <p className="text-muted-foreground">
              Gerencie atividades, turmas, graduações e pagamentos.
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateStudent}>
            <Plus className="h-4 w-4" />
            Novo aluno
          </Button>
        </div>

        {feedback ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {feedback}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <MetricCard title="Total de alunos" value={totalStudents} subtitle="Base cadastrada" icon={Users} />
          <MetricCard title="Ativos" value={activeStudents} subtitle="Em operação" icon={TrendingUp} />
          <MetricCard title="Inativos" value={inactiveStudents} subtitle="Precisam de atenção" icon={User} />
          <MetricCard title="Multi-atividade" value={multiActivityStudents} subtitle="2+ atividades" icon={Award} />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="suspended">Suspensos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterActivity} onValueChange={setFilterActivity}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as atividades</SelectItem>
                {(data?.activityCategoryOptions ?? []).map((option) => (
                  <SelectItem key={option} value={option}>
                    {formatActivityCategory(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-medium">
              {isLoading
                ? "Carregando alunos..."
                : `${filteredStudents.length} aluno${filteredStudents.length !== 1 ? "s" : ""} encontrado${filteredStudents.length !== 1 ? "s" : ""}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden xl:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Atividades</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="w-[72px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const averageAttendance =
                      student.activities.length === 0
                        ? 0
                        : Math.round(
                            student.activities.reduce((sum, activity) => sum + activity.attendanceRate, 0) /
                              student.activities.length
                          )

                    return (
                      <TableRow
                        key={student.id}
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3 py-1">
                            <Avatar className="h-11 w-11">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {initials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">{student.name}</p>
                                <Badge variant={student.status === "active" ? "default" : "secondary"}>
                                  {student.status === "active" ? "Ativo" : student.status === "inactive" ? "Inativo" : "Suspenso"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {student.activities.map((activity) => (
                              <Badge key={activity.id} variant="outline">
                                {activity.activityCategory ? formatActivityCategory(activity.activityCategory) : "Atividade principal"}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{student.planName ?? "Sem plano"}</TableCell>
                        <TableCell>
                          <div className="w-[180px] space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{averageAttendance}%</span>
                              <span>{student.activities.reduce((sum, item) => sum + item.totalClasses, 0)} aulas</span>
                            </div>
                            <Progress value={averageAttendance} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={paymentStatusColors[student.paymentStatus]}>
                            {paymentStatusLabels[student.paymentStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(event) => event.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                              <DropdownMenuItem onSelect={() => setSelectedStudent(student)}>
                                Ver perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => openEditStudent(student)}>
                                Editar cadastro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y divide-border xl:hidden">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/40"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">{initials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {student.activities.map((activity) => (
                          <Badge key={activity.id} variant="outline">
                            {activity.activityCategory ? formatActivityCategory(activity.activityCategory) : "Atividade principal"}
                          </Badge>
                        ))}
                        <Badge variant="outline" className={paymentStatusColors[student.paymentStatus]}>
                          {paymentStatusLabels[student.paymentStatus]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(selectedStudent)} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/70 px-0 pb-0 pt-6 sm:max-w-2xl">
          {selectedStudent ? (
            <>
              <DialogHeader>
                <div className="px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials(selectedStudent.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <DialogTitle className="text-3xl font-semibold leading-none">
                          {selectedStudent.name}
                        </DialogTitle>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudent.activities[0] ? (
                            <Badge
                              variant="outline"
                              style={resolveBeltBadgeStyle({
                                beltName:
                                  (selectedStudent.activities.find((item) => item.id === studentDetailActivityId) ??
                                    selectedStudent.activities[0]).belt,
                                colorHex:
                                  (selectedStudent.activities.find((item) => item.id === studentDetailActivityId) ??
                                    selectedStudent.activities[0]).beltColorHex,
                              })}
                            >
                              {(selectedStudent.activities.find((item) => item.id === studentDetailActivityId) ?? selectedStudent.activities[0]).belt}{" "}
                              - {(selectedStudent.activities.find((item) => item.id === studentDetailActivityId) ?? selectedStudent.activities[0]).stripes}{" "}
                              grau{(selectedStudent.activities.find((item) => item.id === studentDetailActivityId) ?? selectedStudent.activities[0]).stripes === 1 ? "" : "s"}
                            </Badge>
                          ) : null}
                          <Badge variant={selectedStudent.status === "active" ? "default" : "secondary"}>
                            {selectedStudent.status === "active" ? "Ativo" : selectedStudent.status === "inactive" ? "Inativo" : "Suspenso"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditStudent(selectedStudent)}>
                          Editar cadastro
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setGraduationForm((current) => ({
                              ...current,
                              studentActivityId: studentDetailActivityId || selectedStudent.activities[0]?.id || "",
                            }))
                            setIsGraduationDialogOpen(true)
                          }}
                        >
                          Registrar graduação
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            void handleStatusChange(
                              selectedStudent,
                              selectedStudent.status === "active" ? "inactive" : "active"
                            )
                          }
                        >
                          {selectedStudent.status === "active" ? "Inativar" : "Reativar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 px-6 pb-6">
                <Tabs value={studentDetailTab} onValueChange={setStudentDetailTab} className="space-y-6">
                  <TabsList className="grid h-11 w-full grid-cols-4">
                    <TabsTrigger value="dados">Dados</TabsTrigger>
                    <TabsTrigger value="presenca">Presença</TabsTrigger>
                    <TabsTrigger value="graduacao">Graduação</TabsTrigger>
                    <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                  </TabsList>

                  {(studentDetailTab === "presenca" || studentDetailTab === "graduacao") &&
                  selectedStudent.activities.length > 1 ? (
                    <Tabs
                      value={studentDetailActivityId}
                      onValueChange={setStudentDetailActivityId}
                      className="space-y-4"
                    >
                      <TabsList className="h-10 w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
                        {selectedStudent.activities.map((activity) => (
                          <TabsTrigger
                            key={activity.id}
                            value={activity.id}
                            className="rounded-full border border-border px-4"
                          >
                            {activity.activityCategory ? formatActivityCategory(activity.activityCategory) : "Atividade principal"}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  ) : null}

                  <TabsContent value="dados" className="mt-0 space-y-6">
                    <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                      <StudentInfoBlock label="E-mail" value={selectedStudent.email} />
                      <StudentInfoBlock label="Telefone" value={selectedStudent.phone ?? "-"} />
                      <StudentInfoBlock label="Idade" value={`${getAge(selectedStudent.birthDate)} anos`} />
                      <StudentInfoBlock label="Na academia há" value={getTimeSinceStart(selectedStudent.startDate)} />
                      <StudentInfoBlock label="Endereço" value={selectedStudent.address || "-"} />
                      <StudentInfoBlock label="Emergência" value={selectedStudent.emergencyContact || "-"} />
                    </div>

                    <div className="space-y-6 border-t border-border/60 pt-6">
                      <div className="space-y-3">
                        <p className="text-base font-semibold text-foreground">Turmas Matriculadas</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudent.activities.flatMap((activity) => activity.enrolledClasses).length > 0 ? (
                            Array.from(
                              new Set(
                                selectedStudent.activities.flatMap((activity) => activity.enrolledClasses)
                              )
                            ).map((className) => (
                              <Badge key={className} variant="secondary">
                                {className}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma turma vinculada.</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 border-t border-border/60 pt-6">
                        <p className="text-base font-semibold text-foreground">Contato de Emergência</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedStudent.emergencyContact || "Nenhum contato registrado."}
                        </p>
                      </div>

                      <div className="space-y-3 border-t border-border/60 pt-6">
                        <p className="text-base font-semibold text-foreground">Observações</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedStudent.notes || "Nenhuma observação registrada."}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="presenca" className="mt-0 space-y-6">
                    {(() => {
                      const activeModality =
                        selectedStudent.activities.find((item) => item.id === studentDetailActivityId) ??
                        selectedStudent.activities[0]

                      if (!activeModality) {
                        return <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
                      }

                      const attendanceCount = activeModality.attendanceHistory.filter(
                        (entry) => entry.status === "present"
                      ).length
                      const monthlyGoal = Math.min(activeModality.totalClasses * 10, 100)

                      return (
                        <>
                          <div className="grid gap-4 md:grid-cols-3">
                            <Card className="rounded-3xl border-border/70">
                              <CardContent className="space-y-2 p-6">
                                <p className="text-sm text-muted-foreground">Taxa de Presença</p>
                                <p className="text-3xl font-semibold">{activeModality.attendanceRate}%</p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-3xl border-border/70">
                              <CardContent className="space-y-2 p-6">
                                <p className="text-sm text-muted-foreground">Aulas Totais</p>
                                <p className="text-3xl font-semibold">{activeModality.totalClasses}</p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-3xl border-border/70">
                              <CardContent className="space-y-2 p-6">
                                <p className="text-sm text-muted-foreground">Presenças</p>
                                <p className="text-3xl font-semibold">{attendanceCount}</p>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-foreground">Meta mensal</span>
                              <span className="text-muted-foreground">{monthlyGoal}% concluído</span>
                            </div>
                            <Progress value={monthlyGoal} className="h-2" />
                          </div>

                          <div className="space-y-4 border-t border-border/60 pt-6">
                            <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                              <Calendar className="h-4 w-4" />
                              Histórico Recente
                            </p>
                            <div className="overflow-hidden rounded-2xl border border-border/60">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Turma</TableHead>
                                    <TableHead>Horário</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {activeModality.attendanceHistory.length > 0 ? (
                                    activeModality.attendanceHistory.map((entry) => (
                                      <TableRow key={entry.id}>
                                        <TableCell>{formatDisplayDate(entry.date)}</TableCell>
                                        <TableCell>{entry.className}</TableCell>
                                        <TableCell>{entry.time}</TableCell>
                                        <TableCell>
                                          <Badge
                                            variant="outline"
                                            className={
                                              entry.status === "present"
                                                ? paymentStatusColors.paid
                                                : paymentStatusColors.overdue
                                            }
                                          >
                                            {entry.status === "present" ? "Presente" : "Falta"}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                                  Nenhuma presença registrada nesta atividade.
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </TabsContent>

                  <TabsContent value="graduacao" className="mt-0 space-y-6">
                    {(() => {
                      const activeModality =
                        selectedStudent.activities.find((item) => item.id === studentDetailActivityId) ??
                        selectedStudent.activities[0]

                      if (!activeModality) {
                        return <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
                      }

                      return (
                        <>
                          <Card className="rounded-3xl border-border/70">
                            <CardContent className="flex items-center justify-between gap-4 p-6">
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Graduação Atual</p>
                                <p className="text-3xl font-semibold">
                                  {activeModality.belt} - {activeModality.stripes} grau
                                  {activeModality.stripes === 1 ? "" : "s"}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                style={resolveBeltBadgeStyle({
                                  beltName: activeModality.belt,
                                  colorHex: activeModality.beltColorHex,
                                })}
                              >
                                {activeModality.activityCategory ? formatActivityCategory(activeModality.activityCategory) : "Atividade principal"}
                              </Badge>
                            </CardContent>
                          </Card>

                          <div className="space-y-4 border-t border-border/60 pt-6">
                            <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                              <Award className="h-4 w-4" />
                              Histórico de Graduações
                            </p>
                            <div className="space-y-3">
                              {activeModality.graduationHistory.length > 0 ? (
                                activeModality.graduationHistory.map((entry) => (
                                  <div
                                    key={entry.id}
                                    className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 p-4"
                                  >
                                    <div className="space-y-1">
                                      <p className="font-medium text-foreground">
                                        {entry.from ? `${entry.from} para ${entry.to}` : entry.to}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Avaliador: {entry.evaluator}
                                      </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDisplayDate(entry.date)}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Nenhuma graduação registrada nesta atividade.
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            className="h-12 w-full"
                            onClick={() => {
                              setGraduationForm((current) => ({
                                ...current,
                                studentActivityId: activeModality.id,
                                toBelt: activeModality.belt,
                                toStripes: activeModality.stripes,
                              }))
                              setIsGraduationDialogOpen(true)
                            }}
                          >
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Registrar Nova Graduação
                          </Button>
                        </>
                      )
                    })()}
                  </TabsContent>

                  <TabsContent value="financeiro" className="mt-0 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="rounded-3xl border-border/70">
                        <CardContent className="space-y-2 p-6">
                          <p className="text-sm text-muted-foreground">Plano Atual</p>
                          <p className="text-3xl font-semibold">{selectedStudent.planName ?? "Sem plano"}</p>
                          <p className="text-xl text-muted-foreground">
                            {formatCurrency(selectedStudent.planValueCents)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="rounded-3xl border-border/70">
                        <CardContent className="space-y-3 p-6">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant="outline" className={paymentStatusColors[selectedStudent.paymentStatus]}>
                            {paymentStatusLabels[selectedStudent.paymentStatus]}
                          </Badge>
                          <p className="text-xl text-muted-foreground">
                            Vence em {formatDisplayDate(selectedStudent.nextPayment)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4 border-t border-border/60 pt-6">
                      <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                        <CreditCard className="h-4 w-4" />
                        Histórico de Pagamentos
                      </p>
                      <div className="overflow-hidden rounded-2xl border border-border/60">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead>Método</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>{formatDisplayDate(selectedStudent.lastPayment)}</TableCell>
                              <TableCell>
                                {selectedStudent.planName
                                  ? `Mensalidade ${selectedStudent.planName}`
                                  : "Sem histórico disponível"}
                              </TableCell>
                              <TableCell>Assinatura</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(selectedStudent.planValueCents)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
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
}: {
  title: string
  value: number
  subtitle: string
  icon: typeof Users
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
