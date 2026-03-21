"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, UserCircle2 } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"
import {
  getAllNavItems,
  getAllNavItemsForCapabilities,
  getMobileNavItems,
  getMobileNavItemsForCapabilities,
  isActivePath,
} from "@/lib/navigation"
import { routes } from "@/lib/routes"
import { useCurrentRole } from "@/hooks/use-current-role"
import { useCurrentSession } from "@/hooks/use-current-session"
import { useTeacherPendingApprovals } from "@/modules/teachers/hooks"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const currentRole = useCurrentRole()
  const { session } = useCurrentSession()
  const { pendingApprovalsCount } = useTeacherPendingApprovals()
  const capabilityNavItems =
    session?.currentTenantCapabilities?.length
      ? getMobileNavItemsForCapabilities(session.currentTenantCapabilities)
      : []
  const mobileNavItems = capabilityNavItems.length > 0
    ? capabilityNavItems
    : [
        {
          href: routes.dashboardSettingsPayments,
          icon: UserCircle2,
          label: "Perfil",
        },
      ]
  const allNavItems = session?.currentTenantCapabilities?.length
    ? getAllNavItemsForCapabilities(session.currentTenantCapabilities, currentRole)
    : getAllNavItems(currentRole)
  const teacherPendingBadge =
    pendingApprovalsCount > 0
      ? pendingApprovalsCount > 99
        ? "99+"
        : String(pendingApprovalsCount)
      : null

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = isActivePath(pathname, item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-xl transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive && "text-primary"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
          
          {/* Menu Button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="relative flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
              >
                <Menu className="h-5 w-5" />
                <span className="text-[10px] font-medium">Menu</span>
                {teacherPendingBadge ? (
                  <span className="absolute right-2 top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-amber-950">
                    {teacherPendingBadge}
                  </span>
                ) : null}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
              <SheetTitle className="text-lg font-semibold mb-4">Menu</SheetTitle>
              <nav className="grid grid-cols-3 gap-3">
                {allNavItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href)
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      )}
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="text-xs font-medium">{item.label}</span>
                      {item.href === routes.teachers && teacherPendingBadge ? (
                        <span className="absolute right-2 top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-semibold text-amber-950">
                          {teacherPendingBadge}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  )
}
