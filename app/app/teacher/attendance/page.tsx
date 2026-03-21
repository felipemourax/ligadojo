"use client"

import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import type { TeacherAppAttendanceData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { TeacherAttendanceScreen } from "@/modules/app/components/teacher/teacher-attendance-screen"
import { fetchTeacherAppAttendance, saveTeacherAppAttendance } from "@/modules/app/services/teacher-app"
import { Button } from "@/components/ui/button"

export default function TeacherAppAttendancePage() {
  const [data, setData] = useState<TeacherAppAttendanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function loadTeacherAttendance() {
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetchTeacherAppAttendance()
      setData(response.data)
    } catch (error) {
      setData(null)
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar a chamada.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTeacherAttendance()
  }, [])

  async function handleSave(payload: {
    classGroupId: string
    sessionDate: string
    weekday: number
    startTime: string
    endTime: string
    confirmedStudentIds: string[]
    confirmedStudentNames: string[]
    presentStudentIds: string[]
    absentStudentIds: string[]
    justifiedStudentIds: string[]
    isFinalized: boolean
  }) {
    try {
      const result = await saveTeacherAppAttendance(payload)
      toast({ title: "Presença atualizada", description: result.message })
      setData(result.data)
    } catch (error) {
      toast({
        title: "Falha ao salvar presença",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    }
  }

  const content = (() => {
    if (isLoading) {
      return <section className="text-sm text-muted-foreground">Carregando presença...</section>
    }

    if (feedback) {
      return (
        <section className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{feedback}</p>
          <Button type="button" variant="outline" onClick={() => void loadTeacherAttendance()}>
            Tentar novamente
          </Button>
        </section>
      )
    }

    if (!data) {
      return <section className="text-sm text-muted-foreground">Nenhum dado de presença disponível.</section>
    }

    return <TeacherAttendanceScreen data={data} onSave={handleSave} />
  })()

  return (
    <AppRoleGuard requiredRole="teacher">
      {content}
    </AppRoleGuard>
  )
}
