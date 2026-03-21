"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  LayoutGrid,
  List,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Settings,
  Shield,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError, fetchJson } from "@/lib/api/client"
import { resolveBeltBadgeStyle } from "@/lib/ui/belt-badges"
import {
  useTeacherDashboard,
  useTeacherPendingApprovals,
} from "@/modules/teachers/hooks"
import type { ModalityEntity } from "@/apps/api/src/modules/modalities/domain/modality"
import type {
  TeacherDashboardRecord,
  TeacherGraduationCatalogItem,
} from "@/apps/api/src/modules/teachers/domain/teacher-dashboard"
import {
  createTeacher,
  reviewTeacherEnrollmentRequest,
  updateTeacher,
} from "@/modules/teachers/services/teacher-dashboard"

type TeacherItem = TeacherDashboardRecord
type TeacherRole = TeacherItem["role"]
type TeacherStatus = TeacherItem["status"]
type TeacherAccessStatus = TeacherItem["accessStatus"]
type TeacherStatusFilter = "all" | "review_pending" | "active" | "inactive"

interface ModalitiesResponse {
  modalities: ModalityEntity[]
}

const weekDaysFull: Record<string, string> = {
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sab: "Sábado",
}

const roleLabels: Record<TeacherRole, string> = {
  head_instructor: "Instrutor chefe",
  instructor: "Instrutor",
  assistant: "Assistente",
}

const roleColors: Record<TeacherRole, string> = {
  head_instructor: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  instructor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  assistant: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
}

const teacherStatusLabel: Record<TeacherStatus, string> = {
  active: "Ativo",
  pending: "Pendente",
  inactive: "Inativo",
}

const teacherStatusClasses: Record<TeacherStatus, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  inactive: "border-muted/60 bg-muted/70 text-muted-foreground",
}

const teacherAccessStatusLabel: Record<TeacherAccessStatus, string> = {
  no_access: "Sem acesso",
  invited: "Convite enviado",
  pending_approval: "Aguardando aprovação",
  active: "Acesso ativo",
  rejected: "Cadastro rejeitado",
  revoked: "Acesso revogado",
  suspended: "Acesso suspenso",
}

const teacherAccessStatusClasses: Record<TeacherAccessStatus, string> = {
  no_access: "border-muted/60 bg-muted/70 text-muted-foreground",
  invited: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  pending_approval: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  rejected: "border-rose-500/30 bg-rose-500/10 text-rose-700",
  revoked: "border-rose-500/30 bg-rose-500/10 text-rose-700",
  suspended: "border-slate-500/30 bg-slate-500/10 text-slate-700",
}

