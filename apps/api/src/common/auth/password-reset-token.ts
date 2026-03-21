import { createHash, randomBytes } from "node:crypto"

export function createPasswordResetToken() {
  const token = randomBytes(24).toString("base64url")
  const tokenHash = hashPasswordResetToken(token)

  return {
    token,
    tokenHash,
  }
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}
