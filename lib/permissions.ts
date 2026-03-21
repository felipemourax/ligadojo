import { moduleRegistry, type ModuleRegistryKey } from "@/lib/module-registry"
import { roles, type Role } from "@/lib/access-control"
import { hasCapability, type Capability } from "@/lib/capabilities"

// Permissões por módulo derivadas do registry central
export const modulePermissions = Object.fromEntries(
  moduleRegistry.map((module) => [module.key, module.requiredCapabilities])
) as Record<ModuleRegistryKey, readonly Capability[]>

// Helper para verificar permissão
export function hasPermission(
  userCapabilities: Capability[],
  module: keyof typeof modulePermissions
): boolean {
  return modulePermissions[module].every((capability) => hasCapability(userCapabilities, capability))
}

export { roles }
export type { Role }
