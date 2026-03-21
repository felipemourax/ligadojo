"use client"

import { useEffect, useState } from "react"
import type { StudentAppEventsData } from "@/apps/api/src/modules/app/domain/student-app"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import {
  enrollStudentAppEvent,
  fetchStudentAppEvents,
  updateStudentAppEventResponse,
} from "@/modules/app/services/student-app"
import { StudentEventsScreen } from "@/modules/app/student/student-events-screen"

export default function StudentAppEventsPage() {
  const [data, setData] = useState<StudentAppEventsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [pendingEventId, setPendingEventId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<"enroll" | "confirmed" | "maybe" | "declined" | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function load() {
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetchStudentAppEvents()
      setData(response.data)
    } catch (error) {
      setData(null)
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar os eventos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function confirmAction() {
    if (!pendingEventId || !pendingAction || pendingAction === "enroll") return

    setIsSaving(true)
    setFeedback(null)

    try {
      const response = await updateStudentAppEventResponse(pendingEventId, pendingAction)

      setData(response.data)
      window.dispatchEvent(new Event("student-app-indicators-refresh"))
      setFeedback(response.message)
      setPendingEventId(null)
      setPendingAction(null)
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Não foi possível concluir a operação."
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function chooseEnrollmentResponse(status: "confirmed" | "maybe" | "declined") {
    if (!pendingEventId || pendingAction !== "enroll") return

    setIsSaving(true)
    setFeedback(null)

    try {
      const response = await enrollStudentAppEvent(pendingEventId, status)
      setData(response.data)
      window.dispatchEvent(new Event("student-app-indicators-refresh"))
      setFeedback(response.message)
      setPendingEventId(null)
      setPendingAction(null)
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Não foi possível concluir a operação."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppRoleGuard requiredRole="student">
      {isLoading ? (
        <section className="p-4 text-sm text-muted-foreground">Carregando eventos...</section>
      ) : !data ? (
        <section className="p-4 text-sm text-muted-foreground">
          Não foi possível carregar os eventos agora.
        </section>
      ) : (
        <StudentEventsScreen
          data={data}
          feedback={feedback}
          pendingEventId={pendingEventId}
          pendingAction={pendingAction}
          isSaving={isSaving}
          onSelectEvent={(eventId, action) => {
            setPendingEventId(eventId)
            setPendingAction(action)
          }}
          onConfirm={() => void confirmAction()}
          onChooseEnrollmentResponse={(status) => void chooseEnrollmentResponse(status)}
        />
      )}
    </AppRoleGuard>
  )
}
