import { SurfaceGuard } from "@/components/guards"
import { ContentFrame } from "@/components/layout/content-frame"
import { CurrentSessionProvider } from "@/hooks/use-current-session"
import { PlatformDesktopSidebar } from "@/modules/platform-admin/components/platform-desktop-sidebar"
import { PlatformMobileHeader } from "@/modules/platform-admin/components/platform-mobile-header"
import { PlatformMobileNav } from "@/modules/platform-admin/components/platform-mobile-nav"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CurrentSessionProvider>
      <SurfaceGuard surface="platform">
        <div className="flex min-h-screen bg-background">
          <PlatformDesktopSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <PlatformMobileHeader />

            <main className="flex-1 pb-20 md:pb-0">
              <ContentFrame size="dashboard" className="px-4 py-4 md:px-6 md:py-6 lg:px-8 xl:px-10">
                {children}
              </ContentFrame>
            </main>

            <PlatformMobileNav />
          </div>
        </div>
      </SurfaceGuard>
    </CurrentSessionProvider>
  )
}
