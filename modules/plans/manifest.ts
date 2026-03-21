import { Wallet } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const plansModule = defineModule({
  key: "plans",
  path: "/dashboard/plans",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.PLANS_READ],
  navigation: {
    label: "Planos",
    icon: Wallet,
    section: "Gestão",
    description: "Mensalidades e pacotes",
    order: 30,
  },
})
