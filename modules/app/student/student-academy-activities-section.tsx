"use client"

import type { StudentAppAcademyActivity } from "@/apps/api/src/modules/app/domain/student-app"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AppEmptyState } from "@/modules/app/components/app-empty-state"

interface StudentAcademyActivitiesSectionProps {
  activities: StudentAppAcademyActivity[]
}

export function StudentAcademyActivitiesSection({
  activities,
}: StudentAcademyActivitiesSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-foreground">Atividades da academia</h2>
          <p className="text-sm text-muted-foreground">
            Veja as atividades principais oferecidas neste tenant.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Atividades</p>
          <p className="font-semibold text-foreground">{activities.length}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {activities.length === 0 ? (
            <AppEmptyState message="Nenhuma atividade principal foi configurada pela academia até agora." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {activities.map((activity) => (
                <Badge key={activity.value} variant="secondary" className="rounded-full px-3 py-1">
                  {activity.label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
