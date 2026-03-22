"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getNavSectionsForCapabilities, isActivePath } from "@/lib/navigation"
import { routes } from "@/lib/routes"
import { useCurrentRole } from "@/hooks/use-current-role"
import { useCurrentSession } from "@/hooks/use-current-session"
import { fetchJson } from "@/lib/api/client"
import { TenantSwitcher } from "@/components/tenant/tenant-switcher"
import { useTeacherPendingApprovals } from "@/modules/teachers/hooks"

export function DesktopSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const currentRole = useCurrentRole()
  const { session } = useCurrentSession()
  const { pendingApprovalsCount } = useTeacherPendingApprovals()
  const navSections = getNavSectionsForCapabilities(
    session?.currentTenantCapabilities ?? [],
    currentRole
  )
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
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border sticky top-0 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-sidebar-border",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <Link href={routes.dashboard} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-black p-1.5 shadow-sm">
                <Image alt="Logo da LigaDojo" className="h-full w-full object-contain" height={36} src="/logo-ligadojo.svg" width={36} />
              </div>
              <div>
                <h1 className="font-semibold text-sidebar-foreground">LigaDojo</h1>
                <p className="text-[10px] text-sidebar-foreground/60">Gestão de Academias</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-black p-1.5 shadow-sm">
              <Image alt="Logo da LigaDojo" className="h-full w-full object-contain" height={36} src="/logo-ligadojo.svg" width={36} />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section, idx) => (
            <div key={section.title} className={cn(idx > 0 && "mt-6")}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isActivePath(pathname, item.href)
                  const teacherPendingBadge =
                    item.href === routes.teachers && pendingApprovalsCount > 0
                      ? pendingApprovalsCount > 99
                        ? "99+"
                        : String(pendingApprovalsCount)
                      : null
                  
                  const linkContent = (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <div className="relative shrink-0">
                        <item.icon className={cn("h-5 w-5", isActive && "text-sidebar-primary-foreground")} />
                        {collapsed && teacherPendingBadge ? (
                          <span className="absolute -right-2 -top-2 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-amber-950">
                            {teacherPendingBadge}
                          </span>
                        ) : null}
                      </div>
                      {!collapsed ? (
                        <>
                          <span className="text-sm font-medium">{item.label}</span>
                          {teacherPendingBadge ? (
                            <span className="ml-auto inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-amber-950">
                              {teacherPendingBadge}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </Link>
                  )

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return linkContent
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-sidebar-border p-3">
          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full mb-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Recolher
              </>
            )}
          </Button>

          <Separator className="mb-3 bg-sidebar-border" />

          {!collapsed && (
            <div className="mb-3">
              <TenantSwitcher />
            </div>
          )}

          {/* User Profile */}
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer",
            collapsed && "justify-center p-2"
          )}>
              <Avatar className="h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {session?.user.name ?? "Sessão não iniciada"}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] text-sidebar-foreground/60 truncate">
                    {session?.currentMembership?.role ?? currentRole}
                  </p>
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
            )}
          </div>

          {/* Quick Actions */}
          <div className={cn(
            "flex gap-1 mt-2",
            collapsed ? "flex-col" : "flex-row"
          )}>
            {collapsed ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full px-0 text-sidebar-foreground/60 hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sair</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sidebar-foreground/60 hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
