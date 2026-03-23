import { ok } from "@/app/api/_lib/http"
import { requirePlatformAdminAccess } from "@/app/api/_lib/platform-admin-access"
import { PlatformAdminService } from "@/apps/api/src/modules/platform/services/platform-admin.service"

const platformAdminService = new PlatformAdminService()

export async function GET(request: Request) {
  const access = await requirePlatformAdminAccess()

  if (!access.ok) {
    return access.response
  }

  const url = new URL(request.url)
  const query = url.searchParams.get("query") ?? ""
  const status = url.searchParams.get("status")
  const academies = await platformAdminService.listAcademies({
    query,
    status: status === "active" || status === "suspended" ? status : "all",
  })

  return ok(academies)
}
