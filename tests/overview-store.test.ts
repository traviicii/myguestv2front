import { expect, test } from '@playwright/test'

import {
  applyMetricSelection,
  defaultMetrics,
  defaultSectionOrder,
  mergeOverviewStoreState,
  normalizeOverviewSectionOrder,
} from '../components/state/overviewStoreConfig'
import type { OverviewStore } from '../components/state/overviewStore'

const createCurrentStore = (): OverviewStore => ({
  sectionOrder: defaultSectionOrder,
  selectedMetrics: defaultMetrics,
  setMetricSelection: () => {},
  setSectionOrder: () => {},
  setSelectedMetrics: () => {},
  showLayoutEditor: false,
  showMetricEditor: false,
  showQuickActionEditor: false,
  toggleLayoutEditor: () => {},
  toggleMetricEditor: () => {},
  toggleQuickActionEditor: () => {},
})

test('normalizeOverviewSectionOrder keeps known sections unique and appends missing defaults', () => {
  expect(normalizeOverviewSectionOrder(['recentClients', 'metrics', 'metrics'])).toEqual([
    'recentClients',
    'metrics',
    'quickActions',
    'pinnedClients',
    'recentAppointments',
  ])
})

test('applyMetricSelection adds and removes metrics deterministically', () => {
  expect(applyMetricSelection(['revenueYtd'], 'avgTicket', true)).toEqual([
    'revenueYtd',
    'avgTicket',
  ])
  expect(applyMetricSelection(['revenueYtd', 'avgTicket'], 'avgTicket', false)).toEqual([
    'revenueYtd',
  ])
})

test('mergeOverviewStoreState preserves editor flags and normalizes persisted section order', () => {
  const merged = mergeOverviewStoreState(
    {
      sectionOrder: ['metrics', 'recentClients'],
      selectedMetrics: ['avgTicket'],
      showLayoutEditor: true,
    },
    createCurrentStore()
  )

  expect(merged.sectionOrder).toEqual([
    'metrics',
    'recentClients',
    'quickActions',
    'pinnedClients',
    'recentAppointments',
  ])
  expect(merged.selectedMetrics).toEqual(['avgTicket'])
  expect(merged.showLayoutEditor).toBe(true)
})
