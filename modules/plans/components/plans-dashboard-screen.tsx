"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarClock, Check, ChevronsUpDown, Plus, Receipt, Save, Wallet, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchJson } from "@/lib/api/client"
import { formatCurrencyInputFromCents, parseCurrencyInputToCents } from "@/lib/currency-input"
import { cn } from "@/lib/utils"
import type { AgeGroupValue } from "@/apps/api/src/modules/modalities/domain/modality"
import type { PlansCollectionEntity } from "@/apps/api/src/modules/plans/domain/plan"
import type { PlansDashboardState } from "@/modules/plans/types"

function defaultPlans(): PlansDashboardState {
  return { plans: [] }
}

function formatAgeGroups(ageGroups: AgeGroupValue[]) {
  const labels: Record<AgeGroupValue, string> = {
    kids: "Kids",
    juvenile: "Juvenil",
    adult: "Adulto",
    mixed: "Misto",
  }

  return ageGroups.map((item) => labels[item]).join(", ")
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

function getModalityColor(name: string) {
  const palette = [
    "bg-blue-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-indigo-500",
  ]

  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return palette[hash % palette.length]
}

function ModalitiesMultiselect({
  selectedIds,
  modalityReferences,
  onSelectionChange,
}: {
  selectedIds: string[]
  modalityReferences: PlansCollectionEntity["modalityReferences"]
  onSelectionChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selectedModalities = modalityReferences.filter((item) => selectedIds.includes(item.id))
  const filteredModalities = modalityReferences.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      formatAgeGroups(item.ageGroups).toLowerCase().includes(search.toLowerCase())
  )

  const groupedModalities = filteredModalities.reduce<Record<string, PlansCollectionEntity["modalityReferences"]>>(
    (groups, modality) => {
      const key = formatAgeGroups(modality.ageGroups) || "Outros"
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(modality)
      return groups
    },
    {}
  )

  function toggleModality(modalityId: string) {
    onSelectionChange(
      selectedIds.includes(modalityId)
        ? selectedIds.filter((id) => id !== modalityId)
        : [...selectedIds, modalityId]
    )
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-9 w-full justify-between bg-input py-2 text-sm hover:bg-secondary"
          >
            <span className="text-muted-foreground">
              {selectedIds.length === 0
                ? "Selecionar modalidades..."
                : `${selectedIds.length} modalidade${selectedIds.length !== 1 ? "s" : ""} selecionada${selectedIds.length !== 1 ? "s" : ""}`}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar modalidade..."
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Nenhuma modalidade encontrada.</CommandEmpty>
              <CommandGroup>
                <div className="flex gap-2 p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => onSelectionChange(modalityReferences.map((item) => item.id))}
                  >
                    Selecionar todas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => onSelectionChange([])}
                  >
                    Limpar
                  </Button>
                </div>
              </CommandGroup>
              <CommandSeparator />
              {Object.entries(groupedModalities).map(([group, modalities]) => (
                <CommandGroup key={group} heading={group}>
                  {modalities.map((modality) => (
                    <CommandItem
                      key={modality.id}
                      value={modality.id}
                      onSelect={() => toggleModality(modality.id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border border-primary",
                          selectedIds.includes(modality.id)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50"
                        )}
                      >
                        {selectedIds.includes(modality.id) ? <Check className="h-3 w-3" /> : null}
                      </div>
                      <span className={cn("h-2 w-2 rounded-full", getModalityColor(modality.name))} />
                      <span className="flex-1">{modality.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedModalities.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedModalities.map((modality) => (
            <Badge key={modality.id} variant="secondary" className="gap-1 pr-1 text-xs">
              <span className={cn("h-1.5 w-1.5 rounded-full", getModalityColor(modality.name))} />
              {modality.name}
              <button
                type="button"
                onClick={() => onSelectionChange(selectedIds.filter((id) => id !== modality.id))}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function PlansDashboardScreen() {
  const [plansSetup, setPlansSetup] = useState<PlansDashboardState>(defaultPlans)
  const [modalityReferences, setModalityReferences] = useState<PlansCollectionEntity["modalityReferences"]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const response = await fetchJson<PlansCollectionEntity>("/api/plans")
        if (!active) return

        const plans = response.plans.map((item) => ({
          clientId: item.id,
          name: item.name,
          amountCents: item.amountCents,
          billingCycle: item.billingCycle,
          weeklyFrequency: item.weeklyFrequency,
          classLimitKind: item.classLimitKind,
          classLimitValue: item.classLimitValue,
          includedModalityIds: item.includedModalityIds,
        }))

        setPlansSetup({ plans })
        setModalityReferences(response.modalityReferences)
        setOpenItems([])
      } catch (error) {
        if (active) {
          setFeedback(error instanceof Error ? error.message : "Não foi possível carregar os planos.")
        }
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  const totalPlans = plansSetup.plans.length
  const avgTicket = totalPlans
    ? Math.round(plansSetup.plans.reduce((sum, item) => sum + item.amountCents, 0) / totalPlans)
    : 0
  const avgFrequency = totalPlans
    ? Math.round(plansSetup.plans.reduce((sum, item) => sum + (item.weeklyFrequency ?? 0), 0) / totalPlans)
    : 0

  const plansByCycle = useMemo(() => {
    return plansSetup.plans.reduce<Record<string, typeof plansSetup.plans>>((groups, plan) => {
      const key = plan.billingCycle
      if (!groups[key]) groups[key] = []
      groups[key].push(plan)
      return groups
    }, {})
  }, [plansSetup.plans])

  function updatePlan(
    clientId: string,
    updater: (plan: PlansDashboardState["plans"][number]) => PlansDashboardState["plans"][number]
  ) {
    setPlansSetup((current) => ({
      ...current,
      plans: current.plans.map((item) => (item.clientId === clientId ? updater(item) : item)),
    }))
  }

  function addPlan() {
    const clientId = `temp-${crypto.randomUUID()}`
    setPlansSetup((current) => ({
      ...current,
      plans: [
        ...current.plans,
        {
          clientId,
          name: "",
          amountCents: 0,
          billingCycle: "monthly",
          weeklyFrequency: null,
          classLimitKind: "unlimited",
          classLimitValue: null,
          includedModalityIds: modalityReferences.map((item) => item.id),
        },
      ],
    }))
    setOpenItems((current) => [...current, clientId])
  }

  function removePlan(clientId: string) {
    setPlansSetup((current) => ({
      ...current,
      plans: current.plans.filter((item) => item.clientId !== clientId),
    }))
    setOpenItems((current) => current.filter((item) => item !== clientId))
  }

  async function save() {
    setIsSaving(true)
    try {
      const response = await fetchJson<PlansCollectionEntity & { message?: string }>("/api/plans", {
        method: "PUT",
        body: JSON.stringify({
          plans: plansSetup.plans.map((item) => ({
            id: item.clientId.startsWith("temp-") ? undefined : item.clientId,
            name: item.name,
            amountCents: item.amountCents,
            billingCycle: item.billingCycle,
            weeklyFrequency: item.weeklyFrequency,
            classLimitKind: item.classLimitKind,
            classLimitValue: item.classLimitValue,
            includedModalityIds: item.includedModalityIds,
          })),
        }),
      })

      const plans = response.plans.map((item) => ({
        clientId: item.id,
        name: item.name,
        amountCents: item.amountCents,
        billingCycle: item.billingCycle,
        weeklyFrequency: item.weeklyFrequency,
        classLimitKind: item.classLimitKind,
        classLimitValue: item.classLimitValue,
        includedModalityIds: item.includedModalityIds,
      }))

      setPlansSetup({ plans })
      setModalityReferences(response.modalityReferences)
      setOpenItems([])
      setFeedback(response.message ?? "Planos atualizados com sucesso.")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar os planos.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planos e mensalidades</h1>
          <p className="text-muted-foreground">
            Gerencie planos, cobranças recorrentes e modalidades incluídas.
          </p>
        </div>
        <Button onClick={addPlan} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo plano
        </Button>
      </div>

      {feedback ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {feedback}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard title="Planos ativos" value={String(totalPlans)} icon={Wallet} />
        <MetricCard title="Ticket médio" value={formatCurrency(avgTicket)} icon={Receipt} />
        <MetricCard title="Frequência média" value={`${avgFrequency}x`} icon={CalendarClock} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planos da academia</CardTitle>
          <CardDescription>
            Esses planos ficam disponíveis para matrícula e cobrança dos alunos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="space-y-3">
            {plansSetup.plans.map((plan) => (
              <AccordionItem key={plan.clientId} value={plan.clientId} className="rounded-lg border">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex min-w-0 items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{plan.name || "Novo plano"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(plan.amountCents)} • {plan.billingCycle === "monthly"
                          ? "Mensal"
                          : plan.billingCycle === "quarterly"
                            ? "Trimestral"
                            : plan.billingCycle === "semiannual"
                              ? "Semestral"
                              : "Anual"}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 px-4 pb-4">
                  <div className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="grid gap-2">
                      <Label>Nome do plano</Label>
                      <Input
                        value={plan.name}
                        onChange={(event) =>
                          updatePlan(plan.clientId, (item) => ({ ...item, name: event.target.value }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Valor (R$)</Label>
                      <Input
                        inputMode="decimal"
                        placeholder="0,00"
                        value={formatCurrencyInputFromCents(plan.amountCents)}
                        onChange={(event) =>
                          updatePlan(plan.clientId, (item) => ({
                            ...item,
                            amountCents: parseCurrencyInputToCents(event.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Ciclo</Label>
                      <Select
                        value={plan.billingCycle}
                        onValueChange={(value) =>
                          updatePlan(plan.clientId, (item) => ({
                            ...item,
                            billingCycle: value as typeof item.billingCycle,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="semiannual">Semestral</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Frequência semanal</Label>
                      <Input
                        type="number"
                        min="0"
                        value={plan.weeklyFrequency ?? ""}
                        onChange={(event) =>
                          updatePlan(plan.clientId, (item) => ({
                            ...item,
                            weeklyFrequency: event.target.value ? Number(event.target.value) : null,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Limite de aulas</Label>
                      <Select
                        value={plan.classLimitKind}
                        onValueChange={(value) =>
                          updatePlan(plan.clientId, (item) => ({
                            ...item,
                            classLimitKind: value as typeof item.classLimitKind,
                            classLimitValue: value === "weekly" ? item.classLimitValue : null,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unlimited">Ilimitado</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {plan.classLimitKind === "weekly" ? (
                      <div className="grid gap-2">
                        <Label>Quantidade por semana</Label>
                        <Input
                          type="number"
                          min="1"
                          value={plan.classLimitValue ?? ""}
                          onChange={(event) =>
                            updatePlan(plan.clientId, (item) => ({
                              ...item,
                              classLimitValue: event.target.value ? Number(event.target.value) : null,
                            }))
                          }
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-2 rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Label>Modalidades incluídas</Label>
                      <Badge variant="outline">
                        {plan.includedModalityIds.length} selecionada{plan.includedModalityIds.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <ModalitiesMultiselect
                      selectedIds={plan.includedModalityIds}
                      modalityReferences={modalityReferences}
                      onSelectionChange={(ids) =>
                        updatePlan(plan.clientId, (item) => ({ ...item, includedModalityIds: ids }))
                      }
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removePlan(plan.clientId)}>
                      Remover plano
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="flex items-center justify-end pt-1">
            <Button disabled={isSaving} onClick={() => void save()}>
              <Save className="mr-2 h-4 w-4" />
              Salvar planos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: typeof Wallet
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
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
