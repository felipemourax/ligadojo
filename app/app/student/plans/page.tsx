"use client"

import { useEffect, useState } from "react"
import type { StudentAppPlansData } from "@/apps/api/src/modules/app/domain/student-app"
import { Button } from "@/components/ui/button"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { activateStudentAppPlan, fetchStudentAppPlans } from "@/modules/app/services/student-app"
import { StudentPlansScreen } from "@/modules/app/student/student-plans-screen"

export default function StudentAppPlansPage() {
  const [data, setData] = useState<StudentAppPlansData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function load() {
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetchStudentAppPlans()
      setData(response.data)
    } catch (error) {
      setData(null)
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar os planos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function confirmActivation() {
    if (!selectedPlanId) return

    setIsSaving(true)
    setFeedback(null)

    try {
      const response = await activateStudentAppPlan(selectedPlanId)
      setData(response.data)
      setSelectedPlanId(null)
      setFeedback(response.message)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível ativar o plano.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppRoleGuard requiredRole="student">
      {isLoading ? (
        <section className="p-4 text-sm text-muted-foreground">Carregando planos...</section>
      ) : !data ? (
        <section className="p-4 text-sm text-muted-foreground">Não foi possível carregar os planos agora.</section>
      ) : (
        <StudentPlansScreen
          data={data}
          feedback={feedback}
          selectedPlanId={selectedPlanId}
          isSaving={isSaving}
          onSelectPlan={setSelectedPlanId}
          onConfirmActivation={() => void confirmActivation()}
        />
      )}
    </AppRoleGuard>
  )
}
