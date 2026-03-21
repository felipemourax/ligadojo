function normalizePort(port: string | null) {
  return port ? `:${port}` : ""
}

export function buildPlatformHost(options: {
  currentHostname: string
  currentPort: string | null
}) {
  if (
    options.currentHostname === "localhost" ||
    options.currentHostname === "127.0.0.1"
  ) {
    return `${options.currentHostname}${normalizePort(options.currentPort)}`
  }

  if (options.currentHostname.endsWith(".localhost")) {
    return `localhost${normalizePort(options.currentPort)}`
  }

  const segments = options.currentHostname.split(".")

  if (segments.length >= 3) {
    return `${segments.slice(1).join(".")}${normalizePort(options.currentPort)}`
  }

  return `${options.currentHostname}${normalizePort(options.currentPort)}`
}

export function buildTenantHost(options: {
  currentHostname: string
  currentPort: string | null
  tenantSlug: string
  preferredDomain?: string | null
}) {
  if (options.preferredDomain) {
    return `${options.preferredDomain}${normalizePort(options.currentPort)}`
  }

  if (
    options.currentHostname === "localhost" ||
    options.currentHostname === "127.0.0.1" ||
    options.currentHostname.endsWith(".localhost")
  ) {
    return `${options.tenantSlug}.localhost${normalizePort(options.currentPort)}`
  }

  const segments = options.currentHostname.split(".")

  if (segments.length >= 3) {
    return [options.tenantSlug, ...segments.slice(1)].join(".")
  }

  return `${options.tenantSlug}.${options.currentHostname}`
}
