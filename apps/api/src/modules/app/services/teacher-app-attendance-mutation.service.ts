import { ClassGroupService } from "@/apps/api/src/modules/classes/services/class-group.service"

export class TeacherAppAttendanceMutationService {
  constructor(private readonly classGroupService = new ClassGroupService()) {}

  async saveAttendance(input: {
    tenantId: string
    userId: string
    classGroupId: string
    sessionDate: string
    weekday: number
    startTime: string
    endTime: string
    confirmedStudentIds: string[]
    confirmedStudentNames: string[]
    presentStudentIds: string[]
    absentStudentIds: string[]
    justifiedStudentIds: string[]
    isFinalized: boolean
  }) {
    return this.classGroupService.upsertSessionForActor({
      tenantId: input.tenantId,
      userId: input.userId,
      role: "teacher",
      payload: {
        classGroupId: input.classGroupId,
        sessionDate: input.sessionDate,
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        status: "scheduled",
        confirmedStudentIds: input.confirmedStudentIds,
        confirmedStudentNames: input.confirmedStudentNames,
        presentStudentIds: input.presentStudentIds,
        absentStudentIds: input.absentStudentIds,
        justifiedStudentIds: input.justifiedStudentIds,
        isFinalized: input.isFinalized,
      },
    })
  }
}
