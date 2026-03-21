import { notFound, ok } from "@/app/api/_lib/http"
import { AthleteRankingService } from "@/apps/api/src/modules/athletes/services/athlete-ranking.service"

const service = new AthleteRankingService()

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  context: { params: Promise<{ academySlug: string }> }
) {
  const { academySlug } = await context.params
  const data = await service.getAcademyProfile(academySlug)

  if (!data) {
    return notFound("Academia não encontrada.")
  }

  return ok({ data })
}
