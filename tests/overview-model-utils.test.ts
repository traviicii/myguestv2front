import { expect, test } from '@playwright/test'

import {
  buildOverviewAppearance,
  buildOverviewMetricCards,
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
