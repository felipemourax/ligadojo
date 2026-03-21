import { GraduationCap } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const graduationsModule = defineModule({
  key: "graduations",
  path: "/dashboard/graduations",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.GRADUATIONS_READ],
  navigation: {
    label: "Graduação",
    mobileLabel: "Faixas",
    icon: GraduationCap,
    section: "Outros",
    description: "Faixas e graus",
    order: 10,
  },
})
