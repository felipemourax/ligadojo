import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { ClassGroupService } from "@/apps/api/src/modules/classes/services/class-group.service"
import { capabilities } from "@/lib/capabilities"

const classGroupService = new ClassGroupService()

export async function PATCH(
  request: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.CLASSES_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { classId } = await context.params
  const body = await request.json().catch(() => null)

  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload válido para atualizar a turma.")
  }

  try {
    const classGroup = await classGroupService.update({
      tenantId: access.tenant.id,
      classGroupId: classId,
      payload: body as Record<string, unknown>,
    })

    return ok({
      classGroup,
      message: "Turma atualizada com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível atualizar a turma.")
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.CLASSES_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { classId } = await context.params

  try {
    const result = await classGroupService.remove({
      tenantId: access.tenant.id,
      classGroupId: classId,
    })

    return ok({
      ...result,
      message:
        result.mode === "archived"
          ? "A turma foi arquivada porque já possuía histórico."
          : "Turma excluída com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível excluir a turma.")
  }
}
