import { type OverviewSectionId } from 'components/state/studioStore'

import { OverviewLayoutItem } from './OverviewLayoutItem'
import { OverviewMetricsSection } from './OverviewMetricsSection'
import { OverviewPinnedClientsSection } from './OverviewPinnedClientsSection'
import { OverviewQuickActionsSection } from './OverviewQuickActionsSection'
import {
  OverviewRecentAppointmentsSection,
  OverviewRecentClientsSection,
} from './OverviewRecentSections'
import type { Navigate } from './sectionTypes'
import type { OverviewScreenModel } from './useOverviewScreenModel'

export { OverviewLayoutItem }

export function OverviewSectionRenderer({
  sectionId,
  model,
  onNavigate,
}: {
  sectionId: OverviewSectionId
  model: OverviewScreenModel
  onNavigate: Navigate
}) {
  if (sectionId === 'quickActions') {
    return <OverviewQuickActionsSection model={model} onNavigate={onNavigate} />
  }

  if (sectionId === 'metrics') {
    return <OverviewMetricsSection model={model} />
  }

  if (sectionId === 'pinnedClients') {
    return <OverviewPinnedClientsSection model={model} />
  }

  if (sectionId === 'recentAppointments') {
    return <OverviewRecentAppointmentsSection model={model} onNavigate={onNavigate} />
  }

  if (sectionId === 'recentClients') {
    return <OverviewRecentClientsSection model={model} onNavigate={onNavigate} />
  }

  return null
}
