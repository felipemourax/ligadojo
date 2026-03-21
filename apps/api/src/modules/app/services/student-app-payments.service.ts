import type { StudentAppPaymentsData } from "@/apps/api/src/modules/app/domain/student-app"
import { prisma } from "@/apps/api/src/infrastructure/prisma/prisma-client"
import { FinanceStudentPaymentsService } from "@/apps/api/src/modules/finance/services/finance-student-payments.service"

export class StudentAppPaymentsService {
  constructor(
    private readonly financeStudentPaymentsService = new FinanceStudentPaymentsService()
  ) {}

  async getData(input: { tenantId: string; userId: string }): Promise<StudentAppPaymentsData> {
    const student = await prisma.studentProfile.findFirst({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    })

    if (!student) {
      throw new Error("Aluno não encontrado para este tenant.")
    }

    const financialState = await this.financeStudentPaymentsService.getSnapshot({
      tenantId: input.tenantId,
      userId: input.userId,
    })

    return {
      role: "student",
      studentId: student.id,
      planName: financialState.planName,
      paymentStatus: financialState.paymentStatus,
      lastPayment: financialState.lastPayment,
      nextPayment: financialState.nextPayment,
      amountLabel: financialState.planValueCents != null
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
            financialState.planValueCents / 100
          )
        : null,
      currentCharge: financialState.openCharge
        ? {
            id: financialState.openCharge.id,
            description: financialState.openCharge.description,
            dueDate: financialState.openCharge.dueDate,
            status: financialState.openCharge.status,
            amountLabel: new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(financialState.openCharge.amountCents / 100),
            originalAmountLabel:
              financialState.openCharge.originalAmountCents !== financialState.openCharge.amountCents
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(financialState.openCharge.originalAmountCents / 100)
                : null,
            discountAmountLabel:
              financialState.openCharge.discountAmountCents > 0
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(financialState.openCharge.discountAmountCents / 100)
                : null,
            appliedCouponCode: financialState.openCharge.appliedCouponCode,
            appliedCouponTitle: financialState.openCharge.appliedCouponTitle,
          }
        : null,
    }
  }
}
