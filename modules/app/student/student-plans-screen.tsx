"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Calendar, ChevronRight, CreditCard, FileText } from "lucide-react"
import type { StudentAppPlansData } from "@/apps/api/src/modules/app/domain/student-app"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { routes } from "@/lib/routes"

interface StudentPlansScreenProps {
  data: StudentAppPlansData
  feedback: string | null
  selectedPlanId: string | null
  isSaving: boolean
  onSelectPlan: (planId: string | null) => void
  onConfirmActivation: () => void
}

export function StudentPlansScreen({
  data,
  feedback,
  selectedPlanId,
  isSaving,
  onSelectPlan,
  onConfirmActivation,
}: StudentPlansScreenProps) {
  const selectedPlan = useMemo(
    () => data.plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [data.plans, selectedPlanId]
  )

  const currentPlan = useMemo(
    () => data.plans.find((plan) => plan.isCurrent) ?? null,
    [data.plans]
  )

  const otherPlans = useMemo(
    () => data.plans.filter((plan) => !plan.isCurrent),
    [data.plans]
  )

  const currentCardTitle = data.currentPlanName ?? data.pendingPlanName ?? "Sem plano ativo"
  const currentAmountLabel = currentPlan?.amountLabel ?? null
  const currentBillingCycleLabel = currentPlan?.billingCycleLabel ?? null
  const currentModalityNames = currentPlan?.modalityNames ?? []

  return (
    <div className="space-y-4 p-4">
      {feedback ? (
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-foreground">{feedback}</p>
        </section>
      ) : null}

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Badge className="mb-2">
                {data.currentPlanName
                  ? "Plano atual"
                  : data.pendingPlanName
                    ? "Solicitação em análise"
                    : "Plano"}
              </Badge>
              <h1 className="text-lg font-bold text-foreground">{currentCardTitle}</h1>
              {currentAmountLabel ? (
                <p className="mt-1 text-2xl font-bold text-primary">
                  {currentAmountLabel}
                  {currentBillingCycleLabel ? (
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      • {currentBillingCycleLabel}
                    </span>
                  ) : null}
                </p>
              ) : null}
              {!data.currentPlanName && data.pendingPlanName ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Aguardando a confirmação do pagamento pela academia para ativar seu plano.
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Gerencie sua assinatura e consulte os outros planos disponíveis no app.
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm text-muted-foreground">
                {!data.currentPlanName && data.pendingPlanName ? "Ativação" : "Vencimento"}
              </p>
              <p className="font-medium text-foreground">
                {!data.currentPlanName && data.pendingPlanName
                  ? "Após confirmação"
                  : data.nextBillingDate
                    ? formatDate(data.nextBillingDate)
                    : `Dia ${data.activationBillingDay}`}
              </p>
            </div>
          </div>

          {currentModalityNames.length > 0 ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium text-foreground">Modalidades incluídas:</p>
              <div className="flex flex-wrap gap-2">
                {currentModalityNames.map((modalityName) => (
                  <Badge key={modalityName} variant="secondary">
                    {modalityName}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {data.pendingPlanName && data.currentPlanName && data.pendingPlanEffectiveDate ? (
            <div className="mt-4 rounded-2xl border border-primary/20 bg-background/70 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Troca agendada</p>
              <p className="mt-1 text-sm font-medium text-foreground">{data.pendingPlanName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Efetivação prevista para {formatDate(data.pendingPlanEffectiveDate)}.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Link href={routes.tenantAppStudentPayments}>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Ver pagamentos
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={routes.tenantAppStudentPayments}>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Histórico de cobranças
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={routes.tenantAppStudentProfile}>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Ver perfil e assinatura
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium text-foreground">Outros planos disponíveis</h2>

        {otherPlans.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Nenhum outro plano disponível para troca neste momento.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {otherPlans.map((plan) => {
              const hasPendingThisPlan = data.pendingPlanId === plan.id
              const canActivateThisPlan =
                data.canActivateNewPlan && !hasPendingThisPlan

              return (
                <Card key={plan.id}>
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{plan.name}</p>
                          {hasPendingThisPlan ? (
                            <Badge variant="outline">
                              {data.currentPlanName ? "Troca agendada" : "Aguardando pagamento"}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.billingCycleLabel}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold text-primary">{plan.amountLabel}</p>
                      </div>
                    </div>

                    {plan.modalityNames.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {plan.modalityNames.map((modalityName) => (
                          <Badge key={modalityName} variant="secondary">
                            {modalityName}
                          </Badge>
                        ))}
                      </div>
                    ) : null}

                    <Button
                      type="button"
                      className="w-full"
                      disabled={!canActivateThisPlan}
                      onClick={() => onSelectPlan(plan.id)}
                    >
                      {hasPendingThisPlan
                        ? data.currentPlanName
                          ? "Troca agendada"
                          : "Aguardando pagamento"
                        : data.currentPlanName
                          ? "Trocar para este plano"
                          : "Solicitar plano"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <Dialog open={selectedPlan != null} onOpenChange={(open) => !open && onSelectPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ativar plano</DialogTitle>
            <DialogDescription>
              {data.currentPlanName ? "Deseja trocar para o plano " : "Deseja solicitar o plano "}
              <strong>{selectedPlan?.name}</strong>?
              {!data.currentPlanName ? (
                <>
                  {" "}A cobrança inicial será criada agora como pendente. O plano só será ativado
                  após a confirmação do pagamento pela academia, e os próximos vencimentos seguirão
                  o dia da confirmação.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onSelectPlan(null)}>
              Cancelar
            </Button>
            <Button type="button" onClick={onConfirmActivation} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-")
  return `${day}/${month}/${year}`
}
