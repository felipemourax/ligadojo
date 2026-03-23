import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { roles } from "@/lib/access-control"

export async function requirePlatformAdminAccess() {
  const auth = await resolveAuthenticatedUser()

  if (!auth.user || !auth.session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "unauthorized",
          message: "Sessão inválida.",
        },
        { status: 401 }
      ),
    }
  }

  if (!auth.session.systemRoles.includes(roles.PLATFORM_ADMIN)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "forbidden",
          message: "Acesso restrito ao administrativo da plataforma.",
        },
        { status: 403 }
      ),
    }
  }

  return {
    ok: true as const,
    auth,
  }
}
