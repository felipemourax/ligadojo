"use client"

import type { CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ContentFrame } from "@/components/layout/content-frame"
import { TenantSwitcher } from "@/components/tenant/tenant-switcher"
import { cn } from "@/lib/utils"

export interface SurfaceNavItem {
  href: string
  label: string
}

interface SurfaceShellProps {
  title: string
  subtitle: string
  homeHref: string
  homeLabel: string
  navItems: SurfaceNavItem[]
  branding?: {
    appName: string
    logoUrl: string | null
    bannerUrl: string | null
    themeColor: string
    backgroundColor: string
  }
  children: React.ReactNode
}

export function SurfaceShell({
  title,
  subtitle,
  homeHref,
  homeLabel,
  navItems,
  branding,
  children,
}: SurfaceShellProps) {
  const pathname = usePathname()

  return (
    <div
      className="min-h-screen bg-background"
      style={
        branding
          ? ({
              ["--tenant-primary" as string]: branding.themeColor,
              ["--tenant-background" as string]: branding.backgroundColor,
            } as CSSProperties)
          : undefined
      }
    >
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        {branding?.bannerUrl ? (
          <div className="relative h-28 overflow-hidden border-b border-border sm:h-36">
            <Image
              alt={`Banner de ${branding.appName}`}
              className="object-cover"
              fill
              sizes="100vw"
              src={branding.bannerUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />
          </div>
        ) : null}
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <Link href={homeHref} className="inline-flex items-center gap-3">
                {branding?.logoUrl ? (
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <Image
                      alt={`Logo de ${branding.appName}`}
                      className="h-full w-full object-cover"
                      height={48}
                      src={branding.logoUrl}
                      width={48}
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white"
                    style={{ backgroundColor: branding?.themeColor ?? "hsl(var(--primary))" }}
                  >
                    {branding?.appName?.[0]?.toUpperCase() ?? "D"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{branding?.appName ?? title}</p>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <TenantSwitcher />
              <Link
                href={homeHref}
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                {homeLabel}
              </Link>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    isActive
                      ? "text-white"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                  style={
                    isActive && branding
                      ? {
                          borderColor: branding.themeColor,
                          backgroundColor: branding.themeColor,
                        }
                      : undefined
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="px-4 py-6 md:px-6 lg:px-8">
        <ContentFrame size="surface">{children}</ContentFrame>
      </main>
    </div>
  )
}
