import { NextResponse } from "next/server"
import { attachAuthSessionCookie } from "@/app/api/_lib/auth-session"
import { UserRepository } from "@/apps/api/src/modules/iam/repositories/user.repository"
import { PasswordCredentialRepository } from "@/apps/api/src/modules/iam/repositories/password-credential.repository"
import { PasswordAuthService } from "@/apps/api/src/modules/iam/services/password-auth.service"
import { UserSessionService } from "@/apps/api/src/modules/iam/services/user-session.service"
import { InvitationRepository } from "@/apps/api/src/modules/invitations/repositories/invitation.repository"
import { InvitationService } from "@/apps/api/src/modules/invitations/services/invitation.service"
import { createPasswordHash } from "@/apps/api/src/common/auth/password-hasher"

const userRepository = new UserRepository()
const passwordCredentialRepository = new PasswordCredentialRepository()
const passwordAuthService = new PasswordAuthService()
const userSessionService = new UserSessionService()
const invitationRepository = new InvitationRepository()
const invitationService = new InvitationService()

export async function POST(request: Request) {
  const body = await request.json()

  if (!body?.token || !body?.email) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Campos obrigatórios: token e email.",
      },
      { status: 400 }
    )
  }

  const invitation = await invitationRepository.findByToken(body.token)

  if (!invitation) {
    return NextResponse.json(
      {
        error: "not_found",
        message: "Convite não encontrado.",
      },
      { status: 404 }
    )
  }

  if (invitation.email.toLowerCase() !== body.email.toLowerCase()) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "O email autenticado não corresponde ao email do convite.",
      },
      { status: 400 }
    )
  }

  const existingUser = await userRepository.findByEmail(body.email)
  const existingCredentialForUser = existingUser
    ? await passwordCredentialRepository.findByUserId(existingUser.id)
    : null

  if (existingUser && existingCredentialForUser) {
    if (typeof body?.password !== "string" || body.password.length < 8) {
      return NextResponse.json(
        {
          error: "bad_request",
          message: "Informe a senha da conta existente para aceitar o convite.",
        },
        { status: 400 }
      )
    }

    const authenticatedUser = await passwordAuthService.authenticateByEmail({
      email: body.email,
      password: body.password,
    })

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message: "Senha inválida para a conta convidada.",
        },
        { status: 401 }
      )
    }
  }

  const user = await userRepository.findOrCreateByEmail({
    email: body.email,
    name: body.name,
    phone: body.phone,
  })

  const existingCredential = existingCredentialForUser
    ?? await passwordCredentialRepository.findByUserId(user.id)

  if (!existingCredential) {
    if (typeof body?.password !== "string" || body.password.length < 8) {
      return NextResponse.json(
        {
          error: "bad_request",
          message: "Defina uma senha com pelo menos 8 caracteres para aceitar o convite.",
        },
        { status: 400 }
      )
    }

    const credential = createPasswordHash(body.password)
    await passwordCredentialRepository.upsert({
      userId: user.id,
      passwordHash: credential.passwordHash,
      passwordSalt: credential.passwordSalt,
    })
  }

  const result = await invitationService.acceptInvitationAndActivateMembership({
    token: body.token,
    acceptedByUserId: user.id,
  })

  if (!result) {
    return NextResponse.json(
      {
        error: "not_found",
        message: "Não foi possível aceitar o convite.",
      },
      { status: 404 }
    )
  }

  const authSession = await userSessionService.createForUser(user.id)

  const response = NextResponse.json({
    user,
    ...result,
  })

  return attachAuthSessionCookie(response, authSession.token)
}
