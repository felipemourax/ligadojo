import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import {
  InvalidCreateFinanceChargeInputError,
  parseCreateFinanceChargeInput,
} from "@/apps/api/src/modules/finance/contracts/create-finance-charge.parser"
import { FinanceDashboardService } from "@/apps/api/src/modules/finance/services/finance-dashboard.service"
import { capabilities } from "@/lib/capabilities"

const financeDashboardService = new FinanceDashboardService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.FINANCE_READ,
  })

  if (!access.ok) {
    return access.response
  }

  const dashboard = await financeDashboardService.getDashboardData(access.tenant.id)
  return ok({ dashboard })
}

export async function POST(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.FINANCE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload válido para criar a cobrança.")
  }

  try {
    const dashboard = await financeDashboardService.createCharge(
      access.tenant.id,
      parseCreateFinanceChargeInput(body as Record<string, unknown>)
    )

    return ok({ dashboard, message: "Cobrança criada com sucesso." })
  } catch (error) {
    if (error instanceof InvalidCreateFinanceChargeInputError) {
      return badRequest(error.message)
    }

    return badRequest(error instanceof Error ? error.message : "Não foi possível criar a cobrança.")
  }
}
