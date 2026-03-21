"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Clock,
  Loader2,
  Plus,
  Receipt,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Progress } from "@/components/ui/progress"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import type {
  FinanceChargeRecord,
  FinanceCouponRecord,
  FinanceDashboardData,
  FinancePaymentMethod,
} from "@/apps/api/src/modules/finance/domain/finance-dashboard"
import { fetchJson } from "@/lib/api/client"

const statusColors = {
  paid: "bg-green-500/10 text-green-600 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  overdue: "bg-red-500/10 text-red-600 border-red-500/20",
  cancelled: "bg-muted text-muted-foreground",
} as const

const statusLabels = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
  cancelled: "Cancelado",
} as const

const chargeTypeOptions = [
  "Mensalidade",
  "Taxa de Matrícula",
  "Taxa de Graduação",
  "Inscrição em Evento",
  "Cobrança Avulsa",
] as const

export function FinanceDashboardScreen() {
  const [dashboard, setDashboard] = useState<FinanceDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("all")
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<FinanceChargeRecord | null>(null)
  const [paymentToRegister, setPaymentToRegister] = useState<FinanceChargeRecord | null>(null)
  const [paymentToDiscount, setPaymentToDiscount] = useState<FinanceChargeRecord | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<FinancePaymentMethod>("PIX")
  const [registeringPaymentId, setRegisteringPaymentId] = useState<string | null>(null)
  const [applyingDiscountId, setApplyingDiscountId] = useState<string | null>(null)
  const [showNewChargeDialog, setShowNewChargeDialog] = useState(false)
  const [showDuplicatePlanDialog, setShowDuplicatePlanDialog] = useState(false)
  const [showNewCouponDialog, setShowNewCouponDialog] = useState(false)
  const [creatingCharge, setCreatingCharge] = useState(false)
  const [creatingCoupon, setCreatingCoupon] = useState(false)
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false)
  const [chargeForm, setChargeForm] = useState({
    userId: "",
    studentProfileId: "",
    type: "Mensalidade",
    recurrenceMode: "ONE_TIME",
    recurringSource: "MANUAL_AMOUNT",
    planId: "",
    amount: "",
    dueDate: "",
    description: "",
  })
  const [manualDiscountForm, setManualDiscountForm] = useState({
    amount: "",
    reason: "",
  })
  const [couponForm, setCouponForm] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "FIXED_AMOUNT",
    value: "",
    appliesToPlanId: "all",
    maxRedemptions: "",
    startsAt: "",
    endsAt: "",
  })

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchJson<{ dashboard: FinanceDashboardData }>("/api/finance")
        if (!active) return
        setDashboard(response.dashboard)
      } catch (loadError) {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o financeiro.")
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const filteredPayments = useMemo(() => {
    if (!dashboard) return []
    return dashboard.payments.filter((payment) => {
      const matchesSearch =
        payment.name.toLowerCase().includes(search.toLowerCase()) ||
        payment.plan.toLowerCase().includes(search.toLowerCase()) ||
        payment.category.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = filterStatus === "all" || payment.status === filterStatus
      const matchesCategory = filterCategory === "all" || payment.category === filterCategory
      const dueDate = new Date(`${payment.dueDate}T12:00:00`)
      const now = new Date()
      let matchesPeriod = true

      if (periodFilter === "30d") {
        const start = new Date(now)
        start.setDate(now.getDate() - 30)
        matchesPeriod = dueDate >= start && dueDate <= now
      } else if (periodFilter === "3m") {
        const start = new Date(now)
        start.setMonth(now.getMonth() - 3)
        matchesPeriod = dueDate >= start && dueDate <= now
      } else if (periodFilter === "range" && rangeStart && rangeEnd) {
        matchesPeriod =
          dueDate >= new Date(`${rangeStart}T00:00:00`) &&
          dueDate <= new Date(`${rangeEnd}T23:59:59`)
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesPeriod
    })
  }, [dashboard, filterCategory, filterStatus, periodFilter, rangeEnd, rangeStart, search])

  const selectedStudent = useMemo(
    () => dashboard?.references.students.find((item) => item.userId === chargeForm.userId) ?? null,
    [chargeForm.userId, dashboard]
  )

  const isRecurringCharge =
    chargeForm.type === "Mensalidade" && chargeForm.recurrenceMode === "RECURRING"
  const isPlanLinkedRecurring =
    isRecurringCharge && chargeForm.recurringSource === "PLAN_LINKED"
  const selectedPlan = dashboard?.plans.find((plan) => plan.id === chargeForm.planId) ?? null

  function resetChargeForm() {
    setChargeForm({
      userId: "",
      studentProfileId: "",
      type: "Mensalidade",
      recurrenceMode: "ONE_TIME",
      recurringSource: "MANUAL_AMOUNT",
      planId: "",
      amount: "",
      dueDate: "",
      description: "",
    })
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    })
  }

  function formatDate(value: string) {
    return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR")
  }

  async function registerPayment() {
    if (!paymentToRegister) return

    setRegisteringPaymentId(paymentToRegister.id)
    setError(null)

    try {
      const response = await fetchJson<{ dashboard: FinanceDashboardData; message: string }>(
        `/api/finance/${paymentToRegister.id}/payment`,
        {
          method: "PATCH",
          body: JSON.stringify({ method: paymentMethod }),
        }
      )
      setDashboard(response.dashboard)
      setSelectedPayment(
        response.dashboard.payments.find((item) => item.id === paymentToRegister.id) ?? null
      )
      setPaymentToRegister(null)
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Não foi possível registrar o pagamento.")
    } finally {
      setRegisteringPaymentId(null)
    }
  }

  async function createCharge(options?: { confirmDuplicatePlan?: boolean }) {
    if (!dashboard) return
    if (!chargeForm.userId || !chargeForm.dueDate || !chargeForm.type) {
      setError("Preencha aluno, tipo e vencimento.")
      return
    }

    if (isPlanLinkedRecurring && !chargeForm.planId) {
      setError("Selecione um plano para criar a mensalidade recorrente.")
      return
    }

    if (!isPlanLinkedRecurring && !chargeForm.amount) {
      setError("Preencha o valor da cobrança.")
      return
    }

    if (isPlanLinkedRecurring && selectedStudent?.planId && !options?.confirmDuplicatePlan) {
      setShowDuplicatePlanDialog(true)
      return
    }

    setCreatingCharge(true)
    setError(null)

    try {
      const response = await fetchJson<{ dashboard: FinanceDashboardData; message: string }>("/api/finance", {
        method: "POST",
        body: JSON.stringify({
          userId: chargeForm.userId,
          studentProfileId: chargeForm.studentProfileId || null,
          category: chargeForm.type,
          description: chargeForm.description || chargeForm.type,
          amount: isPlanLinkedRecurring ? null : Number(chargeForm.amount),
          dueDate: chargeForm.dueDate,
          planId: isPlanLinkedRecurring ? chargeForm.planId : null,
          recurrenceMode: chargeForm.recurrenceMode,
          recurringSource: isRecurringCharge ? chargeForm.recurringSource : null,
          confirmDuplicatePlan: options?.confirmDuplicatePlan === true,
        }),
      })
      setDashboard(response.dashboard)
      setShowNewChargeDialog(false)
      setShowDuplicatePlanDialog(false)
      resetChargeForm()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Não foi possível criar a cobrança.")
    } finally {
      setCreatingCharge(false)
    }
  }

  async function createCoupon() {
    if (!couponForm.code || !couponForm.title || !couponForm.value) {
      setError("Preencha codigo, titulo e valor do cupom.")
      return
    }

    setCreatingCoupon(true)
    setError(null)

    try {
      const response = await fetchJson<{ dashboard: FinanceDashboardData; message: string }>(
        "/api/finance/coupons",
        {
          method: "POST",
          body: JSON.stringify({
            code: couponForm.code,
            title: couponForm.title,
            description: couponForm.description || null,
            discountType: couponForm.discountType,
            value: Number(couponForm.value),
            appliesToPlanId: couponForm.appliesToPlanId === "all" ? null : couponForm.appliesToPlanId,
            maxRedemptions: couponForm.maxRedemptions ? Number(couponForm.maxRedemptions) : null,
            startsAt: couponForm.startsAt || null,
            endsAt: couponForm.endsAt || null,
          }),
        }
      )

      setDashboard(response.dashboard)
      setShowNewCouponDialog(false)
      setCouponForm({
        code: "",
        title: "",
        description: "",
        discountType: "FIXED_AMOUNT",
        value: "",
        appliesToPlanId: "all",
        maxRedemptions: "",
        startsAt: "",
        endsAt: "",
      })
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Nao foi possivel criar o cupom.")
    } finally {
      setCreatingCoupon(false)
    }
  }

  async function applyManualDiscount() {
    if (!paymentToDiscount) return
    if (!manualDiscountForm.amount) {
      setError("Informe o valor do desconto.")
      return
    }

    setApplyingDiscountId(paymentToDiscount.id)
    setError(null)

    try {
      const response = await fetchJson<{ dashboard: FinanceDashboardData; message: string }>(
        `/api/finance/${paymentToDiscount.id}/discount`,
        {
          method: "PATCH",
          body: JSON.stringify({
            amount: Number(manualDiscountForm.amount),
            reason: manualDiscountForm.reason || null,
          }),
        }
      )
      setDashboard(response.dashboard)
      setSelectedPayment(
        response.dashboard.payments.find((item) => item.id === paymentToDiscount.id) ?? null
      )
      setPaymentToDiscount(null)
      setManualDiscountForm({
        amount: "",
        reason: "",
      })
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "Nao foi possivel aplicar o desconto.")
    } finally {
      setApplyingDiscountId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!dashboard) {
    return <div className="py-10 text-sm text-muted-foreground">{error ?? "Falha ao carregar financeiro."}</div>
  }

  return (
    <>
      <Dialog open={showNewChargeDialog} onOpenChange={setShowNewChargeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova cobrança</DialogTitle>
            <DialogDescription>Crie uma cobrança manual para controle interno da academia.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Aluno</Label>
                <Popover open={isStudentPickerOpen} onOpenChange={setIsStudentPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="truncate">
                        {chargeForm.userId
                          ? dashboard.references.students.find((item) => item.userId === chargeForm.userId)?.name
                          : "Selecione o aluno"}
                      </span>
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[340px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar aluno..." />
                      <CommandList>
                        <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                        <CommandGroup>
                          {dashboard.references.students.map((student) => (
                            <CommandItem
                              key={student.userId}
                              value={student.name}
                              onSelect={() => {
                                setChargeForm((current) => ({
                                  ...current,
                                  userId: student.userId,
                                  studentProfileId: student.studentProfileId ?? "",
                                  description: current.description || current.type,
                                }))
                                setIsStudentPickerOpen(false)
                              }}
                            >
                              {student.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Tipo de cobrança</Label>
              <Select
                value={chargeForm.type}
                onValueChange={(value) =>
                  setChargeForm((current) => ({
                    ...current,
                    type: value,
                    recurrenceMode: value === "Mensalidade" ? current.recurrenceMode : "ONE_TIME",
                    recurringSource: value === "Mensalidade" ? current.recurringSource : "MANUAL_AMOUNT",
                    planId: value === "Mensalidade" ? current.planId : "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chargeTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {chargeForm.type === "Mensalidade" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Natureza</Label>
                  <Select
                    value={chargeForm.recurrenceMode}
                    onValueChange={(value) =>
                      setChargeForm((current) => ({
                        ...current,
                        recurrenceMode: value,
                        recurringSource: value === "RECURRING" ? current.recurringSource : "MANUAL_AMOUNT",
                        planId: value === "RECURRING" ? current.planId : "",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONE_TIME">Pontual</SelectItem>
                      <SelectItem value="RECURRING">Recorrente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isRecurringCharge ? (
                  <div className="grid gap-2">
                    <Label>Origem</Label>
                    <Select
                      value={chargeForm.recurringSource}
                      onValueChange={(value) =>
                        setChargeForm((current) => ({
                          ...current,
                          recurringSource: value,
                          planId: value === "PLAN_LINKED" ? current.planId : "",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANUAL_AMOUNT">Valor manual</SelectItem>
                        <SelectItem value="PLAN_LINKED">Plano existente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
            ) : null}
            {isPlanLinkedRecurring ? (
              <div className="grid gap-2">
                <Label>Plano vinculado</Label>
                <Select
                  value={chargeForm.planId}
                  onValueChange={(value) =>
                    setChargeForm((current) => ({
                      ...current,
                      planId: value,
                      description:
                        current.description || dashboard.plans.find((plan) => plan.id === value)?.name || current.type,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboard.plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {selectedStudent?.planId === plan.id
                          ? `${plan.name} · Atualmente ativo`
                          : plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStudent?.planName ? (
                  <p className="text-xs text-muted-foreground">
                    Cliente com plano ativo: {selectedStudent.planName}. Vincular outra recorrência pode duplicar cobranças.
                  </p>
                ) : null}
                {selectedPlan ? (
                  <p className="text-xs text-muted-foreground">
                    Valor do plano selecionado: {formatCurrency(selectedPlan.price)}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-4">
              {!isPlanLinkedRecurring ? (
                <div className="grid gap-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={chargeForm.amount}
                    onChange={(event) => setChargeForm((current) => ({ ...current, amount: event.target.value }))}
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label>Valor</Label>
                  <Input value={selectedPlan ? formatCurrency(selectedPlan.price) : ""} disabled />
                </div>
              )}
              <div className="grid gap-2">
                <Label>Vencimento</Label>
                <Input
                  type="date"
                  value={chargeForm.dueDate}
                  onChange={(event) => setChargeForm((current) => ({ ...current, dueDate: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Input
                value={chargeForm.description}
                onChange={(event) => setChargeForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Detalhes da cobrança"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChargeDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void createCharge()} disabled={creatingCharge}>
              {creatingCharge ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Criar cobrança
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDuplicatePlanDialog} onOpenChange={setShowDuplicatePlanDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicidade de mensalidade</DialogTitle>
            <DialogDescription>
              Cliente {selectedStudent?.name ?? "selecionado"} já possui um plano ativo. Caso você adicione essa cobrança, será gerada mais uma cobrança. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicatePlanDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void createCharge({ confirmDuplicatePlan: true })} disabled={creatingCharge}>
              {creatingCharge ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continuar mesmo assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewCouponDialog} onOpenChange={setShowNewCouponDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo cupom</DialogTitle>
            <DialogDescription>
              Crie um desconto reutilizavel para o aluno aplicar na propria cobranca em aberto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Codigo</Label>
                <Input
                  value={couponForm.code}
                  onChange={(event) =>
                    setCouponForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))
                  }
                  placeholder="DOJO10"
                />
              </div>
              <div className="grid gap-2">
                <Label>Titulo</Label>
                <Input
                  value={couponForm.title}
                  onChange={(event) =>
                    setCouponForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Desconto de boas-vindas"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select
                  value={couponForm.discountType}
                  onValueChange={(value) =>
                    setCouponForm((current) => ({ ...current, discountType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED_AMOUNT">Valor fixo</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{couponForm.discountType === "PERCENTAGE" ? "Percentual" : "Valor"}</Label>
                <Input
                  type="number"
                  value={couponForm.value}
                  onChange={(event) =>
                    setCouponForm((current) => ({ ...current, value: event.target.value }))
                  }
                  placeholder={couponForm.discountType === "PERCENTAGE" ? "10" : "50"}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Plano</Label>
              <Select
                value={couponForm.appliesToPlanId}
                onValueChange={(value) =>
                  setCouponForm((current) => ({ ...current, appliesToPlanId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  {dashboard.plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Limite</Label>
                <Input
                  type="number"
                  value={couponForm.maxRedemptions}
                  onChange={(event) =>
                    setCouponForm((current) => ({ ...current, maxRedemptions: event.target.value }))
                  }
                  placeholder="Opcional"
                />
              </div>
              <div className="grid gap-2">
                <Label>Inicio</Label>
                <Input
                  type="date"
                  value={couponForm.startsAt}
                  onChange={(event) =>
                    setCouponForm((current) => ({ ...current, startsAt: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Fim</Label>
                <Input
                  type="date"
                  value={couponForm.endsAt}
                  onChange={(event) =>
                    setCouponForm((current) => ({ ...current, endsAt: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Descricao</Label>
              <Input
                value={couponForm.description}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Uso unico para alunos novos"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCouponDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void createCoupon()} disabled={creatingCoupon}>
              {creatingCoupon ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Criar cupom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(paymentToRegister)} onOpenChange={(open) => !open && setPaymentToRegister(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
            <DialogDescription>
              Confirme a forma de pagamento e marque a cobrança como paga.
            </DialogDescription>
          </DialogHeader>
          {paymentToRegister ? (
            <div className="grid gap-4 py-2">
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="font-medium">{paymentToRegister.name}</p>
                <p className="text-sm text-muted-foreground">{paymentToRegister.plan}</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(paymentToRegister.amount)}</p>
              </div>
              <div className="grid gap-2">
                <Label>Método</Label>
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as FinancePaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="CARD">Cartão</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                    <SelectItem value="CASH">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentToRegister(null)}>
              Fechar
            </Button>
            <Button onClick={() => void registerPayment()} disabled={registeringPaymentId != null}>
              {registeringPaymentId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Marcar como pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(paymentToDiscount)} onOpenChange={(open) => !open && setPaymentToDiscount(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aplicar desconto</DialogTitle>
            <DialogDescription>
              Use esta acao para negociar uma divida ou ajustar manualmente uma cobranca em aberto.
            </DialogDescription>
          </DialogHeader>
          {paymentToDiscount ? (
            <div className="grid gap-4 py-2">
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="font-medium">{paymentToDiscount.name}</p>
                <p className="text-sm text-muted-foreground">{paymentToDiscount.plan}</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(paymentToDiscount.amount)}</p>
              </div>
              <div className="grid gap-2">
                <Label>Valor do desconto</Label>
                <Input
                  type="number"
                  value={manualDiscountForm.amount}
                  onChange={(event) =>
                    setManualDiscountForm((current) => ({ ...current, amount: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Motivo</Label>
                <Input
                  value={manualDiscountForm.reason}
                  onChange={(event) =>
                    setManualDiscountForm((current) => ({ ...current, reason: event.target.value }))
                  }
                  placeholder="Opcional"
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentToDiscount(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void applyManualDiscount()} disabled={applyingDiscountId != null}>
              {applyingDiscountId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Aplicar desconto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedPayment)} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-md">
          {selectedPayment ? (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da cobrança</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedPayment.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedPayment.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPayment.plan}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard label="Valor" value={formatCurrency(selectedPayment.amount)} />
                  <InfoCard label="Status" value={statusLabels[selectedPayment.status]} toneClass={statusColors[selectedPayment.status]} />
                </div>
                <div className="space-y-2 text-sm">
                  {selectedPayment.originalAmount != null ? (
                    <InfoRow label="Valor original" value={formatCurrency(selectedPayment.originalAmount)} />
                  ) : null}
                  {selectedPayment.discountAmount > 0 ? (
                    <InfoRow label="Desconto" value={formatCurrency(selectedPayment.discountAmount)} />
                  ) : null}
                  <InfoRow label="Vencimento" value={formatDate(selectedPayment.dueDate)} />
                  {selectedPayment.date ? <InfoRow label="Pagamento" value={formatDate(selectedPayment.date)} /> : null}
                  {selectedPayment.method ? <InfoRow label="Método" value={formatPaymentMethodLabel(selectedPayment.method)} /> : null}
                  {selectedPayment.discountSource ? (
                    <InfoRow
                      label="Origem do desconto"
                      value={selectedPayment.discountSource === "manual" ? "Manual" : "Cupom"}
                    />
                  ) : null}
                  {selectedPayment.appliedCouponCode ? (
                    <InfoRow label="Cupom" value={selectedPayment.appliedCouponCode} />
                  ) : null}
                  {selectedPayment.discountReason ? (
                    <InfoRow label="Motivo do desconto" value={selectedPayment.discountReason} />
                  ) : null}
                  <InfoRow label="Descrição" value={selectedPayment.description} />
                </div>
              </div>
              <DialogFooter>
                {selectedPayment.status === "pending" || selectedPayment.status === "overdue" ? (
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setManualDiscountForm({ amount: "", reason: "" })
                        setPaymentToDiscount(selectedPayment)
                      }}
                    >
                      Aplicar desconto
                    </Button>
                    <Button
                      onClick={() => {
                        setPaymentMethod("PIX")
                        setPaymentToRegister(selectedPayment)
                      }}
                    >
                      Registrar pagamento
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline">
                    <Receipt className="mr-2 h-4 w-4" />
                    Pagamento confirmado
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Financeiro</h1>
            <p className="text-muted-foreground">Controle manual de cobranças e pagamentos da academia.</p>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <FinanceMetricCard title="Receita mensal" value={formatCurrency(dashboard.stats.revenue)} icon={Wallet} tone="primary" />
          <FinanceMetricCard title="Pendente" value={formatCurrency(dashboard.stats.pending)} icon={Clock} tone="warning" />
          <FinanceMetricCard title="Atrasado" value={formatCurrency(dashboard.stats.overdue)} icon={AlertCircle} tone="danger" />
          <FinanceMetricCard title="Ticket médio" value={formatCurrency(dashboard.stats.avgTicket)} icon={TrendingUp} tone="success" />
        </div>

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Cobranças</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <div className="flex justify-start">
              <Button className="gap-2" onClick={() => setShowNewChargeDialog(true)}>
                <Plus className="h-4 w-4" />
                Nova cobrança
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar cobranças..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="overdue">Atrasados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="3m">Últimos 3 meses</SelectItem>
                  <SelectItem value="range">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodFilter === "range" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>De</Label>
                  <Input type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Até</Label>
                  <Input type="date" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} />
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              <QuickActionCard
                title="Pendentes"
                value={dashboard.payments.filter((item) => item.status === "pending").length}
                tone="warning"
              />
              <QuickActionCard
                title="Atrasados"
                value={dashboard.payments.filter((item) => item.status === "overdue").length}
                tone="danger"
              />
              <QuickActionCard
                title="Alunos ativos"
                value={dashboard.stats.activeStudents}
                tone="success"
              />
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base font-medium">
                    {filteredPayments.length} cobrança{filteredPayments.length !== 1 ? "s" : ""}
                  </CardTitle>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                      <SelectValue placeholder="Tipo de cobrança" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {chargeTypeOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="cursor-pointer" onClick={() => setSelectedPayment(payment)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {payment.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{payment.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{payment.plan}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.category}</TableCell>
                        <TableCell>{formatDate(payment.dueDate)}</TableCell>
                        <TableCell>
                          {payment.date ? <span className="text-green-600">{formatDate(payment.date)}</span> : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <div className="space-y-1">
                            <p>{formatCurrency(payment.amount)}</p>
                            {payment.discountAmount > 0 ? (
                              <p className="text-xs text-muted-foreground">
                                desconto {formatCurrency(payment.discountAmount)}
                              </p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[payment.status]}>{statusLabels[payment.status]}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.status === "pending" || payment.status === "overdue" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation()
                                setPaymentMethod("PIX")
                                setPaymentToRegister(payment)
                              }}
                            >
                              Registrar pagamento
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <div className="flex justify-start">
              <Button className="gap-2" onClick={() => setShowNewCouponDialog(true)}>
                <Plus className="h-4 w-4" />
                Novo cupom
              </Button>
            </div>
            <div className="-mx-1 overflow-x-auto pb-2">
              <div className="flex min-w-full gap-4 px-1">
                {dashboard.plans.map((plan) => (
                  <Card key={plan.id} className="w-[280px] min-w-[280px]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 text-3xl font-bold text-primary">{formatCurrency(plan.price)}</div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{plan.students} alunos</span>
                        </div>
                        <span>{plan.modalities} modalidade{plan.modalities !== 1 ? "s" : ""}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Distribuição por plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[320px] space-y-4 overflow-y-auto pr-2">
                  {dashboard.plans.map((plan) => {
                    const percentage =
                      dashboard.stats.activeStudents > 0
                        ? Math.round((plan.students / dashboard.stats.activeStudents) * 100)
                        : 0

                    return (
                      <div key={plan.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{plan.name}</span>
                          <span className="font-medium">
                            {plan.students} ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Cupons ativos e historico recente</CardTitle>
                <CardDescription>
                  Os cupons nao acumulam entre si e serao aplicados na cobranca em aberto do aluno.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.coupons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum cupom criado ainda.
                  </p>
                ) : (
                  dashboard.coupons.map((coupon) => (
                    <CouponRow key={coupon.id} coupon={coupon} />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </>
  )
}

function FinanceMetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  icon: typeof Wallet
  tone: "primary" | "success" | "warning" | "danger"
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-500",
    warning: "bg-yellow-500/10 text-yellow-500",
    danger: "bg-red-500/10 text-red-500",
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
            <Icon className="h-5 w-5" />
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

function QuickActionCard({
  title,
  value,
  tone,
}: {
  title: string
  value: number
  tone: "warning" | "danger" | "success"
}) {
  const toneClasses = {
    warning: "bg-yellow-500/10 text-yellow-500",
    danger: "bg-red-500/10 text-red-500",
    success: "bg-green-500/10 text-green-500",
  }

  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]} md:h-10 md:w-10`}>
            {tone === "warning" ? (
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
            ) : tone === "danger" ? (
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Users className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold leading-none md:text-2xl">{value}</p>
            <p className="truncate text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CouponRow({ coupon }: { coupon: FinanceCouponRecord }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{coupon.title}</p>
            <Badge className={coupon.isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}>
              {coupon.isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Codigo {coupon.code}
            {coupon.appliesToPlanName ? ` · ${coupon.appliesToPlanName}` : " · Todos os planos"}
          </p>
          {coupon.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{coupon.description}</p>
          ) : null}
        </div>
        <div className="text-sm">
          <p className="font-medium">{coupon.discountLabel} de desconto</p>
          <p className="text-muted-foreground">
            {coupon.redemptionCount}
            {coupon.maxRedemptions != null ? ` / ${coupon.maxRedemptions}` : ""} usos
          </p>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value, toneClass }: { label: string; value: string; toneClass?: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      {toneClass ? <Badge className={`mt-1 ${toneClass}`}>{value}</Badge> : <p className="text-lg font-bold">{value}</p>}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function formatPaymentMethodLabel(method: FinancePaymentMethod) {
  switch (method) {
    case "CARD":
      return "Cartão"
    case "BOLETO":
      return "Boleto"
    case "CASH":
      return "Dinheiro"
    default:
      return "PIX"
  }
}
