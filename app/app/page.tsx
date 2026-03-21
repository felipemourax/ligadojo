"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { fetchJson } from "@/lib/api/client"
import { roles } from "@/lib/access-control"
import { getTenantAppHomeRouteBySystemRole } from "@/lib/app-role-routing"
import { routes } from "@/lib/routes"
import { useCurrentSession } from "@/hooks/use-current-session"

interface TenantAccessResponse {
  tenant: { displayName: string } | null
  membership: { role: "academy_admin" | "teacher" | "student" } | null
  accessState:
    | "unauthenticated"
    | "no_link"
    | "invited"
    | "pending"
    | "active"
    | "rejected"
    | "revoked"
    | "suspended"
}

export default function TenantAppPage() {
  const router = useRouter()
  const { session, isLoading } = useCurrentSession()
  const [access, setAccess] = useState<TenantAccessResponse | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        if (isLoading || !session?.currentMembership) {
          return
        }

        const role = session.currentMembership.role
        if (role === roles.TEACHER || role === roles.STUDENT) {
          router.replace(getTenantAppHomeRouteBySystemRole(role))
        }
      } catch (error) {
        if (active) {
          setFeedback(error instanceof Error ? error.message : "Não foi possível carregar o app.")
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [isLoading, router, session])

  useEffect(() => {
    let active = true

    async function loadAccess() {
      try {
        const accessResponse = await fetchJson<TenantAccessResponse>("/api/me/tenant-access")
        if (active) {
          setAccess(accessResponse)
        }
      } catch (error) {
        if (active) {
          setFeedback(error instanceof Error ? error.message : "Não foi possível carregar o app.")
        }
      }
    }

    void loadAccess()

    return () => {
      active = false
    }
  }, [])

  if (feedback) {
    return <section className="rounded-3xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">{feedback}</section>
  }

  if (access?.accessState !== "active") {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-foreground">
          {access?.tenant?.displayName ?? "App da Academia"}
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Seu acesso ainda não está ativo para usar o app da academia.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold text-foreground">Selecionando área do app...</h1>
      <p className="text-sm text-muted-foreground">
        Você será direcionado para o aplicativo de {access?.membership?.role === "teacher" ? "professor" : "aluno"}.
      </p>
      <p className="text-sm">
        <Link className="text-primary hover:underline" href={routes.login}>
          Trocar conta
        </Link>
      </p>
    </section>
  )
}
