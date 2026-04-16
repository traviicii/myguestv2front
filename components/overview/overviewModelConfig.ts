import type { OverviewSectionId } from 'components/state/studioStore'

export const overviewSectionLabels: Record<OverviewSectionId, string> = {
  needsAttention: 'Upcoming',
  quickActions: 'Quick Actions',
  metrics: 'Metrics',
  pinnedClients: 'Pinned',
  recentAppointments: 'Recent Appointments',
  recentClients: 'Recently Added',
}
