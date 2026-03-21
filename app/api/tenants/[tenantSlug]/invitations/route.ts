import { created, badRequest, notFound, ok } from "@/app/api/_lib/http"
import { requireTenantCapability } from "@/app/api/_lib/tenant-capability"
import { InvitationService } from "@/apps/api/src/modules/invitations/services/invitation.service"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { capabilities } from "@/lib/capabilities"

const tenantRepository = new TenantRepository()
const invitationService = new InvitationService()

export async function GET(
  _request: Request,
  context: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await context.params
  const access = await requireTenantCapability({
    tenantSlug,
    capability: capabilities.MEMBERSHIPS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const tenant = await tenantRepository.findBySlug(tenantSlug)

  if (!tenant) {
    return notFound("Tenant não encontrado.")
  }

  const invitations = await invitationService.listInvitationsForTenant(tenant.id)
  return ok(invitations)
}

export async function POST(
  request: Request,
  context: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await context.params
  const access = await requireTenantCapability({
    tenantSlug,
    capability: capabilities.MEMBERSHIPS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json()
  const tenant = await tenantRepository.findBySlug(tenantSlug)

  if (!tenant) {
    return notFound("Tenant não encontrado.")
  }

  if (!body?.email || !body?.role || !body?.invitedByName) {
    return badRequest("Campos obrigatórios: email, role, invitedByName.")
  }

  if (!["academy_admin", "teacher", "student"].includes(body.role)) {
    return badRequest("Role inválido para convite.")
  }

  const invitation = await invitationService.createInvitation({
    tenantId: tenant.id,
    email: body.email,
    role: body.role,
    invitedByName: body.invitedByName,
    expiresInDays: body.expiresInDays,
  })

  return created(invitation)
}
