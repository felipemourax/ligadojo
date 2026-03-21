export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "platform",
  "admin",
  "api",
  "localhost",
])

export const PLATFORM_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
])

export const TENANCY_HEADERS = {
  kind: "x-tenant-kind",
  host: "x-tenant-host",
  slug: "x-tenant-slug",
  name: "x-tenant-name",
  customDomain: "x-tenant-custom-domain",
} as const
