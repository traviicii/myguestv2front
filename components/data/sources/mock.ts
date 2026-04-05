import type {
  OverviewMetrics,
  OverviewMetricsInput,
} from '../api/metrics'
import type { ServiceOption } from '../api/services'
import {
  MOCK_APPOINTMENT_HISTORY,
  MOCK_CLIENTS,
  MOCK_COLOR_ANALYSIS_BY_CLIENT,
  MOCK_IMAGES_BY_CLIENT,
} from '../mock/fixtures'
import type { ColorAnalysis } from '../models'
import { normalizeServiceName } from 'components/utils/services'
import type { DataSource } from './types'

export const MOCK_SERVICES: ServiceOption[] = [
  {
    id: 1,
    name: 'Cut',
    normalizedName: 'cut',
    sortOrder: 0,
    defaultPriceCents: 7500,
    defaultReturnWeeks: 6,
    isActive: true,
    usageCount: 2,
  },
  {
    id: 2,
    name: 'Color',
    normalizedName: 'color',
    sortOrder: 1,
    defaultPriceCents: 14000,
    defaultReturnWeeks: 8,
    isActive: true,
    usageCount: 1,
  },
  {
    id: 3,
    name: 'Cut & Color',
    normalizedName: 'cut & color',
    sortOrder: 2,
    defaultPriceCents: 21000,
    defaultReturnWeeks: 8,
    isActive: true,
    usageCount: 2,
  },
  {
    id: 4,
    name: 'Balayage',
    normalizedName: 'balayage',
    sortOrder: 3,
    defaultPriceCents: 26000,
    defaultReturnWeeks: 12,
    isActive: true,
    usageCount: 1,
  },
  {
    id: 5,
    name: 'Single Process',
    normalizedName: 'single process',
    sortOrder: 4,
    defaultPriceCents: 15500,
    defaultReturnWeeks: 6,
    isActive: true,
    usageCount: 1,
  },
  {
    id: 6,
    name: 'Glaze',
    normalizedName: 'glaze',
    sortOrder: 5,
    defaultPriceCents: 9500,
    defaultReturnWeeks: 8,
    isActive: true,
    usageCount: 3,
  },
]

const readOnlyError = (message: string) => {
  throw new Error(`Mock data mode is enabled. Set EXPO_PUBLIC_USE_MOCK_DATA=false to ${message}.`)
}

const resolveMockColorAnalysis = (clientId: string): ColorAnalysis | null => {
  const direct = MOCK_COLOR_ANALYSIS_BY_CLIENT[clientId]
  if (direct) return direct
  const legacyLikeId = /^\d+$/.test(clientId) ? `c-${clientId}` : clientId
  return MOCK_COLOR_ANALYSIS_BY_CLIENT[legacyLikeId] ?? null
}