const fallbackModalities: ModalityEntity[] = [
  {
    id: "fallback-jiu-jitsu",
    tenantId: "fallback",
    activityCategory: "jiu-jitsu",
    name: "Jiu-Jitsu",
    ageGroups: ["adult"],
    defaultDurationMinutes: 60,
    defaultCapacity: 20,
    sortOrder: 0,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-muay-thai",
    tenantId: "fallback",
    activityCategory: "muay-thai",
    name: "Muay Thai",
    ageGroups: ["adult"],
    defaultDurationMinutes: 60,
    defaultCapacity: 20,
    sortOrder: 1,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-boxe",
    tenantId: "fallback",
    activityCategory: "boxe",
    name: "Boxe",
    ageGroups: ["adult"],
    defaultDurationMinutes: 60,
    defaultCapacity: 20,
    sortOrder: 2,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-judo",
    tenantId: "fallback",
    activityCategory: "judo",
    name: "Judô",
    ageGroups: ["adult"],
    defaultDurationMinutes: 60,
    defaultCapacity: 20,
    sortOrder: 3,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
]

const ageGroupLabels: Record<ModalityEntity["ageGroups"][number], string> = {
  kids: "Kids",
  juvenile: "Juvenil",
  adult: "Adulto",
  mixed: "Misto",
}

function formatAgeGroups(ageGroups: ModalityEntity["ageGroups"]) {
  return ageGroups.map((item) => ageGroupLabels[item]).join(", ")
}

function isTeacherAwaitingReview(teacher: TeacherItem) {
  return (
    teacher.accessStatus === "pending_approval" &&
    teacher.availableActions.includes("approve") &&
    Boolean(teacher.reviewRequestId)
  )
}

function getTeacherStatusClassName(teacher: TeacherItem) {
  if (teacher.accessStatus !== "active" && teacher.accessStatus !== "no_access") {
    return teacherAccessStatusClasses[teacher.accessStatus]
  }

  return teacherStatusClasses[teacher.status]
}

function getTeacherStatusCopy(teacher: TeacherItem) {
  if (teacher.accessStatus !== "active" && teacher.accessStatus !== "no_access") {
    return teacherAccessStatusLabel[teacher.accessStatus]
  }

  return teacherStatusLabel[teacher.status]
}

export function TeachersDashboardScreen() {
  const {
    teacherRecords,
    graduationCatalog,
    isLoading: isTeachersLoading,
    error: teacherError,
    refresh: refreshTeacherRecords,
  } = useTeacherDashboard()
  const { refreshPendingApprovals } = useTeacherPendingApprovals()
  const [modalities, setModalities] = useState<ModalityEntity[]>(fallbackModalities)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TeacherStatusFilter>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null)
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false)
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null)
  const [teacherForm, setTeacherForm] = useState(createTeacherFormState())
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null)
  const [origin, setOrigin] = useState("")
  const [createdInvitation, setCreatedInvitation] = useState<{
    email: string
    token: string
  } | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const teacherFormGraduationLevels = useMemo(
    () =>
      resolveTeacherGraduationLevels({
        catalog: graduationCatalog,
        modalities,
        selectedModalityNames: teacherForm.modalities,
      }),
    [graduationCatalog, modalities, teacherForm.modalities]
  )

  useEffect(() => {
    let active = true

    async function loadModalities() {
      try {
        const response = await fetchJson<ModalitiesResponse>("/api/modalities")

        if (active && response.modalities.length > 0) {
          setModalities(response.modalities)
        }
      } catch {}
    }

    void loadModalities()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    if (teacherForm.modalities.length === 0 || teacherFormGraduationLevels.length === 0) {
      return
    }

    if (teacherFormGraduationLevels.some((level) => level.name === teacherForm.belt)) {
      return
    }

    setTeacherForm((current) => ({
      ...current,
      belt: teacherFormGraduationLevels[0].name,
    }))
  }, [teacherForm.belt, teacherForm.modalities.length, teacherFormGraduationLevels])

  const filteredTeachers = useMemo(() => {
    return teacherRecords.filter((teacher) => {
      const term = search.toLowerCase()
      const matchesSearch =
        teacher.name.toLowerCase().includes(term) ||
        (teacher.email ?? "").toLowerCase().includes(term) ||
        teacher.modalities.some((modality) => modality.toLowerCase().includes(term))

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "review_pending"
            ? isTeacherAwaitingReview(teacher)
            : teacher.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, teacherRecords])

  const totalTeachers = teacherRecords.length
  const activeTeachers = teacherRecords.filter((teacher) => teacher.status === "active").length
  const pendingReviewTeachers = teacherRecords.filter((teacher) => isTeacherAwaitingReview(teacher)).length
  const weeklyClasses = teacherRecords.reduce((total, teacher) => total + teacher.schedule.length, 0)
  const totalStudents = teacherRecords.reduce((total, teacher) => total + teacher.students, 0)
  const attendanceTotals = teacherRecords.reduce(
    (summary, teacher) => ({
      present: summary.present + teacher.attendanceSnapshot.present,
      absent: summary.absent + teacher.attendanceSnapshot.absent,
      confirmed: summary.confirmed + teacher.attendanceSnapshot.confirmed,
    }),
    { present: 0, absent: 0, confirmed: 0 }
  )

  function openCreateTeacher() {
    setSelectedTeacher(null)
    setEditingTeacherId(null)
    setTeacherForm(createTeacherFormState())
    setIsTeacherFormOpen(true)
  }

  function openEditTeacher(teacher: TeacherItem) {
    setSelectedTeacher(null)
    setEditingTeacherId(teacher.id)
    setTeacherForm({
      name: teacher.name,
      email: teacher.email ?? "",
      phone: teacher.phone ?? "",
      role: teacher.role,
      belt: teacher.belt,
      modalities: teacher.modalities,
      compensationType: teacher.compensation.type,
      compensationValue: String(teacher.compensation.value),
      bonus: teacher.compensation.bonus,
    })
    setIsTeacherFormOpen(true)
  }

  function toggleModality(modality: string) {
    setTeacherForm((current) => ({
      ...current,
      modalities: current.modalities.includes(modality)
        ? current.modalities.filter((item) => item !== modality)
        : [...current.modalities, modality],
    }))
  }

  async function submitTeacherForm() {
    if (isSubmitting) {
      return
    }

    const trimmedName = teacherForm.name.trim()

    if (!trimmedName) {
      setFormError("Informe o nome completo do professor.")
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    const normalizeOptional = (value?: string) => {
      if (!value) {
        return null
      }

      const trimmed = value.trim()
      return trimmed.length ? trimmed : null
    }

    const payload = {
      name: trimmedName,
      email: normalizeOptional(teacherForm.email),
      phone: normalizeOptional(teacherForm.phone),
      rank: normalizeOptional(teacherForm.belt),
      roleTitle: roleLabels[teacherForm.role],
      requestedModalityIds: modalities
        .filter((modality) => teacherForm.modalities.includes(modality.name))
        .map((modality) => modality.id),
      compensationType: teacherForm.compensationType,
      compensationValue: normalizeOptional(teacherForm.compensationValue),
      bonus: normalizeOptional(teacherForm.bonus),
      specialty: teacherForm.modalities[0] ?? null,
    }

    try {
      if (editingTeacherId) {
        await updateTeacher(editingTeacherId, payload)
      } else {
        const response = await createTeacher(payload)
        setCreatedInvitation(
          response.accessInvitation
            ? {
                email: response.accessInvitation.email,
                token: response.accessInvitation.token,
              }
            : null
        )
        setCopyFeedback(null)
      }
      setSelectedTeacher(null)
      refreshTeacherRecords()
      setIsTeacherFormOpen(false)
      setEditingTeacherId(null)
      setTeacherForm(createTeacherFormState())
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar o professor. Tente novamente."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCopyInvitationLink() {
    if (!createdInvitation || !origin) {
      setCopyFeedback("Aguarde enquanto o link de acesso é preparado.")
      return
    }

    try {
      await navigator.clipboard.writeText(`${origin}/aceitar-convite/${createdInvitation.token}`)
      setCopyFeedback("Link de acesso copiado.")
    } catch {
      setCopyFeedback("Não foi possível copiar automaticamente o link.")
    }
  }

  async function handleReviewTeacher(teacher: TeacherItem, action: "approve" | "reject") {
    if (!isTeacherAwaitingReview(teacher) || !teacher.reviewRequestId || reviewingRequestId) {
      return
    }

    setReviewError(null)
    setReviewingRequestId(teacher.reviewRequestId)

    try {
      await reviewTeacherEnrollmentRequest(teacher.reviewRequestId, action)
      if (selectedTeacher?.id === teacher.id) {
        setSelectedTeacher(null)
      }
      refreshTeacherRecords()
      void refreshPendingApprovals()
    } catch (error) {
      setReviewError(
        error instanceof ApiError
          ? error.message
          : `Não foi possível ${action === "approve" ? "aprovar" : "recusar"} este cadastro agora.`
      )
    } finally {
      setReviewingRequestId(null)
    }
  }

  return (
    <>
      <Dialog open={isTeacherFormOpen} onOpenChange={setIsTeacherFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTeacherId ? "Editar professor" : "Novo professor"}</DialogTitle>
            <DialogDescription>
              {editingTeacherId
                ? "Ajuste dados, função, modalidades e remuneração do professor."
                : "Cadastre um novo professor ou instrutor na academia."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="teacherName">Nome completo</Label>
              <Input
                id="teacherName"
                value={teacherForm.name}
                onChange={(event) =>
                  setTeacherForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Nome do professor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="teacherEmail">E-mail</Label>
                <Input
                  id="teacherEmail"
                  type="email"
                  value={teacherForm.email}
                  onChange={(event) =>
                    setTeacherForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="email@academia.com"
                />
                <p className="text-xs text-muted-foreground">
                  Ao informar o e-mail, o sistema já gera o link para o professor criar a senha.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacherPhone">Telefone</Label>
                <Input
                  id="teacherPhone"
                  value={teacherForm.phone}
                  onChange={(event) =>
                    setTeacherForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="(11) 99999-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Função</Label>
                <Select
                  value={teacherForm.role}
                  onValueChange={(value: TeacherRole) =>
                    setTeacherForm((current) => ({ ...current, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="head_instructor">Instrutor chefe</SelectItem>
                    <SelectItem value="instructor">Instrutor</SelectItem>
                    <SelectItem value="assistant">Assistente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Graduação</Label>
                <Select
                  value={teacherForm.belt}
                  onValueChange={(value) =>
                    setTeacherForm((current) => ({ ...current, belt: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherFormGraduationLevels.length > 0 ? (
                      teacherFormGraduationLevels.map((level) => (
                        <SelectItem key={`${level.name}-${level.stripes}`} value={level.name}>
                          {level.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value={teacherForm.belt}>{teacherForm.belt || "Branca"}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Modalidades</Label>
              <div className="flex flex-wrap gap-2">
                {modalities.map((modality) => {
                  const active = teacherForm.modalities.includes(modality.name)
                  return (
                    <button
                      key={modality.id}
                      type="button"
                      onClick={() => toggleModality(modality.name)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                      title={formatAgeGroups(modality.ageGroups)}
                    >
                      {modality.name}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                As modalidades seguem o cadastro da academia. Passe o mouse para ver as faixas etárias.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de remuneração</Label>
                <Select
                  value={teacherForm.compensationType}
                  onValueChange={(value: TeacherItem["compensation"]["type"]) =>
                    setTeacherForm((current) => ({ ...current, compensationType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Salário fixo</SelectItem>
                    <SelectItem value="per_class">Por aula</SelectItem>
                    <SelectItem value="percentage">Percentual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacherValue">Valor (R$)</Label>
                <Input
                  id="teacherValue"
                  type="number"
                  value={teacherForm.compensationValue}
                  onChange={(event) =>
                    setTeacherForm((current) => ({
                      ...current,
                      compensationValue: event.target.value,
                    }))
                  }
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="teacherBonus">Bônus</Label>
              <Input
                id="teacherBonus"
                value={teacherForm.bonus}
                onChange={(event) =>
                  setTeacherForm((current) => ({ ...current, bonus: event.target.value }))
                }
                placeholder="Ex: R$ 50 por graduação"
              />
            </div>

            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}

            <Button
              className="mt-2"
              onClick={submitTeacherForm}
              disabled={
                isSubmitting || !teacherForm.name || teacherForm.modalities.length === 0
              }
            >
              {isSubmitting
                ? "Salvando..."
                : editingTeacherId
                ? "Salvar alterações"
                : "Cadastrar professor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(createdInvitation)} onOpenChange={(open) => !open && setCreatedInvitation(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Link de acesso gerado</DialogTitle>
            <DialogDescription>
              O professor foi cadastrado e agora pode criar a senha a partir deste convite.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">{createdInvitation?.email}</p>
              <p className="mt-2 break-all text-sm text-muted-foreground">
                {createdInvitation ? `${origin}/aceitar-convite/${createdInvitation.token}` : ""}
              </p>
            </div>

            {copyFeedback ? <p className="text-sm text-muted-foreground">{copyFeedback}</p> : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setCreatedInvitation(null)}>
                Fechar
              </Button>
              <Button type="button" className="gap-2" onClick={handleCopyInvitationLink}>
                <Copy className="h-4 w-4" />
                Copiar link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Professores</h1>
            <p className="text-muted-foreground">Gerencie o corpo docente, permissões e agendas da academia</p>
          </div>
          <Button className="gap-2" onClick={openCreateTeacher}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo professor</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <TeacherMetricCard title="Total" value={totalTeachers} subtitle="Docentes cadastrados" icon={UserCheck} tone="primary" />
          <TeacherMetricCard title="Ativos" value={activeTeachers} subtitle="Com agenda ativa" icon={CheckCircle2} tone="success" />
          <TeacherMetricCard
            title="Aprovação"
            value={pendingReviewTeachers}
            subtitle="Cadastros aguardando análise"
            icon={Shield}
            tone="warning"
          />
          <TeacherMetricCard title="Aulas/mês" value={teacherRecords.reduce((total, teacher) => total + teacher.monthlyClasses, 0)} subtitle="Carga mensal" icon={Calendar} tone="info" />
          <TeacherMetricCard title="Alunos atendidos" value={totalStudents} subtitle="Sob responsabilidade" icon={Users} tone="warning" />
          <TeacherMetricCard
            title="Presença hoje"
            value={attendanceTotals.confirmed > 0 ? `${attendanceTotals.present}/${attendanceTotals.confirmed}` : "—"}
            subtitle={`${attendanceTotals.absent} ausências`}
            icon={CheckCircle2}
            tone="success"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar professores..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as TeacherStatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Filtrar situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os professores</SelectItem>
              <SelectItem value="review_pending">Aguardando aprovação</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <div className="inline-flex rounded-lg border border-border bg-background p-1">
            <Button
              type="button"
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              Listagem
            </Button>
            <Button
              type="button"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            {isTeachersLoading ? (
              <p className="text-sm text-muted-foreground">Atualizando os professores…</p>
            ) : teacherError ? (
              <p className="text-sm text-destructive">{teacherError.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {pendingReviewTeachers} cadastro{pendingReviewTeachers !== 1 ? "s" : ""} aguardando aprovação.
              </p>
            )}
            {reviewError ? <p className="text-sm text-destructive">{reviewError}</p> : null}
          </div>
          <Button size="sm" variant="outline" onClick={refreshTeacherRecords} disabled={isTeachersLoading}>
            Atualizar
          </Button>
        </div>

        {pendingReviewTeachers > 0 ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-amber-950">
                Professores aguardando aprovação
              </p>
              <p className="text-sm text-amber-900/80">
                {pendingReviewTeachers} cadastro{pendingReviewTeachers !== 1 ? "s" : ""} precisa{pendingReviewTeachers === 1 ? "" : "m"} da sua análise para liberar o acesso completo.
              </p>
            </div>
            {statusFilter !== "review_pending" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber-500/40 bg-white/80 text-amber-950 hover:bg-white"
                onClick={() => setStatusFilter("review_pending")}
              >
                Ver pendência
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber-500/40 bg-white/80 text-amber-950 hover:bg-white"
                onClick={() => setStatusFilter("all")}
              >
                Limpar filtro
              </Button>
            )}
          </div>
        ) : null}

        {viewMode === "list" ? (
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-medium">
                {filteredTeachers.length} professor{filteredTeachers.length !== 1 ? "es" : ""} encontrado{filteredTeachers.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden xl:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professor</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Modalidades</TableHead>
                      <TableHead>Alunos</TableHead>
                      <TableHead>Aulas/mês</TableHead>
                      <TableHead>Graduação</TableHead>
                      <TableHead className="w-[72px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((teacher) => (
                      <TableRow
                        key={teacher.id}
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                        onClick={() => setSelectedTeacher(teacher)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3 py-1">
                            <Avatar className="h-11 w-11">
                              <AvatarImage src={teacher.avatar ?? undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {initials(teacher.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate font-semibold text-foreground">{teacher.name}</p>
                                <Badge variant="outline" className={roleColors[teacher.role]}>
                                  {roleLabels[teacher.role]}
                                </Badge>
                                <Badge className={getTeacherStatusClassName(teacher)}>
                                  {getTeacherStatusCopy(teacher)}
                                </Badge>
                              </div>
                              <p className="truncate text-sm text-muted-foreground">{teacher.email ?? "E-mail não informado"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">{roleLabels[teacher.role]}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex max-w-[260px] flex-wrap gap-2">
                            {teacher.modalities.map((modality) => (
                              <Badge key={modality} variant="secondary">
                                {modality}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground">{teacher.students}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground">{teacher.monthlyClasses}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              style={resolveBeltBadgeStyle({
                                beltName: teacher.belt,
                                colorHex: teacher.beltColorHex,
                              })}
                        >
                          {teacher.belt}
                        </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="flex items-center justify-end gap-2"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {isTeacherAwaitingReview(teacher) ? (
                              <TeacherReviewActionButtons
                                teacher={teacher}
                                reviewingRequestId={reviewingRequestId}
                                onReview={handleReviewTeacher}
                              />
                            ) : null}
                            <TeacherActions
                              teacher={teacher}
                              onOpenProfile={() => {
                                setIsTeacherFormOpen(false)
                                setSelectedTeacher(teacher)
                              }}
                              onEdit={() => openEditTeacher(teacher)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="divide-y divide-border xl:hidden">
                {filteredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    role="button"
                    tabIndex={0}
                    className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/40 active:bg-muted/60"
                    onClick={() => setSelectedTeacher(teacher)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        setSelectedTeacher(teacher)
                      }
                    }}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={teacher.avatar ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials(teacher.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-2.5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-foreground">{teacher.name}</p>
                            <Badge variant="outline" className={roleColors[teacher.role]}>
                              {roleLabels[teacher.role]}
                            </Badge>
                            <Badge className={getTeacherStatusClassName(teacher)}>
                              {getTeacherStatusCopy(teacher)}
                            </Badge>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{teacher.email ?? "E-mail não informado"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {teacher.modalities.map((modality) => (
                            <Badge key={modality} variant="secondary">
                              {modality}
                            </Badge>
                          ))}
                          <Badge
                            variant="outline"
                            style={resolveBeltBadgeStyle({
                              beltName: teacher.belt,
                              colorHex: teacher.beltColorHex,
                            })}
                          >
                            {teacher.belt}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {teacher.students} alunos
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {teacher.monthlyClasses} aulas/mês
                          </span>
                        </div>
                        {isTeacherAwaitingReview(teacher) ? (
                          <TeacherReviewActionButtons
                            teacher={teacher}
                            reviewingRequestId={reviewingRequestId}
                            onReview={handleReviewTeacher}
                          />
                        ) : null}
                      </div>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Card
                key={teacher.id}
                className="cursor-pointer overflow-hidden transition-all hover:bg-muted/50"
                onClick={() => setSelectedTeacher(teacher)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={teacher.avatar ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {initials(teacher.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{teacher.name}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {teacher.modalities.join(", ")}
                          </p>
                        </div>
                        <div className="flex items-start gap-1">
                          <Badge className={roleColors[teacher.role]}>{roleLabels[teacher.role]}</Badge>
                          <Badge className={getTeacherStatusClassName(teacher)}>
                            {getTeacherStatusCopy(teacher)}
                          </Badge>
                          <TeacherActions
                            teacher={teacher}
                            onOpenProfile={() => {
                              setIsTeacherFormOpen(false)
                              setSelectedTeacher(teacher)
                            }}
                            onEdit={() => openEditTeacher(teacher)}
                          />
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          style={resolveBeltBadgeStyle({
                            beltName: teacher.belt,
                            colorHex: teacher.beltColorHex,
                          })}
                      >
                          {teacher.belt}
                        </Badge>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{teacher.students} alunos</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{teacher.monthlyClasses} aulas/mês</span>
                        </div>
                      </div>
                      {isTeacherAwaitingReview(teacher) ? (
                        <div className="mt-3 border-t pt-3">
                          <TeacherReviewActionButtons
                            teacher={teacher}
                            reviewingRequestId={reviewingRequestId}
                            onReview={handleReviewTeacher}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(selectedTeacher)} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          {selectedTeacher ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedTeacher.avatar ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {initials(selectedTeacher.name)}
                      </AvatarFallback>
                    </Avatar>
                      <div>
                        <DialogTitle className="text-xl">{selectedTeacher.name}</DialogTitle>
                        <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={roleColors[selectedTeacher.role]}>
                            {roleLabels[selectedTeacher.role]}
                          </Badge>
                          <Badge className={getTeacherStatusClassName(selectedTeacher)}>
                            {getTeacherStatusCopy(selectedTeacher)}
                          </Badge>
                          <Badge
                            variant="outline"
                            style={resolveBeltBadgeStyle({
                              beltName: selectedTeacher.belt,
                              colorHex: selectedTeacher.beltColorHex,
                            })}
                          >
                            {selectedTeacher.belt}
                          </Badge>
                        </DialogDescription>
                        {isTeacherAwaitingReview(selectedTeacher) ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Esse cadastro foi feito pelo próprio professor e precisa da aprovação da academia.
                              Depois da aprovação, complete os dados internos e de pagamento no cadastro profissional.
                            </p>
                            <TeacherReviewActionButtons
                              teacher={selectedTeacher}
                              reviewingRequestId={reviewingRequestId}
                              onReview={handleReviewTeacher}
                            />
                          </div>
                        ) : null}
                      </div>
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
                          openEditTeacher(selectedTeacher)
                        }}
                      >
                        Editar cadastro
                      </DropdownMenuItem>
                      <DropdownMenuItem>Enviar mensagem</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-4">
                  <TabsList className="grid h-auto w-full grid-cols-4">
                    <TabsTrigger value="info">Dados</TabsTrigger>
                    <TabsTrigger value="schedule">Agenda</TabsTrigger>
                    <TabsTrigger value="permissions">Permissões</TabsTrigger>
                    <TabsTrigger value="compensation">Financeiro</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TeacherInfoBlock
                        icon={Mail}
                        label="E-mail"
                        value={selectedTeacher.email ?? "E-mail não informado"}
                      />
                      <TeacherInfoBlock
                        icon={Phone}
                        label="Telefone"
                        value={selectedTeacher.phone ?? "Telefone não informado"}
                      />
                      <TeacherInfoBlock icon={Calendar} label="Na academia" value={yearsAtAcademy(selectedTeacher.startDate)} />
                      <TeacherInfoBlock icon={Award} label="Total de aulas" value={selectedTeacher.totalClasses.toLocaleString("pt-BR")} />
                    </div>

                    <div className="border-t pt-4">
                      <p className="mb-3 font-medium text-foreground">Modalidades</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeacher.modalities.map((modality) => (
                          <Badge key={modality} variant="secondary">
                            {modality}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="mb-3 font-medium text-foreground">Especialidades</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeacher.specializations.map((specialization) => (
                          <Badge key={specialization} variant="secondary">
                            {specialization}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="mt-4 space-y-4">
                    <div className="space-y-3">
                      {selectedTeacher.schedule.map((slot) => (
                        <div key={slot.day} className="rounded-lg bg-muted/50 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground">{weekDaysFull[slot.day] ?? slot.day}</span>
                          </div>
                          <div className="ml-6 space-y-2">
                            {slot.classes.map((className) => (
                              <div key={className} className="flex items-center gap-2 text-sm text-foreground">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{className}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      Editar agenda
                    </Button>
                  </TabsContent>

                  <TabsContent value="permissions" className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Configure as permissões de acesso do professor no sistema
                    </p>
                    <div className="space-y-4">
                      <PermissionRow label="Gerenciar alunos" description="Cadastrar, editar e visualizar alunos" value={selectedTeacher.permissions.manageStudents} />
                      <PermissionRow label="Gerenciar graduações" description="Realizar exames e promover alunos" value={selectedTeacher.permissions.manageGraduations} />
                      <PermissionRow label="Registrar presença" description="Registrar e editar presenças" value={selectedTeacher.permissions.manageAttendance} />
                      <PermissionRow label="Ver financeiro" description="Visualizar dados financeiros" value={selectedTeacher.permissions.viewFinancials} />
                      <PermissionRow label="Gerenciar turmas" description="Criar e editar turmas" value={selectedTeacher.permissions.manageClasses} />
                      <PermissionRow label="Gerenciar técnicas" description="Criar e editar biblioteca de técnicas" value={selectedTeacher.permissions.manageTechniques} />
                      <PermissionRow label="Gerenciar eventos" description="Adicionar participantes e operar eventos da academia" value={selectedTeacher.permissions.manageEvents} />
                    </div>
                    <Button className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Salvar permissões
                    </Button>
                  </TabsContent>

                  <TabsContent value="compensation" className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TeacherDetailMetric title="Tipo de remuneração" value={compensationTypeLabel(selectedTeacher.compensation.type)} />
                      <TeacherDetailMetric
                        title="Valor"
                        value={`R$ ${selectedTeacher.compensation.value.toLocaleString("pt-BR")}${selectedTeacher.compensation.type === "per_class" ? "/aula" : ""}`}
                      />
                    </div>

                    {selectedTeacher.compensation.type === "per_class" ? (
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">Estimativa mensal</p>
                          <p className="mt-1 text-2xl font-bold text-primary">
                            R$ {(selectedTeacher.compensation.value * selectedTeacher.monthlyClasses).toLocaleString("pt-BR")}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {selectedTeacher.monthlyClasses} aulas x R$ {selectedTeacher.compensation.value}
                          </p>
                        </CardContent>
                      </Card>
                    ) : null}

                    <div className="border-t pt-4">
                      <p className="mb-3 font-medium text-foreground">Bônus e adicional</p>
                      <p className="text-sm text-muted-foreground">{selectedTeacher.compensation.bonus}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">Editar remuneração</Button>
                      <Button variant="outline" className="flex-1">Ver histórico</Button>
                    </div>
                  </TabsContent>
                </Tabs>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function TeacherMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: typeof UserCheck
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
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TeacherActions({
  teacher,
  onOpenProfile,
  onEdit,
}: {
  teacher: TeacherItem
  onOpenProfile: () => void
  onEdit: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            onOpenProfile()
          }}
          onClick={(event) => event.stopPropagation()}
        >
          Ver perfil
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            onEdit()
          }}
          onClick={(event) => event.stopPropagation()}
        >
          Editar professor
        </DropdownMenuItem>
        <DropdownMenuItem>Gerenciar agenda</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TeacherReviewActionButtons({
  teacher,
  reviewingRequestId,
  onReview,
}: {
  teacher: TeacherItem
  reviewingRequestId: string | null
  onReview: (teacher: TeacherItem, action: "approve" | "reject") => void
}) {
  if (!isTeacherAwaitingReview(teacher) || !teacher.reviewRequestId) {
    return null
  }

  const isReviewing = reviewingRequestId === teacher.reviewRequestId

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        type="button"
        size="sm"
        onClick={(event) => {
          event.stopPropagation()
          onReview(teacher, "approve")
        }}
        disabled={isReviewing}
      >
        {isReviewing ? "Salvando..." : "Aprovar"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={(event) => {
          event.stopPropagation()
          onReview(teacher, "reject")
        }}
        disabled={isReviewing}
      >
        Recusar
      </Button>
    </div>
  )
}

function TeacherInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-muted p-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}

function TeacherInfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="space-y-1 rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  )
}

function PermissionRow({
  label,
  description,
  value,
}: {
  label: string
  description: string
  value: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {value ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
        )}
        <Switch checked={value} aria-label={label} />
      </div>
    </div>
  )
}

function TeacherDetailMetric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR")
}

function yearsAtAcademy(startDate: string) {
  const start = new Date(`${startDate}T00:00:00`)
  const today = new Date()
  const years = today.getFullYear() - start.getFullYear()
  return `${years} ano${years !== 1 ? "s" : ""}`
}

function compensationTypeLabel(type: TeacherItem["compensation"]["type"]) {
  if (type === "fixed") return "Salário fixo"
  if (type === "per_class") return "Por aula"
  return "Percentual"
}

function defaultTeacherPermissions() {
  return {
    manageStudents: false,
    manageGraduations: false,
    manageAttendance: true,
    viewFinancials: false,
    manageClasses: false,
    manageTechniques: false,
    manageEvents: true,
  }
}

function createTeacherFormState() {
  return {
    name: "",
    email: "",
    phone: "",
    role: "instructor" as TeacherRole,
    belt: "Preta",
    modalities: [] as string[],
    compensationType: "fixed" as TeacherItem["compensation"]["type"],
    compensationValue: "",
    bonus: "",
  }
}

function resolveTeacherGraduationLevels(input: {
  catalog: TeacherGraduationCatalogItem[]
  modalities: ModalityEntity[]
  selectedModalityNames: string[]
}) {
  const selectedActivityCategories = new Set<NonNullable<ModalityEntity["activityCategory"]>>(
    input.modalities
      .filter((modality) => input.selectedModalityNames.includes(modality.name))
      .flatMap((modality) => (modality.activityCategory ? [modality.activityCategory] : []))
  )

  const levels = input.catalog
    .filter(
      (item) =>
        item.activityCategory !== null &&
        selectedActivityCategories.has(item.activityCategory as NonNullable<ModalityEntity["activityCategory"]>)
    )
    .flatMap((item) => item.levels)

  const deduped = new Map<string, (typeof levels)[number]>()
  for (const level of levels) {
    const key = `${level.name.trim().toLowerCase()}::${level.stripes}`
    if (!deduped.has(key)) {
      deduped.set(key, level)
    }
  }

  return Array.from(deduped.values())
}
