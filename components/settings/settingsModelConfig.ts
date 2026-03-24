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
    id: 'quickActions',
    label: 'Quick Actions',
    help: 'Show the quick action buttons at the top of Overview.',
  },
  {
    id: 'metrics',
    label: 'Metrics',
    help: 'Show the metrics tiles section.',
  },
  {
    id: 'recentAppointments',
    label: 'Recent Appointments',
    help: 'Show the most recent appointment logs.',
  },
  {
    id: 'recentClients',
    label: 'Recent Clients',
    help: 'Show recently added or visited clients.',
  },
  {
    id: 'pinnedClients',
    label: 'Pinned Clients',
    help: 'Show your pinned client list on Overview.',
  },
]
