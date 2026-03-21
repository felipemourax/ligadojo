"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, ChevronDown, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ApiError, fetchJson } from "@/lib/api/client"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"

interface CadastroPageClientProps {
  tenant: {
    kind: "platform" | "tenant" | "unknown"
    tenantSlug: string | null
    tenantName: string | null
  }
  branding: {
    appName: string
    shortName: string
    themeColor: string
    backgroundColor: string
    logoUrl: string | null
    bannerUrl: string | null
  }
  modalities: Array<{
    id: string
    name: string
    ageGroups?: Array<"kids" | "juvenile" | "adult" | "mixed">
  }>
  activityCategories: Array<{
    value: string
    label: string
  }>
}

const platformModalities = [
  { value: "jiu-jitsu", label: "Jiu-Jitsu" },
  { value: "muay-thai", label: "Muay Thai" },
  { value: "judo", label: "Judô" },
  { value: "karate", label: "Karatê" },
  { value: "taekwondo", label: "Taekwondo" },
  { value: "boxe", label: "Boxe" },
  { value: "mma", label: "MMA" },
  { value: "outras", label: "Outras" },
]

const teacherRoleOptions = [
  "Professor",
  "Instrutor chefe",
  "Instrutor",
  "Assistente",
] as const

const teacherRankOptions = ["Branca", "Azul", "Roxa", "Marrom", "Preta"] as const

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`

  const prefix = digits.length === 11 ? digits.slice(2, 7) : digits.slice(2, 6)
  const suffix = digits.length === 11 ? digits.slice(7) : digits.slice(6)
  return `(${digits.slice(0, 2)}) ${prefix}-${suffix}`
}

function formatZipCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  return digits.length <= 5 ? digits : `${digits.slice(0, 5)}-${digits.slice(5)}`
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function formatAgeGroups(ageGroups?: Array<"kids" | "juvenile" | "adult" | "mixed">) {
  if (!ageGroups || ageGroups.length === 0) {
    return ""
  }

  const labels = {
    kids: "Kids",
    juvenile: "Juvenil",
    adult: "Adulto",
    mixed: "Misto",
  } as const

  return ageGroups.map((item) => labels[item]).join(", ")
}

export function CadastroPageClient({
  tenant,
  branding,
  modalities,
  activityCategories,
}: CadastroPageClientProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLookingUpZipCode, setIsLookingUpZipCode] = useState(false)
  const [isEnrollmentTargetPickerOpen, setIsEnrollmentTargetPickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stepErrorVisible, setStepErrorVisible] = useState(false)
  const [existingAccessHint, setExistingAccessHint] = useState<{
    title: string
    description: string
    acceptInvitationPath?: string
    loginPath: string
    resetPasswordPath?: string
  } | null>(null)
  const [formData, setFormData] = useState({
    nomeAcademia: "",
    activityCategories: [] as string[],
    whatsapp: "",
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    requestedRole: "student" as "student" | "teacher",
    firstName: "",
    lastName: "",
    birthDate: "",
    emergencyContact: "",
    teacherRoleTitle: "Professor" as (typeof teacherRoleOptions)[number],
    teacherRank: "Preta" as (typeof teacherRankOptions)[number],
    requestedModalityIds: [] as string[],
    requestedActivityCategories: [] as string[],
    zipCode: "",
    street: "",
    city: "",
    state: "",
  })

  const isTenantHost = tenant.kind === "tenant"
  const brandColor = branding.themeColor ?? "hsl(var(--primary))"
  const selectedTeacherModalities = useMemo(
    () => modalities.filter((item) => formData.requestedModalityIds.includes(item.id)),
    [modalities, formData.requestedModalityIds]
  )
  const selectedStudentActivities = useMemo(
    () => activityCategories.filter((item) => formData.requestedActivityCategories.includes(item.value)),
    [activityCategories, formData.requestedActivityCategories]
  )
  const selectedActivityCategories = useMemo(
    () => platformModalities.filter((item) => formData.activityCategories.includes(item.value)),
    [formData.activityCategories]
  )

  useEffect(() => {
    if (!isTenantHost) return

    const zipCode = formData.zipCode.replace(/\D/g, "")
    if (zipCode.length !== 8) return

    void lookupZipCode(zipCode)
  }, [formData.zipCode, isTenantHost])

  async function lookupZipCode(rawZipCode?: string) {
    const zipCode = (rawZipCode ?? formData.zipCode).replace(/\D/g, "")
    if (zipCode.length !== 8) return

    setIsLookingUpZipCode(true)

    try {
      const response = await fetchJson<{
        street: string
        city: string
        state: string
      }>(`/api/location/lookup?zipCode=${zipCode}`)

      setFormData((current) => ({
        ...current,
        zipCode: formatZipCode(zipCode),
        street: response.street ?? current.street,
        city: response.city ?? current.city,
        state: response.state ?? current.state,
      }))
    } catch {
      // fallback manual
    } finally {
      setIsLookingUpZipCode(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const isCurrentStepValid = isTenantHost ? isTenantStep2Valid : isPlatformStep2Valid

    if (!isCurrentStepValid) {
      const message = "Preencha os campos obrigatórios antes de finalizar o cadastro."
      setStepErrorVisible(true)
      setError(message)
      toast({
        variant: "destructive",
        title: "Campos obrigatórios pendentes",
        description: message,
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setExistingAccessHint(null)

    try {
      if (isTenantHost && tenant.tenantSlug) {
        await fetchJson(`/api/tenants/${tenant.tenantSlug}/enrollment-requests`, {
          method: "POST",
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            whatsapp: formData.whatsapp,
            birthDate: formData.birthDate,
            emergencyContact:
              formData.requestedRole === "student" ? formData.emergencyContact : undefined,
            teacherRoleTitle:
              formData.requestedRole === "teacher" ? formData.teacherRoleTitle : undefined,
            teacherRank: formData.requestedRole === "teacher" ? formData.teacherRank : undefined,
            requestedModalityIds:
              formData.requestedRole === "teacher" ? formData.requestedModalityIds : [],
            requestedActivityCategories:
              formData.requestedRole === "student" ? formData.requestedActivityCategories : [],
            email: normalizeEmail(formData.email),
            password: formData.password,
            requestedRole: formData.requestedRole,
            zipCode: formData.zipCode,
            street: formData.street,
            city: formData.city,
            state: formData.state,
          }),
        })
      } else {
        await fetchJson("/api/onboarding/academy", {
          method: "POST",
          body: JSON.stringify({
            academyName: formData.nomeAcademia,
            activityCategories: formData.activityCategories,
            ownerName: formData.nome,
            ownerEmail: normalizeEmail(formData.email),
            ownerPhone: formData.whatsapp,
            password: formData.password,
          }),
        })
      }

      window.dispatchEvent(new Event("dojo-session-refresh"))
      toast({
        title: isTenantHost ? "Cadastro enviado" : "Academia criada",
        description: isTenantHost
          ? "Seu acesso foi criado com sucesso."
          : "Sua academia foi criada e o setup inicial já pode começar.",
      })
      router.push(isTenantHost ? routes.tenantApp : routes.dashboard)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && isTenantHost) {
        const details =
	          typeof err.details === "object" && err.details !== null
	            ? (err.details as {
	                code?: string
	                accessState?: "invited" | "active" | "pending"
	                acceptInvitationPath?: string
	                loginPath?: string
	                resetPasswordPath?: string
              })
            : null

        if (
          details?.code === "access_already_exists" ||
          details?.code === "access_pending" ||
          details?.code === "invitation_pending"
        ) {
          setExistingAccessHint({
            title:
              details.code === "invitation_pending"
                ? "Seu acesso já foi iniciado pela academia"
                : details.accessState === "pending"
                  ? "Seu acesso já está em análise"
                  : "Seu acesso a esta academia já foi criado",
            description:
              details.code === "invitation_pending"
                ? "A academia já cadastrou você. Aceite o convite para criar sua senha e concluir a entrada no app."
                : details.accessState === "pending"
                  ? "Entre com sua conta para acompanhar a aprovação da academia ou redefina sua senha, se necessário."
                  : "A academia já criou seu acesso. Entre com sua conta ou redefina a senha para continuar.",
            acceptInvitationPath:
              typeof details.acceptInvitationPath === "string"
                ? details.acceptInvitationPath
                : undefined,
            loginPath: details.loginPath ?? routes.login,
            resetPasswordPath: details.resetPasswordPath,
          })
          setError(null)
          return
        }
      }

      if (err instanceof ApiError && err.status === 403 && isTenantHost) {
        setError("Esta conta já existe, mas não possui acesso a esta academia.")
      } else {
        const message =
          err instanceof Error
            ? err.message
            : isTenantHost
              ? "Não foi possível criar seu acesso à academia."
              : "Não foi possível criar a academia."
        setError(message)
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: message,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isPlatformStep1Valid = Boolean(
    formData.nomeAcademia.trim() &&
      formData.activityCategories.length > 0 &&
      formData.whatsapp.replace(/\D/g, "").length >= 10
  )
  const isPlatformStep2Valid = Boolean(
    formData.nome.trim() &&
      formData.email.trim() &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword
  )
  const isTenantStep1Valid = Boolean(
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.whatsapp &&
      formData.birthDate &&
      (
        (formData.requestedRole === "teacher" && formData.requestedModalityIds.length > 0) ||
        (formData.requestedRole === "student" && formData.requestedActivityCategories.length > 0)
      ) &&
      (formData.requestedRole === "student" ||
        (formData.teacherRoleTitle &&
          formData.teacherRank))
  )
  const isTenantStep2Valid = Boolean(formData.zipCode && formData.street && formData.city && formData.state)

  return (
    <div className="relative min-h-screen overflow-hidden bg-background safe-top safe-bottom">
      {branding.bannerUrl ? (
        <div className="absolute inset-x-0 top-0 h-64 sm:h-80">
          <Image
            alt={`Banner de ${branding.appName}`}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={branding.bannerUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-background" />
        </div>
      ) : (
        <div
          className="absolute inset-x-0 top-0 h-64 sm:h-80"
          style={{
            background: `linear-gradient(180deg, ${brandColor}33 0%, ${brandColor}14 38%, transparent 100%)`,
          }}
        />
      )}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-lg"
            style={{ backgroundColor: isTenantHost ? `${brandColor}22` : "hsl(var(--primary))" }}
          >
            {branding.logoUrl ? (
              <Image
                alt={`Logo de ${branding.appName}`}
                className="h-full w-full object-cover"
                height={56}
                src={branding.logoUrl}
                width={56}
              />
            ) : (
              <span className="text-xl font-bold text-primary-foreground">
                {isTenantHost ? branding.shortName?.[0] ?? "A" : "D"}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {isTenantHost ? `Criar acesso para ${tenant.tenantName ?? "a academia"}` : "Criar conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isTenantHost
              ? "Cadastre seus dados para acessar o app da academia."
              : "Comece a configurar sua academia em poucos minutos."}
          </p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium ${
            step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}>
            {step > 1 ? <Check className="h-5 w-5" /> : "1"}
          </div>
          <div className={`h-1 w-16 rounded-full ${step > 1 ? "bg-primary" : "bg-secondary"}`} />
          <div className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium ${
            step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}>
            2
          </div>
        </div>

        <Card className="w-full max-w-[420px] border-border bg-card/95 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold">
              {isTenantHost
                ? step === 1
                  ? "Dados pessoais"
                  : "Endereço"
                : step === 1
                  ? "Dados da academia"
                  : "Seus dados"}
            </CardTitle>
            <CardDescription>
              {isTenantHost
                ? step === 1
                  ? "Conte um pouco sobre você para criar seu acesso."
                  : "Informe seu CEP para completar seu cadastro."
                : step === 1
                  ? "Informações básicas da sua academia"
                  : "Crie suas credenciais de acesso"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isTenantHost && step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nomeAcademia">Nome da Academia</Label>
                    <Input
                      id="nomeAcademia"
                      placeholder="Ex: Academia Força Total"
                      value={formData.nomeAcademia}
                      onChange={(event) => setFormData({ ...formData, nomeAcademia: event.target.value })}
                      required
                      className={cn("bg-input", stepErrorVisible && !formData.nomeAcademia.trim() && "border-destructive")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Modalidade(s)</Label>
                    <Popover open={isEnrollmentTargetPickerOpen} onOpenChange={setIsEnrollmentTargetPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-between bg-input",
                            stepErrorVisible && formData.activityCategories.length === 0 && "border-destructive"
                          )}
                        >
                          <span className="truncate text-left">
                            {selectedActivityCategories.length
                              ? selectedActivityCategories.map((item) => item.label).join(", ")
                              : "Selecione as categorias esportivas"}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[340px] p-0">
                        <Command>
                          <CommandList>
                            <CommandEmpty>Nenhuma atividade encontrada.</CommandEmpty>
                            <CommandGroup>
                              {platformModalities.map((item) => {
                                const checked = formData.activityCategories.includes(item.value)

                                return (
                                  <CommandItem
                                    key={item.value}
                                    onSelect={() =>
                                      setFormData((current) => ({
                                        ...current,
                                        activityCategories: checked
                                          ? current.activityCategories.filter((value) => value !== item.value)
                                          : [...current.activityCategories, item.value],
                                      }))
                                    }
                                  >
                                    <Checkbox checked={checked} className="mr-2" />
                                    <span>{item.label}</span>
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappAcademia">WhatsApp</Label>
                    <Input
                      id="whatsappAcademia"
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(event) =>
                        setFormData({ ...formData, whatsapp: formatPhone(event.target.value) })
                      }
                      required
                      className={cn(
                        "bg-input",
                        stepErrorVisible && formData.whatsapp.replace(/\D/g, "").length < 10 && "border-destructive"
                      )}
                    />
                  </div>
                </>
              )}

              {!isTenantHost && step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Seu nome</Label>
                    <Input
                      id="nome"
                      placeholder="Nome completo"
                      value={formData.nome}
                      onChange={(event) => setFormData({ ...formData, nome: event.target.value })}
                      required
                      className={cn("bg-input", stepErrorVisible && !formData.nome.trim() && "border-destructive")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: normalizeEmail(event.target.value) })}
                      required
                      className={cn("bg-input", stepErrorVisible && !formData.email.trim() && "border-destructive")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                        required
                        minLength={8}
                        className={cn("bg-input pr-10", stepErrorVisible && formData.password.length < 8 && "border-destructive")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
                      required
                      className={cn(
                        "bg-input",
                        stepErrorVisible &&
                          (!formData.confirmPassword || formData.password !== formData.confirmPassword) &&
                          "border-destructive"
                      )}
                    />
                  </div>
                </>
              )}

              {isTenantHost && step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label>Como você quer entrar</Label>
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
                      <button
                        type="button"
                        onClick={() => setFormData((current) => ({ ...current, requestedRole: "student" }))}
                        className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                          formData.requestedRole === "student"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                        }`}
                      >
                        Sou aluno
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((current) => ({ ...current, requestedRole: "teacher" }))}
                        className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                          formData.requestedRole === "teacher"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                        }`}
                      >
                        Sou professor
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                        required
                        className={cn("bg-input", stepErrorVisible && !formData.firstName && "border-destructive")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                        required
                        className={cn("bg-input", stepErrorVisible && !formData.lastName && "border-destructive")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: normalizeEmail(event.target.value) })}
                      required
                      className={cn("bg-input", stepErrorVisible && !formData.email && "border-destructive")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(event) =>
                        setFormData({ ...formData, whatsapp: formatPhone(event.target.value) })
                      }
                      required
                      className={cn("bg-input", stepErrorVisible && !formData.whatsapp && "border-destructive")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(event) => setFormData({ ...formData, birthDate: event.target.value })}
                      required
                      className={cn("bg-input", stepErrorVisible && !formData.birthDate && "border-destructive")}
                    />
                  </div>
                  {formData.requestedRole === "student" ? (
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Contato de emergência (opcional)</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(event) =>
                          setFormData({ ...formData, emergencyContact: formatPhone(event.target.value) })
                        }
                        className="bg-input"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="teacherRoleTitle">Função</Label>
                        <Select
                          value={formData.teacherRoleTitle}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              teacherRoleTitle: value as (typeof teacherRoleOptions)[number],
                            })
                          }
                        >
                          <SelectTrigger id="teacherRoleTitle" className="bg-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {teacherRoleOptions.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teacherRank">Faixa</Label>
                        <Select
                          value={formData.teacherRank}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              teacherRank: value as (typeof teacherRankOptions)[number],
                            })
                          }
                        >
                          <SelectTrigger id="teacherRank" className="bg-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {teacherRankOptions.map((rank) => (
                              <SelectItem key={rank} value={rank}>
                                Faixa {rank.toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label>{formData.requestedRole === "teacher" ? "Atividades que atua" : "Atividades que pratica"}</Label>
                    <Popover open={isEnrollmentTargetPickerOpen} onOpenChange={setIsEnrollmentTargetPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-between",
                            stepErrorVisible &&
                              (
                                (formData.requestedRole === "teacher" && formData.requestedModalityIds.length === 0) ||
                                (formData.requestedRole === "student" && formData.requestedActivityCategories.length === 0)
                              ) &&
                              "border-destructive"
                          )}
                        >
                          <span className="truncate text-left">
                            {formData.requestedRole === "teacher"
                              ? selectedTeacherModalities.length
                                ? selectedTeacherModalities.map((item) => item.name).join(", ")
                                : "Selecione as modalidades"
                              : selectedStudentActivities.length
                                ? selectedStudentActivities.map((item) => item.label).join(", ")
                                : "Selecione as atividades principais"}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[340px] p-0">
                        <Command>
                          <CommandList>
                            {formData.requestedRole === "teacher" ? (
                              <>
                                <CommandEmpty>Nenhuma modalidade cadastrada.</CommandEmpty>
                                <CommandGroup>
                                  {modalities.map((item) => {
                                    const checked = formData.requestedModalityIds.includes(item.id)

                                    return (
                                      <CommandItem
                                        key={item.id}
                                        onSelect={() =>
                                          setFormData((current) => ({
                                            ...current,
                                            requestedModalityIds: checked
                                              ? current.requestedModalityIds.filter((value) => value !== item.id)
                                              : [...current.requestedModalityIds, item.id],
                                          }))
                                        }
                                      >
                                        <Checkbox checked={checked} className="mr-2" />
                                        <div className="flex flex-col">
                                          <span>{item.name}</span>
                                          {item.ageGroups?.length ? (
                                            <span className="text-xs text-muted-foreground">
                                              {formatAgeGroups(item.ageGroups)}
                                            </span>
                                          ) : null}
                                        </div>
                                      </CommandItem>
                                    )
                                  })}
                                </CommandGroup>
                              </>
                            ) : (
                              <>
                                <CommandEmpty>Nenhuma atividade principal cadastrada.</CommandEmpty>
                                <CommandGroup>
                                  {activityCategories.map((item) => {
                                    const checked = formData.requestedActivityCategories.includes(item.value)

                                    return (
                                      <CommandItem
                                        key={item.value}
                                        onSelect={() =>
                                          setFormData((current) => ({
                                            ...current,
                                            requestedActivityCategories: checked
                                              ? current.requestedActivityCategories.filter((value) => value !== item.value)
                                              : [...current.requestedActivityCategories, item.value],
                                          }))
                                        }
                                      >
                                        <Checkbox checked={checked} className="mr-2" />
                                        <div className="flex flex-col">
                                          <span>{item.label}</span>
                                        </div>
                                      </CommandItem>
                                    )
                                  })}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                        required
                        minLength={8}
                        className={cn("bg-input pr-10", stepErrorVisible && formData.password.length < 8 && "border-destructive")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {isTenantHost && step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(event) =>
                          setFormData({ ...formData, zipCode: formatZipCode(event.target.value) })
                        }
                        required
                        className="bg-input"
                      />
                      <Button type="button" variant="outline" onClick={() => lookupZipCode()} disabled={isLookingUpZipCode}>
                        {isLookingUpZipCode ? "Buscando..." : "Buscar"}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(event) => setFormData({ ...formData, street: event.target.value })}
                      required
                      className="bg-input"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(event) => setFormData({ ...formData, city: event.target.value })}
                        required
                        className="bg-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(event) => setFormData({ ...formData, state: event.target.value })}
                        required
                        className="bg-input"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                ) : (
                  <span />
                )}

                {step === 1 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (!(isTenantHost ? isTenantStep1Valid : isPlatformStep1Valid)) {
                        setStepErrorVisible(true)
                        const message = "Preencha os campos obrigatórios antes de continuar."
                        setError(message)
                        toast({
                          variant: "destructive",
                          title: "Campos obrigatórios pendentes",
                          description: message,
                        })
                        return
                      }
                      setError(null)
                      setStepErrorVisible(false)
                      setStep(2)
                    }}
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : isTenantHost ? (
                      "Criar meu acesso"
                    ) : (
                      "Criar academia"
                    )}
                  </Button>
                )}
              </div>

              <p className="pt-2 text-center text-sm text-muted-foreground">
                Já tem acesso?{" "}
                <Link href={routes.login} className="font-medium text-primary hover:underline">
                  Entrar
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(existingAccessHint)} onOpenChange={(open) => !open && setExistingAccessHint(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{existingAccessHint?.title ?? "Atenção"}</DialogTitle>
            <DialogDescription>{existingAccessHint?.description ?? ""}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {existingAccessHint?.acceptInvitationPath ? (
              <Button asChild>
                <Link href={existingAccessHint.acceptInvitationPath}>Aceitar convite</Link>
              </Button>
            ) : null}

            <Button asChild variant={existingAccessHint?.acceptInvitationPath ? "outline" : "default"}>
              <Link href={existingAccessHint?.loginPath ?? routes.login}>Entrar na academia</Link>
            </Button>

            {existingAccessHint?.resetPasswordPath ? (
              <Button asChild variant="outline">
                <Link href={existingAccessHint.resetPasswordPath}>Criar ou redefinir senha</Link>
              </Button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
