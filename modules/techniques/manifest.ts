import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const techniquesModule = defineModule({
  key: "techniques",
  path: "/dashboard/techniques",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.TECHNIQUES_READ],
})
