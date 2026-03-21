import { dashboardModule } from "@/modules/dashboard/manifest"
import { athletesModule } from "@/modules/athletes/manifest"
import { studentsModule } from "@/modules/students/manifest"
import { teachersModule } from "@/modules/teachers/manifest"
import { classesModule } from "@/modules/classes/manifest"
import { attendanceModule } from "@/modules/attendance/manifest"
import { graduationsModule } from "@/modules/graduations/manifest"
import { financeModule } from "@/modules/finance/manifest"
import { modalitiesModule } from "@/modules/modalities/manifest"
import { plansModule } from "@/modules/plans/manifest"
import { siteModule } from "@/modules/site/manifest"
import { marketingModule } from "@/modules/marketing/manifest"
import { crmModule } from "@/modules/crm/manifest"
import { eventsModule } from "@/modules/events/manifest"
import { techniquesModule } from "@/modules/techniques/manifest"
import type { AppSurface, FeatureModuleManifest } from "@/lib/module-types"
import type { Role } from "@/lib/access-control"
import type { Capability } from "@/lib/capabilities"

export const moduleRegistry = [
  dashboardModule,
  athletesModule,
  modalitiesModule,
  plansModule,
  classesModule,
  studentsModule,
  teachersModule,
  attendanceModule,
  graduationsModule,
  financeModule,
  eventsModule,
  siteModule,
  marketingModule,
  techniquesModule,
  crmModule,
] satisfies FeatureModuleManifest[]

export type ModuleRegistryKey = (typeof moduleRegistry)[number]["key"]

export function getModuleByKey(key: ModuleRegistryKey) {
  return moduleRegistry.find((module) => module.key === key)
}

export function getNavigationModules(surface: AppSurface = "dashboard") {
  return moduleRegistry
    .filter((module) => module.navigation && module.surface.includes(surface))
    .sort((a, b) => (a.navigation?.order ?? 0) - (b.navigation?.order ?? 0))
}

export function getNavigationModulesForRole(
  userRole: Role,
  surface: AppSurface = "dashboard"
) {
  return getNavigationModules(surface).filter((module) => module.roles.includes(userRole))
}

export function getNavigationModulesForCapabilities(
  userCapabilities: Capability[],
  surface: AppSurface = "dashboard"
) {
  return getNavigationModules(surface).filter((module) =>
    module.requiredCapabilities.every((capability) => userCapabilities.includes(capability))
  )
}
