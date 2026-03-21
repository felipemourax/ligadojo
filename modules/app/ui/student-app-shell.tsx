"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Calendar,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Home,
  Menu,
  Receipt,
  ShieldCheck,
  Trophy,
  User,
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
import { TenantSwitcher } from "@/components/tenant/tenant-switcher"
import { ContentFrame } from "@/components/layout/content-frame"
import { fetchStudentAppNavigationIndicators } from "@/modules/app/services/student-app"
import { cn } from "@/lib/utils"
import { routes } from "@/lib/routes"

interface StudentAppShellProps {
  appName: string
  userName: string
  children: React.ReactNode
}

interface StudentAppIndicatorState {
  paymentsBadgeCount: number
  eventsBadgeCount: number
  eventInvitesCount: number
  eventUpcomingCount: number
}

const navItems = [
  { href: routes.tenantAppStudent, icon: Home, label: "Resumo" },
  { href: routes.tenantAppStudentClasses, icon: Calendar, label: "Turmas" },
  { href: routes.tenantAppStudentAttendance, icon: ShieldCheck, label: "Presença" },
  { href: routes.tenantAppStudentEvents, icon: Trophy, label: "Eventos" },
  { href: routes.tenantAppStudentPayments, icon: Receipt, label: "Pagamentos" },
  { href: routes.tenantAppStudentProfile, icon: User, label: "Perfil" },
] as const

const menuItems = [
  {
    href: routes.tenantAppStudentPlans,
    icon: CreditCard,
    label: "Meu plano",
    description: "Ativar e consultar assinatura",
  },
  {
    href: routes.tenantAppStudentEvents,
    icon: Trophy,
    label: "Eventos da academia",
    description: "Inscrições e histórico de eventos",
  },
  {
    href: routes.tenantAppStudentPayments,
    icon: Receipt,
    label: "Minhas cobranças",
    description: "Ver pagamentos e cupons",
  },
  {
    href: routes.tenantAppStudentProgress,
    icon: Users,
    label: "Minha evolução",
    description: "Faixas, graus e histórico",
  },
  {
    href: routes.tenantAppStudentProfile,
    icon: HelpCircle,
    label: "Perfil e ajuda",
    description: "Dados da conta e suporte",
  },
] as const

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("")
}

export function StudentAppShell({ appName, userName, children }: StudentAppShellProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [indicators, setIndicators] = useState<StudentAppIndicatorState>({
    paymentsBadgeCount: 0,
    eventsBadgeCount: 0,
    eventInvitesCount: 0,
    eventUpcomingCount: 0,
  })

  useEffect(() => {
    let cancelled = false

    async function loadIndicators() {
      try {
        const response = await fetchStudentAppNavigationIndicators()
        if (cancelled) return

        setIndicators({
          paymentsBadgeCount: response.data.paymentsBadgeCount,
          eventsBadgeCount: response.data.eventsBadgeCount,
          eventInvitesCount: response.data.eventInvitesCount,
          eventUpcomingCount: response.data.eventUpcomingCount,
        })
      } catch {
        if (!cancelled) {
          setIndicators((current) => current)
        }
      }
    }

    function handleVisibilityRefresh() {
      if (document.visibilityState === "visible") {
        void loadIndicators()
      }
    }

    function handleCustomRefresh() {
      void loadIndicators()
    }

    void loadIndicators()

    const interval = window.setInterval(() => {
      void loadIndicators()
    }, 30000)

    window.addEventListener("focus", handleCustomRefresh)
    window.addEventListener("student-app-indicators-refresh", handleCustomRefresh)
    document.addEventListener("visibilitychange", handleVisibilityRefresh)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener("focus", handleCustomRefresh)
      window.removeEventListener("student-app-indicators-refresh", handleCustomRefresh)
      document.removeEventListener("visibilitychange", handleVisibilityRefresh)
    }
  }, [pathname])

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
                      {getInitials(userName || appName || "A")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <SheetTitle className="text-base">{userName || "Aluno"}</SheetTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-primary/30 bg-primary/10 text-xs text-primary"
                      >
                        Aluno
                      </Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="max-h-[calc(100vh-140px)] overflow-y-auto p-2">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Plano e assinatura</p>
                  <p className="mt-1 font-medium text-foreground">
                    Consulte seu plano, eventos e cobranças pelo app.
                  </p>
                  <Link
                    href={routes.tenantAppStudentPlans}
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    Abrir planos
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">Menu</p>
                  <nav className="space-y-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
                      >
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <item.icon className="h-4 w-4 text-primary" />
                          {item.href === routes.tenantAppStudentEvents && indicators.eventsBadgeCount > 0 ? (
                            <AppIndicatorBadge value={indicators.eventsBadgeCount} />
                          ) : null}
                          {item.href === routes.tenantAppStudentPayments && indicators.paymentsBadgeCount > 0 ? (
                            <AppIndicatorBadge value={indicators.paymentsBadgeCount} />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium">{item.label}</span>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
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
                      <p className="text-xs text-muted-foreground">App do Aluno</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <TenantSwitcher />
                  </div>
                </div>
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
                <span className="sr-only">Notificações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">Sem notificações por enquanto</span>
                <span className="text-sm text-muted-foreground">
                  Quando houver avisos reais da academia, eles aparecerão aqui.
                </span>
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
              pathname === item.href ||
              (item.href !== routes.tenantAppStudent && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-full w-16 flex-col items-center justify-center gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                  {item.href === routes.tenantAppStudentEvents && indicators.eventsBadgeCount > 0 ? (
                    <AppIndicatorBadge value={indicators.eventsBadgeCount} />
                  ) : null}
                  {item.href === routes.tenantAppStudentPayments && indicators.paymentsBadgeCount > 0 ? (
                    <AppIndicatorBadge value={indicators.paymentsBadgeCount} />
                  ) : null}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function AppIndicatorBadge({ value }: { value: number }) {
  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
      {value}
    </span>
  )
}
