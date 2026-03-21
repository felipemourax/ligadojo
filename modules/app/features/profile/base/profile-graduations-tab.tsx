"use client"

import { useEffect, useMemo, useState } from "react"
import { GraduationCap, Pencil, Plus, ShieldCheck, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { resolveBeltBadgeStyle } from "@/lib/ui/belt-badges"

interface ProfileGraduationActivityItem {
  id: string
  activityCategory: string | null
  activityLabel: string
  currentBelt: string
  currentStripes: number
  beltColorHex: string | null
  levels: Array<{
    name: string
    colorHex: string
    stripes: number
  }>
  history: Array<{
    id: string
    activityCategory: string | null
    activityLabel: string
    belt: string
    stripes: number
    date: string
    notes: string | null
  }>
}

interface ProfileGraduationsTabProps {
  activities: ProfileGraduationActivityItem[]
  isSaving?: boolean
  onSubmit: (payload: {
    activityId: string
    activityCategory: string | null
    toBelt: string
    toStripes: number
    graduatedAtMonth: string
    notes?: string | null
  }) => Promise<void> | void
  onUpdate: (payload: {
    graduationId: string
    activityId: string
    activityCategory: string | null
    toBelt: string
    toStripes: number
    graduatedAtMonth: string
    notes?: string | null
  }) => Promise<void> | void
}

export function ProfileGraduationsTab({
  activities,
  isSaving = false,
  onSubmit,
  onUpdate,
}: ProfileGraduationsTabProps) {
  const [selectedActivityId, setSelectedActivityId] = useState(activities[0]?.id ?? "")
  const [form, setForm] = useState(() => createFormState(activities[0] ?? null))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGraduationId, setEditingGraduationId] = useState<string | null>(null)

  useEffect(() => {
    if (activities.length === 0) {
      setSelectedActivityId("")
      setForm(createFormState(null))
      return
    }

    if (!activities.some((activity) => activity.id === selectedActivityId)) {
      setSelectedActivityId(activities[0].id)
      setForm(createFormState(activities[0]))
    }
  }, [activities, selectedActivityId])

  useEffect(() => {
    const nextActivity = activities.find((activity) => activity.id === selectedActivityId) ?? null
    if (!nextActivity || form.activityId === nextActivity.id) {
      return
    }

    setForm(createFormState(nextActivity))
  }, [activities, form.activityId, selectedActivityId])

  const activeActivity = useMemo(
    () => activities.find((activity) => activity.id === selectedActivityId) ?? activities[0] ?? null,
    [activities, selectedActivityId]
  )

  const formActivity = useMemo(
    () => activities.find((activity) => activity.id === form.activityId) ?? activeActivity,
    [activities, activeActivity, form.activityId]
  )

  const stripeOptions = useMemo(() => {
    const selectedLevel = formActivity?.levels.find((level) => level.name === form.toBelt) ?? null
    const maxStripes = selectedLevel?.stripes ?? 0
    return Array.from({ length: maxStripes + 1 }, (_, index) => index)
  }, [form.toBelt, formActivity])

  const orderedHistory = useMemo(
    () =>
      [...(activeActivity?.history ?? [])].sort((left, right) => right.date.localeCompare(left.date)),
    [activeActivity]
  )

  const isEditing = Boolean(editingGraduationId)

  async function handleSubmit() {
    const normalizedMonth = parseMaskedMonthYear(form.graduatedAtMonth)
    if (!formActivity || !form.toBelt || !normalizedMonth) {
      return
    }

    const payload = {
      activityId: formActivity.id,
      activityCategory: formActivity.activityCategory,
      toBelt: form.toBelt,
      toStripes: form.toStripes,
      graduatedAtMonth: normalizedMonth,
      notes: form.notes.trim() ? form.notes.trim() : null,
    }

    if (editingGraduationId) {
      await onUpdate({
        graduationId: editingGraduationId,
        ...payload,
      })
    } else {
      await onSubmit(payload)
    }

    setForm(createFormState(formActivity))
    setEditingGraduationId(null)
    setIsDialogOpen(false)
  }

  function handleCreateDialogOpen() {
    setEditingGraduationId(null)
    setForm(createFormState(activeActivity))
    setIsDialogOpen(true)
  }

  function handleEditDialogOpen(entry: ProfileGraduationActivityItem["history"][number]) {
    const nextActivity = activities.find((activity) => activity.id === activeActivity?.id) ?? activeActivity
    if (!nextActivity) {
      return
    }

    setEditingGraduationId(entry.id)
    setForm(createFormState(nextActivity, entry))
    setIsDialogOpen(true)
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    setIsDialogOpen(nextOpen)
    if (!nextOpen) {
      setEditingGraduationId(null)
      setForm(createFormState(activeActivity))
    }
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Nenhuma atividade com sistema de faixas disponível para este perfil.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activities.length > 1 ? (
        <Tabs value={selectedActivityId} onValueChange={setSelectedActivityId}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            {activities.map((activity) => (
              <TabsTrigger key={activity.id} value={activity.id} className="rounded-full border border-border/60">
                {activity.activityLabel}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}

      {activeActivity ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Minhas graduações</CardTitle>
                <CardDescription>{activeActivity.activityLabel}</CardDescription>
              </div>
              <Button size="sm" onClick={handleCreateDialogOpen}>
                <Plus className="mr-1 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Faixa atual</p>
              <div className="mt-2 flex items-center gap-3">
                <Badge
                  variant="outline"
                  style={resolveBeltBadgeStyle({
                    beltName: activeActivity.currentBelt,
                    colorHex: activeActivity.beltColorHex,
                  })}
                >
                  {activeActivity.currentBelt}
                  {activeActivity.currentStripes > 0
                    ? ` • ${activeActivity.currentStripes} grau${activeActivity.currentStripes === 1 ? "" : "s"}`
                    : ""}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Registro pessoal ordenado automaticamente por mes e ano.
                </p>
              </div>
            </div>

            {orderedHistory.length > 0 ? (
              orderedHistory.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {entry.activityLabel} - {entry.belt}
                      {entry.stripes > 0 ? ` ${entry.stripes} grau${entry.stripes === 1 ? "" : "s"}` : ""} -{" "}
                      {formatMonthYear(entry.date)}
                    </p>
                    {entry.notes ? (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Registro pessoal de graduação.</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => handleEditDialogOpen(entry)}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Editar
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <GraduationCap className="mx-auto mb-2 h-12 w-12 opacity-20" />
                <p>Nenhuma graduação cadastrada</p>
                <p className="text-sm">Use o botão adicionar para registrar seu histórico.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar graduação" : "Adicionar graduação"}</DialogTitle>
            <DialogDescription>
              Use apenas as faixas disponíveis no sistema de faixas da academia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                <p>
                  As opções de faixa e graus são filtradas automaticamente pela atividade e pelo sistema
                  de faixas da academia.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Atividade</Label>
              <Select
                value={form.activityId}
                onValueChange={(value) => {
                  const nextActivity = activities.find((activity) => activity.id === value) ?? null
                  setForm(createFormState(nextActivity))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.activityLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Faixa</Label>
                <Select
                  value={form.toBelt}
                  onValueChange={(value) =>
                    setForm((current) => ({
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
                    {(formActivity?.levels ?? []).map((level) => (
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
                  value={String(form.toStripes)}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, toStripes: Number(value) || 0 }))
                  }
                  disabled={stripeOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {stripeOptions.map((value) => (
                      <SelectItem key={value} value={String(value)}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Data</Label>
              <Input
                inputMode="numeric"
                placeholder="MM/AAAA"
                value={form.graduatedAtMonth}
                maxLength={7}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    graduatedAtMonth: formatMaskedMonthYear(event.target.value),
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={isSaving || !formActivity || !form.toBelt || !parseMaskedMonthYear(form.graduatedAtMonth)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isEditing ? "Salvar graduação" : "Registrar graduação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function createFormState(
  activity: ProfileGraduationActivityItem | null,
  entry?: ProfileGraduationActivityItem["history"][number]
) {
  const preferredBelt =
    activity?.levels.find((level) => level.name === (entry?.belt ?? activity.currentBelt))?.name ??
    activity?.levels[0]?.name ??
    entry?.belt ??
    activity?.currentBelt ??
    ""

  return {
    activityId: activity?.id ?? "",
    toBelt: preferredBelt,
    toStripes: entry?.stripes ?? 0,
    graduatedAtMonth: entry ? formatMonthYear(entry.date) : formatMaskedMonthYear(new Date().toISOString().slice(0, 7)),
    notes: entry?.notes ?? "",
  }
}

function formatMonthYear(value: string) {
  const [year = "", month = ""] = value.split("-")
  return `${month}/${year}`
}

function formatMaskedMonthYear(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 6)
  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function parseMaskedMonthYear(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.length !== 6) {
    return null
  }

  const month = digits.slice(0, 2)
  const year = digits.slice(2)

  if (Number(month) < 1 || Number(month) > 12) {
    return null
  }

  return `${year}-${month}`
}
