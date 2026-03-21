export interface GraduationCatalogLevel {
  name: string
  colorHex: string
  stripes: number
  order: number
}

export interface GraduationActivityCatalogItem {
  activityCategory: string | null
  modalityIds: string[]
  modalityNames: string[]
  levels: GraduationCatalogLevel[]
}

interface GraduationTrackCatalogSource {
  modalityId: string | null
  modalityName: string | null
  activityCategory: string | null
  order: number
  levels: Array<{
    name: string
    colorHex: string
    stripes: number
    order: number
  }>
}

export function buildGraduationActivityCatalog(
  tracks: GraduationTrackCatalogSource[]
): GraduationActivityCatalogItem[] {
  const groups = new Map<
    string,
    {
      activityCategory: string | null
      modalityIds: Set<string>
      modalityNames: Set<string>
      levels: Map<string, GraduationCatalogLevel>
    }
  >()

  for (const track of [...tracks].sort((left, right) => left.order - right.order)) {
    const key = track.activityCategory ?? "__default__"
    const current =
      groups.get(key) ??
      {
        activityCategory: track.activityCategory,
        modalityIds: new Set<string>(),
        modalityNames: new Set<string>(),
        levels: new Map<string, GraduationCatalogLevel>(),
      }

    if (track.modalityId) {
      current.modalityIds.add(track.modalityId)
    }
    if (track.modalityName) {
      current.modalityNames.add(track.modalityName)
    }

    for (const level of track.levels.sort((left, right) => left.order - right.order)) {
      const levelKey = `${level.name.trim().toLowerCase()}::${level.stripes}`
      if (!current.levels.has(levelKey)) {
        current.levels.set(levelKey, {
          name: level.name,
          colorHex: level.colorHex,
          stripes: level.stripes,
          order: current.levels.size,
        })
      }
    }

    groups.set(key, current)
  }

  return Array.from(groups.values())
    .map<GraduationActivityCatalogItem>((item) => ({
      activityCategory: item.activityCategory,
      modalityIds: Array.from(item.modalityIds),
      modalityNames: Array.from(item.modalityNames),
      levels: Array.from(item.levels.values()).sort((left, right) => left.order - right.order),
    }))
    .sort((left, right) => {
      const leftLabel = left.activityCategory ?? "zzz"
      const rightLabel = right.activityCategory ?? "zzz"
      return leftLabel.localeCompare(rightLabel)
    })
}

export function resolveGraduationCatalogLevels(input: {
  catalog: GraduationActivityCatalogItem[]
  activityCategory: string | null
  preferredModalityIds?: string[]
}) {
  const modalitySet = new Set(input.preferredModalityIds ?? [])

  const exactActivityItems = input.catalog.filter((item) => item.activityCategory === input.activityCategory)

  if (exactActivityItems.length === 0) {
    return []
  }

  if (modalitySet.size > 0) {
    const scoped = exactActivityItems.filter((item) => item.modalityIds.some((id) => modalitySet.has(id)))
    if (scoped.length > 0) {
      return dedupeLevels(scoped.flatMap((item) => item.levels))
    }
  }

  return dedupeLevels(exactActivityItems.flatMap((item) => item.levels))
}

function dedupeLevels(levels: GraduationCatalogLevel[]) {
  const map = new Map<string, GraduationCatalogLevel>()

  for (const level of levels) {
    const key = `${level.name.trim().toLowerCase()}::${level.stripes}`
    if (!map.has(key)) {
      map.set(key, level)
    }
  }

  return Array.from(map.values()).sort((left, right) => left.order - right.order)
}
