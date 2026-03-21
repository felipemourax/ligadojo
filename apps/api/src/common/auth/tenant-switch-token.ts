import { createHmac, timingSafeEqual } from "node:crypto"

interface TenantSwitchPayload {
  userId: string
  tenantSlug: string
  redirectPath: string
  exp: number
}

function getSecret() {
  return process.env.AUTH_SESSION_SECRET ?? "dev-auth-session-secret"
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url")
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url")
}

export function createTenantSwitchToken(input: {
  userId: string
  tenantSlug: string
  redirectPath: string
  expiresInSeconds?: number
}) {
  const payload: TenantSwitchPayload = {
    userId: input.userId,
    tenantSlug: input.tenantSlug,
    redirectPath: input.redirectPath,
    exp: Math.floor(Date.now() / 1000) + (input.expiresInSeconds ?? 300),
  }

  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = signPayload(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function verifyTenantSwitchToken(token: string): TenantSwitchPayload | null {
  const [encodedPayload, signature] = token.split(".")

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signPayload(encodedPayload)

  const providedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (providedBuffer.length !== expectedBuffer.length) {
    return null
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload)) as TenantSwitchPayload

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null
  }

  return payload
}
