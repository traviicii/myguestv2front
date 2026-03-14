import type { ThemeAesthetic } from 'components/ThemePrefs'
import type { OverviewMetrics } from 'components/data/api/metrics'
import type { AppointmentHistory, Client } from 'components/data/models'
import type { AppSettings, OverviewSectionId, QuickActionId } from 'components/state/studioStore'
import { sortClientsByNewest } from 'components/utils/clientSort'
import { formatDateByStyle } from 'components/utils/date'

import type { OverviewMetricCard, OverviewQuickAction } from './overviewModelTypes'

const QUICK_ACTION_COLUMNS = 2
const QUICK_ACTION_ITEM_SIZE = 148
const QUICK_ACTION_GAP = 12

export function buildOverviewAppearance(aesthetic: ThemeAesthetic) {
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'

  return {
    actionCardRadius: isCyberpunk ? 0 : isGlass ? 52 : 999,
    controlRadius: isCyberpunk ? 0 : isGlass ? 20 : 10,
    iconBadgeRadius: isCyberpunk ? 0 : isGlass ? 16 : 10,
    isCyberpunk,
    isGlass,
    sectionCardRadius: isCyberpunk ? 0 : isGlass ? 24 : 14,
  }
}

export function formatOverviewLastVisitLabel(
  value: string,
  appSettings: Pick<AppSettings, 'dateDisplayFormat' | 'dateLongIncludeWeekday'>
) {
  if (!value || value === 'No visits yet' || value === '—') return 'No visits yet'

  return formatDateByStyle(value, appSettings.dateDisplayFormat, {
    todayLabel: true,
    includeWeekday: appSettings.dateLongIncludeWeekday,
  })
}

export function resolveOverviewLastVisit(
  clientId: string,
  fallback: string,
  lastVisitByClient: Record<string, string>
) {
  return lastVisitByClient[clientId] ?? fallback
}

export function buildRecentClients(clients: Client[], count: number) {
  return sortClientsByNewest(clients).slice(0, count)
}

export function buildRecentHistory(history: AppointmentHistory[], count: number) {
  return [...history]
    .filter((entry) => entry.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

export function buildOverviewCutoffs(
  appSettings: Pick<AppSettings, 'activeStatusMonths' | 'avgTicketRange' | 'photoCoverageRange'>
) {
  const activeCutoff = new Date()
  activeCutoff.setMonth(activeCutoff.getMonth() - appSettings.activeStatusMonths)

  const yearStart = new Date(new Date().getFullYear(), 0, 1)

  const avgTicketCutoff = (() => {
    if (appSettings.avgTicketRange === 'allTime') return null
    const months = Number(appSettings.avgTicketRange.replace('m', ''))
    if (!Number.isFinite(months) || months <= 0) return null
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - months)
    return cutoff.toISOString()
  })()

  const photoCutoff = (() => {
    const cutoffMonths =
      appSettings.photoCoverageRange === '6m'
        ? 6
        : appSettings.photoCoverageRange === '12m'
          ? 12
          : null
    if (!cutoffMonths) return null
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - cutoffMonths)
    return cutoff.toISOString()
  })()

  const newClientsCutoff = new Date()
  newClientsCutoff.setDate(newClientsCutoff.getDate() - 90)

  return {
    activeCutoff: activeCutoff.toISOString(),
    avgTicketCutoff,
    newClientsCutoff: newClientsCutoff.toISOString(),
    photoCutoff,
    yearStart: yearStart.toISOString(),
  }
}

export function buildOverviewMetricCards(
  overviewMetrics: OverviewMetrics | null | undefined,
  totalClients: number
): OverviewMetricCard[] {
  const resolved = overviewMetrics ?? {
    revenueYtd: 0,
    avgTicket: 0,
    totalClients,
    activeClients: 0,
    inactiveClients: Math.max(totalClients, 0),
    newClients90: 0,
    serviceMixLabel: '',
    serviceMixPercent: 0,
    colorCoveragePercent: 0,
    photoCoveragePercent: 0,
  }

  const serviceMix = resolved.serviceMixLabel
    ? `${resolved.serviceMixLabel} (${resolved.serviceMixPercent}%)`
    : '—'

  return [
    {
      id: 'revenueYtd',
      label: 'Revenue (YTD)',
      value: `$${resolved.revenueYtd.toFixed(0)}`,
    },
    { id: 'totalClients', label: 'Total Clients', value: `${resolved.totalClients}` },
    { id: 'activeClients', label: 'Active Clients', value: `${resolved.activeClients}` },
    { id: 'inactiveClients', label: 'Inactive Clients', value: `${resolved.inactiveClients}` },
    { id: 'avgTicket', label: 'Average Ticket', value: `$${resolved.avgTicket.toFixed(0)}` },
    { id: 'newClients90', label: 'New Clients (90d)', value: `${resolved.newClients90}` },
    { id: 'serviceMix', label: 'Top Service Mix', value: serviceMix },
    {
      id: 'colorCoverage',
      label: 'Color Chart Coverage',
      value: `${resolved.colorCoveragePercent}%`,
    },
    {
      id: 'photoCoverage',
      label: 'Photo Coverage (Logs)',
      value: `${resolved.photoCoveragePercent}%`,
    },
  ]
}


export function getEnabledQuickActions(
  orderedQuickActions: OverviewQuickAction[],
  enabledActions: Record<QuickActionId, boolean>
) {
  return orderedQuickActions.filter((action) => enabledActions[action.id])
}

export function getQuickActionLayout(enabledQuickActionCount: number) {
  const rows = Math.max(1, Math.ceil(enabledQuickActionCount / QUICK_ACTION_COLUMNS))

  return {
    quickActionColumns: QUICK_ACTION_COLUMNS,
    quickActionGap: QUICK_ACTION_GAP,
    quickActionGridHeight:
      enabledQuickActionCount > 0
        ? rows * QUICK_ACTION_ITEM_SIZE + QUICK_ACTION_GAP * (rows - 1)
        : 0,
    quickActionItemSize: QUICK_ACTION_ITEM_SIZE,
    shouldCenterQuickActionRow: enabledQuickActionCount % QUICK_ACTION_COLUMNS !== 0,
  }
}

export function getPinnedClients(clients: Client[], pinnedClientIds: string[]) {
  if (!pinnedClientIds.length) return []
  return clients.filter((client) => pinnedClientIds.includes(client.id))
}

export function getVisibleSections(
  sectionOrder: OverviewSectionId[],
  overviewSections: Record<OverviewSectionId, boolean>
) {
  return sectionOrder.filter((id) => overviewSections[id])
}
