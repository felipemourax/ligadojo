"use client"

import Link from "next/link"
import { 
  UserPlus, 
  Calendar, 
  ClipboardCheck, 
  QrCode,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  {
    label: "Novo Aluno",
    icon: UserPlus,
    href: "/dashboard/alunos/novo",
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Nova Turma",
    icon: Calendar,
    href: "/dashboard/turmas/nova",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    label: "Registrar Presença",
    icon: ClipboardCheck,
    href: "/dashboard/presenca",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    label: "Check-in QR",
    icon: QrCode,
    href: "/dashboard/presenca/qrcode",
    color: "bg-chart-4/10 text-chart-4",
  },
]

export function QuickActions() {
  return (
    <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Ações Rápidas</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
              action.color
            )}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-xs font-medium text-center">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
