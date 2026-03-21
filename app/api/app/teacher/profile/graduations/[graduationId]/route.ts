import { badRequest, notFound, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { parseRegisterTeacherAppProfileGraduationInput } from "@/apps/api/src/modules/app/contracts/register-teacher-app-profile-graduation.parser"
import { TeacherAppProfileGraduationsService } from "@/apps/api/src/modules/app/services/teacher-app-profile-graduations.service"

const service = new TeacherAppProfileGraduationsService()

export async function PATCH(
  request: Request,
  context: { params: Promise<{ graduationId: string }> }
) {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response

  const { graduationId } = await context.params

  try {
    const payload = parseRegisterTeacherAppProfileGraduationInput(
      await request.json().catch(() => null)
    )

    const data = await service.updateGraduation({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      graduationId,
      payload,
    })

    return ok({
      data,
      message: "Graduação atualizada com sucesso.",
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível atualizar a graduação."

    if (/não encontrada/i.test(message)) {
      return notFound(message)
    }

    return badRequest(message)
  }
}
