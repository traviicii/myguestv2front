import { expect, test } from '@playwright/test'

import type { ServiceOption } from '../components/data/api/services'
import type { AppointmentHistory, Client } from '../components/data/models'
import {
  buildRebookingAttentionLists,
  buildRebookingRecommendationForClient,
  getUpcomingBirthdays,
} from '../components/utils/rebooking'

const services: ServiceOption[] = [
  {
    id: 1,
    name: 'Cut',
    normalizedName: 'cut',
    sortOrder: 0,
    defaultPriceCents: 7500,
    defaultReturnWeeks: 6,
    isActive: true,
    usageCount: 0,
  },
  {
    id: 2,
    name: 'Glaze',
    normalizedName: 'glaze',
    sortOrder: 1,
    defaultPriceCents: 9500,
    defaultReturnWeeks: 8,
    isActive: true,
    usageCount: 0,
  },
  {
    id: 3,
    name: 'Single Process',
    normalizedName: 'single process',
    sortOrder: 2,
    defaultPriceCents: 15500,
    defaultReturnWeeks: 6,
    isActive: true,
    usageCount: 0,
  },
]

test('rebooking learns cadence after three same-service visits and chooses the earliest multi-service candidate', () => {
  const history: AppointmentHistory[] = [
    {
      id: 'a-1',
      clientId: 'c-1',
      date: '2025-12-15',
      services: 'Cut',
      serviceIds: [1],
      serviceLabels: ['Cut'],
      price: 75,
      notes: '',
    },
    {
      id: 'a-2',
      clientId: 'c-1',
      date: '2026-01-26',
      services: 'Cut',
      serviceIds: [1],
      serviceLabels: ['Cut'],
      price: 75,
      notes: '',
    },
    {
      id: 'a-3',
      clientId: 'c-1',
      date: '2026-03-09',
      services: 'Cut + Glaze',
      serviceIds: [1, 2],
      serviceLabels: ['Cut', 'Glaze'],
      price: 140,
      notes: '',
    },
  ]

  const recommendation = buildRebookingRecommendationForClient({
    clientId: 'c-1',
    appointmentHistory: history,
    serviceCatalog: services,
    now: new Date('2026-04-01T12:00:00Z'),
  })

  expect(recommendation).toMatchObject({
    clientId: 'c-1',
    drivingServiceName: 'Cut',
    source: 'learned',
    suggestedNextVisitDate: '2026-04-20',
    status: 'onTrack',
    dueInDays: 19,
  })
})

test('rebooking falls back to service defaults, supports legacy labels, and sorts due/overdue lists', () => {
  const clients: Client[] = [
    {
      id: 'c-2',
      name: 'Marco Vale',
      email: '',
      phone: '',
      birthday: null,
      createdAt: '2025-10-12',
      lastVisit: '2026-02-22',
      type: 'Cut',
      revenueYtd: 0,
      tag: '',
      status: 'Active',
      notes: '',
    },
    {
      id: 'c-3',
      name: 'Theo Brooks',
      email: '',
      phone: '',
      birthday: null,
      createdAt: '2025-11-18',
      lastVisit: '2026-01-16',
      type: 'Cut',
      revenueYtd: 0,
      tag: '',
      status: 'Inactive',
      notes: '',
    },
  ]

  const history: AppointmentHistory[] = [
    {
      id: 'a-4',
      clientId: 'c-2',
      date: '2026-02-22',
      services: 'Cut',
      serviceIds: [1],
      serviceLabels: ['Cut'],
      price: 75,
      notes: '',
    },
    {
      id: 'a-5',
      clientId: 'c-3',
      date: '2026-01-16',
      services: 'Single Process',
      notes: '',
      price: 155,
    },
  ]

  const dueRecommendation = buildRebookingRecommendationForClient({
    clientId: 'c-2',
    appointmentHistory: history,
    serviceCatalog: services,
    now: new Date('2026-04-01T12:00:00Z'),
  })
  const overdueRecommendation = buildRebookingRecommendationForClient({
    clientId: 'c-3',
    appointmentHistory: history,
    serviceCatalog: services,
    now: new Date('2026-04-01T12:00:00Z'),
  })

  expect(dueRecommendation).toMatchObject({
    drivingServiceName: 'Cut',
    source: 'default',
    suggestedNextVisitDate: '2026-04-05',
    status: 'dueThisWeek',
  })
  expect(overdueRecommendation).toMatchObject({
    drivingServiceName: 'Single Process',
    source: 'default',
    suggestedNextVisitDate: '2026-02-27',
    status: 'overdue',
  })

  const attention = buildRebookingAttentionLists({
    rebookingByClient: {
      'c-2': dueRecommendation!,
      'c-3': overdueRecommendation!,
    },
    clients,
    now: new Date('2026-04-01T12:00:00Z'),
  })

  expect(attention.dueThisWeek.map((item) => item.clientId)).toEqual(['c-2'])
  expect(attention.overdue.map((item) => item.clientId)).toEqual(['c-3'])
})

test('upcoming birthdays handles year rollover and february 29 on non-leap years', () => {
  const clients: Client[] = [
    {
      id: 'c-4',
      name: 'Leap Day',
      email: '',
      phone: '',
      birthday: '2000-02-29',
      createdAt: '2025-01-01',
      lastVisit: 'No visits yet',
      type: 'Color',
      revenueYtd: 0,
      tag: '',
      status: 'Inactive',
      notes: '',
    },
    {
      id: 'c-5',
      name: 'Year End',
      email: '',
      phone: '',
      birthday: '1990-01-02',
      createdAt: '2025-01-01',
      lastVisit: 'No visits yet',
      type: 'Cut',
      revenueYtd: 0,
      tag: '',
      status: 'Inactive',
      notes: '',
    },
  ]

  expect(getUpcomingBirthdays(clients, new Date('2026-02-20T12:00:00Z'))).toContainEqual({
    clientId: 'c-4',
    clientName: 'Leap Day',
    birthday: '2000-02-29',
    nextBirthday: '2026-02-28',
    daysUntilBirthday: 8,
  })

  expect(getUpcomingBirthdays(clients, new Date('2026-12-25T12:00:00Z'))).toContainEqual({
    clientId: 'c-5',
    clientName: 'Year End',
    birthday: '1990-01-02',
    nextBirthday: '2027-01-02',
    daysUntilBirthday: 8,
  })
})
