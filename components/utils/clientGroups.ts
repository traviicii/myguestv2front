import type { Client, ClientGroup } from 'components/data/models'

export function normalizeClientGroupName(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function sortClientGroupsForDisplay<T extends Pick<ClientGroup, 'name' | 'sortOrder'>>(
  groups: T[]
) {
  return [...groups].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder
    return left.name.localeCompare(right.name)
  })
}

export function getClientGroupSummary(
  client: Pick<Client, 'groups' | 'type'>,
  { maxVisible = 2 }: { maxVisible?: number } = {}
) {
  const groups = sortClientGroupsForDisplay(client.groups ?? [])
  if (groups.length === 0) return client.type || 'Ungrouped'
  const visible = groups.slice(0, maxVisible).map((group) => group.name)
  const remaining = groups.length - visible.length
  return remaining > 0 ? `${visible.join(' + ')} +${remaining}` : visible.join(' + ')
}

export function buildLegacyClientTypeFromGroups(groups: ClientGroup[]) {
  const sortedGroups = sortClientGroupsForDisplay(groups)
  const normalized = new Set(groups.map((group) => group.normalizedName))
  if (normalized.has('cut') && normalized.has('color')) return 'Cut & Color'
  if (normalized.has('color')) return 'Color'
  if (normalized.has('cut')) return 'Cut'
  return sortedGroups[0]?.name ?? null
}

export function areClientGroupIdsEqual(left: number[], right: number[]) {
  if (left.length !== right.length) return false
  const leftSorted = [...left].sort((a, b) => a - b)
  const rightSorted = [...right].sort((a, b) => a - b)
  return leftSorted.every((value, index) => value === rightSorted[index])
}
