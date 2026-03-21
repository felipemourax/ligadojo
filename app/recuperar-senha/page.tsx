"use client"

import Link from "next/link"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchJson } from "@/lib/api/client"

export default function RecoverPasswordPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get("email") ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewResetUrl, setPreviewResetUrl] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetchJson<{
        message: string
        previewResetUrl: string | null
      }>("/api/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      })

      setSuccess(response.message)
      setPreviewResetUrl(response.previewResetUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar a redefinição.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar senha</CardTitle>
          <CardDescription>
            Informe o e-mail da sua conta para gerar um link de redefinição.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-muted-foreground">{success}</p>}
            {previewResetUrl && (
              <p className="text-sm">
                <Link className="text-primary underline" href={previewResetUrl}>
                  Abrir link de redefinição
                </Link>
              </p>
            )}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando link...
                </>
              ) : (
                "Gerar link"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
