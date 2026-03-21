"use client"

import { useEffect, useState } from "react"
import type { TeacherAppEvolutionData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { Button } from "@/components/ui/button"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { TeacherEvolutionScreen } from "@/modules/app/components/teacher/teacher-evolution-screen"
import {
  addTeacherAppStudentToExam,
  fetchTeacherAppEvolution,
  markTeacherAppStudentAsEligible,
} from "@/modules/app/services/teacher-app"

export default function TeacherAppEvolutionPage() {
  const [data, setData] = useState<TeacherAppEvolutionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [markingEligibleStudentId, setMarkingEligibleStudentId] = useState<string | null>(null)
  const [addingExamCandidateKey, setAddingExamCandidateKey] = useState<string | null>(null)

  async function load() {
    setIsLoading(true)
    setLoadError(null)
    setFeedback(null)

    try {
      const response = await fetchTeacherAppEvolution()
      setData(response.data)
    } catch (error) {
      setData(null)
      setLoadError(error instanceof Error ? error.message : "Não foi possível carregar evolução.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleMarkEligible(studentActivityId: string) {
    setMarkingEligibleStudentId(studentActivityId)
    setFeedback(null)

    try {
      const response = await markTeacherAppStudentAsEligible(studentActivityId)
      setData(response.data)
      setFeedback(response.message)
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Não foi possível marcar o aluno como apto."
      )
    } finally {
      setMarkingEligibleStudentId(null)
    }
  }

  async function handleAddStudentToExam(examId: string, studentActivityId: string) {
    setAddingExamCandidateKey(`${examId}:${studentActivityId}`)
    setFeedback(null)

    try {
      const response = await addTeacherAppStudentToExam(examId, studentActivityId)
      setData(response.data)
      setFeedback(response.message)
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Não foi possível incluir o aluno no exame."
      )
    } finally {
      setAddingExamCandidateKey(null)
    }
  }

  const content = (() => {
    if (isLoading) {
      return <section className="text-sm text-muted-foreground">Carregando evolução...</section>
    }

    if (loadError) {
      return (
        <section className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button type="button" variant="outline" onClick={() => void load()}>
            Tentar novamente
          </Button>
        </section>
      )
    }

    if (!data) {
      return <section className="text-sm text-muted-foreground">Sem dados de evolução disponíveis.</section>
    }

    return (
      <TeacherEvolutionScreen
        data={data}
        feedback={feedback}
        markingEligibleStudentId={markingEligibleStudentId}
        addingExamCandidateKey={addingExamCandidateKey}
        onMarkEligible={handleMarkEligible}
        onAddStudentToExam={handleAddStudentToExam}
      />
    )
  })()

  return (
    <AppRoleGuard requiredRole="teacher">
      {content}
    </AppRoleGuard>
  )
}
