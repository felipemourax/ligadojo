import {
  BookOpen,
  UserCircle2,
  type LucideIcon,
} from "lucide-react"
import { routes } from "@/lib/routes"
import { roles, type Role } from "@/lib/access-control"
import { type Capability } from "@/lib/capabilities"

export interface SystemNavItem {
  href: string
  icon: LucideIcon
  label: string
  description?: string
  roles?: Role[]
  requiredCapabilities?: Capability[]
}

export const systemNavItems: SystemNavItem[] = [
  {
    href: routes.dashboardSettingsPayments,
    icon: UserCircle2,
    label: "Meu perfil",
    description: "Pagamentos e políticas da academia",
    roles: [roles.ACADEMY_ADMIN],
  },
  {
    href: routes.techniques,
    icon: BookOpen,
    label: "Técnicas",
    description: "Biblioteca de técnicas",
    roles: [roles.ACADEMY_ADMIN, roles.TEACHER, roles.STUDENT],
  },
]

export function getSystemNavItems(userRole: Role): SystemNavItem[] {
  return systemNavItems.filter((item) => item.roles?.includes(userRole))
}

export function getSystemNavItemsForCapabilities(
  userCapabilities: Capability[],
  fallbackRole: Role
): SystemNavItem[] {
  return systemNavItems.filter((item) => item.roles?.includes(fallbackRole) ?? false)
}
