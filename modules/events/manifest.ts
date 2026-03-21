import { Trophy } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const eventsModule = defineModule({
  key: "events",
  path: "/dashboard/events",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.EVENTS_READ],
  navigation: {
    label: "Eventos",
    icon: Trophy,
    section: "Outros",
    description: "Competições e seminários",
    order: 20,
  },
})
