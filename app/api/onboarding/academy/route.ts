import { NextResponse } from "next/server"
import { attachAuthSessionCookie, attachDashboardTenantCookie } from "@/app/api/_lib/auth-session"
import {
  InvalidCreateAcademyFromSelfServiceInputError,
  parseCreateAcademyFromSelfServiceInput,
} from "@/apps/api/src/modules/onboarding/contracts/create-academy-from-self-service.parser"
import {
  AcademySelfServiceOnboardingError,
  AcademySelfServiceOnboardingService,
} from "@/apps/api/src/modules/onboarding/services/academy-self-service-onboarding.service"
import { UserSessionService } from "@/apps/api/src/modules/iam/services/user-session.service"

const academySelfServiceOnboardingService = new AcademySelfServiceOnboardingService()
const userSessionService = new UserSessionService()

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Corpo da requisição inválido.",
        details: { code: "invalid_json" },
      },
      { status: 400 }
    )
  }

  let input

  try {
    input = parseCreateAcademyFromSelfServiceInput(body)
  } catch (error) {
    if (error instanceof InvalidCreateAcademyFromSelfServiceInputError) {
      return NextResponse.json(
        {
          error: "bad_request",
          message: error.message,
          details: { code: error.code },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "bad_request",
        message: "Nao foi possivel validar o payload do onboarding da academia.",
        details: { code: "invalid_payload" },
      },
      { status: 400 }
    )
  }

  try {
    const result = await academySelfServiceOnboardingService.createAcademyFromSelfService(input)

    const authSession = await userSessionService.createForUser(result.user.id)

    const response = NextResponse.json(result, { status: 201 })
    attachAuthSessionCookie(response, authSession.token)
    attachDashboardTenantCookie(response, result.tenant.id)

    return response
  } catch (error) {
    if (error instanceof AcademySelfServiceOnboardingError) {
      return NextResponse.json(
        {
          error: error.code === "unauthorized_existing_owner" ? "unauthorized" : "conflict",
          message: error.message,
          details: { code: error.code },
        },
        { status: error.status }
      )
    }

    return NextResponse.json(
      {
        error: "internal_error",
        message: "Nao foi possivel concluir o onboarding da academia.",
        details: {
          code: "internal_error",
        },
      },
      { status: 500 }
    )
  }
}
