import { redirect } from "next/navigation"

export default function DashboardSettingsModalitiesPage() {
  redirect("/dashboard/settings?tab=structure")
}
