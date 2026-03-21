export function formatCurrencyInputFromCents(valueCents: number | null | undefined) {
  const normalizedValue = Number.isFinite(valueCents) ? Number(valueCents) : 0
  return (normalizedValue / 100).toFixed(2).replace(".", ",")
}

export function parseCurrencyInputToCents(value: string) {
  const normalized = value.replace(/\s/g, "").replace(/[R$r$]/g, "")

  if (!normalized) {
    return 0
  }

  const lastComma = normalized.lastIndexOf(",")
  const lastDot = normalized.lastIndexOf(".")
  const separatorIndex = Math.max(lastComma, lastDot)

  if (separatorIndex < 0) {
    const integerDigits = normalized.replace(/\D/g, "")
    return integerDigits ? Number(integerDigits) * 100 : 0
  }

  const integerDigits = normalized.slice(0, separatorIndex).replace(/\D/g, "")
  const decimalDigits = normalized
    .slice(separatorIndex + 1)
    .replace(/\D/g, "")
    .slice(0, 2)
    .padEnd(2, "0")

  return Number(integerDigits || "0") * 100 + Number(decimalDigits || "0")
}
