"use client"

import { useState } from "react"
import { Plus, Dumbbell, Clock, Users, Trash2, Save, Check, ChevronsUpDown, ChevronDown, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
interface Activity {
  id: string
  name: string
  color: string
}

interface Modality {
  id: string
  name: string
  activityId: string
  ageGroup: "Adulto" | "Kids" | "Teen" | "Todos"
  duration: number
  capacity: number
}

// Dados mock
const activities: Activity[] = [
  { id: "1", name: "Jiu-Jitsu", color: "bg-blue-500" },
  { id: "2", name: "Muay Thai", color: "bg-red-500" },
  { id: "3", name: "Boxe", color: "bg-yellow-500" },
  { id: "4", name: "Judô", color: "bg-orange-500" },
  { id: "5", name: "Wrestling", color: "bg-purple-500" },
  { id: "6", name: "MMA", color: "bg-green-500" },
  { id: "7", name: "Kickboxing", color: "bg-pink-500" },
  { id: "8", name: "Capoeira", color: "bg-emerald-500" },
]

const ageGroups = [
  { value: "Adulto", label: "Adulto", description: "18+ anos" },
  { value: "Teen", label: "Teen", description: "13-17 anos" },
  { value: "Kids", label: "Kids", description: "6-12 anos" },
  { value: "Todos", label: "Todos", description: "Todas as idades" },
]

const durationOptions = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
  { value: "75", label: "75 min" },
  { value: "90", label: "90 min" },
  { value: "120", label: "120 min" },
]

const initialModalities: Modality[] = [
  { id: "1", name: "Jiu-Jitsu", activityId: "1", ageGroup: "Adulto", duration: 60, capacity: 24 },
  { id: "2", name: "Jiu-Jitsu Adulto", activityId: "1", ageGroup: "Adulto", duration: 60, capacity: 24 },
  { id: "3", name: "Jiu-Jitsu Infantil", activityId: "1", ageGroup: "Kids", duration: 45, capacity: 18 },
  { id: "4", name: "No-Gi", activityId: "1", ageGroup: "Adulto", duration: 60, capacity: 22 },
  { id: "5", name: "Jiu-Jitsu Kids", activityId: "1", ageGroup: "Kids", duration: 45, capacity: 18 },
  { id: "6", name: "Muay Thai Iniciante", activityId: "2", ageGroup: "Adulto", duration: 60, capacity: 20 },
]

