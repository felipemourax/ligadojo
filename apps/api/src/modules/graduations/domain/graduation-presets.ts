import { AgeGroup, GraduationProgression, GraduationTrackBranch } from "@prisma/client"

export interface GraduationLevelPreset {
  name: string
  colorHex: string
  stripes: number
  minTimeMonths: number | null
}

export interface GraduationTrackPreset {
  branch: GraduationTrackBranch
  progression: GraduationProgression
  levels: GraduationLevelPreset[]
}

export interface GraduationTrackBootstrap {
  name: string
  modalityId: string
  modalityName: string
  branch: GraduationTrackBranch
  progression: GraduationProgression
  isDefault: boolean
  sortOrder: number
  levels: GraduationLevelPreset[]
}

const bjjKids: GraduationLevelPreset[] = [
  { name: "Branca", colorHex: "#F5F5F5", stripes: 4, minTimeMonths: 0 },
  { name: "Cinza", colorHex: "#9CA3AF", stripes: 4, minTimeMonths: 6 },
  { name: "Amarela", colorHex: "#FACC15", stripes: 4, minTimeMonths: 12 },
  { name: "Laranja", colorHex: "#F97316", stripes: 4, minTimeMonths: 18 },
  { name: "Verde", colorHex: "#22C55E", stripes: 4, minTimeMonths: 24 },
]

const bjjAdult: GraduationLevelPreset[] = [
  { name: "Branca", colorHex: "#F5F5F5", stripes: 4, minTimeMonths: 0 },
  { name: "Azul", colorHex: "#2563EB", stripes: 4, minTimeMonths: 24 },
  { name: "Roxa", colorHex: "#7C3AED", stripes: 4, minTimeMonths: 42 },
  { name: "Marrom", colorHex: "#92400E", stripes: 4, minTimeMonths: 60 },
  { name: "Preta", colorHex: "#111827", stripes: 10, minTimeMonths: 78 },
]

const judoKids: GraduationLevelPreset[] = [
  { name: "Branca", colorHex: "#F5F5F5", stripes: 0, minTimeMonths: 0 },
  { name: "Cinza", colorHex: "#9CA3AF", stripes: 0, minTimeMonths: 4 },
  { name: "Azul", colorHex: "#2563EB", stripes: 0, minTimeMonths: 8 },
  { name: "Amarela", colorHex: "#FACC15", stripes: 0, minTimeMonths: 12 },
  { name: "Laranja", colorHex: "#F97316", stripes: 0, minTimeMonths: 16 },
  { name: "Verde", colorHex: "#22C55E", stripes: 0, minTimeMonths: 20 },
  { name: "Roxa", colorHex: "#7C3AED", stripes: 0, minTimeMonths: 24 },
  { name: "Marrom", colorHex: "#92400E", stripes: 0, minTimeMonths: 30 },
]

const judoAdult: GraduationLevelPreset[] = [
  { name: "Branca", colorHex: "#F5F5F5", stripes: 0, minTimeMonths: 0 },
  { name: "Amarela", colorHex: "#FACC15", stripes: 0, minTimeMonths: 6 },
  { name: "Laranja", colorHex: "#F97316", stripes: 0, minTimeMonths: 12 },
  { name: "Verde", colorHex: "#22C55E", stripes: 0, minTimeMonths: 18 },
  { name: "Azul", colorHex: "#2563EB", stripes: 0, minTimeMonths: 24 },
  { name: "Marrom", colorHex: "#92400E", stripes: 0, minTimeMonths: 36 },
  { name: "Preta", colorHex: "#111827", stripes: 10, minTimeMonths: 48 },
]

const karateKids: GraduationLevelPreset[] = [
  { name: "Branca", colorHex: "#F5F5F5", stripes: 0, minTimeMonths: 0 },
  { name: "Branca com ponta amarela", colorHex: "#E5E7EB", stripes: 0, minTimeMonths: 4 },
  { name: "Amarela", colorHex: "#FACC15", stripes: 0, minTimeMonths: 8 },
  { name: "Amarela com ponta laranja", colorHex: "#FDE68A", stripes: 0, minTimeMonths: 12 },
  { name: "Laranja", colorHex: "#F97316", stripes: 0, minTimeMonths: 16 },
  { name: "Verde", colorHex: "#22C55E", stripes: 0, minTimeMonths: 20 },
  { name: "Azul", colorHex: "#2563EB", stripes: 0, minTimeMonths: 24 },
  { name: "Roxa", colorHex: "#7C3AED", stripes: 0, minTimeMonths: 30 },
  { name: "Marrom", colorHex: "#92400E", stripes: 0, minTimeMonths: 36 },
]

