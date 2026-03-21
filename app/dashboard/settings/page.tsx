"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Building2,
  Check,
  ChevronsUpDown,
  Clock3,
  CreditCard,
  Dumbbell,
  ImageIcon,
  Info,
  KeyRound,
  MapPin,
  Plus,
  Save,
  Shield,
  ShieldAlert,
  Trash2,
  Users,
  Wallet,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { fetchJson } from "@/lib/api/client"
import { formatCurrencyInputFromCents, parseCurrencyInputToCents } from "@/lib/currency-input"
import type { SessionApiResponse } from "@/lib/domain/session-api"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type {
  AcademyInfoStepData,
  BrandingStepData,
  ClassStructureStepData,
  LocationStepData,
  OnboardingStepKey,
  PlansStepData,
  TenantOnboardingEntity,
  AgeGroupValue,
} from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding"
import { activityCategoryOptions, formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"
import type { FinanceSettingsData } from "@/apps/api/src/modules/finance/domain/finance-settings"
import {
  financePlanTransitionChargeHandlingOptions,
  getFinancePlanTransitionChargeHandlingOption,
} from "@/apps/api/src/modules/finance/domain/finance-settings"

interface SettingsResponse {
  tenant: {
    id: string
    displayName: string
    slug: string
  }
  onboarding: TenantOnboardingEntity | null
}

interface FinanceSettingsResponse {
  settings: FinanceSettingsData
  message?: string
}

const stepLabels: Record<OnboardingStepKey, string> = {
  academy_info: "Informações",
  location: "Localização",
  class_structure: "Estrutura",
  plans: "Planos",
  branding: "Identidade visual",
  payments: "Pagamentos",
}

function defaultAcademyInfo(): AcademyInfoStepData {
  return {
    legalName: "",
    phone: "",
    contactEmail: "",
    document: "",
    foundedYear: "",
    activityCategories: [],
  }
}

function defaultLocation(): LocationStepData {
  return {
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    country: "Brasil",
  }
}

function defaultClassStructure(): ClassStructureStepData {
  return {
    modalities: [],
  }
}

function defaultPlans(): PlansStepData {
  return {
    plans: [],
  }
}

function defaultBranding(): BrandingStepData {
  return {
    appName: "",
    logoUrl: "",
    bannerUrl: "",
    primaryColor: "#0f766e",
    secondaryColor: "#f59e0b",
  }
}

function defaultFinanceSettings(): FinanceSettingsData {
  return {
    acceptedMethods: [],
    gateway: "",
    planTransitionPolicy: "next_cycle",
    planTransitionChargeHandling: "charge_difference",
    delinquencyGraceDays: 0,
    delinquencyBlocksNewClasses: false,
    delinquencyRemovesCurrentClasses: false,
    delinquencyRecurringMode: "continue",
    delinquencyAccumulatesDebt: true,
  }
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
}

function maskZipCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  return digits.replace(/(\d{5})(\d)/, "$1-$2")
}

