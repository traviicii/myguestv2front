import type { AppointmentDateFormat, AvgTicketRange, PhotoCoverageRange } from 'components/state/studioStore'

import type {
  Option,
  OverviewSectionOption,
  PrivacyHighlight,
} from './settingsModelTypes'

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

// Keep the user-facing trust copy centralized so onboarding, settings, and
// release documentation stay aligned when the product surface changes.
export const privacyHighlights: PrivacyHighlight[] = [
  {
    title: 'What MyGuest stores',
    body:
      'Your sign-in identity, client contact details, notes, appointment history, color-chart records, and any appointment photos you choose to attach.',
  },
  {
    title: 'What exports include',
    body:
      'Export My Data creates a ZIP of CSV files for clients, services, appointment logs, and color-chart data.',
  },
  {
    title: 'What exports leave out',
    body:
      'Appointment images are not included in exports. They stay attached to appointments inside MyGuest until you remove them or delete your account.',
  },
  {
    title: 'What account deletion does',
    body:
      'Deleting your account permanently removes your hosted data and signs you out immediately. This action cannot be undone.',
  },
]
