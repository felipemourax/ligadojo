import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type ContentFrameSize = "dashboard" | "app" | "surface" | "narrow"

const sizeClasses: Record<ContentFrameSize, string> = {
  dashboard: "layout-balance-dashboard",
  app: "layout-balance-app",
  surface: "layout-balance-surface",
  narrow: "layout-balance-narrow",
}

interface ContentFrameProps {
  children: ReactNode
  className?: string
  size?: ContentFrameSize
}

export function ContentFrame({
  children,
  className,
  size = "surface",
}: ContentFrameProps) {
  return <div className={cn("layout-balance w-full min-w-0", sizeClasses[size], className)}>{children}</div>
}
