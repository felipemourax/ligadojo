"use client"

import { useMemo } from "react"

export function useCurrentTenantSlug(): string | null {
  return useMemo(() => {
    if (typeof document === "undefined") {
      return null
    }

    const tenantNode = document.querySelector("[data-tenant-slug]")
    const tenantSlug = tenantNode?.getAttribute("data-tenant-slug")

    return tenantSlug || null
  }, [])
}
