import type { AppointmentHistory, Client } from 'components/data/models'

export const buildClientMap = (clients: Client[]) => {
  const map = new Map<string, Client>()
  clients.forEach((client) => {
    map.set(client.id, client)
  })
  return map
}

export const deriveLastVisitByClient = (appointmentHistory: AppointmentHistory[]) => {
  return appointmentHistory.reduce<Record<string, string>>((acc, entry) => {
    const current = acc[entry.clientId]
    if (!current || new Date(entry.date) > new Date(current)) {
      acc[entry.clientId] = entry.date
    }
    return acc
  }, {})
}
