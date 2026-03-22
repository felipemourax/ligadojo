import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Image from 'next/image'
import { getResolvedTenantBranding, getResolvedTenantSurfaceContext } from '@/lib/tenancy'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'LigaDojo - Gestão de Academias',
  description: 'Plataforma SaaS de gestão para academias de artes marciais',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon.svg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LigaDojo',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1a1a2e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const tenantPromise = getResolvedTenantSurfaceContext()

  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans antialiased min-h-screen">
        <TenantChrome tenantPromise={tenantPromise}>{children}</TenantChrome>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}

async function TenantChrome({
  children,
  tenantPromise,
}: Readonly<{
  children: React.ReactNode
  tenantPromise: ReturnType<typeof getResolvedTenantSurfaceContext>
}>) {
  const tenantContext = await tenantPromise
  const tenant = tenantContext.tenant
  const branding = await getResolvedTenantBranding(tenant)

  return (
    <>
      {tenant.kind === 'tenant' && tenantContext.resolvedTenant && tenant.tenantName && (
        <div
          className="border-b px-4 py-2 text-center text-xs font-medium"
          style={{
            borderColor: `${branding.themeColor}33`,
            backgroundColor: `${branding.themeColor}1a`,
            color: branding.themeColor,
          }}
        >
          <span className="inline-flex items-center gap-2">
            {branding.logoUrl ? (
              <Image
                alt={`Logo de ${tenant.tenantName}`}
                className="h-5 w-5 rounded object-cover"
                height={20}
                src={branding.logoUrl}
                width={20}
              />
            ) : null}
            <span>
              App ativo: <span className="font-semibold">{branding.appName}</span>
            </span>
          </span>
        </div>
      )}
      <div
        data-tenant-kind={tenant.kind}
        data-tenant-slug={tenant.tenantSlug ?? undefined}
        data-tenant-host={tenant.host}
      >
        {children}
      </div>
    </>
  )
}