const karateAdult: GraduationLevelPreset[] = [
  { name: "Branca", colorHex: "#F5F5F5", stripes: 0, minTimeMonths: 0 },
  { name: "Amarela", colorHex: "#FACC15", stripes: 0, minTimeMonths: 6 },
  { name: "Laranja", colorHex: "#F97316", stripes: 0, minTimeMonths: 12 },
  { name: "Verde", colorHex: "#22C55E", stripes: 0, minTimeMonths: 18 },
  { name: "Azul", colorHex: "#2563EB", stripes: 0, minTimeMonths: 24 },
  { name: "Roxa", colorHex: "#7C3AED", stripes: 0, minTimeMonths: 30 },
  { name: "Marrom", colorHex: "#92400E", stripes: 0, minTimeMonths: 36 },
  { name: "Preta", colorHex: "#111827", stripes: 10, minTimeMonths: 48 },
]

const taekwondoKids: GraduationLevelPreset[] = [
  { name: "Branca", colorHex: "#F5F5F5", stripes: 0, minTimeMonths: 0 },
  { name: "Branca/amarela", colorHex: "#FEF3C7", stripes: 0, minTimeMonths: 4 },
  { name: "Amarela", colorHex: "#FACC15", stripes: 0, minTimeMonths: 8 },
  { name: "Amarela/verde", colorHex: "#A3E635", stripes: 0, minTimeMonths: 12 },
  { name: "Verde", colorHex: "#22C55E", stripes: 0, minTimeMonths: 16 },
  { name: "Verde/azul", colorHex: "#14B8A6", stripes: 0, minTimeMonths: 20 },
  { name: "Azul", colorHex: "#2563EB", stripes: 0, minTimeMonths: 24 },
  { name: "Azul/vermelha", colorHex: "#8B5CF6", stripes: 0, minTimeMonths: 28 },
  { name: "Vermelha", colorHex: "#DC2626", stripes: 0, minTimeMonths: 32 },
  { name: "Vermelha/preta", colorHex: "#111827", stripes: 0, minTimeMonths: 36 },
]

const taekwondoAdult: GraduationLevelPreset[] = [
  { name: "Branca", colorHex: "#F5F5F5", stripes: 0, minTimeMonths: 0 },
  { name: "Amarela", colorHex: "#FACC15", stripes: 0, minTimeMonths: 6 },
  { name: "Verde", colorHex: "#22C55E", stripes: 0, minTimeMonths: 12 },
  { name: "Azul", colorHex: "#2563EB", stripes: 0, minTimeMonths: 18 },
  { name: "Vermelha", colorHex: "#DC2626", stripes: 0, minTimeMonths: 24 },
  { name: "Preta", colorHex: "#111827", stripes: 9, minTimeMonths: 36 },
]

const skillLevels: GraduationLevelPreset[] = [
  { name: "Iniciante", colorHex: "#CBD5E1", stripes: 0, minTimeMonths: 0 },
  { name: "Intermediário", colorHex: "#60A5FA", stripes: 0, minTimeMonths: 8 },
  { name: "Avançado", colorHex: "#1D4ED8", stripes: 0, minTimeMonths: 18 },
]

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

function resolveFamily(name: string) {
  const normalized = normalizeName(name)

  if (normalized.includes("nogi") || normalized.includes("no-gi") || normalized.includes("no gi")) {
    return "bjj-nogi"
  }
  if (normalized.includes("jiu") || normalized.includes("bjj")) return "bjj"
  if (normalized.includes("judo")) return "judo"
  if (normalized.includes("karate")) return "karate"
  if (normalized.includes("taekwondo")) return "taekwondo"
  if (
    normalized.includes("boxe") ||
    normalized.includes("boxing") ||
    normalized.includes("wrestling") ||
    normalized.includes("muay")
  ) {
    return "skill"
  }

  return "skill"
}

function resolveCanonicalBaseName(name: string) {
  switch (resolveFamily(name)) {
    case "bjj":
      return "Jiu Jitsu"
    case "bjj-nogi":
      return "Jiu Jitsu NoGi"
    case "judo":
      return "Judô"
    case "karate":
      return "Karatê"
    case "taekwondo":
      return "Taekwondo"
    default:
      return name.trim()
  }
}

