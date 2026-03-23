"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCurrentSession } from "@/hooks/use-current-session"
import { fetchJson } from "@/lib/api/client"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { isActivePath } from "@/lib/navigation"
import { platformNavItems } from "@/modules/platform-admin/navigation"

export function PlatformDesktopSidebar() {
  const pathname = usePathname()
  const { session } = useCurrentSession()
  const [collapsed, setCollapsed] = useState(false)
  const userInitials = session?.user.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "LD"

  async function handleSignOut() {
    await fetchJson("/api/auth/session", { method: "DELETE" })
    window.dispatchEvent(new Event("dojo-session-refresh"))
    window.location.href = routes.login
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-sidebar-border bg-sidebar sticky top-0 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed ? (
            <Link href={routes.platform} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-black p-1.5 shadow-sm">
                <Image
                  alt="Logo da LigaDojo"
                  className="h-full w-full object-contain"
                  height={36}
                  src="/logo-ligadojo.svg"
                  width={36}
                />
              </div>
              <div>
                <h1 className="font-semibold text-sidebar-foreground">LigaDojo</h1>
                <p className="text-[10px] text-sidebar-foreground/60">Administração da plataforma</p>
              </div>
            </Link>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-black p-1.5 shadow-sm">
              <Image
                alt="Logo da LigaDojo"
                className="h-full w-full object-contain"
                height={36}
                src="/logo-ligadojo.svg"
                width={36}
              />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {!collapsed ? (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Plataforma
            </p>
          ) : null}
          <div className="space-y-1">
            {platformNavItems.map((item) => {
              const isActive = isActivePath(pathname, item.href)

              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed ? <span className="text-sm font-medium">{item.label}</span> : null}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}
          </div>
        </nav>

        <div className="mt-auto border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "mb-3 w-full text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Recolher
              </>
            )}
          </Button>

          <Separator className="mb-3 bg-sidebar-border" />

          <div
            className={cn(
              "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-sidebar-accent",
              collapsed && "justify-center p-2"
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-sm text-primary">{userInitials}</AvatarFallback>
            </Avatar>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {session?.user.name ?? "Sessão não iniciada"}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[10px] text-sidebar-foreground/60">platform_admin</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-sidebar-foreground/60 hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full px-0 text-sidebar-foreground/60 hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </aside>
    </TooltipProvider>
  )
}
