import type { MetadataRoute } from "next"
import { getResolvedTenantBranding, getTenantContext } from "@/lib/tenancy"

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const tenant = await getTenantContext()
  const branding = await getResolvedTenantBranding(tenant)

  return {
    name: branding.appName,
    short_name: branding.shortName,
    description: "Plataforma SaaS de gestão para academias de artes marciais",
    start_url: tenant.kind === "tenant" ? "/app" : "/login",
    display: "standalone",
    background_color: branding.backgroundColor,
    theme_color: branding.themeColor,
    icons: [
      ...(branding.logoUrl
        ? [
            {
              src: branding.logoUrl,
              sizes: "512x512",
              type: "image/png",
            },
          ]
        : []),
      {
        src: "/icon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}
