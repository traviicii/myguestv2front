import type { ThemeAesthetic } from 'components/ThemePrefs'
import type { ServiceOption } from 'components/data/api/services'

import type {
  SettingsCardTone,
  SettingsDisplayCounts,
  SettingsDisplayRow,
} from './settingsModelTypes'

export function getSettingsCardTone(aesthetic: ThemeAesthetic): SettingsCardTone {
  return aesthetic === 'glass' ? 'secondary' : 'default'
}

export function sortActiveServices(serviceCatalog: ServiceOption[]) {
  return serviceCatalog
    .filter((service) => service.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

export function sortInactiveServices(serviceCatalog: ServiceOption[]) {
  return serviceCatalog
    .filter((service) => !service.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function buildDisplayRows(appSettings: SettingsDisplayCounts): SettingsDisplayRow[] {
  return [
    {
      id: 'overviewRecentAppointmentsCount',
      label: 'Recent appointments',
      help: 'How many recent appointment logs are shown on the Overview screen.',
      value: appSettings.overviewRecentAppointmentsCount,
    },
    {
      id: 'overviewRecentClientsCount',
      label: 'Recent clients',
      help: 'How many recent clients are shown on the Overview screen.',
      value: appSettings.overviewRecentClientsCount,
    },
    {
      id: 'clientDetailsAppointmentLogsCount',
      label: 'Client details appointment logs',
      help: 'How many appointment logs are previewed on each client details screen.',
      value: appSettings.clientDetailsAppointmentLogsCount,
    },
  ]
}

export function clampPreviewCount(currentValue: number, delta: number) {
  return Math.min(12, Math.max(1, currentValue + delta))
}

export function removeDraftEntry(drafts: Record<number, string>, serviceId: number) {
  const next = { ...drafts }
  delete next[serviceId]
  return next
}

export function formatPriceInput(value: number | null | undefined) {
  if (value === null || value === undefined) return ''
  const formatted = (value / 100).toFixed(2)
  return formatted.replace(/\.00$/, '')
}

export function parsePriceInputToCents(value: string): number | null | undefined {
  const trimmed = value.trim()
  if (!trimmed) return null
  const normalized = trimmed.replace(/[$,\s]/g, '')
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return undefined
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return undefined
  return Math.round(parsed * 100)
}
