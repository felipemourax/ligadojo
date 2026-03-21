const e2ePort = process.env.E2E_PORT ?? "3000"

function escapeForRegex(value: string) {
  return value.replaceAll(".", "\\.").replaceAll("/", "\\/")
}

export function appUrl(path: string, host = "localhost") {
  return `http://${host}:${e2ePort}${path}`
}

export function tenantUrl(tenantSlug: string, path: string) {
  return appUrl(path, `${tenantSlug}.localhost`)
}

export function appUrlPattern(path: string, host = "localhost") {
  return new RegExp(`${escapeForRegex(host)}:${e2ePort}${escapeForRegex(path)}`)
}

export function tenantUrlPattern(tenantSlug: string, path: string) {
  return appUrlPattern(path, `${tenantSlug}.localhost`)
}
