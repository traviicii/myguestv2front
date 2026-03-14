import { useMemo } from 'react'

import type { OverviewMetrics } from 'components/data/api/metrics'
import type { AppointmentHistory, Client } from 'components/data/models'
import type { OverviewSectionId } from 'components/state/studioStore'
import { buildClientMap, deriveLastVisitByClient } from 'components/utils/clientDerived'

import type { OverviewMetricCard, OverviewQuickAction } from './overviewModelTypes'
import {
  buildOverviewMetricCards,
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
  overviewMetrics,
  orderedQuickActions,
  pinnedClientIds,
  sectionOrder,
}: {
  appSettings: {
    overviewQuickActions: Record<string, boolean>
    overviewRecentAppointmentsCount: number
    overviewRecentClientsCount: number
    overviewSections: Record<OverviewSectionId, boolean>
  }
  clients: Client[]
  appointmentHistory: AppointmentHistory[]
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

  const clientMap = useMemo(() => buildClientMap(clients), [clients])
  const isEmptyAccount = clients.length === 0 && appointmentHistory.length === 0

  const metrics = useMemo<OverviewMetricCard[]>(
    () => buildOverviewMetricCards(overviewMetrics, clients.length),
    [clients.length, overviewMetrics]
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
    metrics,
    pinnedClients,
    quickActionColumns,
    quickActionGap,
    quickActionGridHeight,
    quickActionItemSize,
    recentClients,
    recentHistory,
    shouldCenterQuickActionRow,
    visibleSections,
  }
}
