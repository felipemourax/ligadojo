import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-4 md:p-5 border border-border",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            {title}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            {value}
          </p>
          {trend && (
            <p className={cn(
              "text-xs font-medium flex items-center gap-1",
              trend.isPositive ? "text-primary" : "text-destructive"
            )}>
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
              <span className="text-muted-foreground">vs mês anterior</span>
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
      </div>
    </div>
  )
}
