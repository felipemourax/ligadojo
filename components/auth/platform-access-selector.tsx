"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, ChevronRight, GraduationCap, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchJson } from "@/lib/api/client"
import { routes } from "@/lib/routes"
import { useCurrentSession } from "@/hooks/use-current-session"

export function PlatformAccessSelector() {
  const router = useRouter()
  const { session, isLoading } = useCurrentSession()
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const { academyUserMemberships } = useMemo(() => {
    const memberships = (session?.memberships ?? []).filter(
      (membership) => membership.status === "active" && membership.tenant?.slug
    )

    return {
      academyUserMemberships: memberships.filter(
        (membership) => membership.role === "teacher" || membership.role === "student"
      ),
    }
  }, [session?.memberships])

  async function handleAcademyUserAccess(tenantSlug: string, role: "teacher" | "student") {
    const actionKey = `${role}:${tenantSlug}`
    setBusyKey(actionKey)

    try {
      const response = await fetchJson<{ redirectUrl: string }>("/api/auth/tenant-switch", {
        method: "POST",
        body: JSON.stringify({
          tenantSlug,
          redirectPath: role === "teacher" ? routes.tenantAppTeacher : routes.tenantAppStudent,
        }),
      })

      window.location.href = response.redirectUrl
    } finally {
      setBusyKey(null)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Carregando seus acessos</CardTitle>
            <CardDescription>Estamos identificando como esta conta pode entrar na plataforma.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <section className="space-y-3">
        <Badge variant="outline">Escolha de acesso</Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Como você gostaria de acessar?</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Identificamos vínculos desta conta com academias. Escolha se deseja entrar como usuário de
            uma academia, gerenciar uma academia já vinculada ou criar uma nova.
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Entrar como usuário de academia</CardTitle>
                <CardDescription>Use o app como professor ou aluno nas academias em que já tem vínculo.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {academyUserMemberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Esta conta ainda não possui vínculo ativo de professor ou aluno.
              </p>
            ) : (
              academyUserMemberships.map((membership) => {
                const tenantSlug = membership.tenant?.slug

                if (!tenantSlug) {
                  return null
                }

                const actionKey = `${membership.role}:${tenantSlug}`
                const isBusy = busyKey === actionKey
                const roleLabel = membership.role === "teacher" ? "Professor" : "Aluno"

                return (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {membership.tenant?.displayName ?? tenantSlug}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{roleLabel}</Badge>
                        <span className="text-xs text-muted-foreground">{membership.tenant?.slug}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        handleAcademyUserAccess(tenantSlug, membership.role as "teacher" | "student")
                      }
                      disabled={isBusy}
                      className="gap-2"
                    >
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      Entrar
                    </Button>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Criar nova academia</CardTitle>
              <CardDescription>
                Se você é dono de uma academia de luta e ainda não tem sua academia cadastrada conosco, clique no botão abaixo e faça seu cadastro agora mesmo.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className="gap-2">
            <Link href={routes.onboardingAcademy}>
              Criar academia
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
