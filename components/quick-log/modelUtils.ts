import { formatDateMMDDYYYY } from 'components/utils/date'
import { normalizeServiceName } from 'components/utils/services'

const pad = (value: number) => String(value).padStart(2, '0')
const FOLLOW_UP_WEEKS = 6

export type FollowUpChannel = 'sms' | 'email'

export function buildTodayLabel() {
  const date = new Date()
  return formatDateMMDDYYYY(
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  )
}

export function parseQuickLogDateInput(value: string): Date | null {
  const trimmed = (value || '').trim()
  if (!trimmed) return null

  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slashMatch) {
    const month = Number(slashMatch[1])
    const day = Number(slashMatch[2])
    const year = Number(slashMatch[3])
    return new Date(year, month - 1, day)
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const year = Number(isoMatch[1])
    const month = Number(isoMatch[2])
    const day = Number(isoMatch[3])
    return new Date(year, month - 1, day)
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed
  }

  return null
}

export function addWeeks(base: Date, weeks: number) {
  const next = new Date(base)
  next.setDate(next.getDate() + weeks * 7)
  return next
}

export function buildQuickLogFollowUpMessage(
  clientName: string,
  channel: FollowUpChannel
) {
  const firstName = clientName.split(' ')[0] || clientName
  if (channel === 'email') {
    return `Hi ${firstName},\n\nJust checking in to see if you'd like to book your next appointment. Let me know what works best for you.`
  }
  return `Hi ${firstName}, just checking in to see if you'd like to book your next appointment.`
}

export function filterQuickLogClients<T extends { name?: string | null; email?: string | null; phone?: string | null }>(
  clients: T[],
  searchText: string,
  debouncedSearchText: string
) {
  const effectiveSearch = searchText.trim() ? debouncedSearchText : searchText
  const normalized = effectiveSearch.trim().toLowerCase()
  if (!normalized) return clients

  return clients.filter((client) => {
    const haystack = [client.name, client.email, client.phone]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalized)
  })
}

export function findLastAppointmentForClient<T extends { clientId: string; date: string; serviceIds?: number[]; services?: string | null; price?: number | null }>(
  appointmentHistory: T[],
  selectedClientId: string | null
) {
  if (!selectedClientId) return null

  return appointmentHistory.reduce((latest, entry) => {
    if (entry.clientId !== selectedClientId) return latest
    if (!entry.date) return latest
    if (!latest) return entry
    return new Date(entry.date).getTime() > new Date(latest.date).getTime()
      ? entry
      : latest
  }, null as T | null)
}

export function resolveQuickLogDefaultFollowUpDate(date: string) {
  const base = parseQuickLogDateInput(date) ?? new Date()
  const due = addWeeks(base, FOLLOW_UP_WEEKS)
  return formatDateMMDDYYYY(due.toISOString())
}

export function resolveQuickLogNextServiceId<
  TAppointment extends { serviceIds?: number[]; services?: string | null },
  TService extends { id: number; normalizedName?: string | null }
>(lastAppointment: TAppointment | null, serviceOptions: TService[]) {
  if (!lastAppointment) return null

  let nextServiceId = lastAppointment.serviceIds?.[0] ?? null
  if (!nextServiceId && lastAppointment.services) {
    const normalized = normalizeServiceName(lastAppointment.services).toLowerCase()
    nextServiceId =
      serviceOptions.find((service) => service.normalizedName === normalized)?.id ?? null
  }

  return nextServiceId
}

export { FOLLOW_UP_WEEKS }
