import type { ReactNode } from "react"

export function AppStatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon?: ReactNode
}) {
  return (
    <article className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon}
      </div>
      <p className="mt-4 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </article>
  )
}
