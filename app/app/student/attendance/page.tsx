"use client"

import { useEffect, useState } from "react"
import type { StudentAppAttendanceData } from "@/apps/api/src/modules/app/domain/student-app"
import { Button } from "@/components/ui/button"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { fetchStudentAppAttendance } from "@/modules/app/services/student-app"
import { StudentAttendanceScreen } from "@/modules/app/student/student-attendance-screen"

export default function StudentAppAttendancePage() {
  const [data, setData] = useState<StudentAppAttendanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function load() {
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetchStudentAppAttendance()
      setData(response.data)
    } catch (error) {
      setData(null)
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar presença.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const content = (() => {
    if (isLoading) {
      return <section className="text-sm text-muted-foreground">Carregando presença...</section>
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
      return <section className="text-sm text-muted-foreground">Sem dados de presença disponíveis.</section>
    }

    return <StudentAttendanceScreen data={data} />
  })()

  return (
    <AppRoleGuard requiredRole="student">
      {content}
    </AppRoleGuard>
  )
}
