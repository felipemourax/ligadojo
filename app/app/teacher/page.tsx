"use client"

import { useEffect, useState } from "react"
import type { TeacherAppHomeData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { Button } from "@/components/ui/button"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { TeacherHomeScreen } from "@/modules/app/components/teacher/teacher-home-screen"
import { fetchTeacherAppHome } from "@/modules/app/services/teacher-app"

export default function TeacherAppHomePage() {
  const [data, setData] = useState<TeacherAppHomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function load() {
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetchTeacherAppHome()
      setData(response.data)
    } catch (error) {
      setData(null)
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar o app do professor.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const content = (() => {
    if (isLoading) {
      return <section className="text-sm text-muted-foreground">Carregando app do professor...</section>
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

    return <TeacherHomeScreen data={data} />
  })()

  return (
    <AppRoleGuard requiredRole="teacher">
      {content}
    </AppRoleGuard>
  )
}
