"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchJson } from "@/lib/api/client"
import { routes } from "@/lib/routes"

interface AcademySettingsResponse {
  tenant: {
    displayName: string
    slug: string
  }
  onboarding: {
    status: "draft" | "in_progress" | "completed"
    currentStep: number
    completedSteps: string[]
  } | null
}

export default function DashboardSettingsAcademyPage() {
  const [data, setData] = useState<AcademySettingsResponse | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await fetchJson<AcademySettingsResponse>("/api/onboarding/academy-setup")

        if (active) {
          setData(response)
        }
      } catch {}
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Configuracoes da Academia</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Dados institucionais, branding e setup inicial do tenant.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Onboarding do negocio</CardTitle>
            <CardDescription>
              Continue o setup da academia ou revise o progresso atual do onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted-foreground">
              <p>
                Tenant: <span className="font-medium text-foreground">{data?.tenant.displayName ?? "-"}</span>
              </p>
              <p className="mt-2">
                Status: <span className="font-medium text-foreground">{data?.onboarding?.status ?? "sem onboarding"}</span>
              </p>
              <p className="mt-2">
                Passo atual: <span className="font-medium text-foreground">{data?.onboarding?.currentStep ?? 1}</span>
              </p>
              <p className="mt-2">
                Etapas concluidas:{" "}
                <span className="font-medium text-foreground">
                  {data?.onboarding?.completedSteps.length ?? 0}
                </span>
              </p>
            </div>

            <Button asChild>
              <Link href={`${routes.dashboard}?academySetup=1`}>Abrir setup no dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
