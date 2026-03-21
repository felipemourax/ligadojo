import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { parseRegisterTeacherAppProfileGraduationInput } from "@/apps/api/src/modules/app/contracts/register-teacher-app-profile-graduation.parser"
import { TeacherAppProfileGraduationsService } from "@/apps/api/src/modules/app/services/teacher-app-profile-graduations.service"

const service = new TeacherAppProfileGraduationsService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response

  const data = await service.getData({
    tenantId: access.tenant.id,
    userId: access.auth.user!.id,
  })

  return ok({ data })
}

export async function POST(request: Request) {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response

  try {
    const payload = parseRegisterTeacherAppProfileGraduationInput(
      await request.json().catch(() => null)
    )

    const data = await service.registerGraduation({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      payload,
    })

    return ok({
      data,
      message: "Graduação registrada com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível registrar a graduação.")
  }
}
