import { Users } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const studentsModule = defineModule({
  key: "students",
  path: "/dashboard/students",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.STUDENTS_READ],
  navigation: {
    label: "Alunos",
    icon: Users,
    section: "Gestão",
    description: "Cadastro de alunos",
    order: 50,
  },
})
