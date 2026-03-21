"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchJson } from "@/lib/api/client"

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    let active = true

    async function validate() {
      try {
        await fetchJson(`/api/auth/password-reset/${params.token}`)
        if (active) {
          setIsValid(true)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Link inválido.")
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void validate()

    return () => {
      active = false
    }
  }, [params.token])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError("As senhas não conferem.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await fetchJson("/api/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({
          token: params.token,
          password,
        }),
      })

      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>
            {isValid
              ? "Defina sua nova senha para continuar."
              : "Este link de redefinição não é mais válido."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isValid ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Atualizar senha"
                )}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
