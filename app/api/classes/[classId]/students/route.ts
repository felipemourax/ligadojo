import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { ClassGroupService } from "@/apps/api/src/modules/classes/services/class-group.service"
import { capabilities } from "@/lib/capabilities"

const classGroupService = new ClassGroupService()

export async function PUT(
  request: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const adminAccess = await requireDashboardTenantCapability({
    capability: capabilities.CLASSES_MANAGE,
  })

  const access = adminAccess.ok
    ? adminAccess
    : await requireDashboardTenantCapability({
        capability: capabilities.ATTENDANCE_MANAGE,
      })

  if (!access.ok) {
    return access.response
  }

  const { classId } = await context.params
  const body = await request.json().catch(() => null)

  if (!body || !Array.isArray((body as { studentUserIds?: unknown }).studentUserIds)) {
    return badRequest("Informe uma lista válida de alunos para a turma.")
  }

  try {
    const classGroup = await classGroupService.replaceEnrollmentsForActor({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      role: access.membership.role,
      classGroupId: classId,
      studentUserIds: (body as { studentUserIds: unknown[] }).studentUserIds.filter(
        (item): item is string => typeof item === "string" && item.length > 0
      ),
    })

    return ok({
      classGroup,
      message: "Alunos da turma atualizados com sucesso.",
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Não foi possível atualizar os alunos da turma."
    )
  }
}
