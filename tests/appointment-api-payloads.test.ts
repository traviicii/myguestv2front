import { expect, test } from '@playwright/test'

import {
  buildCreateFormulaPayload,
  buildFormulaServicePayload,
  buildUpdateFormulaPayload,
  toFormulaClientId,
  toFormulaId,
  toServiceAtIso,
} from '../components/data/api/appointmentApiPayloads'

test('appointment api payload helpers normalize ids and dates', () => {
  expect(toFormulaClientId('12')).toBe('12')
  expect(toFormulaId('h-42')).toBe(42)
  expect(toServiceAtIso('03/14/2026')).toBe('2026-03-14T00:00:00Z')
  expect(toServiceAtIso('2026-03-14')).toBe('2026-03-14T00:00:00Z')
})

test('appointment api payload helpers reject invalid ids and preserve valid service payloads', () => {
  expect(() => toFormulaClientId('')).toThrow('Invalid client id.')
  expect(() => toFormulaId('abc')).toThrow('Invalid appointment id.')
  expect(() => toServiceAtIso('bad-date')).toThrow('Invalid appointment date format.')

  expect(buildFormulaServicePayload([2, 4], 'Gloss')).toEqual({
    service_ids: [2, 4],
    service_type: 'Gloss',
  })
  expect(buildFormulaServicePayload([], 'Service')).toEqual({
    service_ids: [],
  })
  expect(buildFormulaServicePayload(undefined, 'Balayage')).toEqual({
    service_type: 'Balayage',
  })
})

test('appointment api payload helpers build create and update payloads', () => {
  expect(
    buildCreateFormulaPayload({
      clientId: '12',
      serviceIds: [7],
      serviceType: 'Gloss',
      notes: '  note  ',
      price: 95.5,
      date: '03/14/2026',
      images: [
        {
          storageProvider: 'firebase',
          publicUrl: 'https://example.com/one.jpg',
          fileName: 'one.jpg',
        },
      ],
    })
  ).toEqual({
    service_ids: [7],
    service_type: 'Gloss',
    notes: 'note',
    price_cents: 9550,
    service_at: '2026-03-14T00:00:00Z',
    images: [
      {
        storage_provider: 'firebase',
        public_url: 'https://example.com/one.jpg',
        object_key: null,
        file_name: 'one.jpg',
      },
    ],
  })

  expect(
    buildUpdateFormulaPayload({
      formulaId: 'h-7',
      serviceIds: [],
      serviceType: 'Service',
      notes: '  ',
      price: null,
      date: '2026-03-14',
      images: [],
    })
  ).toEqual({
    service_ids: [],
    notes: null,
    price_cents: null,
    service_at: '2026-03-14T00:00:00Z',
    images: [],
  })
})