const computeOverviewMetrics = (input: OverviewMetricsInput): OverviewMetrics => {
  const activeCutoff = new Date(input.activeCutoff)
  const yearStart = new Date(input.yearStart)
  const avgTicketCutoff = input.avgTicketCutoff ? new Date(input.avgTicketCutoff) : null
  const photoCutoff = input.photoCutoff ? new Date(input.photoCutoff) : null
  const newClientsCutoff = new Date(input.newClientsCutoff)

  const entriesActiveWindow = MOCK_APPOINTMENT_HISTORY.filter((entry) => {
    const date = new Date(entry.date)
    return !Number.isNaN(date.getTime()) && date >= activeCutoff
  })
  const entriesYtd = MOCK_APPOINTMENT_HISTORY.filter((entry) => {
    const date = new Date(entry.date)
    return !Number.isNaN(date.getTime()) && date >= yearStart
  })

  const avgTicketEntries = avgTicketCutoff
    ? MOCK_APPOINTMENT_HISTORY.filter((entry) => {
        const date = new Date(entry.date)
        return !Number.isNaN(date.getTime()) && date >= avgTicketCutoff
      })
    : MOCK_APPOINTMENT_HISTORY

  const activeClientIds = new Set(entriesActiveWindow.map((entry) => entry.clientId))
  const newClients90 = MOCK_CLIENTS.filter((client) => {
    if (!client.createdAt) return false
    const date = new Date(client.createdAt)
    return !Number.isNaN(date.getTime()) && date >= newClientsCutoff
  }).length

  const serviceMixCounts = entriesActiveWindow.reduce<Record<string, number>>((acc, entry) => {
    const normalizedLabels =
      entry.serviceLabels?.map((label) => normalizeServiceName(label)).filter(Boolean) ?? []
    const labels = normalizedLabels.length
      ? normalizedLabels
      : [normalizeServiceName(entry.services) || 'Service']
    labels.forEach((label) => {
      acc[label] = (acc[label] ?? 0) + 1
    })
    return acc
  }, {})
  const topService = Object.entries(serviceMixCounts).sort((left, right) => right[1] - left[1])[0]

  const eligibleColorClients = MOCK_CLIENTS.filter(
    (client) => client.type === 'Color' || client.type === 'Cut & Color'
  )
  const clientsWithColorData = eligibleColorClients.filter((client) => {
    const data = MOCK_COLOR_ANALYSIS_BY_CLIENT[client.id]
    if (!data) return false
    return Object.values(data).some((value) => value && value !== '—' && value !== 'Unknown')
  }).length

  const photoScopedEntries = photoCutoff
    ? MOCK_APPOINTMENT_HISTORY.filter((entry) => {
        const date = new Date(entry.date)
        return !Number.isNaN(date.getTime()) && date >= photoCutoff
      })
    : MOCK_APPOINTMENT_HISTORY
  const photoEntriesWithImages = photoScopedEntries.filter((entry) => (entry.images?.length ?? 0) > 0)

  return {
    revenueYtd: entriesYtd.reduce((sum, entry) => sum + entry.price, 0),
    avgTicket:
      avgTicketEntries.length > 0
        ? avgTicketEntries.reduce((sum, entry) => sum + entry.price, 0) / avgTicketEntries.length
        : 0,
    totalClients: MOCK_CLIENTS.length,
    activeClients: activeClientIds.size,
    inactiveClients: MOCK_CLIENTS.length - activeClientIds.size,
    newClients90,
    serviceMixLabel: topService?.[0] ?? '',
    serviceMixPercent:
      topService && entriesActiveWindow.length > 0
        ? Math.round((topService[1] / entriesActiveWindow.length) * 100)
        : 0,
    colorCoveragePercent:
      eligibleColorClients.length > 0
        ? Math.round((clientsWithColorData / eligibleColorClients.length) * 100)
        : 0,
    photoCoveragePercent:
      photoScopedEntries.length > 0
        ? Math.round((photoEntriesWithImages.length / photoScopedEntries.length) * 100)
        : 0,
  }
}

export const mockDataSource: DataSource = {
  kind: 'mock',
  fetchClients: async () => MOCK_CLIENTS,
  fetchAppointmentHistory: async () => MOCK_APPOINTMENT_HISTORY,
  fetchAppointmentHistoryLite: async () => MOCK_APPOINTMENT_HISTORY,
  fetchAppointmentDetail: async (appointmentId) =>
    MOCK_APPOINTMENT_HISTORY.find((entry) => entry.id === appointmentId) ?? null,
  fetchOverviewMetrics: async (input) => computeOverviewMetrics(input),
  fetchColorAnalysisByClient: async () => MOCK_COLOR_ANALYSIS_BY_CLIENT,
  fetchColorAnalysisForClient: async (clientId) => resolveMockColorAnalysis(clientId),
  fetchImagesByClient: async () => MOCK_IMAGES_BY_CLIENT,
  fetchServices: async (active) => {
    if (active === 'all') return MOCK_SERVICES
    if (active === 'false') return MOCK_SERVICES.filter((service) => !service.isActive)
    return MOCK_SERVICES.filter((service) => service.isActive)
  },
  exportMyData: async () => readOnlyError('export your real client data'),
  createClient: async () => readOnlyError('create clients in the v2 backend'),
  deleteClient: async () => readOnlyError('delete clients in the v2 backend'),
  deleteAccount: async () => readOnlyError('delete your account'),
  updateClient: async () => readOnlyError('edit clients in the v2 backend'),
  createService: async () => readOnlyError('manage services in the v2 backend'),
  updateService: async () => readOnlyError('manage services in the v2 backend'),
  deactivateService: async () => readOnlyError('manage services in the v2 backend'),
  reactivateService: async () => readOnlyError('manage services in the v2 backend'),
  permanentlyDeleteService: async () => readOnlyError('manage services in the v2 backend'),
  createAppointmentLog: async () => readOnlyError('create appointment logs in the v2 backend'),
  updateAppointmentLog: async () => readOnlyError('update appointment logs in the v2 backend'),
  upsertColorAnalysisForClient: async () =>
    readOnlyError('save color charts in the v2 backend'),
}
