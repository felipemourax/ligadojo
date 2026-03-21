import type { AttendanceDashboardData } from "@/apps/api/src/modules/attendance/domain/attendance-dashboard"
import type { UpdateAttendanceSessionInput } from "@/apps/api/src/modules/attendance/contracts/update-attendance-session.input"
import { ClassGroupRepository } from "@/apps/api/src/modules/classes/repositories/class-group.repository"
import { ClassGroupService } from "@/apps/api/src/modules/classes/services/class-group.service"

export class AttendanceDashboardService {
  constructor(
    private readonly classGroupService = new ClassGroupService(),
    private readonly classGroupRepository = new ClassGroupRepository()
  ) {}

  async getDashboardData(tenantId: string): Promise<AttendanceDashboardData> {
    return this.classGroupService.listForTenant(tenantId)
  }

  async updateSession(input: {
    tenantId: string
    sessionId: string
    payload: UpdateAttendanceSessionInput
  }) {
    if (input.sessionId !== "new") {
      const existingSession = await this.classGroupRepository.findSessionIdentityById(
        input.tenantId,
        input.sessionId
      )

      if (!existingSession) {
        throw new Error("Sessão de presença não encontrada.")
      }

      if (
        existingSession.classGroupId !== input.payload.classGroupId ||
        existingSession.sessionDate !== input.payload.sessionDate
      ) {
        throw new Error("A sessão informada não corresponde à turma/data do payload.")
      }
    }

    return this.classGroupService.upsertSession({
      tenantId: input.tenantId,
      payload: {
        ...input.payload,
      },
    })
  }
}
