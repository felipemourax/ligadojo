import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import {
  InvalidApplyFinanceDiscountInputError,
  parseApplyFinanceDiscountInput,
} from "@/apps/api/src/modules/finance/contracts/apply-finance-discount.parser"
import { FinanceDashboardService } from "@/apps/api/src/modules/finance/services/finance-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const financeDashboardService = new FinanceDashboardService()

export async function PATCH(
  request: Request,
  context: { params: Promise<{ chargeId: string }> }
) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.FINANCE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload valido para aplicar o desconto.")
  }

  try {
    const { chargeId } = await context.params
    const dashboard = await financeDashboardService.applyManualDiscount(
      access.tenant.id,
      chargeId,
      parseApplyFinanceDiscountInput(body as Record<string, unknown>)
    )

    return ok({
      dashboard,
      message: "Desconto aplicado com sucesso.",
    })
  } catch (error) {
    if (error instanceof InvalidApplyFinanceDiscountInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Nao foi possivel aplicar o desconto."
    )
  }
}
