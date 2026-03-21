import type { StudentAppClassesData } from "@/apps/api/src/modules/app/domain/student-app"
import { StudentAppAcademyActivitiesService } from "@/apps/api/src/modules/app/services/student-app-academy-activities.service"
import { ClassGroupService } from "@/apps/api/src/modules/classes/services/class-group.service"
import { StudentAppHomeService } from "@/apps/api/src/modules/app/services/student-app-home.service"

export class StudentAppClassesService {
  constructor(
    private readonly studentAppHomeService = new StudentAppHomeService(),
    private readonly studentAppAcademyActivitiesService = new StudentAppAcademyActivitiesService(),
    private readonly classGroupService = new ClassGroupService()
  ) {}

  async getData(input: { tenantId: string; userId: string }): Promise<StudentAppClassesData> {
    const classes = await this.studentAppHomeService.listClasses(input)
    const academyActivities = await this.studentAppAcademyActivitiesService.listForTenant(input.tenantId)
    return {
      role: "student",
      studentId: classes.student.id,
      academyActivities,
      classes: classes.classes,
    }
  }

  async joinClass(input: { tenantId: string; userId: string; classGroupId: string }) {
    return this.classGroupService.joinStudent(input)
  }

  async leaveClass(input: { tenantId: string; userId: string; classGroupId: string }) {
    return this.classGroupService.leaveStudent(input)
  }
}
