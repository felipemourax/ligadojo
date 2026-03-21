"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AcademySetupFooterProps {
  currentStep: number
  totalSteps: number
  isSaving: boolean
  canClose: boolean
  onPrevious: () => void
  onNextOrComplete: () => void
  onClose: () => void
}

export function AcademySetupFooter({
  currentStep,
  totalSteps,
  isSaving,
  canClose,
  onPrevious,
  onNextOrComplete,
  onClose,
}: AcademySetupFooterProps) {
  return (
    <div className="shrink-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <Button disabled={currentStep === 0 || isSaving} onClick={onPrevious} type="button" variant="outline">
            Voltar
          </Button>
        </div>

        <Button disabled={isSaving} onClick={onNextOrComplete} type="button">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : currentStep < totalSteps - 1 ? (
            "Salvar e continuar"
          ) : (
            "Concluir setup"
          )}
        </Button>
      </div>

      {canClose ? (
        <div className="mx-auto mt-3 flex max-w-3xl justify-end">
          <Button onClick={onClose} type="button" variant="ghost">
            Fechar setup
          </Button>
        </div>
      ) : null}
    </div>
  )
}
