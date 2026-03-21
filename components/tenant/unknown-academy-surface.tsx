"use client"

import Image from "next/image"
import { useDeferredValue, useEffect, useState } from "react"
import { ArrowRight, Building2, MapPin, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ApiError, fetchJson } from "@/lib/api/client"
import { buildTenantHost } from "@/lib/tenancy/url"

interface AcademySearchResult {
  id: string
  slug: string
  displayName: string
  logoUrl: string | null
  primaryDomain: string | null
}

interface AcademySearchResponse {
  host: string
  academies: AcademySearchResult[]
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function normalizeQuery(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

export function UnknownAcademySurface({
  attemptedHost,
  suggestedQuery,
}: {
  attemptedHost: string
  suggestedQuery?: string
}) {
  const [query, setQuery] = useState(suggestedQuery ?? "")
  const deferredQuery = useDeferredValue(query)
  const [results, setResults] = useState<AcademySearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectingId, setRedirectingId] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const normalizedQuery = normalizeQuery(deferredQuery)

    const timeoutId = window.setTimeout(() => {
      setIsLoading(true)

      void fetchJson<AcademySearchResponse>(
        `/api/tenancy/search?query=${encodeURIComponent(normalizedQuery)}`,
        { signal: controller.signal }
      )
        .then((response) => {
          setResults(response.academies)
          setError(null)
        })
        .catch((fetchError) => {
          if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
            return
          }

          setResults([])
          setError(
            fetchError instanceof ApiError || fetchError instanceof Error
              ? fetchError.message
              : "Não foi possível buscar as academias agora."
          )
        })
        .finally(() => {
          setIsLoading(false)
        })
    }, 180)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [deferredQuery])

  function getAcademyAddress(academy: AcademySearchResult) {
    if (typeof window === "undefined") {
      return academy.primaryDomain ?? academy.slug
    }

    return buildTenantHost({
      currentHostname: window.location.hostname,
      currentPort: window.location.port || null,
      tenantSlug: academy.slug,
      preferredDomain: academy.primaryDomain,
    })
  }

  function handleSelectAcademy(academy: AcademySearchResult) {
    if (typeof window === "undefined") {
      return
    }

    setRedirectingId(academy.id)
    const host = getAcademyAddress(academy)
    window.location.assign(`${window.location.protocol}//${host}`)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.16),_transparent_42%),linear-gradient(180deg,#07111f_0%,#0b1627_32%,#f6f7fb_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <Card className="w-full overflow-hidden border-white/10 bg-white/95 shadow-[0_32px_80px_rgba(2,6,23,0.35)] backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="border-b border-border/60 bg-slate-950 px-6 py-8 text-white lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80">
                <Building2 className="h-3.5 w-3.5" />
                Academia não encontrada
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight">
                Não encontramos essa academia.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/72">
                O endereço <span className="font-medium text-white">{attemptedHost}</span> não está
                vinculado a nenhuma academia cadastrada. Busque o nome correto abaixo para abrir o
                app web da unidade certa.
              </p>

              <div className="mt-8 rounded-3xl border border-white/12 bg-white/6 p-4">
                <p className="text-sm font-medium text-white">Como funciona</p>
                <div className="mt-3 space-y-2 text-sm text-white/70">
                  <p>1. Digite o nome comercial da academia.</p>
                  <p>2. Escolha a unidade correta na lista.</p>
                  <p>3. Abriremos o endereço oficial do app dessa academia.</p>
                </div>
              </div>
            </div>

            <CardContent className="px-6 py-8 text-slate-950 lg:px-8 lg:py-10">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">Buscar academia</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Ex: Jiu Jitea, Gracie Barra, Team Andrade"
                      className="h-12 rounded-2xl border-border/70 bg-white pl-10 text-base text-slate-950 placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Você pode pesquisar pelo nome da academia ou pelo nome comercial da unidade.
                  </p>
                </div>

                <div className="rounded-3xl border border-border/70 bg-slate-50/80 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3 px-1">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Resultados disponíveis</p>
                      <p className="text-xs text-slate-500">
                        {isLoading
                          ? "Buscando academias..."
                          : `${results.length} academia${results.length !== 1 ? "s" : ""} encontrada${results.length !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {results.map((academy) => {
                      const address = getAcademyAddress(academy)
                      const isRedirecting = redirectingId === academy.id

                      return (
                        <button
                          key={academy.id}
                          type="button"
                          onClick={() => handleSelectAcademy(academy)}
                          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/20 hover:bg-primary/5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="h-12 w-12 border border-border/70">
                              <AvatarImage src={academy.logoUrl ?? undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {initials(academy.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">
                                {academy.displayName}
                              </p>
                              <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                                <MapPin className="h-3.5 w-3.5" />
                                {address}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center rounded-xl px-3 py-2 text-sm font-medium text-primary-foreground ${
                              isRedirecting ? "bg-primary/70" : "bg-primary"
                            }`}
                          >
                            {isRedirecting ? "Abrindo..." : "Abrir"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        </button>
                      )
                    })}

                    {!isLoading && results.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-center">
                        <p className="text-sm font-medium text-slate-900">
                          Nenhuma academia encontrada
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Tente buscar pelo nome principal ou por uma parte do nome comercial.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  )
}
