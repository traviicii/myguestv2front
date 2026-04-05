import type { ServiceOption } from 'components/data/api/services'
import type { AppointmentHistory, Client } from 'components/data/models'
import { normalizeServiceName } from 'components/utils/services'

export type RebookingStatus = 'onTrack' | 'dueThisWeek' | 'overdue'
export type RebookingCadenceSource = 'default' | 'learned'

export type RebookingRecommendation = {
  clientId: string
  latestVisitDate: string
  suggestedNextVisitDate: string
  drivingServiceId: number | null
  drivingServiceName: string
  cadenceDays: number
  cadenceWeeks: number
  source: RebookingCadenceSource
  status: RebookingStatus
  dueInDays: number
  daysOverdue: number
  statusLabel: 'On track' | 'Due this week' | 'Overdue'
  secondaryLabel: string
  basisLabel: string
}

export type BirthdayAttentionItem = {
  clientId: string
  clientName: string
  birthday: string
  nextBirthday: string
  daysUntilBirthday: number
}

type ServiceMatch = {
  id: number | null
  name: string
  normalizedName: string
  defaultReturnWeeks: number | null
}

const DAY_MS = 24 * 60 * 60 * 1000
const DUE_SOON_DAYS = 7
const BIRTHDAY_WINDOW_DAYS = 14
const MIN_LEARNED_VISITS = 3

const normalizeServiceKey = (value: string) => normalizeServiceName(value).toLowerCase()

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDate = (value: string | null | undefined) => {
  const trimmed = (value ?? '').trim()
  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/)
  if (isoDateMatch) {
    const parsed = new Date(
      Number(isoDateMatch[1]),
      Number(isoDateMatch[2]) - 1,
      Number(isoDateMatch[3])
    )
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  const parsed = trimmed ? new Date(trimmed) : new Date('')
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const diffCalendarDays = (later: Date, earlier: Date) =>
  Math.round((startOfDay(later).getTime() - startOfDay(earlier).getTime()) / DAY_MS)

const median = (values: number[]) => {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2)
  }
  return sorted[middle]
}

const toServiceMatch = (service: ServiceOption): ServiceMatch => ({
  id: service.id,
  name: service.name,
  normalizedName: normalizeServiceKey(service.name),
  defaultReturnWeeks: service.defaultReturnWeeks,
})

