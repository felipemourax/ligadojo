import { badRequest, ok } from "@/app/api/_lib/http"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import {
  InvalidUpdateFinanceSettingsInputError,
  parseUpdateFinanceSettingsInput,
} from "@/apps/api/src/modules/finance/contracts/update-finance-settings.parser"
import { FinanceSettingsService } from "@/apps/api/src/modules/finance/services/finance-settings.service"
import { capabilities } from "@/lib/capabilities"

const service = new FinanceSettingsService()

export async function GET() {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.FINANCE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const settings = await service.getSettings(access.tenant.id)
  return ok({ settings })
}

export async function PATCH(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.FINANCE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload válido para salvar as políticas financeiras.")
  }

  try {
    const settings = await service.updateSettings(
      access.tenant.id,
      parseUpdateFinanceSettingsInput(body as Record<string, unknown>)
    )

    return ok({
      settings,
      message: "Políticas financeiras atualizadas com sucesso.",
    })
  } catch (error) {
    if (error instanceof InvalidUpdateFinanceSettingsInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error
        ? error.message
        : "Não foi possível salvar as políticas financeiras."
    )
  }
}
