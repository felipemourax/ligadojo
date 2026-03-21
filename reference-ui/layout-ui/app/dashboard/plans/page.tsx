"use client"

import { useState } from "react"
import { Plus, CreditCard, TrendingUp, CalendarDays, Trash2, Save, Check, ChevronsUpDown, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Tipos
interface Modality {
  id: string
  name: string
  ageGroup: string
  activityColor: string
}

interface Plan {
  id: string
  name: string
  valueInCents: number
  cycle: "mensal" | "trimestral" | "semestral" | "anual"
  weeklyFrequency: number | null
  classLimit: "ilimitado" | number
  modalityIds: string[]
}

// Dados mock das modalidades disponíveis
const availableModalities: Modality[] = [
  { id: "1", name: "Jiu-Jitsu", ageGroup: "Adulto", activityColor: "bg-blue-500" },
  { id: "2", name: "Jiu-Jitsu Adulto", ageGroup: "Adulto", activityColor: "bg-blue-500" },
  { id: "3", name: "Jiu-Jitsu Infantil", ageGroup: "Kids", activityColor: "bg-blue-500" },
  { id: "4", name: "No-Gi", ageGroup: "Adulto", activityColor: "bg-blue-500" },
  { id: "5", name: "Jiu-Jitsu Kids", ageGroup: "Kids", activityColor: "bg-blue-500" },
  { id: "6", name: "Muay Thai Iniciante", ageGroup: "Adulto", activityColor: "bg-red-500" },
  { id: "7", name: "Muay Thai Avançado", ageGroup: "Adulto", activityColor: "bg-red-500" },
  { id: "8", name: "Boxe", ageGroup: "Adulto", activityColor: "bg-yellow-500" },
  { id: "9", name: "Boxe Kids", ageGroup: "Kids", activityColor: "bg-yellow-500" },
  { id: "10", name: "Wrestling", ageGroup: "Adulto", activityColor: "bg-purple-500" },
]

const cycles = [
  { value: "mensal", label: "Mensal" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
]

const classLimits = [
  { value: "ilimitado", label: "Ilimitado" },
  { value: "1", label: "1 aula/semana" },
  { value: "2", label: "2 aulas/semana" },
  { value: "3", label: "3 aulas/semana" },
  { value: "4", label: "4 aulas/semana" },
  { value: "5", label: "5 aulas/semana" },
]

const initialPlans: Plan[] = [
  { 
    id: "1", 
    name: "Mensal Básico", 
    valueInCents: 18000, 
    cycle: "mensal", 
    weeklyFrequency: 0,
    classLimit: "ilimitado",
    modalityIds: ["1", "2", "4"]
  },
  { 
    id: "2", 
    name: "Essencial", 
    valueInCents: 18900, 
    cycle: "mensal", 
    weeklyFrequency: 0,
    classLimit: "ilimitado",
    modalityIds: ["1", "2", "3", "4", "5"]
  },
  { 
    id: "3", 
    name: "Família", 
    valueInCents: 35000, 
    cycle: "mensal", 
    weeklyFrequency: 0,
    classLimit: "ilimitado",
    modalityIds: ["1", "2", "3", "4", "5", "6"]
  },
  { 
    id: "4", 
    name: "Premium", 
    valueInCents: 45000, 
    cycle: "mensal", 
    weeklyFrequency: 0,
    classLimit: "ilimitado",
    modalityIds: ["1", "2", "3", "4", "5", "6", "7", "8"]
  },
]

// Componente Multiselect para Modalidades
function ModalitiesMultiselect({ 
  selectedIds, 
  onSelectionChange 
}: { 
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void 
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  
  const selectedModalities = availableModalities.filter((m) => selectedIds.includes(m.id))
  
  const filteredModalities = availableModalities.filter((modality) =>
    modality.name.toLowerCase().includes(search.toLowerCase()) ||
    modality.ageGroup.toLowerCase().includes(search.toLowerCase())
  )

  // Agrupar por faixa etária
  const modalitiesByAge = filteredModalities.reduce((acc, mod) => {
    if (!acc[mod.ageGroup]) {
      acc[mod.ageGroup] = []
    }
    acc[mod.ageGroup].push(mod)
    return acc
  }, {} as Record<string, Modality[]>)

  const toggleModality = (modalityId: string) => {
    const newIds = selectedIds.includes(modalityId)
      ? selectedIds.filter((id) => id !== modalityId)
      : [...selectedIds, modalityId]
    onSelectionChange(newIds)
  }

  const selectAll = () => {
    onSelectionChange(availableModalities.map((m) => m.id))
  }

  const clearAll = () => {
    onSelectionChange([])
  }

  const removeModality = (id: string) => {
    onSelectionChange(selectedIds.filter((i) => i !== id))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-9 bg-input border-border hover:bg-secondary text-sm py-2"
          >
            <span className="text-muted-foreground">
              {selectedIds.length === 0 
                ? "Selecionar modalidades..." 
                : `${selectedIds.length} modalidade${selectedIds.length !== 1 ? 's' : ''} selecionada${selectedIds.length !== 1 ? 's' : ''}`
              }
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
              
              {/* Ações rápidas */}
              <CommandGroup>
                <div className="flex gap-2 p-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-7 text-xs"
                    onClick={selectAll}
                  >
                    Selecionar todas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-7 text-xs"
                    onClick={clearAll}
                  >
                    Limpar
                  </Button>
                </div>
              </CommandGroup>
              
              <CommandSeparator />
              
              {Object.entries(modalitiesByAge).map(([ageGroup, modalities]) => (
                <CommandGroup key={ageGroup} heading={ageGroup}>
                  {modalities.map((modality) => (
                    <CommandItem
                      key={modality.id}
                      value={modality.id}
                      onSelect={() => toggleModality(modality.id)}
                      className="flex items-center gap-2"
                    >
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border border-primary",
                        selectedIds.includes(modality.id) 
                          ? "bg-primary text-primary-foreground" 
                          : "opacity-50"
                      )}>
                        {selectedIds.includes(modality.id) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span className={cn("w-2 h-2 rounded-full", modality.activityColor)} />
                      <span className="flex-1">{modality.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Tags das modalidades selecionadas */}
      {selectedModalities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedModalities.map((modality) => (
            <Badge 
              key={modality.id} 
              variant="secondary" 
              className="gap-1 pr-1 text-xs"
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", modality.activityColor)} />
              {modality.name}
              <button
                onClick={() => removeModality(modality.id)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans)
  const [hasChanges, setHasChanges] = useState(false)
  const [openItems, setOpenItems] = useState<string[]>(["1"])

  // Stats calculados
  const totalPlans = plans.length
  const avgTicket = plans.length > 0
    ? Math.round(plans.reduce((acc, p) => acc + p.valueInCents, 0) / plans.length)
    : 0
  const avgFrequency = plans.reduce((acc, p) => acc + (p.weeklyFrequency || 0), 0) / (plans.length || 1)

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100)
  }

  const handleAddPlan = () => {
    const newPlan: Plan = {
      id: `new-${Date.now()}`,
      name: "",
      valueInCents: 0,
      cycle: "mensal",
      weeklyFrequency: null,
      classLimit: "ilimitado",
      modalityIds: [],
    }
    setPlans([...plans, newPlan])
    setHasChanges(true)
    setOpenItems([...openItems, newPlan.id])
  }

  const handleUpdatePlan = (updated: Plan) => {
    setPlans(plans.map((p) => p.id === updated.id ? updated : p))
    setHasChanges(true)
  }

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter((p) => p.id !== id))
    setHasChanges(true)
  }

  const handleSave = () => {
    setHasChanges(false)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planos e Mensalidades</h1>
          <p className="text-muted-foreground">
            Gerencie planos, cobranças recorrentes e modalidades incluídas
          </p>
        </div>
        <Button onClick={handleAddPlan} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo plano
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPlans}</p>
                <p className="text-xs text-muted-foreground">Planos ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/10">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(avgTicket)}</p>
                <p className="text-xs text-muted-foreground">Ticket médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/10">
                <CalendarDays className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgFrequency.toFixed(0)}x</p>
                <p className="text-xs text-muted-foreground">Frequência média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planos com Accordion */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Planos da academia</CardTitle>
          <CardDescription>
            Esses planos ficam disponíveis para matrícula e cobrança dos alunos. Clique para expandir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion 
            type="multiple" 
            value={openItems}
            onValueChange={setOpenItems}
            className="space-y-3"
          >
            {plans.map((plan) => {
              const selectedCount = plan.modalityIds.length
              
              return (
                <AccordionItem 
                  key={plan.id} 
                  value={plan.id}
                  className="border border-border rounded-lg bg-secondary/30 px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col items-start gap-1 min-w-0">
                        <span className="font-semibold truncate">
                          {plan.name || "Novo plano"}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {formatCurrency(plan.valueInCents)}
                          </span>
                          <span>/</span>
                          <span>{cycles.find(c => c.value === plan.cycle)?.label}</span>
                          <span className="hidden sm:inline">|</span>
                          <span className="hidden sm:inline">{selectedCount} modalidade{selectedCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4 pt-2">
                      {/* Campos do plano */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Nome do plano</Label>
                          <Input
                            value={plan.name}
                            onChange={(e) => handleUpdatePlan({ ...plan, name: e.target.value })}
                            className="h-9 bg-input border-border"
                            placeholder="Ex: Mensal Básico"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Valor</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                            <Input
                              type="number"
                              value={(plan.valueInCents / 100).toFixed(2)}
                              onChange={(e) => handleUpdatePlan({ ...plan, valueInCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                              className="h-9 bg-input border-border pl-10"
                              min={0}
                              step={0.01}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Ciclo</Label>
                          <Select 
                            value={plan.cycle}
                            onValueChange={(value) => handleUpdatePlan({ ...plan, cycle: value as Plan["cycle"] })}
                          >
                            <SelectTrigger className="h-9 bg-input border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {cycles.map((cycle) => (
                                <SelectItem key={cycle.value} value={cycle.value}>
                                  {cycle.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Limite de aulas</Label>
                          <Select 
                            value={plan.classLimit === "ilimitado" ? "ilimitado" : String(plan.classLimit)}
                            onValueChange={(value) => handleUpdatePlan({ 
                              ...plan, 
                              classLimit: value === "ilimitado" ? "ilimitado" : parseInt(value) 
                            })}
                          >
                            <SelectTrigger className="h-9 bg-input border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {classLimits.map((limit) => (
                                <SelectItem key={limit.value} value={limit.value}>
                                  {limit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Modalidades com Multiselect */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Modalidades incluídas</Label>
                        <ModalitiesMultiselect
                          selectedIds={plan.modalityIds}
                          onSelectionChange={(ids) => handleUpdatePlan({ ...plan, modalityIds: ids })}
                        />
                      </div>

                      {/* Ações do plano */}
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir plano
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-6 border-t border-border mt-6">
            <Button
              className="gap-2"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4" />
              Salvar planos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
