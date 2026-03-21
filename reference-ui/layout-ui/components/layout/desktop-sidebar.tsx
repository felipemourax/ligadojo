"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
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
import { navSections, isActivePath } from "@/lib/navigation"

export function DesktopSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

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
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">D</span>
              </div>
              <div>
                <h1 className="font-semibold text-sidebar-foreground">Dojo</h1>
                <p className="text-[10px] text-sidebar-foreground/60">Gestão de Academias</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">D</span>
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
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary-foreground")} />
                      {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
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

          {/* User Profile */}
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer",
            collapsed && "justify-center p-2"
          )}>
            <Avatar className="h-9 w-9">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                JD
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  João da Silva
                </p>
                <p className="text-[10px] text-sidebar-foreground/60 truncate">
                  Admin
                </p>
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
                    <Button variant="ghost" size="sm" className="w-full px-0 text-sidebar-foreground/60 hover:text-sidebar-foreground">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Configurações</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full px-0 text-sidebar-foreground/60 hover:text-destructive">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sair</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="flex-1 text-sidebar-foreground/60 hover:text-sidebar-foreground" asChild>
                  <Link href="/dashboard/configuracoes">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-sidebar-foreground/60 hover:text-destructive" asChild>
                  <Link href="/login">
                    <LogOut className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
