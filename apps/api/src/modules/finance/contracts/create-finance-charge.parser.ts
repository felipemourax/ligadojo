import type { CreateFinanceChargeInput } from "@/apps/api/src/modules/finance/contracts/create-finance-charge.input"

export class InvalidCreateFinanceChargeInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidCreateFinanceChargeInputError"
  }
}

export function parseCreateFinanceChargeInput(
  body: Record<string, unknown>
): CreateFinanceChargeInput {
  if (
    typeof body.userId !== "string" ||
    typeof body.description !== "string" ||
    typeof body.category !== "string" ||
    typeof body.dueDate !== "string"
  ) {
    throw new InvalidCreateFinanceChargeInputError(
      "Dados obrigatórios da cobrança não foram informados."
    )
  }

  const recurrenceMode =
    body.recurrenceMode === "RECURRING" ? "RECURRING" : "ONE_TIME"
  const recurringSource =
    body.recurringSource === "PLAN_LINKED"
      ? "PLAN_LINKED"
      : body.recurringSource === "MANUAL_AMOUNT"
        ? "MANUAL_AMOUNT"
        : null
  const amount = typeof body.amount === "number" ? body.amount : null
  const dueDate = body.dueDate.trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new InvalidCreateFinanceChargeInputError(
      "Informe uma data de vencimento válida para a cobrança."
    )
  }

  if (recurrenceMode === "RECURRING" && body.category !== "Mensalidade") {
    throw new InvalidCreateFinanceChargeInputError(
      "A recorrência está disponível apenas para cobranças de mensalidade."
    )
  }

  if (recurrenceMode === "RECURRING" && recurringSource == null) {
    throw new InvalidCreateFinanceChargeInputError(
      "Escolha se a recorrência será por valor manual ou por plano."
    )
  }

  if (recurrenceMode === "RECURRING" && recurringSource === "PLAN_LINKED") {
    if (typeof body.planId !== "string" || body.planId.trim().length === 0) {
      throw new InvalidCreateFinanceChargeInputError(
        "Selecione um plano válido para criar a mensalidade recorrente."
      )
    }
  } else if (amount == null || !Number.isFinite(amount) || amount <= 0) {
    throw new InvalidCreateFinanceChargeInputError(
      "Informe um valor maior que zero para criar a cobrança."
    )
  }

  return {
    userId: body.userId.trim(),
    studentProfileId: typeof body.studentProfileId === "string" ? body.studentProfileId : null,
    description: body.description.trim(),
    category: body.category.trim(),
    amount,
    dueDate,
    planId: typeof body.planId === "string" ? body.planId : null,
    recurrenceMode,
    recurringSource,
    confirmDuplicatePlan: body.confirmDuplicatePlan === true,
  }
}
