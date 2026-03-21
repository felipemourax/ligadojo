import { attendanceModule } from "@/modules/attendance/manifest"
import { athletesModule } from "@/modules/athletes/manifest"
import { classesModule } from "@/modules/classes/manifest"
import { crmModule } from "@/modules/crm/manifest"
import { dashboardModule } from "@/modules/dashboard/manifest"
import { eventsModule } from "@/modules/events/manifest"
import { financeModule } from "@/modules/finance/manifest"
import { graduationsModule } from "@/modules/graduations/manifest"
import { modalitiesModule } from "@/modules/modalities/manifest"
import { marketingModule } from "@/modules/marketing/manifest"
import { plansModule } from "@/modules/plans/manifest"
import { siteModule } from "@/modules/site/manifest"
import { studentsModule } from "@/modules/students/manifest"
import { teachersModule } from "@/modules/teachers/manifest"
import { techniquesModule } from "@/modules/techniques/manifest"

const moduleRoutes = {
  dashboard: dashboardModule.path,
  athletes: athletesModule.path,
  students: studentsModule.path,
  teachers: teachersModule.path,
  classes: classesModule.path,
  attendance: attendanceModule.path,
  modalities: modalitiesModule.path,
  plans: plansModule.path,
  site: siteModule.path,
  marketing: marketingModule.path,
  graduations: graduationsModule.path,
  finance: financeModule.path,
  crm: crmModule.path,
  events: eventsModule.path,
  techniques: techniquesModule.path,
} as const

// Fonte única de rotas do sistema derivada do registry de módulos
export const routes = {
  // Auth
  login: "/login",
  cadastro: "/cadastro",
  onboardingAcademy: "/onboarding/academy",
  platformAccess: "/access",

  // Surfaces
  platform: "/platform",
  tenantApp: "/app",
  tenantAppTeacher: "/app/teacher",
  tenantAppTeacherAgenda: "/app/teacher/agenda",
  tenantAppTeacherAttendance: "/app/teacher/attendance",
  tenantAppTeacherClasses: "/app/teacher/classes",
  tenantAppTeacherProfile: "/app/teacher/profile",
  tenantAppTeacherEvolution: "/app/teacher/evolution",
  tenantAppTeacherEvents: "/app/teacher/events",
  tenantAppStudent: "/app/student",
  tenantAppStudentAttendance: "/app/student/attendance",
  tenantAppStudentClasses: "/app/student/classes",
  tenantAppStudentEvents: "/app/student/events",
  tenantAppStudentPlans: "/app/student/plans",
  tenantAppStudentProgress: "/app/student/progress",
  tenantAppStudentPayments: "/app/student/payments",
  tenantAppStudentProfile: "/app/student/profile",
  ranking: "/ranking",
  ...moduleRoutes,
  dashboardSettings: "/dashboard/settings",
  dashboardSettingsPayments: "/dashboard/settings?tab=payments",
  dashboardSettingsAcademy: "/dashboard/settings/academy",
  dashboardSettingsUsers: "/dashboard/settings/users",
  dashboardSettingsPlans: "/dashboard/settings/plans",
  dashboardSettingsModalities: "/dashboard/settings/modalities",
  platformAcademies: "/platform/academies",
  platformBilling: "/platform/billing",
  platformMetrics: "/platform/metrics",
  platformSupport: "/platform/support",
} as const

export type RouteKey = keyof typeof routes
export type Route = (typeof routes)[RouteKey]
