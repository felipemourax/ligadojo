"use client"

import { useEffect, useMemo, useState } from "react"
import { Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchJson } from "@/lib/api/client"
import type { SessionApiResponse } from "@/lib/domain/session-api"
import type { EnrollmentRequest, Invitation } from "@/lib/domain/types"

const membershipStatusLabel = {
  invited: "Convidado",
  active: "Ativo",
  pending: "Pendente",
  suspended: "Suspenso",
  revoked: "Revogado",
} as const

const invitationStatusLabel = {
  pending: "Pendente",
  accepted: "Aceito",
  expired: "Expirado",
  revoked: "Revogado",
} as const

const enrollmentStatusLabel = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  cancelled: "Cancelado",
} as const

const requestedRoleLabel = {
  student: "Aluno",
  teacher: "Professor",
  academy_admin: "Admin da academia",
} as const

export default function DashboardSettingsUsersPage() {
  const [session, setSession] = useState<SessionApiResponse | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "teacher" as "academy_admin" | "teacher" | "student",
  })
  const [origin, setOrigin] = useState("")
  const [copiedInvitationId, setCopiedInvitationId] = useState<string | null>(null)
  const [copyingInvitationId, setCopyingInvitationId] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [copyErrorInvitationId, setCopyErrorInvitationId] = useState<string | null>(null)

  const activeTenant = useMemo(
    () => session?.currentMembership?.tenant ?? session?.memberships[0]?.tenant ?? null,
    [session]
  )

  async function loadData() {
    setIsLoading(true)

    try {
      const currentSession = await fetchJson<SessionApiResponse>("/api/me/memberships")
      setSession(currentSession)

      const tenantSlug = currentSession.currentMembership?.tenant?.slug ?? currentSession.memberships[0]?.tenant?.slug

      if (!tenantSlug) {
        setInvitations([])
        setEnrollmentRequests([])
        return
      }

      const [tenantInvitations, tenantEnrollmentRequests] = await Promise.all([
        fetchJson<Invitation[]>(`/api/tenants/${tenantSlug}/invitations`),
        fetchJson<EnrollmentRequest[]>(`/api/tenants/${tenantSlug}/enrollment-requests`),
      ])

      setInvitations(tenantInvitations)
      setEnrollmentRequests(tenantEnrollmentRequests)
      setFeedback(null)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar os acessos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  async function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!activeTenant || !session?.user.name) {
      return
    }

    setIsSubmittingInvite(true)

    try {
      await fetchJson(`/api/tenants/${activeTenant.slug}/invitations`, {
        method: "POST",
        body: JSON.stringify({
          email: inviteForm.email,
          role: inviteForm.role,
          invitedByName: session.user.name,
        }),
      })

      setInviteForm({
        email: "",
        role: "teacher",
      })
      setFeedback("Convite criado com sucesso.")
      await loadData()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível criar o convite.")
    } finally {
      setIsSubmittingInvite(false)
    }
  }

  async function handleCopyInvitationLink(invitation: Invitation) {
    if (!origin) {
      setCopyError("Aguarde enquanto o link é gerado.")
      setCopyErrorInvitationId(invitation.id)
      return
    }

    const link = `${origin}/aceitar-convite/${invitation.token}`

    setCopyError(null)
    setCopyErrorInvitationId(null)
    setCopyingInvitationId(invitation.id)

    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Seu navegador não suporta copiar automaticamente.")
      }

      await navigator.clipboard.writeText(link)
      setCopiedInvitationId(invitation.id)
    } catch (error) {
      setCopyError(error instanceof Error ? error.message : "Não foi possível copiar o link.")
      setCopyErrorInvitationId(invitation.id)
    } finally {
      setCopyingInvitationId((current) => (current === invitation.id ? null : current))
    }
  }

  async function reviewEnrollmentRequest(requestId: string, action: "approve" | "reject") {
    try {
      await fetchJson(`/api/enrollment-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      })

      setFeedback(
        action === "approve"
          ? "Solicitação aprovada e membership ativado."
          : "Solicitação rejeitada."
      )
      await loadData()
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Não foi possível revisar a solicitação."
      )
    }
  }

  return (
    <section className="p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Usuários e Acessos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sessão, convites e solicitações de vínculo agora carregam da base real usando os
            endpoints do tenant atual.
          </p>
        </div>

        {feedback && (
          <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {feedback}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">Usuário global</p>
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              {session?.user.name ?? "Carregando"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{session?.user.email ?? "-"}</p>
            {session?.user && (
              <Badge className="mt-4" variant="secondary">
                {session.user.status}
              </Badge>
            )}
          </article>

          <article className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">Tenant atual</p>
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              {activeTenant?.displayName ?? "Sem tenant"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{activeTenant?.slug ?? "-"}</p>
            {session?.currentMembership && (
              <Badge className="mt-4" variant="secondary">
                {session.currentMembership.role}
              </Badge>
            )}
          </article>

          <article className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">Roles globais</p>
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              {session?.systemRoles.length ? "Acesso global disponível" : "Sem role global"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {session?.systemRoles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </article>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Memberships do usuário</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              O mesmo usuário pode ter roles diferentes em mais de uma academia.
            </p>

            <div className="mt-5 space-y-3">
              {session?.memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="rounded-2xl border border-border bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {membership.tenant?.displayName ?? membership.tenantId}
                      </p>
                      <p className="text-sm text-muted-foreground">Role: {membership.role}</p>
                    </div>
                    <Badge variant="secondary">
                      {membershipStatusLabel[membership.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Criar convite</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Convites iniciados pela academia para professor, aluno ou outro administrador.
            </p>

            <form className="mt-5 space-y-3" onSubmit={handleInviteSubmit}>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={inviteForm.email}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={inviteForm.role}
                onChange={(event) =>
                  setInviteForm((current) => ({
                    ...current,
                    role: event.target.value as "academy_admin" | "teacher" | "student",
                  }))
                }
              >
                <option value="teacher">Professor</option>
                <option value="student">Aluno</option>
                <option value="academy_admin">Admin da academia</option>
              </select>
              <Button className="w-full" type="submit" disabled={isSubmittingInvite || !activeTenant}>
                {isSubmittingInvite ? "Criando convite..." : "Enviar convite"}
              </Button>
            </form>
          </article>

          <article className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Convites do tenant</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Convites pendentes e históricos do tenant atual.
            </p>

            <div className="mt-5 space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="rounded-2xl border border-border bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">Role: {invitation.role}</p>
                    </div>
                    <Badge variant="secondary">
                      {invitationStatusLabel[invitation.status]}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Expira em: {new Date(invitation.expiresAt).toLocaleDateString("pt-BR")}
                  </p>
                  {invitation.status === "pending" && origin && (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs text-muted-foreground max-w-[360px] truncate">
                          {`${origin}/aceitar-convite/${invitation.token}`}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleCopyInvitationLink(invitation)}
                          disabled={copyingInvitationId === invitation.id}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copyingInvitationId === invitation.id ? "Copiando..." : "Copiar link"}
                        </Button>
                        {copiedInvitationId === invitation.id && (
                          <span className="text-xs text-emerald-500">Link copiado</span>
                        )}
                      </div>
                      {copyError && copyErrorInvitationId === invitation.id && (
                        <p className="text-xs text-destructive">{copyError}</p>
                      )}
                    </div>
                  )}
                </div>
              ))} 

              {!isLoading && invitations.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum convite encontrado.</p>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-border bg-card p-5 xl:col-span-2">
            <h2 className="text-lg font-semibold text-foreground">Solicitações de auto-cadastro</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Professores aguardam aprovação da academia. Alunos entram automaticamente e não aparecem aqui.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {enrollmentRequests.map((request) => (
                <div
                  key={request.id}
                  data-testid={`enrollment-request-${request.id}`}
                  data-request-email={request.userEmail}
                  className="rounded-2xl border border-border bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{request.userName}</p>
                      <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Perfil solicitado: {requestedRoleLabel[request.requestedRole]}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {enrollmentStatusLabel[request.status]}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Solicitação em: {new Date(request.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                  {request.requestedRole === "teacher" && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Dados pessoais já enviados pelo professor. Após aprovar, complete os dados de pagamento no cadastro profissional.
                    </p>
                  )}
                  {request.status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        data-testid={`approve-enrollment-request-${request.id}`}
                        onClick={() => reviewEnrollmentRequest(request.id, "approve")}
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`reject-enrollment-request-${request.id}`}
                        onClick={() => reviewEnrollmentRequest(request.id, "reject")}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {!isLoading && enrollmentRequests.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma solicitação de vínculo encontrada.
                </p>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
