"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { getSystemNavItems, getSystemNavItemsForCapabilities } from "@/lib/system-navigation"
import { useCurrentRole } from "@/hooks/use-current-role"
import { useCurrentSession } from "@/hooks/use-current-session"
import { fetchJson } from "@/lib/api/client"
import { TenantSwitcher } from "@/components/tenant/tenant-switcher"

interface MobileHeaderProps {
  title?: string
}

export function MobileHeader({ title = "Dashboard" }: MobileHeaderProps) {
  const currentRole = useCurrentRole()
  const { session } = useCurrentSession()
  const systemItems = session?.currentTenantCapabilities?.length
    ? getSystemNavItemsForCapabilities(session.currentTenantCapabilities, currentRole)
    : getSystemNavItems(currentRole)
  const userInitials = session?.user.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "JD"

  async function handleSignOut() {
    await fetchJson("/api/auth/session", { method: "DELETE" })
    window.dispatchEvent(new Event("dojo-session-refresh"))
    window.location.href = routes.login
  }

  return (
    <header className="sticky top-0 z-40 md:hidden bg-card/95 backdrop-blur-lg border-b border-border safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">D</span>
          </div>
          <h1 className="font-semibold text-foreground">{title}</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <div className="hidden sm:block">
            <TenantSwitcher />
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            <span className="sr-only">Notificações</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{session?.user.name ?? "Sessão não iniciada"}</span>
                  <span className="text-xs text-muted-foreground">{session?.user.email ?? "sem email"}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {systemItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
