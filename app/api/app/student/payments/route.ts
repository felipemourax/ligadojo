import { badRequest, ok } from "@/app/api/_lib/http"
import { requireTenantAppAccess } from "@/app/api/_lib/app-tenant-access"
import {
  InvalidApplyFinanceCouponInputError,
  parseApplyFinanceCouponInput,
} from "@/apps/api/src/modules/finance/contracts/apply-finance-coupon.parser"
import { FinanceStudentPaymentsService } from "@/apps/api/src/modules/finance/services/finance-student-payments.service"
import { StudentAppPaymentsService } from "@/apps/api/src/modules/app/services/student-app-payments.service"

const service = new StudentAppPaymentsService()
const financeStudentPaymentsService = new FinanceStudentPaymentsService()

export async function GET() {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response
  const userId = access.auth.user!.id
  const data = await service.getData({ tenantId: access.tenant.id, userId })
  return ok({ data })
}

export async function POST(request: Request) {
  const access = await requireTenantAppAccess({ role: "student" })
  if (!access.ok) return access.response

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return badRequest("Informe um payload valido para aplicar o cupom.")
  }

  try {
    await financeStudentPaymentsService.applyCoupon({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
      coupon: parseApplyFinanceCouponInput(body as Record<string, unknown>),
    })

    const data = await service.getData({
      tenantId: access.tenant.id,
      userId: access.auth.user!.id,
    })

    return ok({
      data,
      message: "Cupom aplicado com sucesso.",
    })
  } catch (error) {
    if (error instanceof InvalidApplyFinanceCouponInputError) {
      return badRequest(error.message)
    }

    return badRequest(
      error instanceof Error ? error.message : "Nao foi possivel aplicar o cupom."
    )
  }
}
