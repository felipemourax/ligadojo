"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Calendar,
  ClipboardCheck,
  Users,
  TrendingUp,
  Trophy,
  User,
  Bell,
  Menu,
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
  GraduationCap,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { href: "/app-professor", icon: Home, label: "Resumo" },
  { href: "/app-professor/agenda", icon: Calendar, label: "Agenda" },
  { href: "/app-professor/presenca", icon: ClipboardCheck, label: "Presença" },
  { href: "/app-professor/turmas", icon: Users, label: "Turmas" },
  { href: "/app-professor/perfil", icon: User, label: "Perfil" },
]

const menuItems = [
  { href: "/app-professor/perfil", icon: User, label: "Meu Perfil" },
  { href: "/app-professor/evolucao", icon: TrendingUp, label: "Evolução de Alunos" },
  { href: "/app-professor/eventos", icon: Trophy, label: "Eventos" },
  { href: "/app-professor/configuracoes", icon: Settings, label: "Configurações" },
  { href: "/app-professor/ajuda", icon: HelpCircle, label: "Ajuda" },
]

const quickActions = [
  { href: "/app-professor/turmas", icon: Users, label: "Gerenciar turmas", description: "Criar e editar turmas" },
  { href: "/app-professor/presenca", icon: ClipboardCheck, label: "Registrar presença", description: "Registrar e editar presenças" },
  { href: "/app-professor/evolucao", icon: GraduationCap, label: "Gerenciar graduações", description: "Realizar exames e promover alunos" },
  { href: "/app-professor/turmas?tab=alunos", icon: UserPlus, label: "Gerenciar alunos", description: "Cadastrar, editar e visualizar alunos" },
]

export default function AppProfessorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Mobile */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-top">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Menu Lateral */}
          {mounted ? (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        MS
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <SheetTitle className="text-base">Mestre Silva</SheetTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                          Professor
                        </Badge>
                        <span className="text-xs text-muted-foreground">Faixa Preta</span>
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                <div className="p-2 overflow-y-auto max-h-[calc(100vh-180px)]">
                  {/* Ações Rápidas */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground px-3 mb-2">Ações Rápidas</p>
                    <div className="space-y-1">
                      {quickActions.map((action) => (
                        <Link
                          key={action.href}
                          href={action.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
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

                  {/* Menu Items */}
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-medium text-muted-foreground px-3 mb-2">Menu</p>
                    <nav className="space-y-1">
                      {menuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      ))}
                    </nav>
                  </div>

                  {/* Academia Info */}
                  <div className="mt-6 p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        D
                      </div>
                      <div>
                        <p className="font-medium">Dojo Centro</p>
                        <p className="text-xs text-muted-foreground">
                          Jiu-Jitsu & MMA
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Sair da conta
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          )}

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              D
            </div>
            <span className="font-semibold">Dojo Centro</span>
          </div>

          {/* Notificações */}
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    5
                  </Badge>
                  <span className="sr-only">Notificações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">Aula em 30 minutos</span>
                  <span className="text-sm text-muted-foreground">
                    Jiu-Jitsu Adulto - 14 alunos confirmados
                  </span>
                  <span className="text-xs text-muted-foreground">Agora</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">Novo aluno na turma</span>
                  <span className="text-sm text-muted-foreground">
                    Carlos Santos foi adicionado ao Jiu-Jitsu Kids
                  </span>
                  <span className="text-xs text-muted-foreground">Há 2 horas</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">Exame de faixa agendado</span>
                  <span className="text-sm text-muted-foreground">
                    3 alunos elegíveis para exame amanhã
                  </span>
                  <span className="text-xs text-muted-foreground">Há 1 dia</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                5
              </Badge>
              <span className="sr-only">Notificações</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">{children}</main>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/app-professor" && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
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
