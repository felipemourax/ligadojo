import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import {
  InvalidRegisterFinancePaymentInputError,
  parseRegisterFinancePaymentInput,
} from "@/apps/api/src/modules/finance/contracts/register-finance-payment.parser"
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
    return badRequest("Informe um payload válido para registrar o pagamento.")
  }

  try {
    const { chargeId } = await context.params
    const dashboard = await financeDashboardService.registerPayment(
      access.tenant.id,
      chargeId,
      parseRegisterFinancePaymentInput(body as Record<string, unknown>)
    )

    return ok({ dashboard, message: "Pagamento registrado com sucesso." })
  } catch (error) {
    if (error instanceof InvalidRegisterFinancePaymentInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Não foi possível registrar o pagamento."
    )
  }
}
