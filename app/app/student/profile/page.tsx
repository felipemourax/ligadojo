"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import type {
  StudentAppPaymentsData,
  StudentAppPlansData,
  StudentAppProfileGraduationsData,
  StudentAppProfileTitlesData,
} from "@/apps/api/src/modules/app/domain/student-app"
import { StudentProfileScreen } from "@/modules/app/student/student-profile-screen"
import {
  createStudentAppProfileGraduation,
  createStudentAppProfileTitle,
  fetchStudentAppPayments,
  fetchStudentAppPlans,
  fetchStudentAppProfileGraduations,
  fetchStudentAppProfileTitles,
  removeStudentAppProfileTitle,
  updateStudentAppProfileGraduation,
} from "@/modules/app/services/student-app"
import { fetchJson } from "@/lib/api/client"
import { toast } from "@/hooks/use-toast"

interface ProfileAccess {
  user: { name?: string; email: string } | null
  membership: { role: string } | null
}

export default function StudentAppProfilePage() {
  const [access, setAccess] = useState<ProfileAccess | null>(null)
  const [payments, setPayments] = useState<StudentAppPaymentsData | null>(null)
  const [plans, setPlans] = useState<StudentAppPlansData | null>(null)
  const [graduations, setGraduations] = useState<StudentAppProfileGraduationsData | null>(null)
  const [titles, setTitles] = useState<StudentAppProfileTitlesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingGraduation, setIsSavingGraduation] = useState(false)
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const [removingTitleId, setRemovingTitleId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function load() {
    setIsLoading(true)
    setFeedback(null)

    try {
      const [accessResponse, paymentsResponse, plansResponse, graduationsResponse, titlesResponse] = await Promise.all([
        fetchJson<ProfileAccess>("/api/me/tenant-access"),
        fetchStudentAppPayments(),
        fetchStudentAppPlans(),
        fetchStudentAppProfileGraduations(),
        fetchStudentAppProfileTitles(),
      ])
      setAccess(accessResponse)
      setPayments(paymentsResponse.data)
      setPlans(plansResponse.data)
      setGraduations(graduationsResponse.data)
      setTitles(titlesResponse.data)
    } catch (error) {
      setAccess(null)
      setPayments(null)
      setPlans(null)
      setGraduations(null)
      setTitles(null)
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar o perfil.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateTitle(payload: {
    placement: "gold" | "silver" | "bronze" | "champion" | "runner_up"
    competition: string
    year: number
  }) {
    setIsSavingTitle(true)
    try {
      const response = await createStudentAppProfileTitle(payload)
      setTitles(response.data)
      toast({
        title: "Título adicionado",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao adicionar título",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSavingTitle(false)
    }
  }

  async function handleRemoveTitle(titleId: string) {
    setRemovingTitleId(titleId)
    try {
      const response = await removeStudentAppProfileTitle(titleId)
      setTitles(response.data)
      toast({
        title: "Título removido",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao remover título",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setRemovingTitleId(null)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleRegisterGraduation(payload: {
    activityId: string
    activityCategory: string | null
    toBelt: string
    toStripes: number
    graduatedAtMonth: string
    notes?: string | null
  }) {
    setIsSavingGraduation(true)
    try {
      const response = await createStudentAppProfileGraduation({
        studentActivityId: payload.activityId,
        toBelt: payload.toBelt,
        toStripes: payload.toStripes,
        graduatedAtMonth: payload.graduatedAtMonth,
        notes: payload.notes ?? null,
      })
      setGraduations(response.data)
      toast({
        title: "Graduação registrada",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao registrar graduação",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSavingGraduation(false)
    }
  }

  async function handleUpdateGraduation(payload: {
    graduationId: string
    activityId: string
    activityCategory: string | null
    toBelt: string
    toStripes: number
    graduatedAtMonth: string
    notes?: string | null
  }) {
    setIsSavingGraduation(true)
    try {
      const response = await updateStudentAppProfileGraduation(payload.graduationId, {
        studentActivityId: payload.activityId,
        toBelt: payload.toBelt,
        toStripes: payload.toStripes,
        graduatedAtMonth: payload.graduatedAtMonth,
        notes: payload.notes ?? null,
      })
      setGraduations(response.data)
      toast({
        title: "Graduação atualizada",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao atualizar graduação",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSavingGraduation(false)
    }
  }

  const content = (() => {
    if (isLoading) {
      return <p className="text-sm text-muted-foreground">Carregando perfil...</p>
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

    if (!access) {
      return <p className="text-sm text-muted-foreground">Perfil indisponível no momento.</p>
    }

    return (
      <StudentProfileScreen
        access={access}
        payments={payments}
        plans={plans}
        graduations={graduations}
        titles={titles}
        isSavingGraduation={isSavingGraduation}
        isSavingTitle={isSavingTitle}
        removingTitleId={removingTitleId}
        onRegisterGraduation={handleRegisterGraduation}
        onUpdateGraduation={handleUpdateGraduation}
        onCreateTitle={handleCreateTitle}
        onRemoveTitle={handleRemoveTitle}
      />
    )
  })()

  return (
    <AppRoleGuard requiredRole="student">
      <section className="space-y-4">{content}</section>
    </AppRoleGuard>
  )
}
