import { ok } from "@/app/api/_lib/http"
import { AthleteRankingService } from "@/apps/api/src/modules/athletes/services/athlete-ranking.service"

const service = new AthleteRankingService()

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const data = await service.listAcademies({
    search: searchParams.get("search"),
    state: searchParams.get("state"),
    modality: searchParams.get("modality"),
  })

  return ok({ data })
}
