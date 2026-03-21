"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronsUpDown, Clock3, Dumbbell, Plus, Save, Trash2, Users } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { fetchJson } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import {
  activityCategoryOptions,
  formatActivityCategory,
  type AgeGroupValue,
  type ActivityCategoryValue,
  type ModalityEntity,
} from "@/apps/api/src/modules/modalities/domain/modality"
import type { ModalitiesDashboardState } from "@/modules/modalities/types"

interface ModalitiesResponse {
  modalities: ModalityEntity[]
  activityCategories?: string[]
  message?: string
}

function defaultStructure(): ModalitiesDashboardState {
  return { modalities: [] }
}

const ageGroupOptions: Array<{ value: AgeGroupValue; label: string }> = [
  { value: "kids", label: "Kids" },
  { value: "juvenile", label: "Juvenil" },
  { value: "adult", label: "Adulto" },
  { value: "mixed", label: "Misto" },
]

function formatAgeGroups(ageGroups: AgeGroupValue[]) {
  if (ageGroups.length === 0) {
    return "Selecione"
  }

  return ageGroupOptions
    .filter((option) => ageGroups.includes(option.value))
    .map((option) => option.label)
    .join(", ")
}

function getActivityColor(value: string) {
  const colors = [
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
  const index = activityCategoryOptions.findIndex((option) => option.value === value)
  return colors[index >= 0 ? index % colors.length : 0]
}

function toDashboardActivityCategory(
  value: string | null | undefined,
  fallback?: string
): ActivityCategoryValue | "" {
  if (value && activityCategoryOptions.some((option) => option.value === value)) {
    return value as ActivityCategoryValue
  }

  if (fallback && activityCategoryOptions.some((option) => option.value === fallback)) {
    return fallback as ActivityCategoryValue
  }

  return ""
}

function ActivityCombobox({
  value,
  options,
  onValueChange,
}: {
  value: string
  options: string[]
  onValueChange: (value: ActivityCategoryValue) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredOptions = options.filter((option) =>
    formatActivityCategory(option).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between bg-input text-sm hover:bg-secondary"
        >
          {value ? (
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", getActivityColor(value))} />
              <span className="truncate">{formatActivityCategory(value)}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Selecionar...</span>
          )}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar atividade..."
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>Nenhuma atividade encontrada.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onValueChange(option as ActivityCategoryValue)
                    setOpen(false)
                    setSearch("")
                  }}
                  className="flex items-center gap-2"
                >
                  <span className={cn("h-2 w-2 rounded-full", getActivityColor(option))} />
                  <span className="flex-1">{formatActivityCategory(option)}</span>
                  <Check className={cn("h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function ModalitiesDashboardScreen() {
  const [structure, setStructure] = useState<ModalitiesDashboardState>(defaultStructure)
  const [activityCategories, setActivityCategories] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [openItems, setOpenItems] = useState<string[]>([])
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await fetchJson<ModalitiesResponse>("/api/modalities")
        if (!active) return

        const categories = response.activityCategories ?? []
        const modalities = response.modalities.map((item) => ({
          clientId: item.id,
          activityCategory: toDashboardActivityCategory(item.activityCategory, categories[0]),
          name: item.name,
          ageGroups: item.ageGroups,
          defaultDurationMinutes: item.defaultDurationMinutes,
          defaultCapacity: item.defaultCapacity,
        }))

        setActivityCategories(categories)
        setStructure({ modalities })
        setOpenItems([])
      } catch (error) {
        if (active) {
          setFeedback(error instanceof Error ? error.message : "Não foi possível carregar as modalidades.")
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const groupedModalities = useMemo(() => {
    const groups = new Map<string, ModalitiesDashboardState["modalities"]>()

    for (const category of activityCategories) {
      groups.set(category, [])
    }

    for (const modality of structure.modalities) {
      const key = modality.activityCategory || "uncategorized"
      const current = groups.get(key) ?? []
      current.push(modality)
      groups.set(key, current)
    }

    return Array.from(groups.entries()).filter(([, items]) => items.length > 0 || activityCategories.length === 0)
  }, [activityCategories, structure.modalities])

  const totalModalities = structure.modalities.length
  const avgDuration = totalModalities
    ? Math.round(
        structure.modalities.reduce((total, item) => total + item.defaultDurationMinutes, 0) /
          totalModalities
      )
    : 0
  const avgCapacity = totalModalities
    ? Math.round(
        structure.modalities.reduce((total, item) => total + item.defaultCapacity, 0) / totalModalities
      )
    : 0

  function updateModality(
    clientId: string,
    updater: (modality: ModalitiesDashboardState["modalities"][number]) => ModalitiesDashboardState["modalities"][number]
  ) {
    setStructure((current) => ({
      ...current,
      modalities: current.modalities.map((item) => (item.clientId === clientId ? updater(item) : item)),
    }))
  }

  function addModality(activityCategory?: string) {
    const category = toDashboardActivityCategory(activityCategory, activityCategories[0])
    const newModality = {
      clientId: `temp-${crypto.randomUUID()}`,
      name: "",
      activityCategory: category,
      ageGroups: ["adult"] as AgeGroupValue[],
      defaultDurationMinutes: 60,
      defaultCapacity: 20,
    }

    setStructure((current) => ({
      ...current,
      modalities: [...current.modalities, newModality],
    }))

    if (category && !openItems.includes(category)) {
      setOpenItems((current) => [...current, category])
    }
  }

  function removeModality(clientId: string) {
    setStructure((current) => ({
      ...current,
      modalities: current.modalities.filter((item) => item.clientId !== clientId),
    }))
  }

  function requestRemoveModality(clientId: string) {
    if (clientId.startsWith("temp-")) {
      removeModality(clientId)
      return
    }

    setPendingRemovalId(clientId)
  }

  function confirmRemoveModality() {
    if (!pendingRemovalId) {
      return
    }

    removeModality(pendingRemovalId)
    setPendingRemovalId(null)
  }

  const pendingRemovalModality = pendingRemovalId
    ? structure.modalities.find((item) => item.clientId === pendingRemovalId) ?? null
    : null

  async function save() {
    setIsSaving(true)
    try {
      const response = await fetchJson<ModalitiesResponse>("/api/modalities", {
        method: "PUT",
        body: JSON.stringify({
          modalities: structure.modalities.map((item) => ({
            id: item.clientId.startsWith("temp-") ? undefined : item.clientId,
            activityCategory: item.activityCategory,
            name: item.name,
            ageGroups: item.ageGroups,
            defaultDurationMinutes: item.defaultDurationMinutes,
            defaultCapacity: item.defaultCapacity,
          })),
        }),
      })

      const categories = response.activityCategories ?? activityCategories
      const modalities = response.modalities.map((item) => ({
        clientId: item.id,
        activityCategory: toDashboardActivityCategory(item.activityCategory, categories[0]),
        name: item.name,
        ageGroups: item.ageGroups,
        defaultDurationMinutes: item.defaultDurationMinutes,
        defaultCapacity: item.defaultCapacity,
      }))

      setActivityCategories(categories)
      setStructure({ modalities })
      setOpenItems([])
      setFeedback(response.message ?? "Modalidades atualizadas com sucesso.")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar as modalidades.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modalidades</h1>
          <p className="text-muted-foreground">
            Gerencie as modalidades vinculadas às atividades principais da academia.
          </p>
        </div>
      </div>

      {feedback ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {feedback}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard title="Modalidades" value={String(totalModalities)} icon={Dumbbell} />
        <MetricCard title="Duração média" value={`${avgDuration} min`} icon={Clock3} />
        <MetricCard title="Capacidade média" value={String(avgCapacity)} icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estrutura das modalidades</CardTitle>
          <CardDescription>
            Cada modalidade fica vinculada a uma atividade principal da academia. Isso será refletido nas turmas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="space-y-3">
            {groupedModalities.map(([activityCategory, items]) => (
              <AccordionItem key={activityCategory} value={activityCategory} className="rounded-lg border">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex min-w-0 items-center gap-3 text-left">
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", getActivityColor(activityCategory))} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{formatActivityCategory(activityCategory)}</p>
                      <p className="text-xs text-muted-foreground">
                        {items.length} modalidade{items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 px-4 pb-4">
                  {items.map((modality) => (
                    <div
                      key={modality.clientId}
                      className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-2 xl:grid-cols-6"
                    >
                      <div className="grid gap-2">
                        <Label>Atividade</Label>
                        <ActivityCombobox
                          value={modality.activityCategory ?? ""}
                          options={activityCategories}
                          onValueChange={(value) =>
                            updateModality(modality.clientId, (item) => ({ ...item, activityCategory: value }))
                          }
                        />
                      </div>

                      <div className="grid gap-2 xl:col-span-2">
                        <Label>Nome da modalidade</Label>
                        <Input
                          value={modality.name}
                          onChange={(event) =>
                            updateModality(modality.clientId, (item) => ({ ...item, name: event.target.value }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          {modality.activityCategory
                            ? `${formatActivityCategory(modality.activityCategory)} > ${modality.name || "Nova modalidade"}`
                            : "Vincule esta modalidade a uma atividade principal."}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label>Faixa etária</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="justify-between" type="button" variant="outline">
                              <span className="truncate">{formatAgeGroups(modality.ageGroups)}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            {ageGroupOptions.map((option) => (
                              <DropdownMenuCheckboxItem
                                key={option.value}
                                checked={modality.ageGroups.includes(option.value)}
                                onCheckedChange={(checked) =>
                                  updateModality(modality.clientId, (item) => ({
                                    ...item,
                                    ageGroups: checked
                                      ? [...item.ageGroups, option.value]
                                      : item.ageGroups.filter((value) => value !== option.value),
                                  }))
                                }
                              >
                                {option.label}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid gap-2">
                        <Label>Duração (min)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={modality.defaultDurationMinutes}
                          onChange={(event) =>
                            updateModality(modality.clientId, (item) => ({
                              ...item,
                              defaultDurationMinutes: Number(event.target.value) || 0,
                            }))
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <Label>Capacidade</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => requestRemoveModality(modality.clientId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          value={modality.defaultCapacity}
                          onChange={(event) =>
                            updateModality(modality.clientId, (item) => ({
                              ...item,
                              defaultCapacity: Number(event.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-start pt-1">
                    <Button variant="outline" onClick={() => addModality(activityCategory)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar modalidade
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="flex items-center justify-end pt-1">
            <Button disabled={isSaving} onClick={() => void save()}>
              <Save className="mr-2 h-4 w-4" />
              Salvar modalidades
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(pendingRemovalModality)} onOpenChange={(open) => !open && setPendingRemovalId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Desativar modalidade</DialogTitle>
            <DialogDescription>
              {pendingRemovalModality?.name
                ? `Se você confirmar, a modalidade "${pendingRemovalModality.name}" deixará de ser oferecida.`
                : "Se você confirmar, esta modalidade deixará de ser oferecida."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>As turmas dessa modalidade serão desativadas.</p>
            <p>Os professores continuarão ativos, mas essa modalidade sairá das listas ativas até ser restaurada.</p>
            <p>O histórico dos alunos será preservado.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingRemovalId(null)}>
              Não
            </Button>
            <Button type="button" variant="destructive" onClick={confirmRemoveModality}>
              Sim, desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  icon: typeof Dumbbell
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
