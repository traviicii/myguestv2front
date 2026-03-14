import { expect, test } from '@playwright/test'
import { MOCK_APPOINTMENT_HISTORY, MOCK_CLIENTS } from '../components/data/mock/fixtures'
import { mockDataSource } from '../components/data/sources/mock'

test('mock data source serves tracked fixtures and detail lookups', async () => {
  const clients = await mockDataSource.fetchClients()
  const history = await mockDataSource.fetchAppointmentHistoryLite()
  const detail = await mockDataSource.fetchAppointmentDetail(MOCK_APPOINTMENT_HISTORY[0].id)

  expect(clients).toHaveLength(MOCK_CLIENTS.length)
  expect(history).toHaveLength(MOCK_APPOINTMENT_HISTORY.length)
  expect(detail?.id).toBe(MOCK_APPOINTMENT_HISTORY[0].id)
  expect(mockDataSource.kind).toBe('mock')
})
