"use client"

import { useEffect, useState } from "react"
import type { TeacherAppEventsData } from "@/apps/api/src/modules/app/domain/teacher-app"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { TeacherEventsScreen } from "@/modules/app/components/teacher/teacher-events-screen"
import { addTeacherAppEventParticipant, fetchTeacherAppEvents } from "@/modules/app/services/teacher-app"

export default function TeacherAppEventsPage() {
  const [data, setData] = useState<TeacherAppEventsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSavingParticipant, setIsSavingParticipant] = useState(false)

  async function load() {
    setIsLoading(true)
    setLoadError(null)

    try {
      const response = await fetchTeacherAppEvents()
      setData(response.data)
    } catch (error) {
      setData(null)
      setLoadError(error instanceof Error ? error.message : "Não foi possível carregar eventos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleAddParticipant(eventId: string, userId: string) {
    setIsSavingParticipant(true)

    try {
      const response = await addTeacherAppEventParticipant(eventId, userId)
      setData(response.data)
      toast({
        title: "Participante adicionado",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao adicionar participante",
        description:
          error instanceof Error ? error.message : "Não foi possível adicionar o participante.",
        variant: "destructive",
      })
    } finally {
      setIsSavingParticipant(false)
    }
  }

  const content = (() => {
    if (isLoading) {
      return <section className="text-sm text-muted-foreground">Carregando eventos...</section>
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
      return <section className="text-sm text-muted-foreground">Sem dados de eventos disponíveis.</section>
    }

    return (
      <TeacherEventsScreen
        data={data}
        feedback={null}
        isSavingParticipant={isSavingParticipant}
        onAddParticipant={(eventId, userId) => void handleAddParticipant(eventId, userId)}
      />
    )
  })()

  return (
    <AppRoleGuard requiredRole="teacher">
      {content}
    </AppRoleGuard>
  )
}
