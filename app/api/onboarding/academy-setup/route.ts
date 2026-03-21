import { NextResponse } from "next/server"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import {
  TenantOnboardingService,
  TenantOnboardingValidationError,
} from "@/apps/api/src/modules/onboarding/services/tenant-onboarding.service"
import type { OnboardingStepKey } from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding"
import { capabilities } from "@/lib/capabilities"

const tenantOnboardingService = new TenantOnboardingService()
const tenantRepository = new TenantRepository()

const validSteps = new Set<OnboardingStepKey>([
  "academy_info",
  "location",
  "class_structure",
  "plans",
  "branding",
  "payments",
])

async function resolveDashboardTenantAccess() {
  return requireDashboardTenantCapability({
      capability: capabilities.ONBOARDING_MANAGE,
  })
}

export async function GET() {
  const access = await resolveDashboardTenantAccess()

  if (!access.ok) {
    return access.response
  }

  const onboarding = await tenantOnboardingService.getTenantOnboarding(access.tenant.id)

  return NextResponse.json(
    {
      tenant: access.tenant,
      onboarding,
    },
    { status: 200 }
  )
}

export async function PATCH(request: Request) {
  const access = await resolveDashboardTenantAccess()

  if (!access.ok) {
    return access.response
  }

  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Corpo da requisição inválido para o academy setup.",
        details: { code: "invalid_json" },
      },
      { status: 400 }
    )
  }

  const step = typeof body?.step === "string" ? body.step : null
  const data = body?.data

  if (!step || !validSteps.has(step as OnboardingStepKey)) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Informe um step válido para o onboarding.",
      },
      { status: 400 }
    )
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Informe um payload de dados válido para o passo.",
      },
      { status: 400 }
    )
  }

  try {
    const onboarding = await tenantOnboardingService.saveStep({
      tenantId: access.tenant.id,
      step: step as OnboardingStepKey,
      data: data as Record<string, unknown>,
      currentStep: typeof body.currentStep === "number" ? body.currentStep : undefined,
    })

    return NextResponse.json(
      {
        tenant: access.tenant,
        onboarding,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof TenantOnboardingValidationError) {
      return NextResponse.json(
        {
          error: "bad_request",
          message: error.message,
          details: { code: error.code },
        },
        { status: 400 }
      )
    }

    throw error
  }
}

export async function POST() {
  const access = await resolveDashboardTenantAccess()

  if (!access.ok) {
    return access.response
  }

  const result = await tenantOnboardingService.complete(access.tenant.id)

  if (!result) {
    return NextResponse.json(
      {
        error: "not_found",
        message: "Onboarding não encontrado para este tenant.",
      },
      { status: 404 }
    )
  }

  if (!result.canComplete) {
    return NextResponse.json(
      {
        error: "conflict",
        message: "Os passos obrigatorios do academy setup ainda nao foram concluidos.",
        blockingSteps: result.onboarding.blockingSteps,
        onboarding: result.onboarding,
      },
      { status: 409 }
    )
  }

  return NextResponse.json(
    {
      tenant: access.tenant,
      onboarding: result.onboarding,
    },
    { status: 200 }
  )
}
