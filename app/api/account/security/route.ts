import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"
import { PasswordAuthService } from "@/apps/api/src/modules/iam/services/password-auth.service"

const userRepository = new UserRepository()
const passwordAuthService = new PasswordAuthService()

export async function PATCH(request: Request) {
  const auth = await resolveAuthenticatedUser()

  if (!auth.user || !auth.userId) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Sessão inválida.",
      },
      { status: 401 },
    )
  }

  const body = await request.json().catch(() => null)
  const action = body?.action

  if (action === "email") {
    const nextEmail = String(body?.nextEmail ?? "").trim().toLowerCase()
    const currentPassword = String(body?.currentPassword ?? "")

    if (!nextEmail || !currentPassword) {
      return NextResponse.json(
        {
          error: "bad_request",
          message: "Informe o novo e-mail e a senha atual.",
        },
        { status: 400 },
      )
    }

    const passwordValid = await passwordAuthService.verifyPassword({
      userId: auth.userId,
      password: currentPassword,
    })

    if (!passwordValid) {
      return NextResponse.json(
        {
          error: "forbidden",
          message: "A senha atual está incorreta.",
        },
        { status: 403 },
      )
    }

    const emailOwner = await userRepository.findByEmail(nextEmail)

    if (emailOwner && emailOwner.id !== auth.userId) {
      return NextResponse.json(
        {
          error: "conflict",
          message: "Esse e-mail já está em uso por outra conta.",
        },
        { status: 409 },
      )
    }

    const user = await userRepository.updateEmail(auth.userId, nextEmail, auth.session?.systemRoles ?? [])

    return NextResponse.json(
      {
        user,
        message: "E-mail atualizado com sucesso.",
      },
      { status: 200 },
    )
  }

  if (action === "password") {
    const currentPassword = String(body?.currentPassword ?? "")
    const nextPassword = String(body?.nextPassword ?? "")

    if (!currentPassword || !nextPassword) {
      return NextResponse.json(
        {
          error: "bad_request",
          message: "Informe a senha atual e a nova senha.",
        },
        { status: 400 },
      )
    }

    if (nextPassword.length < 8) {
      return NextResponse.json(
        {
          error: "bad_request",
          message: "A nova senha precisa ter pelo menos 8 caracteres.",
        },
        { status: 400 },
      )
    }

    const passwordValid = await passwordAuthService.verifyPassword({
      userId: auth.userId,
      password: currentPassword,
    })

    if (!passwordValid) {
      return NextResponse.json(
        {
          error: "forbidden",
          message: "A senha atual está incorreta.",
        },
        { status: 403 },
      )
    }

    await passwordAuthService.setPassword({
      userId: auth.userId,
      password: nextPassword,
    })

    return NextResponse.json(
      {
        message: "Senha atualizada com sucesso.",
      },
      { status: 200 },
    )
  }

  return NextResponse.json(
    {
      error: "bad_request",
      message: "Ação inválida.",
    },
    { status: 400 },
  )
}
