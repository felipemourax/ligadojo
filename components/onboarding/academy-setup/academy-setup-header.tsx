"use client"

import { AlertTriangle, Check, Rocket, type LucideIcon } from "lucide-react"
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface AcademySetupHeaderStep {
  key: string
  shortTitle: string
  icon: LucideIcon
}

interface AcademySetupHeaderProps {
  tenantName: string
  completedCount: number
  totalSteps: number
  steps: AcademySetupHeaderStep[]
  currentStep: number
  completedStepKeys: string[]
  invalidStepKeys: string[]
  onStepChange: (index: number) => void
}

export function AcademySetupHeader({
  tenantName,
  completedCount,
  totalSteps,
  steps,
  currentStep,
  completedStepKeys,
  invalidStepKeys,
  onStepChange,
}: AcademySetupHeaderProps) {
  return (
    <div className="sticky top-0 z-20 shrink-0 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
      <DialogHeader className="space-y-0 text-left">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Rocket className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold">{tenantName}</DialogTitle>
            <DialogDescription className="text-xs">
              Configuração inicial: {completedCount} de {totalSteps} etapas
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="flex items-center justify-between gap-1">
        {steps.map((step, index) => {
          const active = index === currentStep
          const completed = completedStepKeys.includes(step.key)
          const invalid = invalidStepKeys.includes(step.key) && !completed
          const Icon = step.icon

          return (
            <button
              key={step.key}
              onClick={() => onStepChange(index)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-1 transition-all",
                active ? "bg-primary/10" : "hover:bg-muted/50"
              )}
              type="button"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                  completed
                    ? "bg-primary text-primary-foreground"
                    : invalid
                      ? "bg-destructive/15 text-destructive"
                      : active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                )}
              >
                {completed && !active ? (
                  <Check className="h-4 w-4" />
                ) : invalid ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] font-medium sm:block",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.shortTitle}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
