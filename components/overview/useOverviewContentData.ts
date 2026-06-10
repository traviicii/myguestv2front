import { useMemo } from 'react'

import type { OverviewMetrics } from 'components/data/api/metrics'
import type { ServiceOption } from 'components/data/api/services'
import type { AppointmentHistory, Client } from 'components/data/models'
import type { OverviewSectionId } from 'components/state/studioStore'
import { buildClientMap, deriveLastVisitByClient } from 'components/utils/clientDerived'

import type { OverviewMetricCard, OverviewQuickAction } from './overviewModelTypes'
import {
  buildOverviewMetricCards,
  buildOverviewAttentionCards,
  buildTodayAppointments,
  buildRecentClients,
  buildRecentHistory,
  getEnabledQuickActions,
  getPinnedClients,
  getQuickActionLayout,
  getVisibleSections,
} from './overviewModelUtils'

export function useOverviewContentData({
  appSettings,
  clients,
  appointmentHistory,
  serviceCatalog,
  overviewMetrics,
  orderedQuickActions,
  pinnedClientIds,
  sectionOrder,
}: {
  appSettings: {
    dateDisplayFormat: 'short' | 'long'
    dateLongIncludeWeekday: boolean
    overviewQuickActions: Record<string, boolean>
    overviewRecentAppointmentsCount: number
    overviewRecentClientsCount: number
    overviewSections: Record<OverviewSectionId, boolean>
  }
  clients: Client[]
  appointmentHistory: AppointmentHistory[]
  serviceCatalog: ServiceOption[]
  overviewMetrics: OverviewMetrics | null | undefined
  orderedQuickActions: OverviewQuickAction[]
  pinnedClientIds: string[]
  sectionOrder: OverviewSectionId[]
}) {
  const derivedLastVisitByClient = useMemo(
    () => deriveLastVisitByClient(appointmentHistory),
    [appointmentHistory]
  )

  const recentClients = useMemo(
    () => buildRecentClients(clients, appSettings.overviewRecentClientsCount),
    [appSettings.overviewRecentClientsCount, clients]
  )

  const recentHistory = useMemo(
    () => buildRecentHistory(appointmentHistory, appSettings.overviewRecentAppointmentsCount),
    [appSettings.overviewRecentAppointmentsCount, appointmentHistory]
  )

  const todayAppointments = useMemo(
    () => buildTodayAppointments({ appointmentHistory, clients }),
    [appointmentHistory, clients]
  )

  const clientMap = useMemo(() => buildClientMap(clients), [clients])
  const isEmptyAccount = clients.length === 0 && appointmentHistory.length === 0

  const metrics = useMemo<OverviewMetricCard[]>(
    () => buildOverviewMetricCards(overviewMetrics, clients.length),
    [clients.length, overviewMetrics]
  )

  const attentionCards = useMemo(
    () =>
      buildOverviewAttentionCards({
        appSettings,
        appointmentHistory,
        clients,
        serviceCatalog,
      }),
    [
      appSettings,
      appointmentHistory,
      clients,
      serviceCatalog,
    ]
  )

  const enabledQuickActions = useMemo(
    () => getEnabledQuickActions(orderedQuickActions, appSettings.overviewQuickActions),
    [appSettings.overviewQuickActions, orderedQuickActions]
  )

  const {
    quickActionColumns,
    quickActionGap,
    quickActionGridHeight,
    quickActionItemSize,
    shouldCenterQuickActionRow,
  } = useMemo(
    () => getQuickActionLayout(enabledQuickActions.length),
    [enabledQuickActions.length]
  )

  const pinnedClients = useMemo(
    () => getPinnedClients(clients, pinnedClientIds),
    [clients, pinnedClientIds]
  )

  const visibleSections = useMemo(
    () => getVisibleSections(sectionOrder, appSettings.overviewSections),
    [appSettings.overviewSections, sectionOrder]
  )

  return {
    clientMap,
    derivedLastVisitByClient,
    enabledQuickActions,
    isEmptyAccount,
    attentionCards,
    metrics,
    pinnedClients,
    quickActionColumns,
    quickActionGap,
    quickActionGridHeight,
    quickActionItemSize,
    recentClients,
    recentHistory,
    shouldCenterQuickActionRow,
    todayAppointments,
    visibleSections,
  }
}
