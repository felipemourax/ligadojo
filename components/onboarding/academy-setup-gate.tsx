"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Check,
  ChevronsUpDown,
  Building2,
  CreditCard,
  GraduationCap,
  MapPin,
  Palette,
  Plus,
  Trash2,
  X,
  Wallet,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { useCurrentSession } from "@/hooks/use-current-session"
import { fetchJson } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { buildTenantHost } from "@/lib/tenancy/url"
import { AcademySetupCompletion } from "@/components/onboarding/academy-setup/academy-setup-completion"
import { AcademySetupFooter } from "@/components/onboarding/academy-setup/academy-setup-footer"
import { AcademySetupHeader } from "@/components/onboarding/academy-setup/academy-setup-header"
import { AcademyInfoStepSection } from "@/components/onboarding/academy-setup/sections/academy-info-step-section"
import { BrandingStepSection } from "@/components/onboarding/academy-setup/sections/branding-step-section"
import { LocationStepSection } from "@/components/onboarding/academy-setup/sections/location-step-section"
import { PaymentsStepSection } from "@/components/onboarding/academy-setup/sections/payments-step-section"
import type {
  AgeGroupValue,
  BillingCycleValue,
  OnboardingStepKey,
  PaymentGatewayValue,
  PaymentsStepData,
  PlanClassLimitKindValue,
} from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding"
import { activityCategoryOptions, formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"
import { createSeededModalityTemplates } from "@/apps/api/src/modules/onboarding/domain/academy-modality-seeds"

type StepKey = OnboardingStepKey
type AgeGroup = AgeGroupValue
type BillingCycle = BillingCycleValue
type PlanClassLimitKind = PlanClassLimitKindValue
type PaymentGateway = PaymentGatewayValue | ""
type PaymentMethod = PaymentsStepData["acceptedMethods"][number]

interface OnboardingResponse {
  tenant: {
    displayName: string
    slug: string
  }
  onboarding: {
    status: "draft" | "in_progress" | "completed"
    currentStep: number
    completedSteps: StepKey[]
    stepValidity: Record<StepKey, boolean>
    blockingSteps: StepKey[]
    academyInfo?: {
      legalName: string
      phone: string
      contactEmail: string
      document: string
      hasNoDocument?: boolean
      foundedYear: string
      activityCategories?: string[]
    }
    location?: {
      zipCode: string
      street: string
      number: string
      complement: string
      city: string
      state: string
      country: string
    }
    classStructure?: {
      modalities: Array<{
        clientId: string
        activityCategory?: string
        name: string
        ageGroups: AgeGroup[]
        defaultDurationMinutes: number
        defaultCapacity: number
      }>
    }
    plansSetup?: {
      plans: Array<{
        clientId: string
        name: string
        amountCents: number
        billingCycle: BillingCycle
        weeklyFrequency: number | null
        classLimitKind: PlanClassLimitKind
        classLimitValue: number | null
        includedModalityIds: string[]
      }>
    }
    brandingSetup?: {
      appName: string
      logoUrl: string
      bannerUrl: string
      primaryColor: string
      secondaryColor: string
    }
    paymentsSetup?: {
      acceptedMethods: PaymentMethod[]
      gateway: PaymentGateway
    }
    references: {
      modalities: Array<{
        id: string
        name: string
        ageGroups: AgeGroup[]
      }>
      plans: Array<{
        id: string
        name: string
      }>
    }
  } | null
}

type OnboardingStatus = NonNullable<OnboardingResponse["onboarding"]>["status"]

interface AcademyInfoFormState {
  legalName: string
  phone: string
  contactEmail: string
  document: string
  hasNoDocument: boolean
  foundedYear: string
  activityCategories: string[]
}

interface LocationFormState {
  zipCode: string
  street: string
  number: string
  complement: string
  city: string
  state: string
  country: string
}

interface BrandingFormState {
  appName: string
  logoUrl: string
  bannerUrl: string
  primaryColor: string
  secondaryColor: string
}

interface PaymentsFormState {
  acceptedMethods: PaymentMethod[]
  gateway: PaymentGateway
}

type FormState = {
  academy_info: AcademyInfoFormState
  location: LocationFormState
  class_structure: {
    modalities: Array<{
      clientId: string
      activityCategory?: string
      name: string
      ageGroups: AgeGroup[]
      defaultDurationMinutes: string
      defaultCapacity: string
    }>
  }
  plans: {
    plans: Array<{
      clientId: string
      name: string
      amountCents: string
      billingCycle: BillingCycle
      weeklyFrequency: string
      classLimitKind: PlanClassLimitKind
      classLimitValue: string
      includedModalityIds: string[]
    }>
  }
  branding: BrandingFormState
  payments: PaymentsFormState
}

const steps: Array<{
  key: StepKey
  title: string
  shortTitle: string
  required: boolean
  entity: string
  icon: typeof Building2
}> = [
  {
    key: "academy_info",
    title: "Informações da academia",
    shortTitle: "Academia",
    required: true,
    entity: "Dados principais do seu negócio",
    icon: Building2,
  },
  {
    key: "location",
    title: "Localização",
    shortTitle: "Localização",
    required: true,
    entity: "Endereço da academia",
    icon: MapPin,
  },
  {
    key: "class_structure",
    title: "Estrutura de aulas",
    shortTitle: "Modalidades",
    required: true,
    entity: "Modalidades e organização das turmas",
    icon: GraduationCap,
  },
  {
    key: "plans",
    title: "Planos",
    shortTitle: "Planos",
    required: true,
    entity: "Planos que você vai vender",
    icon: CreditCard,
  },
  {
    key: "branding",
    title: "Identidade visual",
    shortTitle: "Visual",
    required: true,
    entity: "Aparência do seu app e da sua academia",
    icon: Palette,
  },
  {
    key: "payments",
    title: "Pagamentos",
    shortTitle: "Pagamentos",
    required: true,
    entity: "Como a academia vai receber",
    icon: Wallet,
  },
]

const ageGroupOptions: Array<{ value: AgeGroup; label: string }> = [
  { value: "kids", label: "Kids" },
  { value: "juvenile", label: "Juvenil" },
  { value: "adult", label: "Adulto" },
  { value: "mixed", label: "Misto" },
]

const legacyStepOrder: StepKey[] = [
  "academy_info",
  "location",
  "class_structure",
  "plans",
  "branding",
  "payments",
]

function createSeededModalities(activityCategories: string[]) {
  return createSeededModalityTemplates(activityCategories as Array<
    | "jiu-jitsu"
    | "muay-thai"
    | "judo"
    | "karate"
    | "taekwondo"
    | "boxe"
    | "mma"
    | "outras"
  >).map((item) => ({
    clientId: createId("modality"),
    activityCategory: item.activityCategory,
    name: item.name,
    ageGroups: item.ageGroups as AgeGroup[],
    defaultDurationMinutes: String(item.defaultDurationMinutes),
    defaultCapacity: String(item.defaultCapacity),
  }))
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function formatAgeGroups(ageGroups: AgeGroup[]) {
  if (ageGroups.length === 0) {
    return "Selecione"
  }

  return ageGroupOptions
    .filter((option) => ageGroups.includes(option.value))
    .map((option) => option.label)
    .join(", ")
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function hasOnlyExistingModalityIds(includedModalityIds: string[], availableModalityIds: Set<string>) {
  return (
    includedModalityIds.length > 0 &&
    includedModalityIds.every((modalityId) => availableModalityIds.has(modalityId))
  )
}

function hasValidSelectedActivityCategory(
  activityCategory: string | undefined,
  selectedActivityCategories: string[]
) {
  return Boolean(activityCategory && selectedActivityCategories.includes(activityCategory))
}

function formatZipCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)

  if (digits.length <= 5) {
    return digits
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14)

  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function formatCurrencyFromCents(cents: number) {
  if (!Number.isFinite(cents) || cents <= 0) {
    return ""
  }

  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "")

  if (!digits) {
    return ""
  }

  const cents = Number(digits)
  return formatCurrencyFromCents(cents)
}

function parseCurrencyInputToCents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim()
  const decimal = Number(normalized)

  if (!Number.isFinite(decimal) || decimal <= 0) {
    return 0
  }

  return Math.round(decimal * 100)
}

