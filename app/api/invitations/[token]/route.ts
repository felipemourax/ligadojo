import { notFound, ok } from "@/app/api/_lib/http"
import { InvitationRepository } from "@/apps/api/src/modules/invitations/repositories/invitation.repository"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"

const invitationRepository = new InvitationRepository()
const tenantRepository = new TenantRepository()

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params
  const invitation = await invitationRepository.findByToken(token)

  if (!invitation) {
    return notFound("Convite não encontrado.")
  }

  const tenant = await tenantRepository.findById(invitation.tenantId)

  return ok({
    invitation,
    tenant,
  })
}
