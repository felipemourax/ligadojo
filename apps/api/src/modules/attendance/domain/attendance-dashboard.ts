import type {
  ClassGroupEntity,
  ClassSessionEntity,
} from "@/apps/api/src/modules/classes/domain/class-group"

export interface AttendanceDashboardData {
  classes: ClassGroupEntity[]
  sessions: ClassSessionEntity[]
}
