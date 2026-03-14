import { expect, test } from '@playwright/test'

import {
  clampPreviewCount,
  defaultAppSettings,
  defaultStudioPreferences,
  defaultStudioProfile,
  mergeStudioStoreState,
  normalizeQuickActionOrder,
} from '../components/state/studioStoreConfig'
import type { StudioStore } from '../components/state/studioStore'

const createCurrentStore = (): StudioStore => ({
  profile: defaultStudioProfile,
  preferences: defaultStudioPreferences,
  appSettings: defaultAppSettings,
  pinnedClientIds: [],
  onboardingComplete: false,
  setProfile: () => {},
  setPreferences: () => {},
  setAppSettings: () => {},
  setQuickActionEnabled: () => {},
  setQuickActionOrder: () => {},
  togglePinnedClient: () => {},
  setOnboardingComplete: () => {},
})

test('normalizeQuickActionOrder keeps known actions unique and appends missing defaults', () => {
  expect(normalizeQuickActionOrder(['newTextAlert', 'newClient', 'newClient'])).toEqual([
    'newTextAlert',
    'newClient',
    'newAppointmentLog',
    'newEmailAlert',
  ])
})

test('mergeStudioStoreState migrates legacy settings and clamps preview counts', () => {
  const merged = mergeStudioStoreState(
    {
      appSettings: {
        appointmentDetailDateFormat: 'long',
        overviewRecentAppointmentsCount: 99,
        overviewRecentClientsCount: 0,
        clientDetailsAppointmentLogsCount: 2.4,
        overviewQuickActionOrder: ['newTextAlert'],
        avgTicketRange: 'activeWindow',
        activeStatusMonths: 6,
      },
      pinnedClientIds: ['c-101'],
    },
    createCurrentStore()
  )

  expect(merged.appSettings.dateDisplayFormat).toBe('long')
  expect(merged.appSettings.overviewRecentAppointmentsCount).toBe(12)
  expect(merged.appSettings.overviewRecentClientsCount).toBe(1)
  expect(merged.appSettings.clientDetailsAppointmentLogsCount).toBe(2)
  expect(merged.appSettings.overviewQuickActionOrder).toEqual([
    'newTextAlert',
    'newClient',
    'newAppointmentLog',
    'newEmailAlert',
  ])
  expect(merged.appSettings.avgTicketRange).toBe('6m')
  expect(merged.pinnedClientIds).toEqual(['c-101'])
  expect(clampPreviewCount(undefined, 3)).toBe(3)
})