function buildTrackName(baseName: string, branch: GraduationTrackBranch) {
  return baseName
}

function resolvePresetsForFamily(family: string): GraduationTrackPreset[] {
  switch (family) {
    case "bjj":
      return [
        { branch: GraduationTrackBranch.ADULT, progression: GraduationProgression.BELT, levels: bjjAdult },
        { branch: GraduationTrackBranch.KIDS, progression: GraduationProgression.BELT, levels: bjjKids },
      ]
    case "judo":
      return [
        { branch: GraduationTrackBranch.ADULT, progression: GraduationProgression.BELT, levels: judoAdult },
        { branch: GraduationTrackBranch.KIDS, progression: GraduationProgression.BELT, levels: judoKids },
      ]
    case "karate":
      return [
        { branch: GraduationTrackBranch.ADULT, progression: GraduationProgression.BELT, levels: karateAdult },
        { branch: GraduationTrackBranch.KIDS, progression: GraduationProgression.BELT, levels: karateKids },
      ]
    case "taekwondo":
      return [
        { branch: GraduationTrackBranch.ADULT, progression: GraduationProgression.BELT, levels: taekwondoAdult },
        { branch: GraduationTrackBranch.KIDS, progression: GraduationProgression.BELT, levels: taekwondoKids },
      ]
    case "bjj-nogi":
      return [
        { branch: GraduationTrackBranch.ADULT, progression: GraduationProgression.SKILL_LEVEL, levels: skillLevels },
      ]
    default:
      return [
        { branch: GraduationTrackBranch.ADULT, progression: GraduationProgression.SKILL_LEVEL, levels: skillLevels },
      ]
  }
}

function modalitySupportsBranch(ageGroups: AgeGroup[], branch: GraduationTrackBranch) {
  if (branch === GraduationTrackBranch.ADULT) {
    return ageGroups.includes(AgeGroup.ADULT) || ageGroups.includes(AgeGroup.MIXED)
  }
  return (
    ageGroups.includes(AgeGroup.KIDS) ||
    ageGroups.includes(AgeGroup.JUVENILE) ||
    ageGroups.includes(AgeGroup.MIXED)
  )
}

export function buildGraduationTrackBootstraps(
  modalities: Array<{
    id: string
    name: string
    ageGroups: AgeGroup[]
  }>
): GraduationTrackBootstrap[] {
  const grouped = new Map<
    string,
    {
      modalityId: string
      modalityName: string
      canonicalBaseName: string
      family: string
      ageGroups: Set<AgeGroup>
    }
  >()

  for (const modality of modalities) {
    const family = resolveFamily(modality.name)
    const canonicalBaseName = resolveCanonicalBaseName(modality.name)
    const key = `${canonicalBaseName}::${family}`
    const current = grouped.get(key)

    if (!current) {
      grouped.set(key, {
        modalityId: modality.id,
        modalityName: modality.name,
        canonicalBaseName,
        family,
        ageGroups: new Set(modality.ageGroups),
      })
      continue
    }

    for (const ageGroup of modality.ageGroups) {
      current.ageGroups.add(ageGroup)
    }
  }

  return Array.from(grouped.values()).flatMap((group, modalityIndex) => {
    const presets = resolvePresetsForFamily(group.family).filter((preset) =>
      modalitySupportsBranch(Array.from(group.ageGroups), preset.branch)
    )

    return presets.map((preset, index) => ({
      name: buildTrackName(group.canonicalBaseName, preset.branch),
      modalityId: group.modalityId,
      modalityName: group.modalityName,
      branch: preset.branch,
      progression: preset.progression,
      isDefault: true,
      levels: preset.levels,
      sortOrder: modalityIndex * 10 + index,
    }))
  })
}

export function inferTrackBeltColorHex(input: {
  beltName: string | null | undefined
  tracks: Array<{
    modalityId: string | null
    levels: Array<{ name: string; colorHex: string }>
  }>
  preferredModalityIds?: string[]
}) {
  const beltName = input.beltName?.trim().toLowerCase()
  if (!beltName) {
    return null
  }

  const preferredTracks = input.tracks.filter(
    (track) =>
      track.modalityId &&
      input.preferredModalityIds?.includes(track.modalityId)
  )
  const searchSpace = preferredTracks.length > 0 ? preferredTracks : input.tracks

  for (const track of searchSpace) {
    const match = track.levels.find((level) => level.name.trim().toLowerCase() === beltName)
    if (match) {
      return match.colorHex
    }
  }

  return null
}
