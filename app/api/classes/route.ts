import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { ClassGroupService } from "@/apps/api/src/modules/classes/services/class-group.service"
import { capabilities } from "@/lib/capabilities"

const classGroupService = new ClassGroupService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.CLASSES_READ,
  })

  if (!access.ok) {
    return access.response
  }

  if (!access.auth.user) {
    return badRequest("Usuário autenticado não encontrado para listar turmas.")
  }

  const result = await classGroupService.listForActor({
    tenantId: access.tenant.id,
    userId: access.auth.user.id,
    role: access.membership.role,
  })
  return ok(result)
}

export async function POST(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.CLASSES_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload válido para criar a turma.")
  }

  try {
    const classGroup = await classGroupService.create({
      tenantId: access.tenant.id,
      payload: body as Record<string, unknown>,
    })

    return ok({
      classGroup,
      message: "Turma criada com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível criar a turma.")
  }
}
