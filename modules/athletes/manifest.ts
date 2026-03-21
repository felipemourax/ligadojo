import { Medal } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const athletesModule = defineModule({
  key: "athletes",
  path: "/dashboard/athletes",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.ATHLETES_READ],
  navigation: {
    label: "Atletas",
    icon: Medal,
    section: "Pessoas",
    description: "Atletas e títulos da academia",
    order: 18,
  },
})
