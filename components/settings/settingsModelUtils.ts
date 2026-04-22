import type { ThemeAesthetic } from 'components/ThemePrefs'
import type { ServiceOption } from 'components/data/api/services'
import type { AppSettings } from 'components/state/studioStore'

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
      help: 'Number of appointment logs shown before Full History.',
      value: appSettings.overviewRecentAppointmentsCount,
    },
    {
      id: 'overviewRecentClientsCount',
      label: 'Recently added',
      help: 'Number of newly added clients shown before View All.',
      value: appSettings.overviewRecentClientsCount,
    },
    {
      id: 'clientDetailsAppointmentLogsCount',
      label: 'Client timeline preview',
      help: 'Number of timeline entries shown before opening the full client history.',
      value: appSettings.clientDetailsAppointmentLogsCount,
    },
  ]
}

export function clampPreviewCount(currentValue: number, delta: number) {
  return Math.min(12, Math.max(1, currentValue + delta))
}

export function buildClientDisplaySummary(appSettings: AppSettings) {
  if (!appSettings.clientsShowStatus) {
    return 'Status labels off'
  }

  return `${appSettings.activeStatusMonths} month active window`
}

export function buildOverviewInsightsSummary(params: {
  appSettings: AppSettings
  visibleSectionsCount: number
}) {
  return `${params.visibleSectionsCount} sections · ${params.appSettings.overviewRecentAppointmentsCount}/${params.appSettings.overviewRecentClientsCount}/${params.appSettings.clientDetailsAppointmentLogsCount} previews`
}

export function buildServicesLogsSummary(params: {
  activeServicesCount: number
  inactiveServicesCount: number
}) {
  return `${params.activeServicesCount} active · ${params.inactiveServicesCount} archived`
}

export function buildDatesFormattingSummary(appSettings: AppSettings) {
  if (appSettings.dateDisplayFormat === 'short') {
    return 'MM/DD/YYYY'
  }

  return appSettings.dateLongIncludeWeekday
    ? 'Long format with weekday'
    : 'Long format'
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

export function formatReturnWeeksInput(value: number | null | undefined) {
  if (value === null || value === undefined) return ''
  return String(value)
}

export function parseReturnWeeksInput(value: string): number | null | undefined {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (!/^\d+$/.test(trimmed)) return undefined
  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 52) return undefined
  return parsed
}
