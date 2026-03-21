"use client"

import { useEffect, useState } from "react"
import type { StudentAppHomeData } from "@/apps/api/src/modules/app/domain/student-app"
import { Button } from "@/components/ui/button"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { fetchStudentAppHome } from "@/modules/app/services/student-app"
import { StudentHomeScreen } from "@/modules/app/student/student-home-screen"

export default function StudentAppHomePage() {
  const [data, setData] = useState<StudentAppHomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function load() {
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetchStudentAppHome()
      setData(response.data)
    } catch (error) {
      setData(null)
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar o app do aluno.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const content = (() => {
    if (isLoading) {
      return <section className="text-sm text-muted-foreground">Carregando app do aluno...</section>
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
      return <section className="text-sm text-muted-foreground">Sem dados disponíveis no momento.</section>
    }

    return <StudentHomeScreen data={data} />
  })()

  return (
    <AppRoleGuard requiredRole="student">
      {content}
    </AppRoleGuard>
  )
}
