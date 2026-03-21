import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { parseRegisterStudentAppProfileGraduationInput } from "@/apps/api/src/modules/app/contracts/register-student-app-profile-graduation.parser"
import { StudentAppProfileGraduationsService } from "@/apps/api/src/modules/app/services/student-app-profile-graduations.service"

const service = new StudentAppProfileGraduationsService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  const data = await service.getData({
    tenantId: access.tenant.id,
    userId: access.auth.user!.id,
  })

  return ok({ data })
}

export async function POST(request: Request) {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  try {
    const payload = parseRegisterStudentAppProfileGraduationInput(
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
