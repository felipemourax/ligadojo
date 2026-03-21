import { UserPlus } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const crmModule = defineModule({
  key: "crm",
  path: "/dashboard/crm",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.CRM_READ],
  navigation: {
    label: "CRM",
    icon: UserPlus,
    section: "Gestão",
    description: "Gestão de leads",
    order: 80,
  },
})
