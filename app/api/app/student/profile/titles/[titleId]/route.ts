import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { StudentAppProfileTitlesService } from "@/apps/api/src/modules/app/services/student-app-profile-titles.service"

const service = new StudentAppProfileTitlesService()

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ titleId: string }> }
) {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  try {
    const { titleId } = await context.params
    const data = await service.removeTitle({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      titleId,
    })

    return ok({
      data,
      message: "Título removido com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível remover o título.")
  }
}
