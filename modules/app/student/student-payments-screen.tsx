"use client"

import { CreditCard, TicketPercent } from "lucide-react"
import type { StudentAppPaymentsData } from "@/apps/api/src/modules/app/domain/student-app"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"

const paymentStatusLabels: Record<StudentAppPaymentsData["paymentStatus"], string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
}

function formatDate(value: string | null) {
  if (!value) return null
  const [year, month, day] = value.split("-")
  return `${day}/${month}/${year}`
}

interface StudentPaymentsScreenProps {
  data: StudentAppPaymentsData
  feedback: string | null
  couponCode: string
  isApplyingCoupon: boolean
  onCouponCodeChange: (value: string) => void
  onApplyCoupon: () => void
}

export function StudentPaymentsScreen({
  data,
  feedback,
  couponCode,
  isApplyingCoupon,
  onCouponCodeChange,
  onApplyCoupon,
}: StudentPaymentsScreenProps) {
  return (
    <div className="space-y-6 p-4">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pagamentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulte seu plano atual, suas cobranças e aplique cupom quando houver elegibilidade.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="font-semibold text-foreground">{paymentStatusLabels[data.paymentStatus]}</p>
        </div>
      </section>

      {feedback ? (
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-foreground">{feedback}</p>
        </section>
      ) : null}

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">{data.planName ?? "Sem plano vinculado"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Status: {paymentStatusLabels[data.paymentStatus]}
              </p>
              {data.amountLabel ? (
                <p className="mt-1 text-sm text-muted-foreground">Valor base: {data.amountLabel}</p>
              ) : null}
              {data.nextPayment ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Próximo vencimento: {formatDate(data.nextPayment)}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {data.currentCharge ? (
        <Card>
          <CardContent className="p-4">
            <p className="font-medium text-foreground">Cobrança atual</p>
            <p className="mt-1 text-sm text-muted-foreground">{data.currentCharge.description}</p>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>Status: {paymentStatusLabels[data.currentCharge.status]}</p>
              <p>Vencimento: {formatDate(data.currentCharge.dueDate)}</p>
              <p>Valor atual: {data.currentCharge.amountLabel}</p>
              {data.currentCharge.originalAmountLabel ? (
                <p>Valor original: {data.currentCharge.originalAmountLabel}</p>
              ) : null}
              {data.currentCharge.discountAmountLabel ? (
                <p className="text-emerald-700">
                  Desconto aplicado: {data.currentCharge.discountAmountLabel}
                </p>
              ) : null}
              {data.currentCharge.appliedCouponCode ? (
                <p>
                  Cupom: {data.currentCharge.appliedCouponCode}
                  {data.currentCharge.appliedCouponTitle
                    ? ` · ${data.currentCharge.appliedCouponTitle}`
                    : ""}
                </p>
              ) : null}
            </div>

            {!data.currentCharge.appliedCouponCode ? (
              <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center gap-2">
                  <TicketPercent className="h-4 w-4 text-primary" />
                  <p className="font-medium text-foreground">Aplicar cupom</p>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={couponCode}
                    onChange={(event) => onCouponCodeChange(event.target.value.toUpperCase())}
                    placeholder="Digite seu cupom"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onApplyCoupon}
                    disabled={isApplyingCoupon}
                  >
                    {isApplyingCoupon ? "Aplicando..." : "Aplicar cupom"}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  O cupom é aplicado na próxima cobrança elegível em aberto e não acumula com outro desconto.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <AppEmptyState message="Nenhuma cobrança em aberto para aplicar cupom agora." />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
