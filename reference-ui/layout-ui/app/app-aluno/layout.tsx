"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Calendar,
  History,
  ShoppingBag,
  User,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
  Trophy,
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
  { href: "/app-aluno", icon: Home, label: "Início" },
  { href: "/app-aluno/horarios", icon: Calendar, label: "Horários" },
  { href: "/app-aluno/historico", icon: History, label: "Histórico" },
  { href: "/app-aluno/loja", icon: ShoppingBag, label: "Loja" },
  { href: "/app-aluno/eventos", icon: Trophy, label: "Eventos" },
  { href: "/app-aluno/perfil", icon: User, label: "Perfil" },
]

const menuItems = [
  { href: "/app-aluno/perfil", icon: User, label: "Meu Perfil" },
  { href: "/app-aluno/configuracoes", icon: Settings, label: "Configurações" },
  { href: "/app-aluno/ajuda", icon: HelpCircle, label: "Ajuda" },
]

export default function AppAlunoLayout({
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
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <SheetTitle className="text-base">João da Silva</SheetTitle>
                    <p className="text-sm text-muted-foreground">Faixa Azul</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="p-2">
                {/* Plano Atual */}
                <div className="p-3 mb-2 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Plano atual</p>
                  <p className="font-medium text-primary">Mensal Completo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vence em 15/04/2026
                  </p>
                </div>

                {/* Menu Items */}
                <nav className="space-y-1 mt-4">
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
                    3
                  </Badge>
                  <span className="sr-only">Notificações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">Lembrete de aula</span>
                  <span className="text-sm text-muted-foreground">
                    Sua aula de Jiu-Jitsu começa em 1 hora
                  </span>
                  <span className="text-xs text-muted-foreground">Há 30 min</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">Pagamento confirmado</span>
                  <span className="text-sm text-muted-foreground">
                    Sua mensalidade foi paga com sucesso
                  </span>
                  <span className="text-xs text-muted-foreground">Há 2 dias</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">Nova graduação disponível</span>
                  <span className="text-sm text-muted-foreground">
                    Você está apto para o exame de faixa
                  </span>
                  <span className="text-xs text-muted-foreground">Há 1 semana</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                3
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
              (item.href !== "/app-aluno" && pathname.startsWith(item.href))
            
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
