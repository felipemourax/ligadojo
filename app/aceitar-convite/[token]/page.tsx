"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchJson } from "@/lib/api/client"
import { getDefaultRouteForRole } from "@/lib/surface-access"

interface InvitationLookupResponse {
  invitation: {
    email: string
    role: "academy_admin" | "teacher" | "student"
    status: "pending" | "accepted" | "expired" | "revoked"
    expiresAt: string
    invitedByName: string
  }
  tenant: {
    displayName: string
    slug: string
  } | null
}

export default function AcceptInvitationPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationLookupResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  useEffect(() => {
    let active = true

    async function loadInvitation() {
      try {
        const response = await fetchJson<InvitationLookupResponse>(
          `/api/invitations/${params.token}`
        )

        if (active) {
          setInvitation(response)
          setFormData((current) => ({
            ...current,
            email: response.invitation.email,
          }))
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar o convite.")
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadInvitation()

    return () => {
      active = false
    }
  }, [params.token])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetchJson<{
        membership: {
          role: "academy_admin" | "teacher" | "student"
        } | null
      }>("/api/invitations/accept", {
        method: "POST",
        body: JSON.stringify({
          token: params.token,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      window.dispatchEvent(new Event("dojo-session-refresh"))
      const role = response.membership?.role ?? "student"
      const defaultRoute = getDefaultRouteForRole(role)

      if (invitation?.tenant?.slug && (role === "teacher" || role === "student")) {
        const switchResponse = await fetchJson<{
          redirectUrl: string
        }>("/api/auth/tenant-switch", {
          method: "POST",
          body: JSON.stringify({
            redirectPath: defaultRoute,
            tenantSlug: invitation.tenant.slug,
          }),
        })

        window.location.href = switchResponse.redirectUrl
        return
      }

      router.push(defaultRoute)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível aceitar o convite.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Aceitar convite</CardTitle>
          <CardDescription>
            {invitation?.tenant
              ? `Você foi convidado para acessar ${invitation.tenant.displayName}.`
              : "Conclua seu acesso ao tenant convidado."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitation && (
            <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
              <p>
                Role convidado: <span className="font-medium text-foreground">{invitation.invitation.role}</span>
              </p>
              <p>
                Convite enviado por{" "}
                <span className="font-medium text-foreground">{invitation.invitation.invitedByName}</span>
              </p>
              <p>
                Expira em{" "}
                <span className="font-medium text-foreground">
                  {new Date(invitation.invitation.expiresAt).toLocaleDateString("pt-BR")}
                </span>
              </p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={formData.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Use sua senha atual ou crie uma nova"
                minLength={8}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aceitando convite...
                </>
              ) : (
                "Entrar com este convite"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
