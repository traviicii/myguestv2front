export type PrivacyHighlight = {
  title: string
  body: string
}

export const privacySummary =
  'MyGuest stores your sign-in identity, client contact details, notes, appointment history, color-chart data, and optional appointment photos.'

// Keep trust copy centralized so Settings, onboarding, and the dedicated
// Data & Privacy Center all describe the same product behavior.
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