const dedupeServices = (services: ServiceMatch[]) => {
  const seen = new Set<string>()
  return services.filter((service) => {
    const key = service.id !== null ? `id:${service.id}` : `name:${service.normalizedName}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const buildServiceIndexes = (serviceCatalog: ServiceOption[]) => {
  const byId = new Map<number, ServiceMatch>()
  const byName = new Map<string, ServiceMatch>()

  serviceCatalog.forEach((service) => {
    const match = toServiceMatch(service)
    byId.set(service.id, match)
    byName.set(match.normalizedName, match)
  })

  return { byId, byName }
}

const getEntryServiceMatches = (
  entry: AppointmentHistory,
  indexes: ReturnType<typeof buildServiceIndexes>
) => {
  const matchedById = (entry.serviceIds ?? [])
    .map((serviceId) => indexes.byId.get(serviceId))
    .filter((service): service is ServiceMatch => Boolean(service))

  if (matchedById.length > 0) {
    return dedupeServices(matchedById)
  }

  const labels =
    entry.serviceLabels?.length && entry.serviceLabels.some((label) => label.trim())
      ? entry.serviceLabels
      : [entry.services]

  const matchedByLabel = labels
    .map((label) => indexes.byName.get(normalizeServiceKey(label)))
    .filter((service): service is ServiceMatch => Boolean(service))

  return dedupeServices(matchedByLabel)
}

const entryMatchesService = (
  entry: AppointmentHistory,
  service: ServiceMatch,
  indexes: ReturnType<typeof buildServiceIndexes>
) => {
  const matches = getEntryServiceMatches(entry, indexes)
  return matches.some((match) =>
    service.id !== null && match.id !== null
      ? match.id === service.id
      : match.normalizedName === service.normalizedName
  )
}

const buildCandidate = ({
  clientId,
  latestEntry,
  service,
  clientHistory,
  indexes,
  now,
}: {
  clientId: string
  latestEntry: AppointmentHistory
  service: ServiceMatch
  clientHistory: AppointmentHistory[]
  indexes: ReturnType<typeof buildServiceIndexes>
  now: Date
}): RebookingRecommendation | null => {
  const latestVisit = parseDate(latestEntry.date)
  if (!latestVisit) return null

  const matchingDates = clientHistory
    .filter((entry) => entryMatchesService(entry, service, indexes))
    .map((entry) => parseDate(entry.date))
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => left.getTime() - right.getTime())

  let cadenceDays: number | null = null
  let source: RebookingCadenceSource | null = null

  if (matchingDates.length >= MIN_LEARNED_VISITS) {
    const intervals: number[] = []
    for (let index = 1; index < matchingDates.length; index += 1) {
      intervals.push(diffCalendarDays(matchingDates[index], matchingDates[index - 1]))
    }
    const learnedCadence = intervals.filter((interval) => interval > 0)
    if (learnedCadence.length > 0) {
      cadenceDays = median(learnedCadence)
      source = 'learned'
    }
  }

  if (cadenceDays === null && service.defaultReturnWeeks) {
    cadenceDays = service.defaultReturnWeeks * 7
    source = 'default'
  }

  if (cadenceDays === null || source === null) {
    return null
  }

  const suggestedNextVisit = startOfDay(addDays(latestVisit, cadenceDays))
  const today = startOfDay(now)
  const dueInDays = diffCalendarDays(suggestedNextVisit, today)
  const daysOverdue = dueInDays < 0 ? Math.abs(dueInDays) : 0

  const status: RebookingStatus =
    dueInDays < 0 ? 'overdue' : dueInDays <= DUE_SOON_DAYS ? 'dueThisWeek' : 'onTrack'

  const statusLabel =
    status === 'overdue' ? 'Overdue' : status === 'dueThisWeek' ? 'Due this week' : 'On track'

  const secondaryLabel =
    status === 'overdue'
      ? `Overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`
      : dueInDays === 0
        ? 'Due today'
        : status === 'dueThisWeek'
          ? `Due in ${dueInDays} day${dueInDays === 1 ? '' : 's'}`
          : `Recommended in ${dueInDays} day${dueInDays === 1 ? '' : 's'}`

  const basisLabel =
    source === 'learned'
      ? `Based on this client's recent ${service.name} rhythm`
      : `Based on your default ${service.name} cadence`

  return {
    clientId,
    latestVisitDate: formatIsoDate(startOfDay(latestVisit)),
    suggestedNextVisitDate: formatIsoDate(suggestedNextVisit),
    drivingServiceId: service.id,
    drivingServiceName: service.name,
    cadenceDays,
    cadenceWeeks: Math.max(1, Math.round(cadenceDays / 7)),
    source,
    status,
    dueInDays,
    daysOverdue,
    statusLabel,
    secondaryLabel,
    basisLabel,
  }
}

export function buildRebookingRecommendationForClient({
  clientId,
  appointmentHistory,
  serviceCatalog,
  now = new Date(),
}: {
  clientId: string
  appointmentHistory: AppointmentHistory[]
  serviceCatalog: ServiceOption[]
  now?: Date
}) {
  const clientHistory = appointmentHistory
    .filter((entry) => entry.clientId === clientId)
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())

  const latestEntry = clientHistory[0]
  if (!latestEntry) return null

  const indexes = buildServiceIndexes(serviceCatalog)
  const latestServices = getEntryServiceMatches(latestEntry, indexes)
  if (latestServices.length === 0) return null

  const candidates = latestServices
    .map((service) =>
      buildCandidate({
        clientId,
        latestEntry,
        service,
        clientHistory,
        indexes,
        now,
      })
    )
    .filter((candidate): candidate is RebookingRecommendation => Boolean(candidate))
    .sort(
      (left, right) =>
        new Date(left.suggestedNextVisitDate).getTime() -
        new Date(right.suggestedNextVisitDate).getTime()
    )

  return candidates[0] ?? null
}

export function buildRebookingRecommendationMap({
  appointmentHistory,
  clients,
  serviceCatalog,
  now = new Date(),
}: {
  appointmentHistory: AppointmentHistory[]
  clients: Client[]
  serviceCatalog: ServiceOption[]
  now?: Date
}) {
  const clientIds = new Set([
    ...clients.map((client) => client.id),
    ...appointmentHistory.map((entry) => entry.clientId),
  ])

  return Array.from(clientIds).reduce<Record<string, RebookingRecommendation>>((acc, clientId) => {
    const recommendation = buildRebookingRecommendationForClient({
      clientId,
      appointmentHistory,
      serviceCatalog,
      now,
    })
    if (recommendation) {
      acc[clientId] = recommendation
    }
    return acc
  }, {})
}

const buildBirthdayDate = (month: number, day: number, year: number) => {
  if (month === 2 && day === 29) {
    const leap = new Date(year, 1, 29)
    if (leap.getMonth() !== 1) {
      return new Date(year, 1, 28)
    }
  }
  return new Date(year, month - 1, day)
}

export function getUpcomingBirthdays(clients: Client[], now = new Date()) {
  const today = startOfDay(now)

  return clients
    .map((client) => {
      const birthday = parseDate(client.birthday ?? '')
      if (!birthday) return null

      const month = birthday.getMonth() + 1
      const day = birthday.getDate()
      let nextBirthday = startOfDay(buildBirthdayDate(month, day, today.getFullYear()))
      if (nextBirthday.getTime() < today.getTime()) {
        nextBirthday = startOfDay(buildBirthdayDate(month, day, today.getFullYear() + 1))
      }
      const daysUntilBirthday = diffCalendarDays(nextBirthday, today)
      if (daysUntilBirthday < 0 || daysUntilBirthday > BIRTHDAY_WINDOW_DAYS) {
        return null
      }

      return {
        clientId: client.id,
        clientName: client.name,
        birthday: client.birthday as string,
        nextBirthday: formatIsoDate(nextBirthday),
        daysUntilBirthday,
      } satisfies BirthdayAttentionItem
    })
    .filter((item): item is BirthdayAttentionItem => Boolean(item))
    .sort((left, right) => left.daysUntilBirthday - right.daysUntilBirthday)
}

export function buildRebookingAttentionLists({
  rebookingByClient,
  clients,
  now = new Date(),
}: {
  rebookingByClient: Record<string, RebookingRecommendation>
  clients: Client[]
  now?: Date
}) {
  const today = startOfDay(now)
  const dueSoonCutoff = addDays(today, DUE_SOON_DAYS)

  const recommendations = Object.values(rebookingByClient)

  const dueThisWeek = recommendations
    .filter((item) => {
      const suggested = startOfDay(new Date(item.suggestedNextVisitDate))
      return suggested.getTime() >= today.getTime() && suggested.getTime() <= dueSoonCutoff.getTime()
    })
    .sort((left, right) => left.dueInDays - right.dueInDays)

  const overdue = recommendations
    .filter((item) => item.status === 'overdue')
    .sort((left, right) => right.daysOverdue - left.daysOverdue)

  const birthdays = getUpcomingBirthdays(clients, now)

  return { dueThisWeek, overdue, birthdays }
}
