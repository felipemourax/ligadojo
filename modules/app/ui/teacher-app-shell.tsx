"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  TrendingUp,
  GraduationCap,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Settings,
  Trophy,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ContentFrame } from "@/components/layout/content-frame"
import { cn } from "@/lib/utils"
import { routes } from "@/lib/routes"

interface TeacherAppShellProps {
  appName: string
  userName: string
  children: React.ReactNode
}

const navItems = [
  { href: routes.tenantAppTeacher, icon: Home, label: "Resumo" },
  { href: routes.tenantAppTeacherAgenda, icon: Calendar, label: "Agenda" },
  { href: routes.tenantAppTeacherAttendance, icon: ClipboardCheck, label: "Presença" },
  { href: routes.tenantAppTeacherClasses, icon: Users, label: "Turmas" },
  { href: routes.tenantAppTeacherProfile, icon: User, label: "Perfil" },
]

const menuItems = [
  { href: routes.tenantAppTeacherProfile, icon: User, label: "Meu Perfil" },
  { href: routes.tenantAppTeacherEvolution, icon: TrendingUp, label: "Evolução de Alunos" },
  { href: routes.tenantAppTeacherEvents, icon: Trophy, label: "Eventos" },
  { href: routes.tenantAppTeacherProfile, icon: Settings, label: "Configurações" },
  { href: routes.tenantAppTeacherProfile, icon: HelpCircle, label: "Ajuda" },
]

const quickActions = [
  {
    href: routes.tenantAppTeacherClasses,
    icon: Users,
    label: "Gerenciar turmas",
    description: "Criar e editar turmas",
  },
  {
    href: routes.tenantAppTeacherAttendance,
    icon: ClipboardCheck,
    label: "Registrar presença",
    description: "Registrar e editar presenças",
  },
  {
    href: routes.tenantAppTeacherEvolution,
    icon: GraduationCap,
    label: "Evolução de alunos",
    description: "Acompanhar progresso",
  },
  {
    href: routes.tenantAppTeacherClasses,
    icon: UserPlus,
    label: "Gerenciar alunos",
    description: "Visualizar alunos por turma",
  },
]

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("")
}

export function TeacherAppShell({ appName, userName, children }: TeacherAppShellProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-14 items-center justify-between px-4">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(userName || appName || "P")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <SheetTitle className="text-base">{userName || "Professor"}</SheetTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-xs text-primary">
                        Professor
                      </Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-2">
                <div className="mb-4">
                  <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">Ações Rápidas</p>
                  <div className="space-y-1">
                    {quickActions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <action.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium">{action.label}</span>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">Menu</p>
                  <nav className="space-y-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
                      >
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="mt-6 rounded-lg bg-secondary p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                      {(appName?.[0] ?? "D").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{appName}</p>
                      <p className="text-xs text-muted-foreground">App do Professor</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="mt-4 w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  Sair da conta
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {(appName?.[0] ?? "D").toUpperCase()}
            </div>
            <span className="font-semibold">{appName}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]">
                  3
                </Badge>
                <span className="sr-only">Notificações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">Aula em 30 minutos</span>
                <span className="text-sm text-muted-foreground">Confira a chamada da próxima turma.</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">Novo aluno na turma</span>
                <span className="text-sm text-muted-foreground">A turma recebeu um novo vínculo hoje.</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">Evento próximo</span>
                <span className="text-sm text-muted-foreground">Revise os alunos elegíveis para o evento.</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="pb-20">
        <ContentFrame size="app">{children}</ContentFrame>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== routes.tenantAppTeacher && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-full w-16 flex-col items-center justify-center gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
