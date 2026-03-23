"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Building2, ExternalLink, Search, ShieldCheck, ShieldOff } from "lucide-react"
import type { PlatformAcademyListItem } from "@/apps/api/src/modules/platform/domain/platform-admin"
import { StatCard } from "@/modules/dashboard/components/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { fetchPlatformAcademies } from "@/modules/platform-admin/services"

function statusLabel(status: PlatformAcademyListItem["status"]) {
  return status === "active" ? "Ativa" : "Suspensa"
}

function statusVariant(status: PlatformAcademyListItem["status"]) {
  return status === "active" ? "default" : "secondary"
}

export function PlatformAcademiesScreen() {
  const [academies, setAcademies] = useState<PlatformAcademyListItem[]>([])
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetchPlatformAcademies({ query, status })
        if (!cancelled) {
          setAcademies(response)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar as academias.")
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [query, status])

  const stats = useMemo(() => {
    const active = academies.filter((academy) => academy.status === "active").length
    const suspended = academies.filter((academy) => academy.status === "suspended").length

    return {
      total: academies.length,
      active,
      suspended,
    }
  }, [academies])

  return (
    <section className="space-y-6">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-foreground">Academias</h1>
        <p className="max-w-3xl text-muted-foreground">
          Lista global de tenants da plataforma com ações de aprovação, suspensão e cancelamento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <StatCard title="Total listadas" value={stats.total} icon={Building2} />
        <StatCard title="Ativas" value={stats.active} icon={ShieldCheck} />
        <StatCard title="Suspensas" value={stats.suspended} icon={ShieldOff} />
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1fr,220px] md:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por academia, slug, responsável ou e-mail"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(value: "all" | "active" | "suspended") => setStatus(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="suspended">Suspensas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {academies.map((academy) => (
          <article key={academy.id} className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-foreground">{academy.displayName}</h2>
                      <Badge variant={statusVariant(academy.status)}>{statusLabel(academy.status)}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{academy.legalName}</p>
                      <p className="break-all">{academy.primaryDomain ?? `${academy.slug}.ligadojo.com.br`}</p>
                      <p>
                        Responsável: {academy.ownerName ?? "Não identificado"}
                        {academy.ownerEmail ? ` · ${academy.ownerEmail}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Alunos</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{academy.studentsCount}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Professores</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{academy.teachersCount}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Slug</p>
                    <p className="mt-1 truncate text-sm font-semibold text-foreground">{academy.slug}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href={`/platform/academies/${academy.slug}`}>
                    Ver detalhe
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ))}

        {academies.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Nenhuma academia encontrada com os filtros atuais.
          </div>
        ) : null}
      </div>
    </section>
  )
}
