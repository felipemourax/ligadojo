const fallbackColors: Record<string, string> = {
  branca: "#F5F5F5",
  cinza: "#9CA3AF",
  amarela: "#FACC15",
  laranja: "#F97316",
  verde: "#22C55E",
  azul: "#2563EB",
  roxa: "#7C3AED",
  marrom: "#92400E",
  vermelha: "#DC2626",
  preta: "#111827",
}

function getContrastColor(hexColor: string) {
  const normalized = hexColor.replace("#", "")
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
  return luminance > 0.68 ? "#111827" : "#FFFFFF"
}

export function resolveBeltBadgeStyle(input: {
  beltName: string | null | undefined
  colorHex?: string | null
} | null | undefined) {
  if (!input) {
    return undefined
  }

  const provided = input.colorHex?.trim()
  const fallback =
    input.beltName?.trim().toLowerCase() && fallbackColors[input.beltName.trim().toLowerCase()]
      ? fallbackColors[input.beltName.trim().toLowerCase()]
      : null
  const colorHex = provided && /^#[0-9a-fA-F]{6}$/.test(provided) ? provided : fallback

  if (!colorHex) {
    return undefined
  }

  return {
    backgroundColor: colorHex,
    borderColor: colorHex,
    color: getContrastColor(colorHex),
  }
}
