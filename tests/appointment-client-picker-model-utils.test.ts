import { expect, test } from '@playwright/test'

import type { Client } from 'components/data/models'
import {
  filterAppointmentPickerClients,
  formatAppointmentPickerLastVisitLabel,
} from 'components/appointments/clientPicker/modelUtils'

const clients: Client[] = [
  {
    id: 'c-2',
    name: 'Marco Vale',
    email: 'marco@example.com',
    phone: '5552222',
    createdAt: '2026-01-01',
    lastVisit: '2026-03-01',
    type: 'Color',
    revenueYtd: 0,
    tag: 'Highlights',
    status: 'Active',
    notes: '',
  },
  {
    id: 'c-1',
    name: 'Avery Stone',
    email: 'avery@example.com',
    phone: '5551111',
    createdAt: '2026-01-01',
    lastVisit: '2026-03-07',
    type: 'Cut & Color',
    revenueYtd: 0,
    tag: 'Loyal',
    status: 'Active',
    notes: '',
  },
]

test('appointment client picker filters and sorts clients deterministically', async () => {
  expect(filterAppointmentPickerClients(clients, '').map((client) => client.name)).toEqual([
    'Avery Stone',
    'Marco Vale',
  ])
  expect(filterAppointmentPickerClients(clients, 'mar').map((client) => client.id)).toEqual([
    'c-2',
  ])
  expect(filterAppointmentPickerClients(clients, 'loyal').map((client) => client.id)).toEqual([
    'c-1',
  ])
})

test('appointment client picker last-visit formatter preserves empty sentinel values', async () => {
  expect(
    formatAppointmentPickerLastVisitLabel('No visits yet', {
      dateDisplayFormat: 'short',
      dateLongIncludeWeekday: true,
    })
  ).toBe('No visits yet')
  expect(
    formatAppointmentPickerLastVisitLabel('—', {
      dateDisplayFormat: 'short',
      dateLongIncludeWeekday: true,
    })
  ).toBe('No visits yet')
  expect(
    formatAppointmentPickerLastVisitLabel('2026-03-07', {
      dateDisplayFormat: 'short',
      dateLongIncludeWeekday: true,
    })
  ).toBe('03/07/2026')
})
