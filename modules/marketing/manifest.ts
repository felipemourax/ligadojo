import { Megaphone } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const marketingModule = defineModule({
  key: "marketing",
  path: "/dashboard/marketing",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.MARKETING_READ],
  navigation: {
    label: "Marketing",
    icon: Megaphone,
    section: "Outros",
    description: "Marca, conteúdo e templates",
    order: 41,
  },
})
