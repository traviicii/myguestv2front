import { expect, test } from '@playwright/test'

import {
  addWeeks,
  buildQuickLogFollowUpMessage,
  filterQuickLogClients,
  parseQuickLogDateInput,
  resolveQuickLogDefaultFollowUpDate,
  resolveQuickLogNextServiceId,
} from 'components/quick-log/modelUtils'

test('quick log helpers parse dates and derive the default follow-up date', async () => {
  expect(parseQuickLogDateInput('03/13/2026')?.toISOString()).toContain('2026-03-13')
  expect(parseQuickLogDateInput('2026-03-13')?.toISOString()).toContain('2026-03-13')
  expect(parseQuickLogDateInput('')).toBeNull()
  expect(addWeeks(new Date('2026-03-13T12:00:00.000Z'), 6).toISOString()).toContain(
    '2026-04-24'
  )
  expect(resolveQuickLogDefaultFollowUpDate('03/13/2026')).toBe('04/24/2026')
})

test('quick log helpers build follow-up messages and filter clients', async () => {
  expect(buildQuickLogFollowUpMessage('Avery Stone', 'sms')).toContain('Hi Avery')
  expect(buildQuickLogFollowUpMessage('Avery Stone', 'email')).toContain('Let me know')

  expect(
    filterQuickLogClients(
      [
        { name: 'Avery Stone', email: 'avery@example.com', phone: '111' },
        { name: 'Marco Vale', email: 'marco@example.com', phone: '222' },
      ],
      'avery',
      'avery'
    )
  ).toEqual([{ name: 'Avery Stone', email: 'avery@example.com', phone: '111' }])
})

test('quick log helpers resolve the next service id from recent history', async () => {
  expect(
    resolveQuickLogNextServiceId(
      { serviceIds: [7], services: 'Balayage' },
      [{ id: 7, normalizedName: 'balayage' }]
    )
  ).toBe(7)

  expect(
    resolveQuickLogNextServiceId(
      { services: 'Single Process' },
      [
        { id: 3, normalizedName: 'cut' },
        { id: 5, normalizedName: 'single process' },
      ]
    )
  ).toBe(5)
})
