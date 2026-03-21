import { NextResponse } from "next/server"
import { PasswordResetService } from "@/apps/api/src/modules/iam/services/password-reset.service"

const passwordResetService = new PasswordResetService()

export async function POST(request: Request) {
  const body = await request.json()

  if (typeof body?.token !== "string" || !body.token) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Token inválido.",
      },
      { status: 400 }
    )
  }

  if (typeof body?.password !== "string" || body.password.length < 8) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "A senha precisa ter pelo menos 8 caracteres.",
      },
      { status: 400 }
    )
  }

  const result = await passwordResetService.resetWithToken({
    token: body.token,
    password: body.password,
  })

  if (!result) {
    return NextResponse.json(
      {
        error: "not_found",
        message: "Link de redefinição inválido ou expirado.",
      },
      { status: 404 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: "Senha atualizada com sucesso.",
  })
}
