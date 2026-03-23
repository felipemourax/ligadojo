import { badRequest, notFound, ok } from "@/app/api/_lib/http"
import { requirePlatformAdminAccess } from "@/app/api/_lib/platform-admin-access"
import { PlatformAdminService } from "@/apps/api/src/modules/platform/services/platform-admin.service"

const platformAdminService = new PlatformAdminService()

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const access = await requirePlatformAdminAccess()

  if (!access.ok) {
    return access.response
  }

  const { slug } = await context.params
  const academy = await platformAdminService.getAcademyBySlug(slug)

  if (!academy) {
    return notFound("Academia não encontrada.")
  }

  return ok(academy)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const access = await requirePlatformAdminAccess()

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  const action = body?.action

  if (action !== "approve" && action !== "suspend" && action !== "cancel") {
    return badRequest("Informe uma ação válida para a academia.")
  }

  const { slug } = await context.params
  const academy = await platformAdminService.updateAcademyStatus({ slug, action })

  if (!academy) {
    return notFound("Academia não encontrada.")
  }

  const message =
    action === "approve"
      ? "Academia aprovada com sucesso."
      : action === "suspend"
        ? "Academia suspensa com sucesso."
        : "Academia cancelada com sucesso."

  return ok({
    academy,
    message,
  })
}
