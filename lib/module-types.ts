import type { LucideIcon } from "lucide-react"
import type { Role } from "@/lib/access-control"
import type { Capability } from "@/lib/capabilities"

export type AppSurface = "platform" | "dashboard" | "app"

export interface ModuleNavigationDefinition {
  label: string
  icon: LucideIcon
  section: string
  description?: string
  badge?: string | number
  mobileLabel?: string
  order?: number
}

export interface FeatureModuleManifest {
  key: string
  path: string
  surface: AppSurface[]
  roles: Role[]
  requiredCapabilities: Capability[]
  navigation?: ModuleNavigationDefinition
}

export function defineModule(manifest: FeatureModuleManifest): FeatureModuleManifest {
  return manifest
}
