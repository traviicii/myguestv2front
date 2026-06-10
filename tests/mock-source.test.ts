import { expect, test } from '@playwright/test'
import { MOCK_APPOINTMENT_HISTORY, MOCK_CLIENTS } from '../components/data/mock/fixtures'
import { mockDataSource, resetMockDataSource } from '../components/data/sources/mock'

test.beforeEach(() => {
  resetMockDataSource()
})

test('mock data source serves tracked fixtures and detail lookups', async () => {
  const clients = await mockDataSource.fetchClients()
  const history = await mockDataSource.fetchAppointmentHistoryLite()
  const detail = await mockDataSource.fetchAppointmentDetail(MOCK_APPOINTMENT_HISTORY[0].id)

  expect(clients).toHaveLength(MOCK_CLIENTS.length)
  expect(history).toHaveLength(MOCK_APPOINTMENT_HISTORY.length)
  expect(detail?.id).toBe(MOCK_APPOINTMENT_HISTORY[0].id)
  expect(mockDataSource.kind).toBe('mock')
})

test('mock client groups can be created, assigned, archived, and restored', async () => {
  const group = await mockDataSource.createClientGroup({ name: 'Blowouts' })
  const client = await mockDataSource.createClient({
    firstName: 'Piper',
    lastName: 'Lane',
    groupIds: [group.id],
  })

  expect(client.groups?.map((item) => item.name)).toEqual(['Blowouts'])

  const activeGroups = await mockDataSource.fetchClientGroups('true')
  expect(activeGroups.find((item) => item.id === group.id)?.clientCount).toBe(1)

  await mockDataSource.updateClient({
    clientId: client.id,
    firstName: 'Piper',
    lastName: 'Lane',
    groupIds: [2],
  })

  const updatedCounts = await mockDataSource.fetchClientGroups('true')
  expect(updatedCounts.find((item) => item.id === group.id)?.clientCount).toBe(0)
  expect(updatedCounts.find((item) => item.id === 2)?.clientCount).toBe(5)

  await mockDataSource.archiveClientGroup(group.id)
  expect((await mockDataSource.fetchClientGroups('true')).some((item) => item.id === group.id)).toBe(
    false
  )
  expect(
    (await mockDataSource.fetchClientGroups('false')).find((item) => item.id === group.id)
      ?.archivedAt
  ).toBeTruthy()

  const restored = await mockDataSource.reactivateClientGroup(group.id)
  expect(restored.archivedAt).toBeNull()
  expect((await mockDataSource.fetchClientGroups('true')).some((item) => item.id === group.id)).toBe(
    true
  )
})

test('mock client group creation restores an archived matching group', async () => {
  expect((await mockDataSource.fetchClientGroups('true')).some((group) => group.name === 'Extensions')).toBe(
    false
  )

  const restored = await mockDataSource.createClientGroup({ name: 'Extensions' })

  expect(restored.id).toBe(5)
  expect(restored.archivedAt).toBeNull()
  expect((await mockDataSource.fetchClientGroups('true')).some((group) => group.name === 'Extensions')).toBe(
    true
  )
})
