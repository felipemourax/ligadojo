import { Wallet } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const financeModule = defineModule({
  key: "finance",
  path: "/dashboard/finance",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.FINANCE_READ],
  navigation: {
    label: "Financeiro",
    icon: Wallet,
    section: "Gestão",
    description: "Pagamentos e cobranças",
    order: 70,
  },
})
