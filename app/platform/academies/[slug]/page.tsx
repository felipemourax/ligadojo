import { PlatformAcademyDetailScreen } from "@/modules/platform-admin"

export default async function PlatformAcademyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return <PlatformAcademyDetailScreen slug={slug} />
}
