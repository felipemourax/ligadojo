import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import {
  InvalidCreateFinanceCouponInputError,
  parseCreateFinanceCouponInput,
} from "@/apps/api/src/modules/finance/contracts/create-finance-coupon.parser"
import { FinanceDashboardService } from "@/apps/api/src/modules/finance/services/finance-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const financeDashboardService = new FinanceDashboardService()

export async function POST(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.FINANCE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload valido para criar o cupom.")
  }

  try {
    const dashboard = await financeDashboardService.createCoupon(
      access.tenant.id,
      access.auth.user?.id ?? null,
      parseCreateFinanceCouponInput(body as Record<string, unknown>)
    )

    return ok({
      dashboard,
      message: "Cupom criado com sucesso.",
    })
  } catch (error) {
    if (error instanceof InvalidCreateFinanceCouponInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Nao foi possivel criar o cupom."
    )
  }
}
