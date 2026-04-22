import type { AppointmentDateFormat, AvgTicketRange, PhotoCoverageRange } from 'components/state/studioStore'

import type { Option, OverviewSectionOption } from './settingsModelTypes'

export const appointmentDateOptions: Option<AppointmentDateFormat>[] = [
  { id: 'short', label: 'MM/DD/YYYY' },
  { id: 'long', label: 'Long format' },
]

export const avgTicketOptions: Option<AvgTicketRange>[] = [
  { id: '3m', label: 'Last 3 months' },
  { id: '6m', label: 'Last 6 months' },
  { id: '12m', label: 'Last 12 months' },
  { id: '18m', label: 'Last 18 months' },
  { id: 'allTime', label: 'All time' },
]

export const photoCoverageOptions: Option<PhotoCoverageRange>[] = [
  { id: '6m', label: 'Last 6 months' },
  { id: '12m', label: 'Last 12 months' },
  { id: 'allTime', label: 'All time' },
]

export const overviewSectionOptions: OverviewSectionOption[] = [
  {
    id: 'needsAttention',
    label: 'Upcoming',
    help: 'Show follow-up timing and upcoming birthdays on Overview.',
  },
  {
    id: 'quickActions',
    label: 'Quick Actions',
    help: 'Show shortcut actions at the top of Overview.',
  },
  {
    id: 'metrics',
    label: 'Metrics',
    help: 'Show performance metrics on Overview.',
  },
  {
    id: 'recentAppointments',
    label: 'Recent Appointments',
    help: 'Show the latest appointment logs.',
  },
  {
    id: 'recentClients',
    label: 'Recently Added',
    help: 'Show the newest client records.',
  },
  {
    id: 'pinnedClients',
    label: 'Pinned',
    help: 'Show pinned client records on Overview.',
  },
]