// Componente Combobox para Atividade com busca
function ActivityCombobox({ 
  value, 
  onValueChange 
}: { 
  value: string
  onValueChange: (value: string) => void 
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  
  const selectedActivity = activities.find((a) => a.id === value)
  
  const filteredActivities = activities.filter((activity) =>
    activity.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 bg-input border-border hover:bg-secondary text-sm"
        >
          {selectedActivity ? (
            <span className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", selectedActivity.color)} />
              {selectedActivity.name}
            </span>
          ) : (
            <span className="text-muted-foreground">Selecionar...</span>
          )}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
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
              {filteredActivities.map((activity) => (
                <CommandItem
                  key={activity.id}
                  value={activity.id}
                  onSelect={() => {
                    onValueChange(activity.id)
                    setOpen(false)
                    setSearch("")
                  }}
                  className="flex items-center gap-2"
                >
                  <span className={cn("w-2 h-2 rounded-full", activity.color)} />
                  <span className="flex-1">{activity.name}</span>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === activity.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function ModalitiesPage() {
  const [modalities, setModalities] = useState<Modality[]>(initialModalities)
  const [hasChanges, setHasChanges] = useState(false)
  const [openItems, setOpenItems] = useState<string[]>(["1"])

  // Stats calculados
  const totalModalities = modalities.length
  const avgDuration = modalities.length > 0 
    ? Math.round(modalities.reduce((acc, m) => acc + m.duration, 0) / modalities.length)
    : 0
  const avgCapacity = modalities.length > 0
    ? Math.round(modalities.reduce((acc, m) => acc + m.capacity, 0) / modalities.length)
    : 0

  // Agrupar modalidades por atividade
  const modalitiesByActivity = modalities.reduce((acc, mod) => {
    const activityId = mod.activityId || "sem-atividade"
    if (!acc[activityId]) {
      acc[activityId] = []
    }
    acc[activityId].push(mod)
    return acc
  }, {} as Record<string, Modality[]>)

  const handleAddModality = (activityId?: string) => {
    const newModality: Modality = {
      id: `new-${Date.now()}`,
      name: "",
      activityId: activityId || "",
      ageGroup: "Adulto",
      duration: 60,
      capacity: 20,
    }
    setModalities([...modalities, newModality])
    setHasChanges(true)
    
    // Abrir o accordion da atividade
    if (activityId && !openItems.includes(activityId)) {
      setOpenItems([...openItems, activityId])
    }
  }

  const handleUpdateModality = (updated: Modality) => {
    setModalities(modalities.map((m) => m.id === updated.id ? updated : m))
    setHasChanges(true)
  }

  const handleDeleteModality = (id: string) => {
    setModalities(modalities.filter((m) => m.id !== id))
    setHasChanges(true)
  }

  const handleSave = () => {
    setHasChanges(false)
  }

  const getActivityById = (id: string) => activities.find((a) => a.id === id)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modalidades</h1>
          <p className="text-muted-foreground">
            Gerencie as modalidades oferecidas pela academia
          </p>
        </div>
        <Button onClick={() => handleAddModality()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova modalidade
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalModalities}</p>
                <p className="text-xs text-muted-foreground">Modalidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/10">
                <Clock className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgDuration}min</p>
                <p className="text-xs text-muted-foreground">Duração média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/10">
                <Users className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgCapacity}</p>
                <p className="text-xs text-muted-foreground">Capacidade média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accordions por Atividade */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Estrutura das modalidades</CardTitle>
          <CardDescription>
            Cada modalidade deve ficar vinculada a uma atividade principal. Clique para expandir e editar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion 
            type="multiple" 
            value={openItems}
            onValueChange={setOpenItems}
            className="space-y-3"
          >
            {activities.filter(activity => modalitiesByActivity[activity.id]?.length > 0).map((activity) => {
              const activityModalities = modalitiesByActivity[activity.id] || []
              
              return (
                <AccordionItem 
                  key={activity.id} 
                  value={activity.id}
                  className="border border-border rounded-lg bg-secondary/30 px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <span className={cn("w-3 h-3 rounded-full", activity.color)} />
                      <span className="font-semibold">{activity.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {activityModalities.length} modalidade{activityModalities.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3">
                      {activityModalities.map((modality) => (
                        <div 
                          key={modality.id}
                          className="flex flex-col gap-3 p-4 bg-card rounded-lg border border-border"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 flex-1">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                              <Input
                                value={modality.name}
                                onChange={(e) => handleUpdateModality({ ...modality, name: e.target.value })}
                                className="font-medium bg-transparent border-none px-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-secondary/50 rounded transition-colors"
                                placeholder="Nome da modalidade"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive h-8 w-8"
                              onClick={() => handleDeleteModality(modality.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Atividade</Label>
                              <ActivityCombobox 
                                value={modality.activityId} 
                                onValueChange={(value) => handleUpdateModality({ ...modality, activityId: value })}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Faixa etária</Label>
                              <Select 
                                value={modality.ageGroup}
                                onValueChange={(value) => handleUpdateModality({ ...modality, ageGroup: value as Modality["ageGroup"] })}
                              >
                                <SelectTrigger className="h-9 bg-input border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ageGroups.map((group) => (
                                    <SelectItem key={group.value} value={group.value}>
                                      <div className="flex items-center gap-2">
                                        <span>{group.label}</span>
                                        <span className="text-xs text-muted-foreground">({group.description})</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Duração</Label>
                              <Select 
                                value={String(modality.duration)}
                                onValueChange={(value) => handleUpdateModality({ ...modality, duration: parseInt(value) })}
                              >
                                <SelectTrigger className="h-9 bg-input border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {durationOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Capacidade</Label>
                              <Input
                                type="number"
                                value={modality.capacity}
                                onChange={(e) => handleUpdateModality({ ...modality, capacity: parseInt(e.target.value) || 0 })}
                                className="h-9 bg-input border-border"
                                min={1}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => handleAddModality(activity.id)}
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar modalidade em {activity.name}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
            
            {/* Modalidades sem atividade */}
            {modalitiesByActivity["sem-atividade"]?.length > 0 && (
              <AccordionItem 
                value="sem-atividade"
                className="border border-border rounded-lg bg-secondary/30 px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="font-semibold text-muted-foreground">Sem atividade</span>
                    <Badge variant="secondary" className="ml-2">
                      {modalitiesByActivity["sem-atividade"].length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-3">
                    {modalitiesByActivity["sem-atividade"].map((modality) => (
                      <div 
                        key={modality.id}
                        className="flex flex-col gap-3 p-4 bg-card rounded-lg border border-border"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <Input
                            value={modality.name}
                            onChange={(e) => handleUpdateModality({ ...modality, name: e.target.value })}
                            className="font-medium bg-transparent border-none px-0 h-8 focus-visible:ring-0"
                            placeholder="Nome da modalidade"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-8 w-8"
                            onClick={() => handleDeleteModality(modality.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Atividade</Label>
                            <ActivityCombobox 
                              value={modality.activityId} 
                              onValueChange={(value) => handleUpdateModality({ ...modality, activityId: value })}
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Faixa etária</Label>
                            <Select 
                              value={modality.ageGroup}
                              onValueChange={(value) => handleUpdateModality({ ...modality, ageGroup: value as Modality["ageGroup"] })}
                            >
                              <SelectTrigger className="h-9 bg-input border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ageGroups.map((group) => (
                                  <SelectItem key={group.value} value={group.value}>
                                    {group.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Duração</Label>
                            <Select 
                              value={String(modality.duration)}
                              onValueChange={(value) => handleUpdateModality({ ...modality, duration: parseInt(value) })}
                            >
                              <SelectTrigger className="h-9 bg-input border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {durationOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Capacidade</Label>
                            <Input
                              type="number"
                              value={modality.capacity}
                              onChange={(e) => handleUpdateModality({ ...modality, capacity: parseInt(e.target.value) || 0 })}
                              className="h-9 bg-input border-border"
                              min={1}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-6 border-t border-border mt-6">
            <Button
              className="gap-2"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4" />
              Salvar modalidades
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
