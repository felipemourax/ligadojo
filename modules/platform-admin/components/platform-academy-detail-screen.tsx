"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { ArrowLeft, BookOpen, Globe, GraduationCap, ScrollText, ShieldCheck, ShieldOff, Users, XCircle } from "lucide-react"
import type { PlatformAcademyDetail } from "@/apps/api/src/modules/platform/domain/platform-admin"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { StatCard } from "@/modules/dashboard/components/stat-card"
import { fetchPlatformAcademyDetail, updatePlatformAcademyStatus } from "@/modules/platform-admin/services"

function statusLabel(status: PlatformAcademyDetail["status"]) {
  return status === "active" ? "Ativa" : "Suspensa"
}

function statusVariant(status: PlatformAcademyDetail["status"]) {
  return status === "active" ? "default" : "secondary"
}

export function PlatformAcademyDetailScreen({ slug }: { slug: string }) {
  const { toast } = useToast()
  const [academy, setAcademy] = useState<PlatformAcademyDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetchPlatformAcademyDetail(slug)
        if (!cancelled) {
          setAcademy(response)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar o tenant.")
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [slug])

  function handleAction(action: "approve" | "suspend" | "cancel") {
    startTransition(async () => {
      try {
        const response = await updatePlatformAcademyStatus(slug, action)
        setAcademy(response.academy)
        toast({
          title: "Tenant atualizado",
          description: response.message,
        })
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Não foi possível atualizar a academia",
          description: err instanceof Error ? err.message : "Tente novamente.",
        })
      }
    })
  }

  if (error) {
    return (
      <section className="space-y-4">
        <Button variant="ghost" asChild className="w-fit">
          <Link href="/platform/academies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      </section>
    )
  }

  if (!academy) {
    return (
      <section className="space-y-4">
        <Button variant="ghost" asChild className="w-fit">
          <Link href="/platform/academies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Carregando tenant...
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <Button variant="ghost" asChild className="w-fit">
        <Link href="/platform/academies">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para academias
        </Link>
      </Button>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Globe className="h-6 w-6" />
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold text-foreground">{academy.displayName}</h1>
                <Badge variant={statusVariant(academy.status)}>{statusLabel(academy.status)}</Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{academy.legalName}</p>
                <p>Slug: {academy.slug}</p>
                <p>
                  Responsável: {academy.ownerName ?? "Não identificado"}
                  {academy.ownerEmail ? ` · ${academy.ownerEmail}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionButton
              title="Aprovar academia"
              description="Essa ação libera o tenant para operar normalmente na plataforma."
              confirmLabel="Aprovar"
              disabled={pendingAction}
              onConfirm={() => handleAction("approve")}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Aprovar
            </ActionButton>

            <ActionButton
              title="Suspender academia"
              description="Essa ação suspende o tenant e bloqueia a operação na plataforma."
              confirmLabel="Suspender"
              disabled={pendingAction}
              onConfirm={() => handleAction("suspend")}
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              Suspender
            </ActionButton>

            <ActionButton
              title="Cancelar academia"
              description="No modelo atual da plataforma, cancelar aplica suspensão do tenant."
              confirmLabel="Cancelar"
              disabled={pendingAction}
              destructive
              onConfirm={() => handleAction("cancel")}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </ActionButton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard title="Alunos" value={String(academy.studentsCount)} icon={Users} />
        <StatCard title="Professores" value={String(academy.teachersCount)} icon={GraduationCap} />
        <StatCard title="Modalidades" value={String(academy.modalitiesCount)} icon={BookOpen} />
        <StatCard title="Planos" value={String(academy.plansCount)} icon={ScrollText} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Domínios do tenant</h2>
          <div className="mt-4 space-y-3">
            {academy.domains.map((domain) => (
              <div
                key={domain.id}
                className="flex flex-col gap-2 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{domain.domain}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {domain.isPrimary ? <Badge variant="outline">Primário</Badge> : null}
                      <Badge variant={domain.isVerified ? "default" : "secondary"}>
                        {domain.isVerified ? "Verificado" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Resumo operacional</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>Status do onboarding: {academy.onboardingStatus ?? "Não iniciado"}</p>
            <p>App name: {academy.appName ?? "Não definido"}</p>
            <p>Domínio principal: {academy.primaryDomain ?? "Não definido"}</p>
            <p>Criada em: {new Date(academy.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ActionButton({
  title,
  description,
  confirmLabel,
  disabled,
  destructive = false,
  onConfirm,
  children,
}: {
  title: string
  description: string
  confirmLabel: string
  disabled?: boolean
  destructive?: boolean
  onConfirm: () => void
  children: React.ReactNode
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={destructive ? "destructive" : "outline"} disabled={disabled}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
