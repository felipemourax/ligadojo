"use client"

import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AcademySetupCompletionProps {
  tenantName: string
  appName: string
  dashboardUrl: string
  appUrl: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  onContinueLater: () => void
  onGoDashboard: () => void
}

export function AcademySetupCompletion({
  tenantName,
  appName,
  dashboardUrl,
  appUrl,
  logoUrl,
  primaryColor,
  secondaryColor,
  onContinueLater,
  onGoDashboard,
}: AcademySetupCompletionProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-2xl rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-foreground">Configuração concluída</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Sua academia já está pronta para começar. Agora você pode usar o painel, cadastrar alunos e seguir com a
              personalização do app.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Sua academia</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{tenantName}</p>
              <p className="mt-1 text-sm text-muted-foreground">Painel administrativo disponível para gestão da academia.</p>
              <div className="mt-4 rounded-xl bg-muted/40 px-3 py-3 text-sm text-foreground">{dashboardUrl}</div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Seu app da academia</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{appName}</p>
              <p className="mt-1 text-sm text-muted-foreground">Este é o endereço base do app para professores e alunos.</p>
              <div className="mt-4 rounded-xl bg-muted/40 px-3 py-3 text-sm text-foreground">{appUrl}</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-medium text-foreground">Resumo da personalização</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/40">
                {logoUrl ? (
                  <Image alt="Logo da academia" className="h-full w-full object-cover" height={56} src={logoUrl} width={56} />
                ) : (
                  <span className="text-xs text-muted-foreground">Sem logo</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-border" style={{ backgroundColor: primaryColor || "#16a34a" }} />
                <div className="h-10 w-10 rounded-xl border border-border" style={{ backgroundColor: secondaryColor || "#0f172a" }} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={onContinueLater} type="button" variant="outline">
              Continuar configurando depois
            </Button>
            <Button onClick={onGoDashboard} type="button">
              Ir para o dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
