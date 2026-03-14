import { expect, test } from '@playwright/test'

import {
  buildEditAppointmentInitialForm,
  buildEditAppointmentUpdateInput,
  filterEditableAppointmentServices,
  getEditAppointmentRequiredDateScrollTarget,
  hasEditAppointmentChanges,
  resolveEditedAppointmentServiceType,
  resolveInitialEditAppointmentServiceIds,
  toggleEditAppointmentServiceId,
} from '../components/appointments/edit/editAppointmentModelUtils'

test('edit appointment helpers build initial form and resolve matching service ids', () => {
  expect(
    buildEditAppointmentInitialForm({
      id: 'apt-1',
      clientId: 'client-1',
      date: '2026-03-13',
      services: 'single process',
      price: 95,
      notes: 'note',
      images: ['one'],
    })
  ).toEqual({
    date: '03/13/2026',
    price: '95',
    notes: 'note',
  })

  expect(
    resolveInitialEditAppointmentServiceIds(
      {
        id: 'apt-1',
        clientId: 'client-1',
        date: '2026-03-13',
        services: 'single process',
        serviceIds: [],
        price: 95,
        notes: '',
      },
      [
        {
          id: 7,
          name: 'Single Process',
          normalizedName: 'single process',
          sortOrder: 0,
          defaultPriceCents: 9500,
          isActive: true,
          usageCount: 0,
        },
      ]
    )
  ).toEqual([7])
})

test('edit appointment helpers detect dirty state and preserve legacy service type only when appropriate', () => {
  expect(
    hasEditAppointmentChanges({
      form: { date: '03/13/2026', price: '95', notes: 'note' },
      initialForm: { date: '03/13/2026', price: '95', notes: 'note' },
      images: ['one'],
      initialImages: ['one'],
      initialServiceIds: [3],
      selectedServiceIds: [3],
    })
  ).toBe(false)

  expect(
    hasEditAppointmentChanges({
      form: { date: '03/13/2026', price: '120', notes: 'note' },
      initialForm: { date: '03/13/2026', price: '95', notes: 'note' },
      images: ['one'],
      initialImages: ['one'],
      initialServiceIds: [3],
      selectedServiceIds: [3],
    })
  ).toBe(true)

  expect(
    resolveEditedAppointmentServiceType({
      appointment: {
        id: 'apt-1',
        clientId: 'client-1',
        date: '2026-03-13',
        services: 'Gloss',
        price: 95,
        notes: '',
      },
      initialServiceIds: [],
      selectedServiceIds: [],
      selectedServices: [],
    })
  ).toBe('Gloss')

  expect(
    resolveEditedAppointmentServiceType({
      appointment: {
        id: 'apt-1',
        clientId: 'client-1',
        date: '2026-03-13',
        services: 'Service',
        price: 95,
        notes: '',
      },
      initialServiceIds: [],
      selectedServiceIds: [],
      selectedServices: [],
    })
  ).toBeNull()
})

test('edit appointment helpers filter picker services, toggle selections, and build update input', () => {
  expect(
    filterEditableAppointmentServices(
      [
        {
          id: 1,
          name: 'Cut',
          normalizedName: 'cut',
          sortOrder: 0,
          defaultPriceCents: 4500,
          isActive: true,
          usageCount: 0,
        },
        {
          id: 2,
          name: 'Gloss',
          normalizedName: 'gloss',
          sortOrder: 1,
          defaultPriceCents: 7500,
          isActive: false,
          usageCount: 0,
        },
      ],
      [2]
    ).map((service) => service.id)
  ).toEqual([1, 2])

  expect(toggleEditAppointmentServiceId([1, 2], 2)).toEqual([1])
  expect(toggleEditAppointmentServiceId([1], 2)).toEqual([1, 2])
  expect(getEditAppointmentRequiredDateScrollTarget(undefined)).toBeNull()
  expect(getEditAppointmentRequiredDateScrollTarget(42)).toBe(30)

  expect(
    buildEditAppointmentUpdateInput({
      appointment: {
        id: 'apt-1',
        clientId: 'client-1',
        date: '2026-03-13',
        services: 'Gloss',
        price: 95,
        notes: '',
        imageRefs: [
          {
            storageProvider: 'remote_url',
            publicUrl: 'https://example.com/original.jpg',
            fileName: 'original.jpg',
          },
        ],
      },
      form: { date: '03/13/2026', price: '120', notes: 'updated' },
      images: ['https://example.com/original.jpg'],
      initialServiceIds: [],
      selectedServiceIds: [7],
      selectedServices: [{ name: 'Cut & Color' }],
    })
  ).toEqual({
    formulaId: 'apt-1',
    serviceIds: [7],
    serviceType: 'Cut & Color',
    notes: 'updated',
    price: 120,
    date: '03/13/2026',
    images: [
      {
        storageProvider: 'remote_url',
        publicUrl: 'https://example.com/original.jpg',
        objectKey: undefined,
        fileName: 'original.jpg',
      },
    ],
  })
})
