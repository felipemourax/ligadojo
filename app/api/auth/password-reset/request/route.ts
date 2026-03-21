import { NextResponse } from "next/server"
import { PasswordResetService } from "@/apps/api/src/modules/iam/services/password-reset.service"

const passwordResetService = new PasswordResetService()

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (!isValidEmail(body?.email)) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Informe um e-mail válido.",
      },
      { status: 400 }
    )
  }

  const result = await passwordResetService.requestByEmail(body.email.toLowerCase())
  const requestUrl = new URL(request.url)

  return NextResponse.json({
    ok: true,
    message: "Se o e-mail existir, um link de redefinição foi gerado.",
    previewResetUrl:
      process.env.NODE_ENV !== "production" && result.token
        ? `${requestUrl.protocol}//${requestUrl.host}/redefinir-senha/${result.token}`
        : null,
  })
}
