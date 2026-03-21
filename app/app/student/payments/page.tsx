"use client"

import { useEffect, useState } from "react"
import type { StudentAppPaymentsData } from "@/apps/api/src/modules/app/domain/student-app"
import { Button } from "@/components/ui/button"
import { applyStudentAppCoupon, fetchStudentAppPayments } from "@/modules/app/services/student-app"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { StudentPaymentsScreen } from "@/modules/app/student/student-payments-screen"

export default function StudentAppPaymentsPage() {
  const [data, setData] = useState<StudentAppPaymentsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  async function load() {
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetchStudentAppPayments()
      setData(response.data)
    } catch (error) {
      setData(null)
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar pagamentos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function applyCoupon() {
    if (!couponCode.trim()) {
      setFeedback("Informe um cupom para aplicar.")
      return
    }

    setIsApplyingCoupon(true)
    setFeedback(null)

    try {
      const response = await applyStudentAppCoupon(couponCode.trim())
      setData(response.data)
      setCouponCode("")
      setFeedback(response.message)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível aplicar o cupom.")
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const content = (() => {
    if (isLoading) {
      return <p className="text-sm text-muted-foreground">Carregando pagamentos...</p>
    }

    if (feedback) {
      return (
        <section className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{feedback}</p>
          <Button type="button" variant="outline" onClick={() => void load()}>
            Tentar novamente
          </Button>
        </section>
      )
    }

    if (!data) {
      return <section className="text-sm text-muted-foreground">Os pagamentos do aluno aparecerão aqui quando houver plano ou cobrança vinculada.</section>
    }

    return (
      <StudentPaymentsScreen
        data={data}
        feedback={feedback}
        couponCode={couponCode}
        isApplyingCoupon={isApplyingCoupon}
        onCouponCodeChange={setCouponCode}
        onApplyCoupon={() => void applyCoupon()}
      />
    )
  })()

  return (
    <AppRoleGuard requiredRole="student">
      {content}
    </AppRoleGuard>
  )
}
