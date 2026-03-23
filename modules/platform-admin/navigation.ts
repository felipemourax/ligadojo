import { Building2, LayoutDashboard, type LucideIcon } from "lucide-react"
import { routes } from "@/lib/routes"

export interface PlatformNavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const platformNavItems: PlatformNavItem[] = [
  {
    href: routes.platform,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: routes.platformAcademies,
    label: "Academias",
    icon: Building2,
  },
]
