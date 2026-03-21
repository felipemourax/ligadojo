"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronsUpDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchJson } from "@/lib/api/client"
import { useCurrentSession } from "@/hooks/use-current-session"

export function TenantSwitcher() {
  const router = useRouter()
  const { session } = useCurrentSession()
  const [isSwitchingSlug, setIsSwitchingSlug] = useState<string | null>(null)

  const memberships = session?.memberships ?? []

  if (memberships.length <= 1) {
    return null
  }

  async function handleSwitchTenant(tenantSlug: string, role: string) {
    setIsSwitchingSlug(tenantSlug)

    try {
      if (role === "academy_admin") {
        await fetchJson<{ redirectUrl: string }>("/api/auth/dashboard-tenant", {
          method: "POST",
          body: JSON.stringify({
            tenantSlug,
          }),
        })

        window.dispatchEvent(new Event("dojo-session-refresh"))
        router.replace("/dashboard")
        router.refresh()
        return
      }

      const response = await fetchJson<{ redirectUrl: string }>("/api/auth/tenant-switch", {
        method: "POST",
        body: JSON.stringify({
          tenantSlug,
          redirectPath: role === "academy_admin" ? "/dashboard" : "/app",
        }),
      })

      window.location.href = response.redirectUrl
    } finally {
      setIsSwitchingSlug(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {session?.currentMembership?.tenant?.displayName ?? "Trocar academia"}
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Trocar academia</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.map((membership) => {
          const tenantSlug = membership.tenant?.slug

          if (!tenantSlug) {
            return null
          }

          const isCurrent = session?.currentMembership?.tenantId === membership.tenantId
          const isSwitching = isSwitchingSlug === tenantSlug

          return (
            <DropdownMenuItem
              key={membership.id}
              disabled={isCurrent || isSwitching}
              onClick={() => handleSwitchTenant(tenantSlug, membership.role)}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex flex-col">
                <span className="font-medium">{membership.tenant?.displayName ?? tenantSlug}</span>
                <span className="text-xs text-muted-foreground">{membership.role}</span>
              </div>
              {isSwitching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCurrent ? (
                <span className="text-xs text-muted-foreground">Atual</span>
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
