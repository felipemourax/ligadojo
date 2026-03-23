import { ok } from "@/app/api/_lib/http"
import { requirePlatformAdminAccess } from "@/app/api/_lib/platform-admin-access"
import { PlatformAdminService } from "@/apps/api/src/modules/platform/services/platform-admin.service"

const platformAdminService = new PlatformAdminService()

export async function GET() {
  const access = await requirePlatformAdminAccess()

  if (!access.ok) {
    return access.response
  }

  const overview = await platformAdminService.getOverview()
  return ok(overview)
}
