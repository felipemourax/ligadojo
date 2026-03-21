import { GraduationCap } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const modalitiesModule = defineModule({
  key: "modalities",
  path: "/dashboard/modalities",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.MODALITIES_READ],
  navigation: {
    label: "Modalidades",
    icon: GraduationCap,
    section: "Gestão",
    description: "Estrutura das modalidades",
    order: 20,
  },
})