function maskDocument(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
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

function formatModalityLabel(modality: { name: string; ageGroups: AgeGroupValue[] }) {
  const groups = formatAgeGroups(modality.ageGroups)
  return groups ? `${modality.name} (${groups})` : modality.name
}

function formatBillingCycleLabel(value: PlansStepData["plans"][number]["billingCycle"]) {
  switch (value) {
    case "monthly":
      return "Mensal"
    case "quarterly":
      return "Trimestral"
    case "semiannual":
      return "Semestral"
    case "yearly":
      return "Anual"
  }
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
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

function ActivityCategoriesMultiselect({
  values,
  onChange,
}: {
  values: string[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredOptions = activityCategoryOptions.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  function toggleValue(value: string) {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-auto min-h-9 w-full justify-between bg-input py-2 text-sm hover:bg-secondary">
            <span className="text-muted-foreground">
              {values.length === 0
                ? "Selecionar atividades..."
                : `${values.length} atividade${values.length !== 1 ? "s" : ""} selecionada${values.length !== 1 ? "s" : ""}`}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
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
                    key={option.value}
                    value={option.value}
                    onSelect={() => toggleValue(option.value)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border border-primary",
                        values.includes(option.value) ? "bg-primary text-primary-foreground" : "opacity-50"
                      )}
                    >
                      {values.includes(option.value) ? <Check className="h-3 w-3" /> : null}
                    </div>
                    <span className={cn("h-2 w-2 rounded-full", getActivityColor(option.value))} />
                    <span className="flex-1">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <button
              key={value}
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs"
              onClick={() => toggleValue(value)}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", getActivityColor(value))} />
              {formatActivityCategory(value)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ActivityCombobox({
  value,
  options,
  onValueChange,
}: {
  value: string
  options: string[]
  onValueChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredOptions = options.filter((option) =>
    formatActivityCategory(option).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 w-full justify-between bg-input text-sm hover:bg-secondary">
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
                    onValueChange(option)
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

export default function DashboardSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [settings, setSettings] = useState<SettingsResponse | null>(null)
  const [session, setSession] = useState<SessionApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const [academyInfo, setAcademyInfo] = useState<AcademyInfoStepData>(defaultAcademyInfo)
  const [location, setLocation] = useState<LocationStepData>(defaultLocation)
  const [classStructure, setClassStructure] = useState<ClassStructureStepData>(defaultClassStructure)
  const [plansSetup, setPlansSetup] = useState<PlansStepData>(defaultPlans)
  const [brandingSetup, setBrandingSetup] = useState<BrandingStepData>(defaultBranding)
  const [financeSettings, setFinanceSettings] = useState<FinanceSettingsData>(defaultFinanceSettings)
  const [emailForm, setEmailForm] = useState({ nextEmail: "", currentPassword: "" })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", nextPassword: "", confirmPassword: "" })
  const [isTransitionChargeDialogOpen, setIsTransitionChargeDialogOpen] = useState(false)
  const rawTab = searchParams.get("tab")
  const activeTab =
    rawTab === "structure"
      ? "modalities"
      : rawTab === "teachers"
        ? "plans"
        : (rawTab ?? "general")

  const modalities = settings?.onboarding?.references.modalities ?? []

  async function loadSettings() {
    setIsLoading(true)
    try {
      const [settingsResponse, sessionResponse, financeSettingsResponse] = await Promise.all([
        fetchJson<SettingsResponse>("/api/onboarding/academy-setup"),
        fetchJson<SessionApiResponse>("/api/me/memberships"),
        fetchJson<FinanceSettingsResponse>("/api/finance/settings"),
      ])

      setSettings(settingsResponse)
      setSession(sessionResponse)
      setAcademyInfo(settingsResponse.onboarding?.academyInfo ?? defaultAcademyInfo())
      setLocation(settingsResponse.onboarding?.location ?? defaultLocation())
      setClassStructure(settingsResponse.onboarding?.classStructure ?? defaultClassStructure())
      setPlansSetup(settingsResponse.onboarding?.plansSetup ?? defaultPlans())
      setBrandingSetup(settingsResponse.onboarding?.brandingSetup ?? defaultBranding())
      setFinanceSettings(financeSettingsResponse.settings)
      setEmailForm({ nextEmail: sessionResponse.user.email ?? "", currentPassword: "" })
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar as configurações.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSettings()
  }, [])

  async function saveStep(step: OnboardingStepKey, data: unknown) {
    setIsSaving(true)
    try {
      const response = await fetchJson<SettingsResponse>("/api/onboarding/academy-setup", {
        method: "PATCH",
        body: JSON.stringify({
          step,
          data,
        }),
      })
      setSettings(response)
      setFeedback(`${stepLabels[step]} atualizada com sucesso.`)
      return response
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar as alterações.")
      return null
    } finally {
      setIsSaving(false)
    }
  }

  async function saveFinanceSettings() {
    setIsSaving(true)

    try {
      const response = await fetchJson<FinanceSettingsResponse>("/api/finance/settings", {
        method: "PATCH",
        body: JSON.stringify(financeSettings),
      })

      setFinanceSettings(response.settings)
      setFeedback(response.message ?? "Políticas financeiras atualizadas com sucesso.")
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as políticas financeiras."
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleZipLookup(zipCode: string) {
    const normalized = zipCode.replace(/\D/g, "")

    if (normalized.length !== 8) {
      return
    }

    try {
      const address = await fetchJson<{
        zipCode: string
        street: string
        complement: string
        city: string
        state: string
        country: string
      }>(`/api/location/lookup?zipCode=${normalized}`)

      setLocation((current) => ({
        ...current,
        zipCode: maskZipCode(address.zipCode),
        street: address.street,
        complement: current.complement || address.complement,
        city: address.city,
        state: address.state,
        country: address.country,
      }))
    } catch {}
  }

  async function uploadBranding(kind: "logo" | "banner", file: File) {
    const formData = new FormData()
    formData.append("kind", kind)
    formData.append("file", file)

    const response = await fetch("/api/uploads/branding", {
      method: "POST",
      body: formData,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.message ?? "Não foi possível enviar a imagem.")
    }

    return data as { url: string }
  }

  if (isLoading) {
    return <section className="space-y-4"><div className="h-10 w-56 animate-pulse rounded bg-muted" /><div className="h-40 rounded-3xl bg-muted" /></section>
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Edite as informações da academia, a estrutura do negócio, o branding do app e a segurança da conta.
          </p>
        </div>
      </div>

      {feedback ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {feedback}
        </div>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(value) => router.replace(`/dashboard/settings?tab=${value}`, { scroll: false })}
        className="space-y-6"
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 border border-border bg-background p-1">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building2 className="mr-2 h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="modalities" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            Modalidades
          </TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="mr-2 h-4 w-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ImageIcon className="mr-2 h-4 w-4" />
            Identidade visual
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="mr-2 h-4 w-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="mr-2 h-4 w-4" />
            Conta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <SettingsSectionHeader
                icon={Building2}
                title="Informações da academia"
                description="Atualize os dados institucionais e comerciais do seu negócio."
              />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Nome da academia</Label>
                <Input value={academyInfo.legalName} onChange={(e) => setAcademyInfo((c) => ({ ...c, legalName: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>WhatsApp</Label>
                <Input value={academyInfo.phone} onChange={(e) => setAcademyInfo((c) => ({ ...c, phone: maskPhone(e.target.value) }))} />
              </div>
              <div className="grid gap-2">
                <Label>E-mail de contato</Label>
                <Input type="email" value={academyInfo.contactEmail} onChange={(e) => setAcademyInfo((c) => ({ ...c, contactEmail: e.target.value.toLowerCase() }))} />
              </div>
              <div className="grid gap-2">
                <Label>CNPJ</Label>
                <Input value={academyInfo.document} onChange={(e) => setAcademyInfo((c) => ({ ...c, document: maskDocument(e.target.value) }))} />
              </div>
              <div className="grid gap-2">
                <Label>Ano de fundação</Label>
                <Input value={academyInfo.foundedYear} onChange={(e) => setAcademyInfo((c) => ({ ...c, foundedYear: e.target.value.replace(/\D/g, "").slice(0, 4) }))} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button disabled={isSaving} onClick={() => void saveStep("academy_info", academyInfo)}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar informações
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <SettingsSectionHeader
                icon={MapPin}
                title="Localização"
                description="Esses dados são usados para landing page, mapa e contato."
              />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>CEP</Label>
                <Input
                  value={location.zipCode}
                  onChange={(e) => {
                    const next = maskZipCode(e.target.value)
                    setLocation((c) => ({ ...c, zipCode: next }))
                    if (next.replace(/\D/g, "").length === 8) {
                      void handleZipLookup(next)
                    }
                  }}
                  onBlur={() => void handleZipLookup(location.zipCode)}
                />
              </div>
              <div className="grid gap-2">
                <Label>País</Label>
                <Input value={location.country} onChange={(e) => setLocation((c) => ({ ...c, country: e.target.value }))} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Rua</Label>
                <Input value={location.street} onChange={(e) => setLocation((c) => ({ ...c, street: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Número</Label>
                <Input value={location.number} onChange={(e) => setLocation((c) => ({ ...c, number: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Complemento</Label>
                <Input value={location.complement} onChange={(e) => setLocation((c) => ({ ...c, complement: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Cidade</Label>
                <Input value={location.city} onChange={(e) => setLocation((c) => ({ ...c, city: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Input value={location.state} onChange={(e) => setLocation((c) => ({ ...c, state: e.target.value }))} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button disabled={isSaving} onClick={() => void saveStep("location", location)}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar localização
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modalities" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Estrutura das modalidades</CardTitle>
              <CardDescription>
                Ajuste atividades/categorias e as modalidades vinculadas. Isso será refletido nas turmas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MetricCard
                  title="Modalidades"
                  value={String(classStructure.modalities.length)}
                  icon={Dumbbell}
                />
                <MetricCard
                  title="Duração média"
                  value={`${Math.round(classStructure.modalities.reduce((sum, item) => sum + item.defaultDurationMinutes, 0) / Math.max(classStructure.modalities.length, 1))} min`}
                  icon={Clock3}
                />
                <MetricCard
                  title="Capacidade média"
                  value={String(Math.round(classStructure.modalities.reduce((sum, item) => sum + item.defaultCapacity, 0) / Math.max(classStructure.modalities.length, 1)))}
                  icon={Users}
                />
              </div>

              <div className="grid gap-2 rounded-2xl border border-border p-4">
                <Label>Atividades / categorias</Label>
                <ActivityCategoriesMultiselect
                  values={academyInfo.activityCategories ?? []}
                  onChange={(values) => {
                    const fallback = values[0] ?? ""
                    setAcademyInfo((current) => ({ ...current, activityCategories: values }))
                    setClassStructure((current) => ({
                      ...current,
                      modalities: current.modalities.map((item) =>
                        item.activityCategory && !values.includes(item.activityCategory)
                          ? { ...item, activityCategory: fallback }
                          : item
                      ),
                    }))
                  }}
                />
              </div>

              <Accordion
                type="multiple"
                defaultValue={[...new Set(classStructure.modalities.map((item) => item.activityCategory).filter(Boolean))] as string[]}
                className="space-y-3"
              >
                {(academyInfo.activityCategories ?? []).map((activityCategory) => {
                  const items = classStructure.modalities.filter((item) => item.activityCategory === activityCategory)
                  return (
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
                                options={academyInfo.activityCategories ?? []}
                                onValueChange={(value) =>
                                  setClassStructure((current) => ({
                                    ...current,
                                    modalities: current.modalities.map((item) =>
                                      item.clientId === modality.clientId ? { ...item, activityCategory: value } : item
                                    ),
                                  }))
                                }
                              />
                            </div>
                            <div className="grid gap-2 xl:col-span-2">
                              <Label>Nome da modalidade</Label>
                              <Input
                                value={modality.name}
                                onChange={(e) =>
                                  setClassStructure((current) => ({
                                    ...current,
                                    modalities: current.modalities.map((item) =>
                                      item.clientId === modality.clientId ? { ...item, name: e.target.value } : item
                                    ),
                                  }))
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
                                        setClassStructure((current) => ({
                                          ...current,
                                          modalities: current.modalities.map((item) =>
                                            item.clientId === modality.clientId
                                              ? {
                                                  ...item,
                                                  ageGroups: checked
                                                    ? [...item.ageGroups, option.value]
                                                    : item.ageGroups.filter((value) => value !== option.value),
                                                }
                                              : item
                                          ),
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
                              <Label>Duração</Label>
                              <Input
                                type="number"
                                min="1"
                                value={modality.defaultDurationMinutes}
                                onChange={(e) =>
                                  setClassStructure((current) => ({
                                    ...current,
                                    modalities: current.modalities.map((item) =>
                                      item.clientId === modality.clientId
                                        ? { ...item, defaultDurationMinutes: Number(e.target.value) || 0 }
                                        : item
                                    ),
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
                                  onClick={() =>
                                    setClassStructure((current) => ({
                                      ...current,
                                      modalities: current.modalities.filter((item) => item.clientId !== modality.clientId),
                                    }))
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <Input
                                type="number"
                                min="1"
                                value={modality.defaultCapacity}
                                onChange={(e) =>
                                  setClassStructure((current) => ({
                                    ...current,
                                    modalities: current.modalities.map((item) =>
                                      item.clientId === modality.clientId
                                        ? { ...item, defaultCapacity: Number(e.target.value) || 0 }
                                        : item
                                    ),
                                  }))
                                }
                              />
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-start pt-1">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setClassStructure((current) => ({
                                ...current,
                                modalities: [
                                  ...current.modalities,
                                  {
                                    clientId: crypto.randomUUID(),
                                    activityCategory,
                                    name: "",
                                    ageGroups: ["adult"],
                                    defaultDurationMinutes: 60,
                                    defaultCapacity: 20,
                                  },
                                ],
                              }))
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar modalidade
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>

              <div className="flex items-center justify-end pt-1">
                <Button
                  disabled={isSaving}
                  onClick={async () => {
                    setIsSaving(true)
                    try {
                      await fetchJson<{
                        modalities: Array<{
                          id: string
                          activityCategory?: string
                          name: string
                          ageGroups: AgeGroupValue[]
                          defaultDurationMinutes: number
                          defaultCapacity: number
                        }>
                        activityCategories?: string[]
                      }>("/api/modalities", {
                        method: "PUT",
                        body: JSON.stringify({
                          activityCategories: academyInfo.activityCategories ?? [],
                          modalities: classStructure.modalities.map((item) => ({
                            id: item.clientId,
                            activityCategory: item.activityCategory,
                            name: item.name,
                            ageGroups: item.ageGroups,
                            defaultDurationMinutes: item.defaultDurationMinutes,
                            defaultCapacity: item.defaultCapacity,
                          })),
                        }),
                      })

                      const settingsResponse = await fetchJson<SettingsResponse>("/api/onboarding/academy-setup")
                      setSettings(settingsResponse)
                      setAcademyInfo(settingsResponse.onboarding?.academyInfo ?? defaultAcademyInfo())
                      setClassStructure(settingsResponse.onboarding?.classStructure ?? defaultClassStructure())
                      setFeedback("Modalidades atualizadas com sucesso.")
                    } catch (error) {
                      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar as modalidades.")
                    } finally {
                      setIsSaving(false)
                    }
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar modalidades
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <SettingsSectionHeader
                icon={CreditCard}
                title="Planos e mensalidades"
                description="Edite planos, frequência e modalidades incluídas."
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MetricCard title="Planos" value={String(plansSetup.plans.length)} icon={CreditCard} />
                <MetricCard
                  title="Ticket médio"
                  value={formatCurrency(
                    Math.round(
                      plansSetup.plans.reduce((sum, item) => sum + item.amountCents, 0) /
                        Math.max(plansSetup.plans.length, 1)
                    )
                  )}
                  icon={Wallet}
                />
                <MetricCard
                  title="Frequência média"
                  value={`${Math.round(plansSetup.plans.reduce((sum, item) => sum + (item.weeklyFrequency ?? 0), 0) / Math.max(plansSetup.plans.length, 1)) || 0}x`}
                  icon={Clock3}
                />
              </div>

              <Accordion type="multiple" className="space-y-3">
                {plansSetup.plans.map((plan, index) => (
                  <AccordionItem key={plan.clientId} value={plan.clientId} className="rounded-lg border">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex min-w-0 items-center gap-3 text-left">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{plan.name || "Novo plano"}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBillingCycleLabel(plan.billingCycle)} • {formatCurrency(plan.amountCents)}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 px-4 pb-4">
                      <div className="space-y-4 rounded-2xl border border-border p-4">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="grid gap-2">
                            <Label>Nome do plano</Label>
                            <Input value={plan.name} onChange={(e) => setPlansSetup((c) => ({ ...c, plans: c.plans.map((item, itemIndex) => itemIndex === index ? { ...item, name: e.target.value } : item) }))} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Valor (R$)</Label>
                            <Input
                              inputMode="decimal"
                              placeholder="0,00"
                              value={formatCurrencyInputFromCents(plan.amountCents)}
                              onChange={(e) =>
                                setPlansSetup((c) => ({
                                  ...c,
                                  plans: c.plans.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          amountCents: parseCurrencyInputToCents(e.target.value),
                                        }
                                      : item
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Cobrança</Label>
                            <Select value={plan.billingCycle} onValueChange={(value) => setPlansSetup((c) => ({ ...c, plans: c.plans.map((item, itemIndex) => itemIndex === index ? { ...item, billingCycle: value as typeof item.billingCycle } : item) }))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
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
                            <Input type="number" min="0" value={plan.weeklyFrequency ?? ""} onChange={(e) => setPlansSetup((c) => ({ ...c, plans: c.plans.map((item, itemIndex) => itemIndex === index ? { ...item, weeklyFrequency: e.target.value ? Number(e.target.value) : null } : item) }))} />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Limite de aulas</Label>
                            <Select value={plan.classLimitKind} onValueChange={(value) => setPlansSetup((c) => ({ ...c, plans: c.plans.map((item, itemIndex) => itemIndex === index ? { ...item, classLimitKind: value as typeof item.classLimitKind } : item) }))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unlimited">Ilimitado</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {plan.classLimitKind === "weekly" ? (
                            <div className="grid gap-2">
                              <Label>Quantidade por semana</Label>
                              <Input type="number" min="1" value={plan.classLimitValue ?? ""} onChange={(e) => setPlansSetup((c) => ({ ...c, plans: c.plans.map((item, itemIndex) => itemIndex === index ? { ...item, classLimitValue: e.target.value ? Number(e.target.value) : null } : item) }))} />
                            </div>
                          ) : null}
                        </div>
                        <div className="grid gap-2">
                          <Label>Modalidades incluídas</Label>
                          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {modalities.map((modality) => (
                              <label key={modality.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2">
                                <input
                                  type="checkbox"
                                  checked={plan.includedModalityIds.includes(modality.id)}
                                  onChange={(e) =>
                                    setPlansSetup((c) => ({
                                      ...c,
                                      plans: c.plans.map((item, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...item,
                                              includedModalityIds: e.target.checked
                                                ? [...item.includedModalityIds, modality.id]
                                                : item.includedModalityIds.filter((id) => id !== modality.id),
                                            }
                                          : item,
                                      ),
                                    }))
                                  }
                                />
                                <span className="text-sm">{formatModalityLabel(modality)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setPlansSetup((c) => ({ ...c, plans: [...c.plans, { clientId: crypto.randomUUID(), name: "", amountCents: 0, billingCycle: "monthly", weeklyFrequency: null, classLimitKind: "unlimited", classLimitValue: null, includedModalityIds: [] }] }))}>
                  Adicionar plano
                </Button>
                <Button disabled={isSaving} onClick={() => void saveStep("plans", plansSetup)}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar planos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <SettingsSectionHeader
                icon={ImageIcon}
                title="Identidade visual"
                description="Atualize nome do app, imagens e cores da academia."
              />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-border p-4">
                  <div className="grid gap-2">
                    <Label>Nome do app</Label>
                    <Input value={brandingSetup.appName} onChange={(e) => setBrandingSetup((c) => ({ ...c, appName: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cor primária</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={brandingSetup.primaryColor} onChange={(e) => setBrandingSetup((c) => ({ ...c, primaryColor: e.target.value }))} className="h-10 w-16 p-1" />
                      <Input value={brandingSetup.primaryColor} onChange={(e) => setBrandingSetup((c) => ({ ...c, primaryColor: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Cor secundária</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={brandingSetup.secondaryColor} onChange={(e) => setBrandingSetup((c) => ({ ...c, secondaryColor: e.target.value }))} className="h-10 w-16 p-1" />
                      <Input value={brandingSetup.secondaryColor} onChange={(e) => setBrandingSetup((c) => ({ ...c, secondaryColor: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2 rounded-2xl border border-border p-4">
                    <Label>Logo</Label>
                    <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        const uploaded = await uploadBranding("logo", file)
                        setBrandingSetup((c) => ({ ...c, logoUrl: uploaded.url }))
                        setFeedback("Logo enviada com sucesso.")
                      } catch (error) {
                        setFeedback(error instanceof Error ? error.message : "Não foi possível enviar a logo.")
                      }
                    }}
                  />
                    {brandingSetup.logoUrl ? <p className="text-xs text-muted-foreground">{brandingSetup.logoUrl}</p> : null}
                  </div>
                  <div className="grid gap-2 rounded-2xl border border-border p-4">
                    <Label>Banner</Label>
                    <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        const uploaded = await uploadBranding("banner", file)
                        setBrandingSetup((c) => ({ ...c, bannerUrl: uploaded.url }))
                        setFeedback("Banner enviado com sucesso.")
                      } catch (error) {
                        setFeedback(error instanceof Error ? error.message : "Não foi possível enviar o banner.")
                      }
                    }}
                  />
                    {brandingSetup.bannerUrl ? <p className="text-xs text-muted-foreground">{brandingSetup.bannerUrl}</p> : null}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button disabled={isSaving} onClick={() => void saveStep("branding", brandingSetup)}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar identidade visual
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <SettingsSectionHeader
                icon={CreditCard}
                title="Pagamentos"
                description="Concentre aqui os meios de pagamento, a troca de plano e as regras de inadimplência da academia."
              />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { key: "pix", label: "Pix" },
                  { key: "card", label: "Cartão" },
                  { key: "boleto", label: "Boleto" },
                ].map((method) => {
                  const enabled = financeSettings.acceptedMethods.includes(
                    method.key as "pix" | "card" | "boleto"
                  )
                  return (
                    <button
                      key={method.key}
                      type="button"
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors",
                        enabled ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                      )}
                      onClick={() =>
                        setFinanceSettings((current) => ({
                          ...current,
                          acceptedMethods: enabled
                            ? current.acceptedMethods.filter((item) => item !== method.key)
                            : [
                                ...current.acceptedMethods,
                                method.key as "pix" | "card" | "boleto",
                              ],
                        }))
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{method.label}</span>
                        <span className={cn("h-2.5 w-2.5 rounded-full", enabled ? "bg-primary" : "bg-muted")} />
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Gateway</Label>
                  <Select
                    value={financeSettings.gateway || "none"}
                    onValueChange={(value) =>
                      setFinanceSettings((current) => ({
                        ...current,
                        gateway:
                          value === "none"
                            ? ""
                            : (value as FinanceSettingsData["gateway"]),
                      }))
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem gateway</SelectItem>
                      <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
                      <SelectItem value="asaas">Asaas</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Política de troca de plano</Label>
                  <Select
                    value={financeSettings.planTransitionPolicy}
                    onValueChange={(value) =>
                      setFinanceSettings((current) => ({
                        ...current,
                        planTransitionPolicy:
                          value as FinanceSettingsData["planTransitionPolicy"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Imediata</SelectItem>
                      <SelectItem value="next_cycle">No próximo ciclo</SelectItem>
                      <SelectItem value="prorata">Pró-rata por dias corridos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">Tratamento da cobrança atual</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Defina como o sistema trata a cobrança em aberto quando a academia permite
                        troca imediata ou pró-rata.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSaving || financeSettings.planTransitionPolicy === "next_cycle"}
                      onClick={() => setIsTransitionChargeDialogOpen(true)}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Ver opções
                    </Button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-medium text-foreground">
                      {
                        getFinancePlanTransitionChargeHandlingOption(
                          financeSettings.planTransitionChargeHandling
                        ).label
                      }
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {financeSettings.planTransitionPolicy === "next_cycle"
                        ? "Essa regra só passa a valer quando a academia escolher troca imediata ou pró-rata."
                        : getFinancePlanTransitionChargeHandlingOption(
                            financeSettings.planTransitionChargeHandling
                          ).description}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3">
                      <ShieldAlert className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Inadimplência</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Essas regras controlam bloqueio em novas turmas, remoção das atuais e
                        geração de novas cobranças.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="grid gap-2">
                      <Label>Tolerância em dias</Label>
                      <Input
                        type="number"
                        min={0}
                        value={financeSettings.delinquencyGraceDays}
                        onChange={(event) =>
                          setFinanceSettings((current) => ({
                            ...current,
                            delinquencyGraceDays: Number(event.target.value) || 0,
                          }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Recorrência durante inadimplência</Label>
                      <Select
                        value={financeSettings.delinquencyRecurringMode}
                        onValueChange={(value) =>
                          setFinanceSettings((current) => ({
                            ...current,
                            delinquencyRecurringMode:
                              value as FinanceSettingsData["delinquencyRecurringMode"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continue">Continuar gerando cobranças</SelectItem>
                          <SelectItem value="pause">Pausar novas cobranças</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                      <div>
                        <p className="font-medium text-foreground">Bloquear novas turmas</p>
                        <p className="text-sm text-muted-foreground">
                          Impede novas entradas até regularizar os pagamentos.
                        </p>
                      </div>
                      <Switch
                        checked={financeSettings.delinquencyBlocksNewClasses}
                        onCheckedChange={(checked: boolean) =>
                          setFinanceSettings((current) => ({
                            ...current,
                            delinquencyBlocksNewClasses: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                      <div>
                        <p className="font-medium text-foreground">Remover das turmas atuais</p>
                        <p className="text-sm text-muted-foreground">
                          Retira o aluno das turmas ativas conforme a política da academia.
                        </p>
                      </div>
                      <Switch
                        checked={financeSettings.delinquencyRemovesCurrentClasses}
                        onCheckedChange={(checked: boolean) =>
                          setFinanceSettings((current) => ({
                            ...current,
                            delinquencyRemovesCurrentClasses: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                      <div>
                        <p className="font-medium text-foreground">Acumular dívida</p>
                        <p className="text-sm text-muted-foreground">
                          Mantém o saldo em aberto aumentando enquanto a recorrência continuar ativa.
                        </p>
                      </div>
                      <Switch
                        checked={financeSettings.delinquencyAccumulatesDebt}
                        onCheckedChange={(checked: boolean) =>
                          setFinanceSettings((current) => ({
                            ...current,
                            delinquencyAccumulatesDebt: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button disabled={isSaving} onClick={() => void saveFinanceSettings()}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar políticas financeiras
                </Button>
              </div>
            </CardContent>
          </Card>

          <Dialog
            open={isTransitionChargeDialogOpen}
            onOpenChange={setIsTransitionChargeDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tratamento da cobrança na troca de plano</DialogTitle>
                <DialogDescription>
                  Escolha como a academia trata a cobrança atual quando a troca acontece antes do
                  próximo ciclo.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {financePlanTransitionChargeHandlingOptions.map((option) => {
                  const selected =
                    option.value === financeSettings.planTransitionChargeHandling

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition-colors",
                        selected
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-card hover:bg-secondary"
                      )}
                      onClick={() => {
                        setFinanceSettings((current) => ({
                          ...current,
                          planTransitionChargeHandling: option.value,
                        }))
                        setIsTransitionChargeDialogOpen(false)
                      }}
                    >
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                    </button>
                  )
                })}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTransitionChargeDialogOpen(false)}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <SettingsSectionHeader
                icon={Shield}
                title="E-mail de acesso"
                description="Atualize o e-mail usado para entrar no sistema."
              />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>E-mail atual</Label>
                <Input value={session?.user.email ?? ""} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Novo e-mail</Label>
                <Input type="email" value={emailForm.nextEmail} onChange={(e) => setEmailForm((c) => ({ ...c, nextEmail: e.target.value.toLowerCase() }))} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Confirme com sua senha atual</Label>
                <Input type="password" value={emailForm.currentPassword} onChange={(e) => setEmailForm((c) => ({ ...c, currentPassword: e.target.value }))} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  disabled={isSaving}
                  onClick={async () => {
                    setIsSaving(true)
                    try {
                      const response = await fetchJson<{ user: { email: string }; message: string }>("/api/account/security", {
                        method: "PATCH",
                        body: JSON.stringify({ action: "email", ...emailForm }),
                      })
                      setFeedback(response.message)
                      setEmailForm((c) => ({ ...c, currentPassword: "" }))
                      await loadSettings()
                    } catch (error) {
                      setFeedback(error instanceof Error ? error.message : "Não foi possível alterar o e-mail.")
                    } finally {
                      setIsSaving(false)
                    }
                  }}
                >
                  Alterar e-mail
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <SettingsSectionHeader
                icon={KeyRound}
                title="Senha"
                description="Troque sua senha de acesso ao painel."
              />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2 md:col-span-2">
                <Label>Senha atual</Label>
                <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((c) => ({ ...c, currentPassword: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Nova senha</Label>
                <Input type="password" value={passwordForm.nextPassword} onChange={(e) => setPasswordForm((c) => ({ ...c, nextPassword: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Confirme a nova senha</Label>
                <Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((c) => ({ ...c, confirmPassword: e.target.value }))} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  disabled={isSaving}
                  onClick={async () => {
                    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
                      setFeedback("A confirmação da nova senha não confere.")
                      return
                    }

                    setIsSaving(true)
                    try {
                      const response = await fetchJson<{ message: string }>("/api/account/security", {
                        method: "PATCH",
                        body: JSON.stringify({
                          action: "password",
                          currentPassword: passwordForm.currentPassword,
                          nextPassword: passwordForm.nextPassword,
                        }),
                      })
                      setFeedback(response.message)
                      setPasswordForm({ currentPassword: "", nextPassword: "", confirmPassword: "" })
                    } catch (error) {
                      setFeedback(error instanceof Error ? error.message : "Não foi possível alterar a senha.")
                    } finally {
                      setIsSaving(false)
                    }
                  }}
                >
                  Alterar senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}

function SettingsSectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Building2
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
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
