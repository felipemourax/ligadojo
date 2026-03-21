import { Calendar } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const classesModule = defineModule({
  key: "classes",
  path: "/dashboard/classes",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.CLASSES_READ],
  navigation: {
    label: "Turmas",
    icon: Calendar,
    section: "Gestão",
    description: "Gerenciar turmas",
    order: 40,
  },
})
