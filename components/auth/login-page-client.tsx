"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError, fetchJson } from "@/lib/api/client"
import { type Role } from "@/lib/access-control"
import { resolveSingleAccessRedirect } from "@/lib/auth/platform-access-routing"
import { routes } from "@/lib/routes"
import { getDefaultRouteForRole } from "@/lib/surface-access"

interface LoginPageClientProps {
  tenant: {
    kind: "platform" | "tenant" | "unknown"
    tenantName: string | null
  }
  branding: {
    appName: string
    shortName: string
    themeColor: string
    backgroundColor: string
    logoUrl: string | null
    bannerUrl: string | null
  }
}

export function LoginPageClient({ tenant, branding }: LoginPageClientProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const isTenantHost = tenant.kind === "tenant"
  const brandColor = branding.themeColor ?? "hsl(var(--primary))"
  const title = isTenantHost ? branding.appName ?? "App da academia" : "LigaDojo"
  const subtitle = isTenantHost
    ? `Entre para acessar a experiência da ${tenant.tenantName ?? "sua academia"}.`
    : "Gestão de Academias"
  const platformLogoUrl = "/logo-ligadojo.svg"

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchJson<{
        session: {
          systemRoles: Role[]
          tenantMemberships: Array<{
            role: Role
          }>
        }
        currentTenantMembership: {
          role: Role
          status: "invited" | "pending" | "active" | "suspended" | "revoked"
        } | null
      }>("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      window.dispatchEvent(new Event("dojo-session-refresh"))

      const fullSession = await fetchJson<{
        memberships: Array<{
          role: Role
          status: "invited" | "pending" | "active" | "suspended" | "revoked"
          tenant: {
            slug: string
          } | null
        }>
        currentMembership: {
          role: Role
          status: "invited" | "pending" | "active" | "suspended" | "revoked"
          tenant: {
            slug: string
          } | null
        } | null
      }>("/api/me/memberships")

      const currentMembership = fullSession.currentMembership
      const singleAccessRedirect = !isTenantHost
        ? resolveSingleAccessRedirect(fullSession.memberships)
        : null

      if (singleAccessRedirect) {
        router.push(singleAccessRedirect)
        return
      }

      const role: Role =
        (isTenantHost ? response.currentTenantMembership?.role : currentMembership?.role) ??
        response.session.systemRoles[0] ??
        response.session.tenantMemberships[0]?.role ??
        "academy_admin"

      const primaryTenantMembership =
        currentMembership ??
        fullSession.memberships.find((membership) => membership.role === role && membership.tenant?.slug) ??
        fullSession.memberships.find((membership) => membership.tenant?.slug)

      if (primaryTenantMembership?.tenant?.slug && (role === "teacher" || role === "student")) {
        if (isTenantHost) {
          router.push(getDefaultRouteForRole(role))
          return
        }

        router.push(routes.platformAccess)
        return
      }

      if (role === "academy_admin") {
        if (isTenantHost) {
          router.push("/dashboard")
          return
        }

        router.push(routes.platformAccess)
        return
      }

      router.push(role === "platform_admin" ? getDefaultRouteForRole(role) : routes.platformAccess)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError(
          isTenantHost
            ? "Esta conta não possui acesso a esta academia. Cadastre-se ou use uma conta vinculada."
            : "Sua conta ainda não possui acesso liberado a nenhuma academia."
        )
      } else {
        setError(err instanceof Error ? err.message : "Não foi possível iniciar a sessão.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {branding.bannerUrl ? (
        <div className="absolute inset-x-0 top-0 h-64 sm:h-80">
          <Image
            alt={`Banner de ${branding.appName}`}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={branding.bannerUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-background" />
        </div>
      ) : (
        <div
          className="absolute inset-x-0 top-0 h-64 sm:h-80"
          style={{
            background: `linear-gradient(180deg, ${brandColor}33 0%, ${brandColor}14 38%, transparent 100%)`,
          }}
        />
      )}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-lg"
            style={{ backgroundColor: isTenantHost ? `${brandColor}22` : "#000000" }}
          >
            {isTenantHost && branding.logoUrl ? (
              <Image
                alt={`Logo de ${branding.appName}`}
                className="h-full w-full object-cover"
                height={64}
                src={branding.logoUrl}
                width={64}
              />
            ) : (
              <Image
                alt="Logo da LigaDojo"
                className="h-full w-full object-contain p-2"
                height={64}
                src={platformLogoUrl}
                width={64}
              />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <Card className="w-full max-w-[400px] border-border bg-card/95 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl font-semibold">
              {isTenantHost ? "Entrar no app da academia" : "Bem-vindo de volta"}
            </CardTitle>
            <CardDescription className="text-center">
              {isTenantHost
                ? "Use suas credenciais para acessar aulas, pagamentos e evolução."
                : "Entre com suas credenciais para acessar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  required
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="/recuperar-senha" className="text-xs text-primary hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    required
                    className="bg-input pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {isTenantHost ? "Ainda não tem acesso?" : "Ainda não tem conta?"}{" "}
                <Link href="/cadastro" className="font-medium text-primary hover:underline">
                  {isTenantHost ? "Cadastre-se aqui" : "Criar conta"}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