function getLegacyStepNumber(stepKey: StepKey) {
  const index = legacyStepOrder.findIndex((item) => item === stepKey)
  return index >= 0 ? index + 1 : 1
}

function mapLegacyCurrentStepToDisplayIndex(legacyCurrentStep: number) {
  const clampedStep = Math.min(Math.max(legacyCurrentStep, 1), legacyStepOrder.length)
  const legacyStep = legacyStepOrder[clampedStep - 1]
  const displayStepKey: StepKey = legacyStep
  const displayIndex = steps.findIndex((step) => step.key === displayStepKey)

  return displayIndex >= 0 ? displayIndex : 0
}

function formatBillingCycleLabel(value: BillingCycle) {
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

function buildInitialState(onboarding: OnboardingResponse["onboarding"]): FormState {
  return {
    academy_info: {
      legalName: onboarding?.academyInfo?.legalName ?? "",
      phone: onboarding?.academyInfo?.phone ?? "",
      contactEmail: onboarding?.academyInfo?.contactEmail ?? "",
      document: onboarding?.academyInfo?.document ?? "",
      hasNoDocument: onboarding?.academyInfo?.hasNoDocument ?? false,
      foundedYear: onboarding?.academyInfo?.foundedYear ?? "",
      activityCategories: onboarding?.academyInfo?.activityCategories ?? [],
    },
    location: {
      zipCode: onboarding?.location?.zipCode ?? "",
      street: onboarding?.location?.street ?? "",
      number: onboarding?.location?.number ?? "",
      complement: onboarding?.location?.complement ?? "",
      city: onboarding?.location?.city ?? "",
      state: onboarding?.location?.state ?? "",
      country: onboarding?.location?.country ?? "Brasil",
    },
    class_structure: {
      modalities:
        onboarding?.classStructure?.modalities.map((item) => ({
          clientId: item.clientId,
          activityCategory: item.activityCategory,
          name: item.name,
          ageGroups: item.ageGroups,
          defaultDurationMinutes: String(item.defaultDurationMinutes),
          defaultCapacity: String(item.defaultCapacity),
        })) ?? [],
    },
    plans: {
      plans:
        onboarding?.plansSetup?.plans.map((item) => ({
          clientId: item.clientId,
          name: item.name,
          amountCents: formatCurrencyFromCents(item.amountCents),
          billingCycle: item.billingCycle,
          weeklyFrequency: item.weeklyFrequency ? String(item.weeklyFrequency) : "",
          classLimitKind: item.classLimitKind,
          classLimitValue: item.classLimitValue ? String(item.classLimitValue) : "",
          includedModalityIds: item.includedModalityIds,
        })) ?? [],
    },
    branding: {
      appName: onboarding?.brandingSetup?.appName ?? "",
      logoUrl: onboarding?.brandingSetup?.logoUrl ?? "",
      bannerUrl: onboarding?.brandingSetup?.bannerUrl ?? "",
      primaryColor: onboarding?.brandingSetup?.primaryColor ?? "#16a34a",
      secondaryColor: onboarding?.brandingSetup?.secondaryColor ?? "#0f172a",
    },
    payments: {
      acceptedMethods: onboarding?.paymentsSetup?.acceptedMethods ?? ["pix", "card", "boleto"],
      gateway: onboarding?.paymentsSetup?.gateway ?? "",
    },
  }
}

function isRequiredStepValid(stepKey: StepKey, state: FormState) {
  switch (stepKey) {
    case "academy_info":
      return Boolean(
        state.academy_info.legalName.trim() &&
          state.academy_info.phone.trim() &&
          state.academy_info.contactEmail.trim() &&
          state.academy_info.activityCategories.length > 0 &&
          (state.academy_info.hasNoDocument || state.academy_info.document.trim())
      )
    case "location":
      return Boolean(
        state.location.zipCode.trim() &&
          state.location.street.trim() &&
          state.location.city.trim() &&
          state.location.state.trim()
      )
    case "class_structure":
      return (
        state.class_structure.modalities.length > 0 &&
        state.class_structure.modalities.every(
          (item) =>
            hasValidSelectedActivityCategory(
              item.activityCategory,
              state.academy_info.activityCategories
            ) &&
            item.name.trim() &&
            Number(item.defaultDurationMinutes) > 0 &&
            Number(item.defaultCapacity) > 0
        )
      )
    case "plans":
      return (
        state.plans.plans.length > 0 &&
        state.plans.plans.every(
          (item) =>
            item.name.trim() &&
            parseCurrencyInputToCents(item.amountCents) > 0 &&
            item.includedModalityIds.length > 0 &&
            (item.classLimitKind === "unlimited" || Number(item.classLimitValue) > 0)
        )
      )
    case "branding":
      return Boolean(
        state.branding.appName.trim() &&
          state.branding.primaryColor.trim() &&
          state.branding.secondaryColor.trim()
      )
    case "payments":
      return state.payments.acceptedMethods.length > 0
  }
}

function getValidationMessage(stepKey: StepKey, state: FormState) {
  if (isRequiredStepValid(stepKey, state)) {
    return null
  }

  switch (stepKey) {
    case "academy_info":
      return "Preencha nome da academia, telefone, e-mail, atividades e CNPJ ou marque que não possui CNPJ."
    case "location":
      return "Preencha CEP, rua, cidade e estado."
    case "class_structure":
      return "Adicione ao menos uma modalidade com atividade principal, faixa etária, duração e capacidade."
    case "plans":
      return "Crie ao menos um plano com preço e modalidades incluídas."
    case "branding":
      return "Defina nome do app e as cores principais."
    case "payments":
      return "Selecione pelo menos uma forma de pagamento."
  }
}

function getFieldErrorClass(hasError: boolean) {
  return hasError ? "border-destructive focus-visible:ring-destructive/30" : ""
}

function isPlanItemInvalid(
  item: FormState["plans"]["plans"][number],
  availableModalityIds?: Set<string>
) {
  return !(
    item.name.trim() &&
    parseCurrencyInputToCents(item.amountCents) > 0 &&
    (availableModalityIds
      ? hasOnlyExistingModalityIds(item.includedModalityIds, availableModalityIds)
      : item.includedModalityIds.length > 0) &&
    (item.classLimitKind === "unlimited" || Number(item.classLimitValue) > 0)
  )
}

function isModalityItemInvalid(
  item: FormState["class_structure"]["modalities"][number],
  selectedActivityCategories: string[]
) {
  return !(
    hasValidSelectedActivityCategory(item.activityCategory, selectedActivityCategories) &&
    item.name.trim() &&
    Number(item.defaultDurationMinutes) > 0 &&
    Number(item.defaultCapacity) > 0
  )
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

interface PlanModalityReference {
  id: string
  name: string
  ageGroups: AgeGroup[]
}

function PlanModalitiesMultiselect({
  selectedIds,
  modalityReferences,
  onSelectionChange,
  invalid,
}: {
  selectedIds: string[]
  modalityReferences: PlanModalityReference[]
  onSelectionChange: (ids: string[]) => void
  invalid: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selectedModalities = modalityReferences.filter((item) => selectedIds.includes(item.id))
  const filteredModalities = modalityReferences.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      formatAgeGroups(item.ageGroups).toLowerCase().includes(search.toLowerCase())
  )

  const groupedModalities = filteredModalities.reduce<Record<string, PlanModalityReference[]>>(
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
            className={cn(
              "h-auto min-h-9 w-full justify-between bg-input py-2 text-sm hover:bg-secondary",
              getFieldErrorClass(invalid)
            )}
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
                    type="button"
                  >
                    Selecionar todas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => onSelectionChange([])}
                    type="button"
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

export function AcademySetupGate() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { session, isLoading: isSessionLoading } = useCurrentSession()
  const [data, setData] = useState<OnboardingResponse | null>(null)
  const [formState, setFormState] = useState<FormState>(() => buildInitialState(null))
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLookingUpZipCode, setIsLookingUpZipCode] = useState(false)
  const [isUploadingBranding, setIsUploadingBranding] = useState<"logo" | null>(null)
  const [showStepErrors, setShowStepErrors] = useState(false)
  const [navigationWarning, setNavigationWarning] = useState<string | null>(null)
  const [manualOpen, setManualOpen] = useState(false)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [autoFillNoticeStep, setAutoFillNoticeStep] = useState<"class_structure" | "plans" | null>(
    null
  )
  const [autoFillNoticeSeen, setAutoFillNoticeSeen] = useState({
    class_structure: false,
    plans: false,
  })
  const previousOnboardingStatus = useRef<OnboardingStatus | null>(null)
  const hasAutoSeededPlans = useRef(false)
  const hasAutoSeededModalities = useRef(false)

  const isAcademyAdmin =
    session?.currentMembership?.role === "academy_admin" ||
    session?.memberships.some(
      (membership) => membership.role === "academy_admin" && membership.status === "active"
    ) === true
  const forcedOpen = searchParams.get("academySetup") === "1"
  const shouldBlock =
    isAcademyAdmin &&
    (data?.onboarding?.status !== "completed" || manualOpen || forcedOpen || showCompletionScreen)
  const current = steps[currentStep]

  useEffect(() => {
    if (forcedOpen) {
      setManualOpen(true)
    }
  }, [forcedOpen])

  useEffect(() => {
    if (!isAcademyAdmin) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)

      try {
        const response = await fetchJson<OnboardingResponse>("/api/onboarding/academy-setup")

        if (cancelled) {
          return
        }

        setData(response)
        setFormState(buildInitialState(response.onboarding))
        setCurrentStep(mapLegacyCurrentStepToDisplayIndex(response.onboarding?.currentStep ?? 1))
        setShowCompletionScreen(response.onboarding?.status === "completed" && Boolean(forcedOpen))
      } catch (error) {
        if (!cancelled) {
          toast({
            variant: "destructive",
            title: "Erro ao carregar setup",
            description:
              error instanceof Error ? error.message : "Não foi possível carregar a configuração inicial.",
          })
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAcademyAdmin])

  useEffect(() => {
    const currentStatus = data?.onboarding?.status ?? null
    const previousStatus = previousOnboardingStatus.current

    if (currentStatus === "completed" && previousStatus && previousStatus !== "completed") {
      setShowCompletionScreen(true)
    }

    previousOnboardingStatus.current = currentStatus
  }, [data?.onboarding?.status])

  useEffect(() => {
    if (hasAutoSeededModalities.current) {
      return
    }

    if (formState.class_structure.modalities.length > 0) {
      hasAutoSeededModalities.current = true
      return
    }

    if (formState.academy_info.activityCategories.length === 0) {
      return
    }

    setFormState((currentState) => ({
      ...currentState,
      class_structure: {
        modalities: createSeededModalities(currentState.academy_info.activityCategories),
      },
    }))
    hasAutoSeededModalities.current = true
  }, [formState.academy_info.activityCategories, formState.class_structure.modalities.length])

  useEffect(() => {
    if (current.key !== "plans" || hasAutoSeededPlans.current) {
      return
    }

    if (formState.plans.plans.length > 0) {
      hasAutoSeededPlans.current = true
      return
    }

    const persistedModalityIds = data?.onboarding?.references.modalities.map((modality) => modality.id) ?? []
    const draftModalityIds = formState.class_structure.modalities.map((modality) => modality.clientId)
    const modalityIds = persistedModalityIds.length > 0 ? persistedModalityIds : draftModalityIds

    if (modalityIds.length === 0) {
      return
    }

    setFormState((currentState) => ({
      ...currentState,
      plans: {
        plans: [
          {
            clientId: createId("plan"),
            name: "Plano mensal",
            amountCents: "",
            billingCycle: "monthly",
            weeklyFrequency: "3",
            classLimitKind: "unlimited",
            classLimitValue: "",
            includedModalityIds: modalityIds,
          },
        ],
      },
    }))
    hasAutoSeededPlans.current = true
  }, [
    current.key,
    data?.onboarding?.references.modalities,
    formState.class_structure.modalities,
    formState.plans.plans.length,
  ])

  useEffect(() => {
    const persistedModalityIds = data?.onboarding?.references.modalities.map((modality) => modality.id) ?? []
    const draftModalityIds = formState.class_structure.modalities.map((modality) => modality.clientId)
    const validIds = new Set(persistedModalityIds.length > 0 ? persistedModalityIds : draftModalityIds)

    const hasStaleSelections = formState.plans.plans.some((plan) =>
      plan.includedModalityIds.some((modalityId) => !validIds.has(modalityId))
    )

    if (!hasStaleSelections) {
      return
    }

    setFormState((currentState) => ({
      ...currentState,
      plans: {
        plans: currentState.plans.plans.map((plan) => ({
          ...plan,
          includedModalityIds: plan.includedModalityIds.filter((modalityId) => validIds.has(modalityId)),
        })),
      },
    }))
  }, [
    data?.onboarding?.references.modalities,
    formState.class_structure.modalities,
    formState.plans.plans,
  ])

  useEffect(() => {
    if (!shouldBlock || showCompletionScreen) {
      return
    }

    if (
      current.key === "class_structure" &&
      !autoFillNoticeSeen.class_structure &&
      formState.academy_info.activityCategories.length > 0
    ) {
      setAutoFillNoticeStep("class_structure")
      setAutoFillNoticeSeen((currentState) => ({ ...currentState, class_structure: true }))
      return
    }

    if (
      current.key === "plans" &&
      !autoFillNoticeSeen.plans &&
      ((data?.onboarding?.references.modalities.length ?? 0) > 0 ||
        formState.class_structure.modalities.length > 0)
    ) {
      setAutoFillNoticeStep("plans")
      setAutoFillNoticeSeen((currentState) => ({ ...currentState, plans: true }))
    }
  }, [
    autoFillNoticeSeen.class_structure,
    autoFillNoticeSeen.plans,
    current.key,
    data?.onboarding?.references.modalities.length,
    formState.academy_info.activityCategories.length,
    formState.class_structure.modalities.length,
    shouldBlock,
    showCompletionScreen,
  ])

  const completedCount =
    data?.onboarding?.completedSteps.length ?? 0
  const validations = useMemo(() => {
    const onboardingData = data?.onboarding

    if (onboardingData) {
      return Object.fromEntries(
        steps.map((step) => [step.key, onboardingData.stepValidity[step.key]])
      ) as Record<StepKey, boolean>
    }

    return Object.fromEntries(
      steps.map((step) => [step.key, isRequiredStepValid(step.key, formState)])
    ) as Record<StepKey, boolean>
  }, [data?.onboarding, formState])
  const invalidRequiredStepKeys = steps
    .filter(
      (step, index) =>
        step.required &&
        !validations[step.key] &&
        (showStepErrors || index <= currentStep)
    )
    .map((step) => step.key)
  const currentValidationMessage =
    showStepErrors && current.required ? getValidationMessage(current.key, formState) : null

  function getStepSectionClass(stepKey: StepKey) {
    void stepKey
    return "rounded-2xl border border-border p-4"
  }

  function handleStepChange(targetIndex: number) {
    if (targetIndex <= currentStep) {
      setShowStepErrors(false)
      setNavigationWarning(null)
      setCurrentStep(targetIndex)
      return
    }

    const firstIncompleteRequiredIndex = steps.findIndex(
      (step, index) => index < targetIndex && step.required && !validations[step.key]
    )

    if (firstIncompleteRequiredIndex >= 0) {
      setShowStepErrors(true)
      setNavigationWarning(
        `Antes de avançar, conclua a etapa "${steps[firstIncompleteRequiredIndex].title}".`
      )
      setCurrentStep(firstIncompleteRequiredIndex)
      toast({
        variant: "destructive",
        title: "Conclua as etapas anteriores",
        description: `A etapa "${steps[firstIncompleteRequiredIndex].title}" ainda não foi concluída.`,
      })
      return
    }

    setShowStepErrors(false)
    setNavigationWarning(null)
    setCurrentStep(targetIndex)
  }

  function updateTopLevel<T extends keyof FormState>(section: T, field: string, value: string | boolean | string[]) {
    setFormState((currentState) => {
      if (section === "academy_info" && field === "activityCategories" && Array.isArray(value)) {
        const nextActivityCategories = value.filter(
          (item): item is string => typeof item === "string" && item.trim().length > 0
        )
        const fallbackActivityCategory = nextActivityCategories[0]

        return {
          ...currentState,
          academy_info: {
            ...currentState.academy_info,
            activityCategories: nextActivityCategories,
          },
          class_structure: {
            modalities: currentState.class_structure.modalities.map((item) => ({
              ...item,
              activityCategory: hasValidSelectedActivityCategory(
                item.activityCategory,
                nextActivityCategories
              )
                ? item.activityCategory
                : fallbackActivityCategory,
            })),
          },
        }
      }

      return {
        ...currentState,
        [section]: {
          ...currentState[section],
          [field]: value,
        },
      }
    })
  }

  function updateArrayItem<T extends "class_structure" | "plans">(
    section: T,
    index: number,
    field: string,
    value: string | boolean | string[]
  ) {
    setFormState((currentState) => {
      if (section === "class_structure") {
        return {
          ...currentState,
          class_structure: {
            modalities: currentState.class_structure.modalities.map((item, itemIndex) =>
              itemIndex === index ? { ...item, [field]: value } : item
            ),
          },
        }
      }

      return {
        ...currentState,
        plans: {
          plans: currentState.plans.plans.map((item, itemIndex) =>
            itemIndex === index ? { ...item, [field]: value } : item
          ),
        },
      }
    })
  }

  function addModality(activityCategory?: string) {
    setFormState((currentState) => ({
      ...currentState,
      class_structure: {
        modalities: [
          ...currentState.class_structure.modalities,
          {
            clientId: createId("modality"),
            activityCategory: activityCategory ?? currentState.academy_info.activityCategories[0] ?? undefined,
            name: "",
            ageGroups: ["adult"],
            defaultDurationMinutes: "60",
            defaultCapacity: "20",
          },
        ],
      },
    }))
  }

  function addPlan() {
    setFormState((currentState) => ({
      ...currentState,
      plans: {
        plans: [
          ...currentState.plans.plans,
          {
            clientId: createId("plan"),
            name: "",
            amountCents: "",
            billingCycle: "monthly",
            weeklyFrequency: "",
            classLimitKind: "unlimited",
            classLimitValue: "",
            includedModalityIds: [],
          },
        ],
      },
    }))
  }

  function removeArrayItem(section: "class_structure" | "plans", index: number) {
    setFormState((currentState) => {
      if (section === "class_structure") {
        return {
          ...currentState,
          class_structure: {
            modalities: currentState.class_structure.modalities.filter((_, itemIndex) => itemIndex !== index),
          },
        }
      }

      return {
        ...currentState,
        plans: {
          plans: currentState.plans.plans.filter((_, itemIndex) => itemIndex !== index),
        },
      }
    })
  }

  function buildStepPayload(stepKey: StepKey) {
    switch (stepKey) {
      case "academy_info":
        return formState.academy_info
      case "location":
        return formState.location
      case "class_structure":
        return {
          modalities: formState.class_structure.modalities.map((item) => ({
            clientId: item.clientId,
            activityCategory: item.activityCategory?.trim() || undefined,
            name: item.name.trim(),
            ageGroups: item.ageGroups,
            defaultDurationMinutes: Number(item.defaultDurationMinutes || 0),
            defaultCapacity: Number(item.defaultCapacity || 0),
          })),
        }
      case "plans":
        return {
          plans: formState.plans.plans.map((item) => ({
            clientId: item.clientId,
            name: item.name.trim(),
            amountCents: parseCurrencyInputToCents(item.amountCents),
            billingCycle: item.billingCycle,
            weeklyFrequency: item.weeklyFrequency ? Number(item.weeklyFrequency) : null,
            classLimitKind: item.classLimitKind,
            classLimitValue: item.classLimitValue ? Number(item.classLimitValue) : null,
            includedModalityIds: item.includedModalityIds,
          })),
        }
      case "branding":
        return formState.branding
      case "payments":
        return formState.payments
    }
  }

  function normalizeHexColor(value: string) {
    const normalized = value.trim().replace(/[^#a-fA-F0-9]/g, "")

    if (!normalized) {
      return "#"
    }

    return normalized.startsWith("#") ? normalized.slice(0, 7) : `#${normalized.slice(0, 6)}`
  }

  async function uploadBrandingAsset(kind: "logo", file: File) {
    setIsUploadingBranding(kind)

    try {
      const formData = new FormData()
      formData.set("kind", kind)
      formData.set("file", file)

      const response = await fetch("/api/uploads/branding", {
        method: "POST",
        body: formData,
        cache: "no-store",
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível enviar a imagem.")
      }

      updateTopLevel("branding", "logoUrl", data.url)
      toast({
        title: "Logo enviada",
        description: "O arquivo foi salvo com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar imagem",
        description: error instanceof Error ? error.message : "Não foi possível enviar a imagem.",
      })
    } finally {
      setIsUploadingBranding(null)
    }
  }

  async function lookupZipCode(zipCodeOverride?: string) {
    const zipCode = (zipCodeOverride ?? formState.location.zipCode).replace(/\D/g, "")

    if (zipCode.length !== 8) {
      toast({
        variant: "destructive",
        title: "CEP inválido",
        description: "Informe um CEP válido com 8 dígitos.",
      })
      return
    }

    setIsLookingUpZipCode(true)

    try {
      const response = await fetchJson<{
        zipCode: string
        street: string
        complement: string
        city: string
        state: string
        country: string
      }>(`/api/location/lookup?zipCode=${zipCode}`)

      setFormState((currentState) => ({
        ...currentState,
        location: {
          ...currentState.location,
          zipCode: response.zipCode,
          street: response.street,
          complement: currentState.location.complement || response.complement,
          city: response.city,
          state: response.state,
          country: response.country,
        },
      }))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar CEP",
        description: error instanceof Error ? error.message : "Não foi possível buscar o CEP.",
      })
    } finally {
      setIsLookingUpZipCode(false)
    }
  }

  async function saveStep(stepIndex: number, goNext: boolean) {
    const step = steps[stepIndex]
    const validationMessage = step.required ? getValidationMessage(step.key, formState) : null

    if (goNext && validationMessage) {
      setShowStepErrors(true)
      toast({
        variant: "destructive",
        title: "Campos obrigatórios pendentes",
        description: validationMessage,
      })
      return false
    }

    setIsSaving(true)

    try {
      const targetStepIndex = goNext ? Math.min(stepIndex + 1, steps.length - 1) : stepIndex
      const targetStep = steps[targetStepIndex]

      const response = await fetchJson<OnboardingResponse>("/api/onboarding/academy-setup", {
        method: "PATCH",
        body: JSON.stringify({
          step: step.key,
          currentStep: getLegacyStepNumber(targetStep.key),
          data: buildStepPayload(step.key),
        }),
      })

      setData(response)
      setFormState(buildInitialState(response.onboarding))

      if (goNext && stepIndex < steps.length - 1) {
        setCurrentStep(stepIndex + 1)
      }

      setShowStepErrors(false)
      toast({
        title: "Etapa salva",
        description: `${step.title} atualizada com sucesso.`,
      })
      return true
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar etapa",
        description: error instanceof Error ? error.message : "Não foi possível salvar esta etapa.",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function completeOnboarding() {
    const validationMessage = getValidationMessage(current.key, formState)

    if (current.required && validationMessage) {
      setShowStepErrors(true)
      toast({
        variant: "destructive",
        title: "Campos obrigatórios pendentes",
        description: validationMessage,
      })
      return
    }

    setIsSaving(true)

    try {
      const didSaveCurrentStep = await saveStep(currentStep, false)

      if (!didSaveCurrentStep) {
        return
      }

      const response = await fetchJson<OnboardingResponse>("/api/onboarding/academy-setup", {
        method: "POST",
      })
      flushSync(() => {
        setManualOpen(true)
        setShowCompletionScreen(true)
      })
      setData(response)
      setShowStepErrors(false)
      toast({
        title: "Setup concluído",
        description: "Sua configuração inicial foi concluída com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao concluir setup",
        description:
          error instanceof Error ? error.message : "Não foi possível concluir a configuração inicial.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isSessionLoading || isLoading || !isAcademyAdmin || !data?.onboarding) {
    return null
  }

  const onboarding = data.onboarding
  const availablePlanModalities: PlanModalityReference[] =
    onboarding.references.modalities.length > 0
      ? onboarding.references.modalities
      : formState.class_structure.modalities.map((modality) => ({
          id: modality.clientId,
          name: modality.name || "Modalidade",
          ageGroups: modality.ageGroups,
        }))
  const availablePlanModalityIds = new Set(availablePlanModalities.map((modality) => modality.id))
  const dashboardUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "/dashboard"
  const appUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${buildTenantHost({
          currentHostname: window.location.hostname,
          currentPort: window.location.port || null,
          tenantSlug: data.tenant.slug,
        })}/app`
      : `/app`

  function closeManualOpen() {
    if (onboarding.status !== "completed") {
      return
    }

    setManualOpen(false)
    setShowCompletionScreen(false)

    if (forcedOpen) {
      const nextSearchParams = new URLSearchParams(searchParams.toString())
      nextSearchParams.delete("academySetup")
      const nextQuery = nextSearchParams.toString()
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
    }
  }

  return (
    <>
      <Dialog
        open={shouldBlock}
        onOpenChange={(open) => {
          if (!open) {
            closeManualOpen()
          }
        }}
      >
        <DialogContent
          className="h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-0 p-0 shadow-2xl sm:h-[95vh] sm:w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-1rem)] sm:rounded-[28px] lg:max-w-5xl"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          showCloseButton={data.onboarding.status === "completed" && (manualOpen || forcedOpen)}
        >
          {showCompletionScreen ? (
            <AcademySetupCompletion
              tenantName={data.tenant.displayName}
              appName={formState.branding.appName || data.tenant.displayName}
              dashboardUrl={dashboardUrl}
              appUrl={appUrl}
              logoUrl={formState.branding.logoUrl}
              primaryColor={formState.branding.primaryColor}
              secondaryColor={formState.branding.secondaryColor}
              onContinueLater={() => {
                setShowCompletionScreen(false)
                closeManualOpen()
                window.dispatchEvent(new Event("dojo-session-refresh"))
                router.refresh()
              }}
              onGoDashboard={() => {
                setShowCompletionScreen(false)
                closeManualOpen()
                window.dispatchEvent(new Event("dojo-session-refresh"))
                router.refresh()
              }}
            />
          ) : (
          <div className="flex h-full min-h-0 flex-col bg-background">
            <AcademySetupHeader
              tenantName={data.tenant.displayName}
              completedCount={completedCount}
              totalSteps={steps.length}
              steps={steps}
              currentStep={currentStep}
              completedStepKeys={onboarding.completedSteps}
              invalidStepKeys={invalidRequiredStepKeys}
              onStepChange={handleStepChange}
            />

          <section className="flex min-h-0 flex-1 flex-col bg-background">
            <div className="shrink-0 border-b border-border px-4 py-4 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-lg font-semibold text-foreground sm:text-xl">{current.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nesta etapa, você define {current.entity.toLowerCase()}.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="mx-auto max-w-3xl space-y-5">
                {navigationWarning ? (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                    {navigationWarning}
                  </div>
                ) : null}

                {currentValidationMessage ? (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {currentValidationMessage}
                  </div>
                ) : null}

                {current.key === "academy_info" ? (
                  <div className={getStepSectionClass("academy_info")}>
                    <AcademyInfoStepSection
                      data={formState.academy_info}
                      showStepErrors={showStepErrors}
                      getFieldErrorClass={getFieldErrorClass}
                      formatPhone={formatPhone}
                      normalizeEmail={normalizeEmail}
                      formatCnpj={formatCnpj}
                      onChangeField={(field, value) => updateTopLevel("academy_info", field, value)}
                    />
                  </div>
                ) : null}

                {current.key === "location" ? (
                  <div className={getStepSectionClass("location")}>
                    <LocationStepSection
                      data={formState.location}
                      isLookingUpZipCode={isLookingUpZipCode}
                      onZipCodeChange={(value) => {
                        const nextZipCode = formatZipCode(value)
                        updateTopLevel("location", "zipCode", nextZipCode)
                        if (nextZipCode.replace(/\D/g, "").length === 8) {
                          void lookupZipCode(nextZipCode)
                        }
                      }}
                      onZipCodeBlur={() => {
                        if (formState.location.zipCode.replace(/\D/g, "").length === 8) {
                          void lookupZipCode()
                        }
                      }}
                      onLookupZipCode={() => {
                        void lookupZipCode()
                      }}
                      onChangeField={(field, value) => updateTopLevel("location", field, value)}
                    />
                  </div>
                ) : null}

                {current.key === "class_structure" ? (
                  <div className={cn("space-y-4", getStepSectionClass("class_structure"))}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Modalidades da academia</p>
                        <p className="text-sm text-muted-foreground">
                          Cadastre as modalidades alinhadas às atividades principais da academia e à estrutura das turmas.
                        </p>
                      </div>
                      <Button onClick={() => addModality()} type="button" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar modalidade
                      </Button>
                    </div>

                    <Accordion
                      type="multiple"
                      defaultValue={[
                        ...new Set(
                          formState.class_structure.modalities
                            .map((item) => item.activityCategory)
                            .filter(Boolean)
                        ),
                      ] as string[]}
                      className="space-y-3"
                    >
                      {formState.academy_info.activityCategories.map((activityCategory) => {
                        const items = formState.class_structure.modalities.filter(
                          (item) => item.activityCategory === activityCategory
                        )

                        return (
                          <AccordionItem
                            key={activityCategory}
                            value={activityCategory}
                            className="rounded-lg border"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                              <div className="flex min-w-0 items-center gap-3 text-left">
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {formatActivityCategory(activityCategory)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {items.length} modalidade{items.length !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3 px-4 pb-4">
                              {items.map((item) => {
                                const index = formState.class_structure.modalities.findIndex(
                                  (value) => value.clientId === item.clientId
                                )

                                return (
                                  <div
                                    key={item.clientId}
                                    className={cn(
                                      "grid gap-3 rounded-2xl border p-4 md:grid-cols-2 xl:grid-cols-6",
                                      showStepErrors &&
                                        isModalityItemInvalid(
                                          item,
                                          formState.academy_info.activityCategories
                                        )
                                        ? "border-destructive/50"
                                        : "border-border"
                                    )}
                                  >
                                    <div className="grid gap-2">
                                      <Label>Atividade</Label>
                                      <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={item.activityCategory ?? ""}
                                        onChange={(event) =>
                                          updateArrayItem(
                                            "class_structure",
                                            index,
                                            "activityCategory",
                                            event.target.value
                                          )
                                        }
                                      >
                                        <option value="" disabled>
                                          Selecione
                                        </option>
                                        {formState.academy_info.activityCategories.map((category) => (
                                          <option key={category} value={category}>
                                            {formatActivityCategory(category)}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="grid gap-2 xl:col-span-2">
                                      <Label>Nome da modalidade</Label>
                                      <Input
                                        value={item.name}
                                        onChange={(event) =>
                                          updateArrayItem("class_structure", index, "name", event.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>Faixa etária</Label>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button className="justify-between" type="button" variant="outline">
                                            <span className="truncate">
                                              {formatAgeGroups(item.ageGroups)}
                                            </span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-56">
                                          {ageGroupOptions.map((option) => (
                                            <DropdownMenuCheckboxItem
                                              key={option.value}
                                              checked={item.ageGroups.includes(option.value)}
                                              onCheckedChange={(checked) => {
                                                const nextAgeGroups = checked
                                                  ? [...item.ageGroups, option.value]
                                                  : item.ageGroups.filter((value) => value !== option.value)
                                                updateArrayItem(
                                                  "class_structure",
                                                  index,
                                                  "ageGroups",
                                                  nextAgeGroups
                                                )
                                              }}
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
                                        value={item.defaultDurationMinutes}
                                        onChange={(event) =>
                                          updateArrayItem(
                                            "class_structure",
                                            index,
                                            "defaultDurationMinutes",
                                            event.target.value
                                          )
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
                                          onClick={() => removeArrayItem("class_structure", index)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={item.defaultCapacity}
                                        onChange={(event) =>
                                          updateArrayItem(
                                            "class_structure",
                                            index,
                                            "defaultCapacity",
                                            event.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                )
                              })}

                              <div className="flex justify-start pt-1">
                                <Button
                                  variant="outline"
                                  onClick={() => addModality(activityCategory)}
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
                  </div>
                ) : null}

                {current.key === "plans" ? (
                  <div className={cn("space-y-4", getStepSectionClass("plans"))}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Planos da academia</p>
                        <p className="text-sm text-muted-foreground">
                          Configure os planos que seus alunos poderão contratar.
                        </p>
                      </div>
                      <Button onClick={addPlan} type="button" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar plano
                      </Button>
                    </div>

                    <Accordion
                      type="multiple"
                      className="space-y-3"
                      defaultValue={formState.plans.plans.map((item) => item.clientId)}
                    >
                      {formState.plans.plans.map((item, index) => (
                        <AccordionItem key={item.clientId} value={item.clientId} className="rounded-lg border">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex min-w-0 items-center gap-3 text-left">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <CreditCard className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{item.name || "Novo plano"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatBillingCycleLabel(item.billingCycle)} • R${" "}
                                  {(parseCurrencyInputToCents(item.amountCents) / 100).toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3 px-4 pb-4">
                            <div
                              className={`space-y-4 rounded-2xl border p-4 ${
                                showStepErrors && isPlanItemInvalid(item, availablePlanModalityIds)
                                  ? "border-destructive/50"
                                  : "border-border"
                              }`}
                            >
                              <div className="flex justify-end">
                                <Button
                                  onClick={() => removeArrayItem("plans", index)}
                                  size="icon"
                                  type="button"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="grid gap-2">
                                  <Label>Nome do plano</Label>
                                  <Input
                                    className={getFieldErrorClass(showStepErrors && !item.name.trim())}
                                    value={item.name}
                                    onChange={(event) =>
                                      updateArrayItem("plans", index, "name", event.target.value)
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Preço (R$)</Label>
                                  <Input
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    className={getFieldErrorClass(
                                      showStepErrors && parseCurrencyInputToCents(item.amountCents) <= 0
                                    )}
                                    value={item.amountCents}
                                    onChange={(event) =>
                                      updateArrayItem(
                                        "plans",
                                        index,
                                        "amountCents",
                                        formatCurrencyInput(event.target.value)
                                      )
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Cobrança</Label>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={item.billingCycle}
                                    onChange={(event) =>
                                      updateArrayItem("plans", index, "billingCycle", event.target.value)
                                    }
                                  >
                                    <option value="monthly">Mensal</option>
                                    <option value="quarterly">Trimestral</option>
                                    <option value="semiannual">Semestral</option>
                                    <option value="yearly">Anual</option>
                                  </select>
                                </div>
                                <div className="grid gap-2">
                                  <Label>Frequência semanal</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.weeklyFrequency}
                                    onChange={(event) =>
                                      updateArrayItem("plans", index, "weeklyFrequency", event.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                  <Label>Limite de aulas</Label>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={item.classLimitKind}
                                    onChange={(event) =>
                                      updateArrayItem("plans", index, "classLimitKind", event.target.value)
                                    }
                                  >
                                    <option value="unlimited">Ilimitado</option>
                                    <option value="weekly">Semanal</option>
                                  </select>
                                </div>
                                {item.classLimitKind === "weekly" ? (
                                  <div className="grid gap-2">
                                    <Label>Quantidade por semana</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={item.classLimitValue}
                                      onChange={(event) =>
                                        updateArrayItem("plans", index, "classLimitValue", event.target.value)
                                      }
                                    />
                                  </div>
                                ) : null}
                              </div>
                              <div className="grid gap-2">
                                <Label>Modalidades incluídas</Label>
                                <div className={cn("rounded-2xl border p-3", showStepErrors && item.includedModalityIds.length === 0 ? "border-destructive/40" : "border-border")}>
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <Label>Modalidades incluídas</Label>
                                    <Badge variant="outline">
                                      {item.includedModalityIds.length} selecionada{item.includedModalityIds.length !== 1 ? "s" : ""}
                                    </Badge>
                                  </div>
                                  <PlanModalitiesMultiselect
                                    selectedIds={item.includedModalityIds}
                                    modalityReferences={availablePlanModalities}
                                    invalid={showStepErrors && item.includedModalityIds.length === 0}
                                    onSelectionChange={(ids) =>
                                      updateArrayItem("plans", index, "includedModalityIds", ids)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    {onboarding.references.modalities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Cadastre modalidades na etapa anterior para montar os planos.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {current.key === "branding" ? (
                  <div className={getStepSectionClass("branding")}>
                    <BrandingStepSection
                      data={formState.branding}
                      isUploadingBranding={isUploadingBranding}
                      normalizeHexColor={normalizeHexColor}
                      onChangeField={(field, value) => updateTopLevel("branding", field, value)}
                      onUpload={(kind, file) => {
                        void uploadBrandingAsset(kind, file)
                      }}
                    />
                  </div>
                ) : null}

                {current.key === "payments" ? (
                  <div className={getStepSectionClass("payments")}>
                    <PaymentsStepSection
                      data={formState.payments}
                      onAcceptedMethodsChange={(methods) => updateTopLevel("payments", "acceptedMethods", methods)}
                      onGatewayChange={(gateway) => updateTopLevel("payments", "gateway", gateway)}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <AcademySetupFooter
              currentStep={currentStep}
              totalSteps={steps.length}
              isSaving={isSaving}
              canClose={data.onboarding.status === "completed" && (manualOpen || forcedOpen)}
              onPrevious={() => {
                setShowStepErrors(false)
                setNavigationWarning(null)
                setCurrentStep((value) => Math.max(value - 1, 0))
              }}
              onNextOrComplete={
                currentStep < steps.length - 1 ? () => saveStep(currentStep, true) : completeOnboarding
              }
              onClose={closeManualOpen}
            />
          </section>
        </div>
          )}

          {autoFillNoticeStep ? (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">Preenchimento inteligente ativado</h3>
                  {autoFillNoticeStep === "class_structure" ? (
                    <p className="text-sm text-muted-foreground">
                      Com base nas atividades selecionadas, já adiantamos o cadastro com modalidades iniciais para
                      acelerar seu onboarding. Revise e ajuste livremente para refletir a realidade da sua academia.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Para agilizar, já preenchemos um plano inicial e vinculamos modalidades automaticamente. Revise e
                      ajuste nomes, valores, frequência e inclusões conforme o seu modelo de negócio.
                    </p>
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <Button type="button" onClick={() => setAutoFillNoticeStep(null)}>
                    Ok, entendido
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
