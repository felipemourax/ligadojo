import { LayoutDashboard } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const dashboardModule = defineModule({
  key: "dashboard",
  path: "/dashboard",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.DASHBOARD_VIEW],
  navigation: {
    label: "Dashboard",
    mobileLabel: "Início",
    icon: LayoutDashboard,
    section: "Gestão",
    description: "Visão geral",
    order: 10,
  },
})
