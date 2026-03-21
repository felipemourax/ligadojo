import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

const KEY_LENGTH = 64

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex")
  const passwordHash = scryptSync(password, salt, KEY_LENGTH).toString("hex")

  return {
    passwordHash,
    passwordSalt: salt,
  }
}

export function verifyPassword(input: {
  password: string
  passwordHash: string
  passwordSalt: string
}) {
  const derivedHash = scryptSync(input.password, input.passwordSalt, KEY_LENGTH)
  const expectedHash = Buffer.from(input.passwordHash, "hex")

  if (derivedHash.byteLength !== expectedHash.byteLength) {
    return false
  }

  return timingSafeEqual(derivedHash, expectedHash)
}
