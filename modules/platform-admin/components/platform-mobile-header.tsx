"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrentSession } from "@/hooks/use-current-session"
import { fetchJson } from "@/lib/api/client"
import { routes } from "@/lib/routes"
import { platformNavItems } from "@/modules/platform-admin/navigation"

function resolveTitle(pathname: string) {
  if (pathname.startsWith(routes.platformAcademies)) {
    return pathname === routes.platformAcademies ? "Academias" : "Detalhe da academia"
  }

  return "Dashboard"
}

export function PlatformMobileHeader() {
  const pathname = usePathname()
  const { session } = useCurrentSession()
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
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg safe-top md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href={routes.platform} className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-black p-1 shadow-sm">
            <Image
              alt="Logo da LigaDojo"
              className="h-full w-full object-contain"
              height={32}
              src="/logo-ligadojo.svg"
              width={32}
            />
          </Link>
          <h1 className="font-semibold text-foreground">{resolveTitle(pathname)}</h1>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Notificações</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">{userInitials}</AvatarFallback>
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
              {platformNavItems.map((item) => (
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
