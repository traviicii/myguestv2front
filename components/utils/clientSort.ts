import type { Client } from 'components/mockData'

const parseTimestamp = (value?: string) => {
  if (!value) return null
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

const parseIdSequence = (id: string) => {
  const match = id.match(/(\d+)(?!.*\d)/)
  if (!match) return null
  const parsed = Number(match[1])
  return Number.isFinite(parsed) ? parsed : null
}

const getRecencyScore = (client: Client) => {
  const createdAt = parseTimestamp(client.createdAt)
  if (createdAt !== null) {
    return { tier: 3, value: createdAt }
  }

  const idSequence = parseIdSequence(client.id)
  if (idSequence !== null) {
    return { tier: 2, value: idSequence }
  }

  const lastVisit = parseTimestamp(client.lastVisit)
  if (lastVisit !== null) {
    return { tier: 1, value: lastVisit }
  }

  return { tier: 0, value: -1 }
}

export const sortClientsByNewest = (clients: Client[]) => {
  return [...clients].sort((a, b) => {
    const aScore = getRecencyScore(a)
    const bScore = getRecencyScore(b)

    if (aScore.tier !== bScore.tier) {
      return bScore.tier - aScore.tier
    }
    if (aScore.value !== bScore.value) {
      return bScore.value - aScore.value
    }
    return a.name.localeCompare(b.name)
  })
}
