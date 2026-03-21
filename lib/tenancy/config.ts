export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "platform",
  "admin",
  "api",
  "localhost",
])

function normalizeHostEntry(host: string): string {
  return host.split(":")[0].trim().toLowerCase()
}

function parsePlatformHosts(value: string | undefined): string[] {
  if (!value) {
    return []
  }

  return value
    .split(",")
    .map((entry) => normalizeHostEntry(entry))
    .filter(Boolean)
}

const DEFAULT_PLATFORM_HOSTS = [
  "localhost",
  "127.0.0.1",
  "ligadojo.com.br",
  "www.ligadojo.com.br",
]

export const PLATFORM_ROOT_DOMAIN = normalizeHostEntry(
  process.env.PLATFORM_ROOT_DOMAIN || "ligadojo.com.br"
)

export const PLATFORM_HOSTS = new Set(
  [...DEFAULT_PLATFORM_HOSTS, ...parsePlatformHosts(process.env.PLATFORM_HOSTS)].map((host) =>
    normalizeHostEntry(host)
  )
)

export function buildManagedTenantDomain(tenantSlug: string): string {
  const normalizedSlug = tenantSlug.trim().toLowerCase()

  if (!normalizedSlug) {
    return PLATFORM_ROOT_DOMAIN
  }

  if (process.env.NODE_ENV !== "production") {
    return `${normalizedSlug}.localhost`
  }

  return `${normalizedSlug}.${PLATFORM_ROOT_DOMAIN}`
}

export const TENANCY_HEADERS = {
  kind: "x-tenant-kind",
  host: "x-tenant-host",
  slug: "x-tenant-slug",
  name: "x-tenant-name",
  customDomain: "x-tenant-custom-domain",
} as const
