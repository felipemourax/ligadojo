import { Globe } from "lucide-react"
import { defineModule } from "@/lib/module-types"
import { roles } from "@/lib/access-control"
import { capabilities } from "@/lib/capabilities"

export const siteModule = defineModule({
  key: "site",
  path: "/dashboard/site",
  surface: ["dashboard"],
  roles: [roles.PLATFORM_ADMIN, roles.ACADEMY_ADMIN],
  requiredCapabilities: [capabilities.SITE_MANAGE],
  navigation: {
    label: "Site",
    icon: Globe,
    section: "Outros",
    description: "Landing page da academia",
    order: 40,
  },
})
