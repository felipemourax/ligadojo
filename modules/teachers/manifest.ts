import { Users } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const teachersModule = defineModule({
  key: "teachers",
  path: "/dashboard/teachers",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.TEACHERS_MANAGE],
  navigation: {
    label: "Professores",
    icon: Users,
    section: "Gestão",
    description: "Corpo docente",
    order: 60,
  },
})
