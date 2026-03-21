"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function TeacherPendingApprovalModal() {
  return (
    <Dialog open={true}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Cadastro aguardando aprovação</DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">
              O administrador precisa aprovar o cadastro para liberar seu acesso completo ao app.
            </span>
            <span className="block">
              Solicite ao administrador da academia para aceitar seu convite.
            </span>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
