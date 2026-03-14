import type { Client } from 'components/data/models'
import type { AppSettings } from 'components/state/studioStoreTypes'
import { formatDateByStyle } from 'components/utils/date'

export function filterAppointmentPickerClients(
  clients: Client[],
  searchText: string
) {
  const normalized = searchText.trim().toLowerCase()
  const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name))

  if (!normalized) {
    return sortedClients
  }

  return sortedClients.filter((client) => {
    const haystack = [client.name, client.email, client.phone, client.tag]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalized)
  })
}

export function formatAppointmentPickerLastVisitLabel(
  value: string,
  appSettings: Pick<AppSettings, 'dateDisplayFormat' | 'dateLongIncludeWeekday'>
) {
  if (!value || value === 'No visits yet' || value === '—') {
    return 'No visits yet'
  }

  return formatDateByStyle(value, appSettings.dateDisplayFormat, {
    todayLabel: true,
    includeWeekday: appSettings.dateLongIncludeWeekday,
  })
}
