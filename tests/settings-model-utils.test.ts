import { expect, test } from '@playwright/test'

import {
  buildDisplayRows,
  clampPreviewCount,
  formatPriceInput,
  getSettingsCardTone,
  parsePriceInputToCents,
} from '../components/settings/settingsModelUtils'

test('settings helper formatting round-trips supported price inputs', () => {
  expect(parsePriceInputToCents('95')).toBe(9500)
  expect(parsePriceInputToCents('95.5')).toBe(9550)
  expect(parsePriceInputToCents('95.50')).toBe(9550)
  expect(parsePriceInputToCents('')).toBeNull()
  expect(formatPriceInput(9550)).toBe('95.50')
  expect(formatPriceInput(9500)).toBe('95')
  expect(formatPriceInput(null)).toBe('')
})

test('settings helpers reject invalid price values and clamp preview counts', () => {
  expect(parsePriceInputToCents('-1')).toBeUndefined()
  expect(parsePriceInputToCents('12.345')).toBeUndefined()
  expect(parsePriceInputToCents('abc')).toBeUndefined()
  expect(clampPreviewCount(1, -3)).toBe(1)
  expect(clampPreviewCount(12, 4)).toBe(12)
  expect(clampPreviewCount(5, 2)).toBe(7)
})

test('settings helpers build display rows and resolve card tones', () => {
  expect(getSettingsCardTone('glass')).toBe('secondary')
  expect(getSettingsCardTone('modern')).toBe('default')

  expect(
    buildDisplayRows({
      clientDetailsAppointmentLogsCount: 4,
      overviewRecentAppointmentsCount: 6,
      overviewRecentClientsCount: 3,
    })
  ).toEqual([
    {
      id: 'overviewRecentAppointmentsCount',
      label: 'Recent appointments',
      help: 'How many recent appointment logs are shown on the Overview screen.',
      value: 6,
    },
    {
      id: 'overviewRecentClientsCount',
      label: 'Recent clients',
      help: 'How many recent clients are shown on the Overview screen.',
      value: 3,
    },
    {
      id: 'clientDetailsAppointmentLogsCount',
      label: 'Client details appointment logs',
      help: 'How many appointment logs are previewed on each client details screen.',
      value: 4,
    },
  ])
})
