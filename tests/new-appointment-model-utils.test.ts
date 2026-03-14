import { expect, test } from '@playwright/test'

import {
  buildNewAppointmentCreateInput,
  buildNewAppointmentInitialForm,
  getRequiredDateScrollTarget,
  hasNewAppointmentDraftContent,
  toggleNewAppointmentServiceId,
} from 'components/appointments/new/newAppointmentModelUtils'

test('new appointment helpers build the initial form and determine draft content', async () => {
  expect(buildNewAppointmentInitialForm('03/13/2026')).toEqual({
    date: '03/13/2026',
    price: '',
    notes: '',
  })

  expect(
    hasNewAppointmentDraftContent({
      form: { date: '', price: '', notes: '' },
      selectedServiceIds: [],
      images: [],
    })
  ).toBe(false)

  expect(
    hasNewAppointmentDraftContent({
      form: { date: '03/13/2026', price: '', notes: '' },
      selectedServiceIds: [],
      images: [],
    })
  ).toBe(true)
})

test('new appointment helpers toggle services and resolve required scroll targets', async () => {
  expect(toggleNewAppointmentServiceId([1, 2], 2)).toEqual([1])
  expect(toggleNewAppointmentServiceId([1, 2], 3)).toEqual([1, 2, 3])
  expect(getRequiredDateScrollTarget(undefined)).toBeNull()
  expect(getRequiredDateScrollTarget(6)).toBe(0)
  expect(getRequiredDateScrollTarget(42)).toBe(30)
})

test('new appointment helpers build create payloads consistently', async () => {
  expect(
    buildNewAppointmentCreateInput({
      clientId: 'c-101',
      form: {
        date: '03/13/2026',
        price: '265',
        notes: 'Lived-in blonde refresh',
      },
      selectedServiceIds: [7],
      selectedServices: [{ name: 'Cut & Color' }],
      images: ['file:///one.jpg'],
    })
  ).toEqual({
    clientId: 'c-101',
    serviceIds: [7],
    serviceType: 'Cut & Color',
    notes: 'Lived-in blonde refresh',
    price: 265,
    date: '03/13/2026',
    images: [
      {
        storageProvider: 'device_local',
        publicUrl: 'file:///one.jpg',
        fileName: 'one.jpg',
      },
    ],
  })
})
