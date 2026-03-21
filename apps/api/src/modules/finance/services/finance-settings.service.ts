import {
  DelinquencyRecurringMode,
  PaymentGateway,
  PlanTransitionChargeHandling,
  PlanTransitionPolicy,
} from "@prisma/client"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import type { UpdateFinanceSettingsInput } from "@/apps/api/src/modules/finance/contracts/update-finance-settings.input"
import type { FinanceSettingsData } from "@/apps/api/src/modules/finance/domain/finance-settings"

function toGatewayValue(value: PaymentGateway | null): FinanceSettingsData["gateway"] {
  switch (value) {
    case PaymentGateway.MERCADO_PAGO:
      return "mercado_pago"
    case PaymentGateway.ASAAS:
      return "asaas"
    case PaymentGateway.STRIPE:
      return "stripe"
    default:
      return ""
  }
}

function toPaymentGateway(value: UpdateFinanceSettingsInput["gateway"]) {
  switch (value) {
    case "mercado_pago":
      return PaymentGateway.MERCADO_PAGO
    case "asaas":
      return PaymentGateway.ASAAS
    case "stripe":
      return PaymentGateway.STRIPE
    default:
      return null
  }
}

function toPlanTransitionPolicy(
  value: PlanTransitionPolicy
): FinanceSettingsData["planTransitionPolicy"] {
  switch (value) {
    case PlanTransitionPolicy.IMMEDIATE:
      return "immediate"
    case PlanTransitionPolicy.PRORATA:
      return "prorata"
    default:
      return "next_cycle"
  }
}

function fromPlanTransitionPolicy(value: UpdateFinanceSettingsInput["planTransitionPolicy"]) {
  switch (value) {
    case "immediate":
      return PlanTransitionPolicy.IMMEDIATE
    case "prorata":
      return PlanTransitionPolicy.PRORATA
    default:
      return PlanTransitionPolicy.NEXT_CYCLE
  }
}

function toPlanTransitionChargeHandling(
  value: PlanTransitionChargeHandling
): FinanceSettingsData["planTransitionChargeHandling"] {
  switch (value) {
    case PlanTransitionChargeHandling.REPLACE_OPEN_CHARGE:
      return "replace_open_charge"
    case PlanTransitionChargeHandling.CONVERT_TO_CREDIT:
      return "convert_to_credit"
    default:
      return "charge_difference"
  }
}

function fromPlanTransitionChargeHandling(
  value: UpdateFinanceSettingsInput["planTransitionChargeHandling"]
) {
  switch (value) {
    case "replace_open_charge":
      return PlanTransitionChargeHandling.REPLACE_OPEN_CHARGE
    case "convert_to_credit":
      return PlanTransitionChargeHandling.CONVERT_TO_CREDIT
    default:
      return PlanTransitionChargeHandling.CHARGE_DIFFERENCE
  }
}

function toDelinquencyRecurringMode(
  value: DelinquencyRecurringMode
): FinanceSettingsData["delinquencyRecurringMode"] {
  return value === DelinquencyRecurringMode.PAUSE ? "pause" : "continue"
}

function fromDelinquencyRecurringMode(
  value: UpdateFinanceSettingsInput["delinquencyRecurringMode"]
) {
  return value === "pause"
    ? DelinquencyRecurringMode.PAUSE
    : DelinquencyRecurringMode.CONTINUE
}

export class FinanceSettingsService {
  async getSettings(tenantId: string): Promise<FinanceSettingsData> {
    const settings = await prisma.tenantPaymentSettings.findUnique({
      where: { tenantId },
    })

    if (!settings) {
      return {
        acceptedMethods: [],
        gateway: "",
        planTransitionPolicy: "next_cycle",
        planTransitionChargeHandling: "charge_difference",
        delinquencyGraceDays: 0,
        delinquencyBlocksNewClasses: false,
        delinquencyRemovesCurrentClasses: false,
        delinquencyRecurringMode: "continue",
        delinquencyAccumulatesDebt: true,
      }
    }

    return {
      acceptedMethods: [
        settings.pixEnabled ? "pix" : null,
        settings.cardEnabled ? "card" : null,
        settings.boletoEnabled ? "boleto" : null,
      ].filter((value): value is "pix" | "card" | "boleto" => value != null),
      gateway: toGatewayValue(settings.gateway),
      planTransitionPolicy: toPlanTransitionPolicy(settings.planTransitionPolicy),
      planTransitionChargeHandling: toPlanTransitionChargeHandling(
        settings.planTransitionChargeHandling
      ),
      delinquencyGraceDays: settings.delinquencyGraceDays,
      delinquencyBlocksNewClasses: settings.delinquencyBlocksNewClasses,
      delinquencyRemovesCurrentClasses: settings.delinquencyRemovesCurrentClasses,
      delinquencyRecurringMode: toDelinquencyRecurringMode(settings.delinquencyRecurringMode),
      delinquencyAccumulatesDebt: settings.delinquencyAccumulatesDebt,
    }
  }

  async updateSettings(tenantId: string, input: UpdateFinanceSettingsInput) {
    await prisma.tenantPaymentSettings.upsert({
      where: { tenantId },
      update: {
        pixEnabled: input.acceptedMethods.includes("pix"),
        cardEnabled: input.acceptedMethods.includes("card"),
        boletoEnabled: input.acceptedMethods.includes("boleto"),
        gateway: toPaymentGateway(input.gateway),
        planTransitionPolicy: fromPlanTransitionPolicy(input.planTransitionPolicy),
        planTransitionChargeHandling: fromPlanTransitionChargeHandling(
          input.planTransitionChargeHandling
        ),
        delinquencyGraceDays: input.delinquencyGraceDays,
        delinquencyBlocksNewClasses: input.delinquencyBlocksNewClasses,
        delinquencyRemovesCurrentClasses: input.delinquencyRemovesCurrentClasses,
        delinquencyRecurringMode: fromDelinquencyRecurringMode(input.delinquencyRecurringMode),
        delinquencyAccumulatesDebt: input.delinquencyAccumulatesDebt,
      },
      create: {
        tenantId,
        pixEnabled: input.acceptedMethods.includes("pix"),
        cardEnabled: input.acceptedMethods.includes("card"),
        boletoEnabled: input.acceptedMethods.includes("boleto"),
        gateway: toPaymentGateway(input.gateway),
        planTransitionPolicy: fromPlanTransitionPolicy(input.planTransitionPolicy),
        planTransitionChargeHandling: fromPlanTransitionChargeHandling(
          input.planTransitionChargeHandling
        ),
        delinquencyGraceDays: input.delinquencyGraceDays,
        delinquencyBlocksNewClasses: input.delinquencyBlocksNewClasses,
        delinquencyRemovesCurrentClasses: input.delinquencyRemovesCurrentClasses,
        delinquencyRecurringMode: fromDelinquencyRecurringMode(input.delinquencyRecurringMode),
        delinquencyAccumulatesDebt: input.delinquencyAccumulatesDebt,
      },
    })

    return this.getSettings(tenantId)
  }
}
