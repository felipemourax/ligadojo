import { SurfaceGuard } from "@/components/guards"
import { SurfaceShell } from "@/components/layout/surface-shell"
import { CurrentSessionProvider } from "@/hooks/use-current-session"
import { routes } from "@/lib/routes"

const platformNavItems = [
  { href: routes.platform, label: "Resumo" },
  { href: routes.platformAcademies, label: "Academias" },
  { href: routes.platformBilling, label: "Cobrança" },
  { href: routes.platformMetrics, label: "Métricas" },
  { href: routes.platformSupport, label: "Suporte" },
]

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CurrentSessionProvider>
      <SurfaceGuard surface="platform">
        <SurfaceShell
          title="Dojo Platform"
          subtitle="Administração da plataforma SaaS"
          homeHref={routes.platform}
          homeLabel="Painel da plataforma"
          navItems={platformNavItems}
        >
          {children}
        </SurfaceShell>
      </SurfaceGuard>
    </CurrentSessionProvider>
  )
}
