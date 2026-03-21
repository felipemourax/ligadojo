"use client"

import { useEffect, useState } from "react"
import type { StudentAppProgressData } from "@/apps/api/src/modules/app/domain/student-app"
import { Button } from "@/components/ui/button"
import { fetchStudentAppProgress } from "@/modules/app/services/student-app"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { StudentProgressScreen } from "@/modules/app/student/student-progress-screen"

export default function StudentAppProgressPage() {
  const [data, setData] = useState<StudentAppProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function load() {
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetchStudentAppProgress()
      setData(response.data)
    } catch (error) {
      setData(null)
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar evolução.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const content = (() => {
    if (isLoading) {
      return <p className="text-sm text-muted-foreground">Carregando evolução...</p>
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
      return <section className="text-sm text-muted-foreground">A evolução do aluno estará disponível após o vínculo ativo no tenant.</section>
    }

    return <StudentProgressScreen data={data} />
  })()

  return (
    <AppRoleGuard requiredRole="student">
      {content}
    </AppRoleGuard>
  )
}
