import { expect, test } from '@playwright/test'

import {
  sortAppointmentsNewestFirst,
  toAppointmentModel,
} from '../components/data/api/appointmentApiMappers'

test('appointment api mapper builds appointment history with sorted services and image refs', () => {
  const appointment = toAppointmentModel({
    id: 17,
    client_id: 3,
    service_type: 'single process',
    services: [
      {
        service_id: 9,
        name: 'gloss',
        position: 1,
        label_snapshot: 'Gloss',
      },
      {
        service_id: 4,
        name: 'single process',
        position: 0,
        label_snapshot: 'Single Process',
      },
    ],
    notes: 'formula note',
    price_cents: 12500,
    service_at: '2026-03-14T00:00:00Z',
    images: [
      {
        id: 1,
        formula_id: 17,
        storage_provider: 'firebase',
        public_url: 'https://example.com/cover.jpg',
        object_key: null,
        file_name: 'cover.jpg',
      },
      {
        id: 2,
        formula_id: 17,
        storage_provider: 's3',
        public_url: null,
        object_key: 'private/key-2',
        file_name: 'second.jpg',
      },
    ],
  })

  expect(appointment).toEqual({
    id: 'h-17',
    clientId: '3',
    date: '2026-03-14T00:00:00Z',
    services: 'Single Process',
    serviceIds: [4, 9],
    serviceLabels: ['Single Process', 'Gloss'],
    price: 125,
    notes: 'formula note',
    images: ['https://example.com/cover.jpg', 'private/key-2'],
    imageRefs: [
      {
        storageProvider: 'firebase',
        publicUrl: 'https://example.com/cover.jpg',
        objectKey: null,
        fileName: 'cover.jpg',
      },
      {
        storageProvider: 's3',
        publicUrl: null,
        objectKey: 'private/key-2',
        fileName: 'second.jpg',
      },
    ],
  })
})

test('appointment api mapper falls back to normalized service type and sorts newest first', () => {
  const older = toAppointmentModel({
    id: 1,
    client_id: 1,
    service_type: 'balayage',
    notes: null,
    price_cents: null,
    service_at: '2026-03-01T00:00:00Z',
  })
  const newer = toAppointmentModel({
    id: 2,
    client_id: 1,
    service_type: null,
    notes: null,
    price_cents: null,
    service_at: '2026-03-20T00:00:00Z',
  })

  expect(older.services).toBe('Balayage')
  expect(newer.services).toBe('Service')
  expect(sortAppointmentsNewestFirst([older, newer]).map((item) => item.id)).toEqual([
    'h-2',
    'h-1',
  ])
})
