import { expect, test } from '@playwright/test'

import {
  buildOverviewAppearance,
  buildOverviewAttentionCards,
  buildOverviewMetricCards,
  buildTodayAppointments,
  getQuickActionLayout,
} from '../components/overview/overviewModelUtils'

test('buildOverviewAppearance returns expected radii for each aesthetic', () => {
  expect(buildOverviewAppearance('modern')).toMatchObject({
    actionCardRadius: 999,
    controlRadius: 10,
    iconBadgeRadius: 10,
    isCyberpunk: false,
    isGlass: false,
    sectionCardRadius: 14,
  })

  expect(buildOverviewAppearance('glass')).toMatchObject({
    actionCardRadius: 52,
    controlRadius: 20,
    iconBadgeRadius: 16,
    isCyberpunk: false,
    isGlass: true,
    sectionCardRadius: 24,
  })

  expect(buildOverviewAppearance('cyberpunk')).toMatchObject({
    actionCardRadius: 0,
    controlRadius: 0,
    iconBadgeRadius: 0,
    isCyberpunk: true,
    isGlass: false,
    sectionCardRadius: 0,
  })
})

test('getQuickActionLayout handles odd rows and zero-state sizing', () => {
  expect(getQuickActionLayout(0)).toEqual({
    quickActionColumns: 2,
    quickActionGap: 12,
    quickActionGridHeight: 0,
    quickActionItemSize: 148,
    shouldCenterQuickActionRow: false,
  })

  expect(getQuickActionLayout(3)).toEqual({
    quickActionColumns: 2,
    quickActionGap: 12,
    quickActionGridHeight: 308,
    quickActionItemSize: 148,
    shouldCenterQuickActionRow: true,
  })
})

test('buildOverviewMetricCards formats overview metrics and safe fallbacks', () => {
  expect(buildOverviewMetricCards(undefined, 3)).toEqual([
    { id: 'revenueYtd', label: 'Revenue (YTD)', value: '$0' },
    { id: 'totalClients', label: 'Total Clients', value: '3' },
    { id: 'activeClients', label: 'Active Clients', value: '0' },
    { id: 'inactiveClients', label: 'Inactive Clients', value: '3' },
    { id: 'avgTicket', label: 'Average Ticket', value: '$0' },
    { id: 'newClients90', label: 'New Clients (90d)', value: '0' },
    { id: 'serviceMix', label: 'Top Service Mix', value: '—' },
    { id: 'colorCoverage', label: 'Color Chart Coverage', value: '0%' },
    { id: 'photoCoverage', label: 'Photo Coverage (Logs)', value: '0%' },
  ])

  expect(
    buildOverviewMetricCards(
      {
        revenueYtd: 1820.4,
        avgTicket: 125.5,
        totalClients: 18,
        activeClients: 12,
        inactiveClients: 6,
        newClients90: 4,
        serviceMixLabel: 'Gloss',
        serviceMixPercent: 35,
        colorCoveragePercent: 80,
        photoCoveragePercent: 55,
      },
      0
    )
  ).toContainEqual({ id: 'serviceMix', label: 'Top Service Mix', value: 'Gloss (35%)' })
})

test('buildOverviewAttentionCards returns upcoming cards in priority order with summaries', () => {
  const cards = buildOverviewAttentionCards({
    appSettings: {
      dateDisplayFormat: 'short',
      dateLongIncludeWeekday: false,
    },
    appointmentHistory: [],
    clients: [],
    serviceCatalog: [],
  })

  expect(cards.map((card) => card.id)).toEqual([
    'overdue',
    'dueThisWeek',
    'upcomingBirthdays',
  ])
  expect(cards.map((card) => card.label)).toEqual([
    'Overdue',
    'Due this week',
    'Upcoming birthdays',
  ])
  expect(cards.map((card) => card.priority)).toEqual(['high', 'medium', 'low'])
  expect(cards.map((card) => card.summary)).toEqual([
    '0 clients past the suggested return window',
    '0 clients due in the next 7 days',
    '0 birthdays in the next 14 days',
  ])
})

test('buildTodayAppointments returns appointment logs dated today', () => {
  const todayAppointments = buildTodayAppointments({
    today: new Date('2026-06-07T12:00:00'),
    clients: [
      {
        id: 'client-1',
        name: 'Avery Stone',
        email: '',
        phone: '',
        lastVisit: 'No visits yet',
        type: 'Color',
        revenueYtd: 0,
        tag: '',
        status: 'Active',
        notes: '',
      },
    ],
    appointmentHistory: [
      {
        id: 'h-1',
        clientId: 'client-1',
        date: '2026-06-07T00:00:00Z',
        services: 'Color',
        serviceLabels: ['Color', 'Gloss'],
        price: 220,
        notes: 'Root touch-up and glaze.',
        images: ['file:///photo.jpg'],
      },
      {
        id: 'h-2',
        clientId: 'client-1',
        date: '2026-06-08',
        services: 'Cut',
        price: 90,
        notes: '',
      },
    ],
  })

  expect(todayAppointments).toEqual([
    {
      id: 'h-1',
      clientId: 'client-1',
      clientName: 'Avery Stone',
      noteSnippet: 'Root touch-up and glaze.',
      photoCount: 1,
      priceLabel: '$220',
      serviceLabel: 'Color + 1',
    },
  ])
})
