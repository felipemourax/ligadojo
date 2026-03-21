import { createHash, randomBytes } from "node:crypto"

export function createOpaqueSessionToken() {
  return randomBytes(32).toString("hex")
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}
