import { expect, test } from '@playwright/test'

import { buildServiceReorderUpdates, hasServiceNameConflict } from 'components/settings/settingsServiceManagementUtils'

test('settings service management helpers detect service name conflicts', async () => {
  const serviceCatalog = [
    { id: 1, normalizedName: 'cut' },
    { id: 2, normalizedName: 'color' },
  ]

  expect(hasServiceNameConflict(serviceCatalog as any, 'Cut')).toBe(true)
  expect(hasServiceNameConflict(serviceCatalog as any, 'Gloss')).toBe(false)
})

test('settings service management helpers build reorder updates only for changed positions', async () => {
  const activeServices = [
    { id: 1, sortOrder: 0 },
    { id: 2, sortOrder: 1 },
    { id: 3, sortOrder: 2 },
  ]

  expect(buildServiceReorderUpdates(activeServices, 2, 'up')).toEqual([
    { serviceId: 2, sortOrder: 0 },
    { serviceId: 1, sortOrder: 1 },
  ])

  expect(buildServiceReorderUpdates(activeServices, 3, 'down')).toEqual([])
})
