"use client"

import { useEffect, useState } from "react"
import type { StudentAppClassesData } from "@/apps/api/src/modules/app/domain/student-app"
import { Button } from "@/components/ui/button"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { fetchStudentAppClasses, joinStudentAppClass, leaveStudentAppClass } from "@/modules/app/services/student-app"
import { StudentClassesScreen } from "@/modules/app/student/student-classes-screen"

export default function StudentAppClassesPage() {
  const [data, setData] = useState<StudentAppClassesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [savingClassId, setSavingClassId] = useState<string | null>(null)

  async function load() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchStudentAppClasses()
      setData(response.data)
    } catch (error) {
      setData(null)
      setError(error instanceof Error ? error.message : "Não foi possível carregar as turmas.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function toggleEnrollment(classId: string, joined: boolean) {
    setSavingClassId(classId)
    setError(null)
    setNotice(null)

    try {
      const response = joined ? await leaveStudentAppClass(classId) : await joinStudentAppClass(classId)
      setData(response.data)
      setNotice(response.message)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível atualizar sua turma.")
    } finally {
      setSavingClassId(null)
    }
  }

  const content = (() => {
    if (isLoading) {
      return <section className="text-sm text-muted-foreground">Carregando turmas...</section>
    }

    if (error && !data) {
      return (
        <section className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" onClick={() => void load()}>
            Tentar novamente
          </Button>
        </section>
      )
    }

    if (!data) {
      return <section className="text-sm text-muted-foreground">Sem dados de turmas disponíveis.</section>
    }

    return (
      <StudentClassesScreen
        data={data}
        error={error}
        notice={notice}
        savingClassId={savingClassId}
        onToggleEnrollment={(classId, joined) => void toggleEnrollment(classId, joined)}
      />
    )
  })()

  return (
    <AppRoleGuard requiredRole="student">
      {content}
    </AppRoleGuard>
  )
}
