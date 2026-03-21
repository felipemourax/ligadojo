import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import { TeacherAppProfileService } from "@/apps/api/src/modules/app/services/teacher-app-profile.service"
import type { TeacherAppProfileUpdateInput } from "@/apps/api/src/modules/app/domain/teacher-app"

const service = new TeacherAppProfileService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response
  const data = await service.getData({
    tenantId: access.tenant.id,
    userId: access.auth.user!.id,
  })
  return ok({ data })
}

export async function PUT(request: Request) {
  const access = await requireTenantAppAccess({ role: "teacher" })
  if (!access.ok) return access.response

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload válido para atualizar o perfil.")
  }

  const payload = body as Partial<TeacherAppProfileUpdateInput>
  if (!payload.name || !payload.email) {
    return badRequest("Nome e e-mail são obrigatórios.")
  }

  try {
    const data = await service.updateData({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      payload: {
        name: String(payload.name ?? ""),
        email: String(payload.email ?? ""),
        phone: String(payload.phone ?? ""),
        address: String(payload.address ?? ""),
        birthDate: String(payload.birthDate ?? ""),
        registry: String(payload.registry ?? ""),
        bio: String(payload.bio ?? ""),
      },
    })

    return ok({
      data,
      message: "Perfil atualizado com sucesso.",
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível atualizar o perfil.")
  }
}
