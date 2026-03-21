import {
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react"
import { routes } from "./routes"
import { getModuleByKey, getNavigationModulesForCapabilities, getNavigationModulesForRole, type ModuleRegistryKey } from "./module-registry"
import { roles, type Role } from "./access-control"
import { getCapabilitiesForRole, type Capability } from "./capabilities"
import { getSystemNavItems, getSystemNavItemsForCapabilities } from "./system-navigation"

export interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  description?: string
  badge?: string | number
}

export interface NavSection {
  title: string
  items: NavItem[]
}

function buildNavSections(userRole: Role, userCapabilities?: Capability[]): NavSection[] {
  const dashboardNavigationModules = userCapabilities
    ? getNavigationModulesForCapabilities(userCapabilities, "dashboard")
    : getNavigationModulesForRole(userRole, "dashboard")

  const sections = dashboardNavigationModules.reduce<NavSection[]>((sections, module) => {
    if (!module.navigation) {
      return sections
    }

    const existingSection = sections.find((section) => section.title === module.navigation?.section)
    const item: NavItem = {
      href: module.path,
      icon: module.navigation.icon,
      label: module.navigation.label,
      description: module.navigation.description,
      badge: module.navigation.badge,
    }

    if (existingSection) {
      existingSection.items.push(item)
      return sections
    }

    sections.push({
      title: module.navigation.section,
      items: [item],
    })

    return sections
  }, [])

  const systemItems = userCapabilities
    ? getSystemNavItemsForCapabilities(userCapabilities, userRole)
    : getSystemNavItems(userRole)

  if (systemItems.length > 0) {
    sections.push({
      title: "Conta",
      items: systemItems.map((item) => ({
        href: item.href,
        icon: item.icon,
        label: item.label,
        description: item.description,
      })),
    })
  }

  return dedupeSections(sections)
}

export function getNavSections(userRole: Role = roles.ACADEMY_ADMIN): NavSection[] {
  return buildNavSections(userRole, getCapabilitiesForRole(userRole))
}

export function getNavSectionsForCapabilities(
  userCapabilities: Capability[],
  fallbackRole: Role = roles.ACADEMY_ADMIN
) {
  return buildNavSections(fallbackRole, userCapabilities)
}

export function getMobileNavItems(userRole: Role = roles.ACADEMY_ADMIN): NavItem[] {
  return getNavSections(userRole)
    .flatMap((section) => section.items)
    .filter((item) =>
      [
        routes.dashboard,
        routes.classes,
        routes.students,
        routes.attendance,
        routes.finance,
      ].includes(item.href),
    )
    .sort((a, b) => {
      const order = [
        routes.dashboard,
        routes.classes,
        routes.students,
        routes.attendance,
        routes.finance,
      ]

      return order.indexOf(a.href) - order.indexOf(b.href)
    })
}

export function getMobileNavItemsForCapabilities(userCapabilities: Capability[]): NavItem[] {
  return getNavSectionsForCapabilities(userCapabilities)
    .flatMap((section) => section.items)
    .filter((item) =>
      [
        routes.dashboard,
        routes.classes,
        routes.students,
        routes.attendance,
        routes.finance,
      ].includes(item.href),
    )
    .sort((a, b) => {
      const order = [
        routes.dashboard,
        routes.classes,
        routes.students,
        routes.attendance,
        routes.finance,
      ]

      return order.indexOf(a.href) - order.indexOf(b.href)
    })
}

export function getAllNavItems(userRole: Role = roles.ACADEMY_ADMIN): NavItem[] {
  return dedupeNavItems([
    ...getNavSections(userRole).flatMap((section) => section.items),
    ...getSettingsNavItems(userRole),
  ])
}

export function getAllNavItemsForCapabilities(
  userCapabilities: Capability[],
  fallbackRole: Role = roles.ACADEMY_ADMIN
): NavItem[] {
  return dedupeNavItems(
    getNavSectionsForCapabilities(userCapabilities, fallbackRole).flatMap((section) => section.items)
  )
}

export function getSettingsNavItems(userRole: Role = roles.ACADEMY_ADMIN): NavItem[] {
  return dedupeNavItems(getSystemNavItems(userRole).map((item) => ({
    href: item.href,
    icon: item.icon,
    label: item.label,
    description: item.description,
  })))
}

export function getSettingsNavItemsForCapabilities(
  userCapabilities: Capability[],
  fallbackRole: Role = roles.ACADEMY_ADMIN
): NavItem[] {
  return dedupeNavItems(getSystemNavItemsForCapabilities(userCapabilities, fallbackRole).map((item) => ({
    href: item.href,
    icon: item.icon,
    label: item.label,
    description: item.description,
  })))
}

function dedupeNavItems(items: NavItem[]) {
  const seen = new Set<string>()

  return items.filter((item) => {
    if (seen.has(item.href)) {
      return false
    }

    seen.add(item.href)
    return true
  })
}

function dedupeSections(sections: NavSection[]) {
  return sections
    .map((section) => ({
      ...section,
      items: dedupeNavItems(section.items),
    }))
    .filter((section) => section.items.length > 0)
}

// Helper to check if a path is active
export function isActivePath(pathname: string, href: string): boolean {
  const normalizedHref = href.split("?")[0]

  if (normalizedHref === routes.dashboard) {
    return pathname === normalizedHref
  }

  return pathname.startsWith(normalizedHref)
}

// Get all routes for a module
export function getModuleRoutes(moduleKey: ModuleRegistryKey): string[] {
  const module = getModuleByKey(moduleKey)
  const baseRoute = module?.path ?? routes.dashboard
  return [
    baseRoute,
    `${baseRoute}/new`,
    `${baseRoute}/[id]`,
    `${baseRoute}/[id]/edit`,
  ]
}
