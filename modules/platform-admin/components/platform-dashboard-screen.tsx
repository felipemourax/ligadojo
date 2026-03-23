"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  PlusCircle,
  ShieldCheck,
  ShieldOff,
} from "lucide-react"
import type { PlatformOverviewData } from "@/apps/api/src/modules/platform/domain/platform-admin"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/modules/dashboard/components/stat-card"
import { routes } from "@/lib/routes"
import { fetchPlatformOverview } from "@/modules/platform-admin/services"

const cards = [
  {
    key: "totalAcademies",
    title: "Total de academias",
    description: "Tenants cadastrados na plataforma",
    icon: Building2,
  },
  {
    key: "activeAcademies",
    title: "Academias ativas",
    description: "Academias liberadas para operar",
    icon: ShieldCheck,
  },
  {
    key: "suspendedAcademies",
    title: "Academias suspensas",
    description: "Tenants bloqueados na plataforma",
    icon: ShieldOff,
  },
  {
    key: "newAcademiesThisMonth",
    title: "Novas no mês",
    description: "Academias criadas no mês atual",
    icon: PlusCircle,
  },
] as const

export function PlatformDashboardScreen() {
  const [data, setData] = useState<PlatformOverviewData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetchPlatformOverview()
        if (!cancelled) {
          setData(response)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar a visão geral da plataforma.")
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="space-y-6">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma com foco em academias ativas, suspensões e crescimento.
        </p>
      </div>

      {error ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.key}
            title={card.title}
            value={data ? String(data[card.key]) : "--"}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Ações rápidas</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Entre direto na gestão global das academias cadastradas.
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={routes.platformAcademies}
              className="rounded-xl border border-border bg-background px-4 py-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">Ver todas as academias</p>
                  <p className="mt-1 text-sm text-muted-foreground">Lista global com busca, status e detalhe.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link
              href={routes.platformAcademies}
              className="rounded-xl border border-border bg-background px-4 py-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">Revisar academias suspensas</p>
                  <p className="mt-1 text-sm text-muted-foreground">Acompanhe tenants bloqueados e pendências.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-2xl bg-primary/10 p-2 text-primary">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Escopo atual da plataforma</h2>
              <p className="text-sm text-muted-foreground">
                Nesta primeira fase, o admin da plataforma está focado em visão geral e gestão das academias.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href={routes.platformAcademies}>Ir para Academias</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
