import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { parseUpdateGraduationEligibilityOverrideInput } from "@/apps/api/src/modules/graduations/contracts/update-graduation-eligibility-override.parser"
import { GraduationDashboardService } from "@/apps/api/src/modules/graduations/services/graduation-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const graduationDashboardService = new GraduationDashboardService()

export async function PATCH(
  req: Request,
  context: { params: Promise<{ studentActivityId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.GRADUATIONS_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const { studentActivityId } = await context.params

  try {
    const input = parseUpdateGraduationEligibilityOverrideInput(await req.json().catch(() => null))
    const dashboard = await graduationDashboardService.updateEligibilityOverride({
      tenantId: access.tenant.id,
      studentActivityId,
      eligibleOverride: input.eligibleOverride,
      actor: {
        userId: access.auth.user!.id,
        name: access.auth.user!.name ?? null,
        role: access.membership.role,
      },
    })

    return ok({ dashboard, message: "Status de aptidão atualizado." })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Não foi possível atualizar a aptidão.")
  }
}
