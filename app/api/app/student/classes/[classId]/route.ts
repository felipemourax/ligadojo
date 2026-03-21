import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { StudentAppClassesService } from "@/apps/api/src/modules/app/services/student-app-classes.service"

const service = new StudentAppClassesService()

export async function POST(
  _request: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  const { classId } = await context.params

  if (!classId) {
    return badRequest("Informe uma turma válida para participar.")
  }

  try {
    await service.joinClass({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      classGroupId: classId,
    })

    const data = await service.getData({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
    })

    return ok({
      data,
      message: "Você entrou na turma com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível entrar na turma.")
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  const { classId } = await context.params

  if (!classId) {
    return badRequest("Informe uma turma válida para sair.")
  }

  try {
    await service.leaveClass({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      classGroupId: classId,
    })

    const data = await service.getData({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
    })

    return ok({
      data,
      message: "Você saiu da turma.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível sair da turma.")
  }
}
