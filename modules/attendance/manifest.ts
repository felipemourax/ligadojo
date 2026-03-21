import { ClipboardCheck } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const attendanceModule = defineModule({
  key: "attendance",
  path: "/dashboard/attendance",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.ATTENDANCE_READ],
  navigation: {
    label: "Presença",
    icon: ClipboardCheck,
    section: "Principal",
    description: "Controle de frequência",
    order: 10,
  },
})
