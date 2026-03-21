import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { parseCreateAthleteTitleInput } from "@/apps/api/src/modules/athletes/contracts/create-athlete-title.parser"
import { TeacherAppProfileTitlesService } from "@/apps/api/src/modules/app/services/teacher-app-profile-titles.service"

const service = new TeacherAppProfileTitlesService()

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
    const payload = parseCreateAthleteTitleInput(await request.json().catch(() => null))
    const data = await service.createTitle({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      payload,
    })

    return ok({
      data,
      message: "Título adicionado com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível adicionar o título.")
  }
}
