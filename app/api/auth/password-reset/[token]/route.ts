import { notFound, ok } from "@/app/api/_lib/http"
import { PasswordResetService } from "@/apps/api/src/modules/iam/services/password-reset.service"

const passwordResetService = new PasswordResetService()

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params
  const valid = await passwordResetService.validateToken(token)

  if (!valid) {
    return notFound("Link de redefinição inválido ou expirado.")
  }

  return ok({ valid: true })
}
