import type {
  OverviewMetrics,
  OverviewMetricsInput,
} from '../api/metrics'
import type { CreateClientInput, UpdateClientInput } from '../api/clients'
import type {
  ClientGroup,
  CreateClientGroupInput,
  UpdateClientGroupInput,
} from '../api/clientGroups'
import type { ServiceOption } from '../api/services'
import {
  MOCK_APPOINTMENT_HISTORY,
  MOCK_CLIENTS,
  MOCK_COLOR_ANALYSIS_BY_CLIENT,
  MOCK_IMAGES_BY_CLIENT,
} from '../mock/fixtures'
import type { Client, ColorAnalysis } from '../models'
import { normalizeServiceName } from 'components/utils/services'
import { normalizePhoneForStorage } from 'components/utils/phone'
import { sortClientGroupsForDisplay } from 'components/utils/clientGroups'
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

export const MOCK_CLIENT_GROUPS: ClientGroup[] = [
  {
    id: 1,
    name: 'Cut',
    normalizedName: 'cut',
    sortOrder: 0,
    archivedAt: null,
    clientCount: 5,
  },
  {
    id: 2,
    name: 'Color',
    normalizedName: 'color',
    sortOrder: 1,
    archivedAt: null,
    clientCount: 4,
  },
  {
    id: 3,
    name: 'VIP',
    normalizedName: 'vip',
    sortOrder: 2,
    archivedAt: null,
    clientCount: 1,
  },
  {
    id: 4,
    name: 'Consultation',
    normalizedName: 'consultation',
    sortOrder: 3,
    archivedAt: null,
    clientCount: 1,
  },
  {
    id: 5,
    name: 'Extensions',
    normalizedName: 'extensions',
    sortOrder: 4,
    archivedAt: '2026-01-15T00:00:00Z',
    clientCount: 0,
  },
]

const readOnlyError = (message: string) => {
  throw new Error(`Mock data mode is enabled. Set EXPO_PUBLIC_USE_MOCK_DATA=false to ${message}.`)
}

const normalizeGroupName = (value: string) => value.trim().replace(/\s+/g, ' ')
const normalizeGroupKey = (value: string) => normalizeGroupName(value).toLowerCase()

const cloneClientGroup = (group: ClientGroup): ClientGroup => ({ ...group })

const summarizeClientGroups = (groups: ClientGroup[], fallbackType: string) => {
  const sortedGroups = sortClientGroupsForDisplay(groups)
  if (sortedGroups.length === 0) return fallbackType || 'Ungrouped'
  if (sortedGroups.length === 1) return (sortedGroups[0]?.name ?? fallbackType) || 'Ungrouped'
  if (sortedGroups.length === 2) return sortedGroups.map((group) => group.name).join(' + ')
  return `${sortedGroups[0]?.name ?? 'Group'} +${sortedGroups.length - 1}`
}

const hydrateGroupsForIds = (groupIds: number[]) => {
  const groupById = new Map(mockClientGroups.map((group) => [group.id, group]))
  return groupIds
    .map((id) => groupById.get(id))
    .filter((group): group is ClientGroup => Boolean(group))
    .map(cloneClientGroup)
}

const cloneClient = (client: Client): Client => {
  const groupIds = [...(client.groupIds ?? client.groups?.map((group) => group.id) ?? [])]
  const groups = hydrateGroupsForIds(groupIds)
  return {
    ...client,
    groupIds,
    groups,
    type: summarizeClientGroups(groups, client.type),
  }
}

const recomputeClientGroupCounts = () => {
  const counts = new Map<number, number>()
  mockClients.forEach((client) => {
    ;(client.groupIds ?? []).forEach((groupId) => {
      counts.set(groupId, (counts.get(groupId) ?? 0) + 1)
    })
  })

  mockClientGroups = mockClientGroups.map((group) => ({
    ...group,
    clientCount: counts.get(group.id) ?? 0,
  }))
}

const getNextClientId = () => {
  const highest = mockClients.reduce((max, client) => {
    const match = client.id.match(/\d+/)
    const value = match ? Number(match[0]) : 0
    return Number.isFinite(value) ? Math.max(max, value) : max
  }, 100)
  return `c-${highest + 1}`
}

const getNextClientGroupSortOrder = () =>
  mockClientGroups.reduce((max, group) => Math.max(max, group.sortOrder), -1) + 1

const getNextClientGroupId = () =>
  mockClientGroups.reduce((max, group) => Math.max(max, group.id), 0) + 1

const findClientIndexById = (clientId: string) => {
  const normalized = clientId.trim()
  const numeric = normalized.match(/\d+/)?.[0] ?? ''
  return mockClients.findIndex((client) => {
    if (client.id === normalized) return true
    return Boolean(numeric) && client.id.match(/\d+/)?.[0] === numeric
  })
}

let mockClientGroups = MOCK_CLIENT_GROUPS.map(cloneClientGroup)
let mockClients = MOCK_CLIENTS.map((client) => ({ ...client }))

recomputeClientGroupCounts()

export function resetMockDataSource() {
  mockClientGroups = MOCK_CLIENT_GROUPS.map(cloneClientGroup)
  mockClients = MOCK_CLIENTS.map((client) => ({ ...client }))
  recomputeClientGroupCounts()
}

async function createMockClient(input: CreateClientInput) {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  if (!firstName || !lastName) {
    throw new Error('First and last name are required.')
  }

  const groupIds = [...new Set(input.groupIds ?? [])]
  const groups = hydrateGroupsForIds(groupIds)
  if (groups.length !== groupIds.length) {
    throw new Error('One or more client groups are invalid.')
  }

  const client: Client = {
    id: getNextClientId(),
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: input.email?.trim() ?? '',
    phone: normalizePhoneForStorage(input.phone ?? ''),
    birthday: input.birthday?.trim() || null,
    createdAt: new Date().toISOString().slice(0, 10),
    lastVisit: 'No visits yet',
    type: summarizeClientGroups(groups, input.clientType?.trim() ?? ''),
    groupIds,
    groups,
    revenueYtd: 0,
    tag: '',
    status: 'Inactive',
    notes: input.notes?.trim() ?? '',
  }

  mockClients = [client, ...mockClients]
  recomputeClientGroupCounts()
  return cloneClient(client)
}

async function updateMockClient(input: UpdateClientInput) {
  const index = findClientIndexById(input.clientId)
  if (index === -1) {
    throw new Error('Client not found.')
  }

  const existing = mockClients[index]
  const firstName =
    input.firstName !== undefined ? input.firstName.trim() : existing.firstName ?? ''
  const lastName =
    input.lastName !== undefined ? input.lastName.trim() : existing.lastName ?? ''
  if (!firstName || !lastName) {
    throw new Error('First and last name are required.')
  }

  const groupIds =
    input.groupIds !== undefined
      ? [...new Set(input.groupIds)]
      : [...(existing.groupIds ?? [])]
  const groups = hydrateGroupsForIds(groupIds)
  if (groups.length !== groupIds.length) {
    throw new Error('One or more client groups are invalid.')
  }

  const nextClient: Client = {
    ...existing,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email:
      input.email !== undefined ? input.email?.trim() ?? '' : existing.email,
    phone:
      input.phone !== undefined
        ? normalizePhoneForStorage(input.phone ?? '')
        : existing.phone,
    birthday:
      input.birthday !== undefined ? input.birthday?.trim() || null : existing.birthday,
    type: summarizeClientGroups(
      groups,
      input.clientType !== undefined ? input.clientType.trim() : existing.type
    ),
    groupIds,
    groups,
    notes:
      input.notes !== undefined ? input.notes?.trim() ?? '' : existing.notes,
  }

  mockClients = mockClients.map((client, clientIndex) =>
    clientIndex === index ? nextClient : client
  )
  recomputeClientGroupCounts()
  return cloneClient(nextClient)
}

async function deleteMockClient(clientId: string) {
  const index = findClientIndexById(clientId)
  if (index === -1) {
    throw new Error('Client not found.')
  }
  mockClients = mockClients.filter((_client, clientIndex) => clientIndex !== index)
  recomputeClientGroupCounts()
}

async function createMockClientGroup(input: CreateClientGroupInput) {
  const name = normalizeGroupName(input.name)
  const normalizedName = normalizeGroupKey(input.name)
  if (!normalizedName) {
    throw new Error('Client group name is required.')
  }

  const existing = mockClientGroups.find((group) => group.normalizedName === normalizedName)
  if (existing) {
    if (!existing.archivedAt) {
      throw new Error('A client group with this name already exists.')
    }

    const restored = { ...existing, name, archivedAt: null }
    mockClientGroups = mockClientGroups.map((group) =>
      group.id === restored.id ? restored : group
    )
    recomputeClientGroupCounts()
    return cloneClientGroup(restored)
  }

  const group: ClientGroup = {
    id: getNextClientGroupId(),
    name,
    normalizedName,
    sortOrder: input.sortOrder ?? getNextClientGroupSortOrder(),
    archivedAt: null,
    clientCount: 0,
  }

  mockClientGroups = [...mockClientGroups, group]
  recomputeClientGroupCounts()
  return cloneClientGroup(group)
}

async function updateMockClientGroup(input: UpdateClientGroupInput) {
  const group = mockClientGroups.find((item) => item.id === input.groupId)
  if (!group) {
    throw new Error('Client group not found.')
  }

  let nextGroup = { ...group }
  if (input.name !== undefined) {
    const name = normalizeGroupName(input.name)
    const normalizedName = normalizeGroupKey(input.name)
    if (!normalizedName) {
      throw new Error('Client group name is required.')
    }
    const duplicate = mockClientGroups.find(
      (item) => item.id !== group.id && item.normalizedName === normalizedName
    )
    if (duplicate) {
      throw new Error('A client group with this name already exists.')
    }
    nextGroup = { ...nextGroup, name, normalizedName }
  }
  if (input.sortOrder !== undefined) {
    nextGroup = { ...nextGroup, sortOrder: input.sortOrder }
  }
  if (input.archived !== undefined) {
    nextGroup = {
      ...nextGroup,
      archivedAt: input.archived ? new Date().toISOString() : null,
    }
  }

  mockClientGroups = mockClientGroups.map((item) =>
    item.id === nextGroup.id ? nextGroup : item
  )
  mockClients = mockClients.map((client) => cloneClient(client))
  recomputeClientGroupCounts()
  return cloneClientGroup(nextGroup)
}

async function archiveMockClientGroup(groupId: number) {
  await updateMockClientGroup({ groupId, archived: true })
}

async function reactivateMockClientGroup(groupId: number) {
  return updateMockClientGroup({ groupId, archived: false })
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
  const newClients90 = mockClients.filter((client) => {
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

  const eligibleColorClients = mockClients.filter((client) =>
    (client.groups ?? []).some((group) => group.normalizedName === 'color')
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
    totalClients: mockClients.length,
    activeClients: activeClientIds.size,
    inactiveClients: mockClients.length - activeClientIds.size,
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
  fetchClients: async () => mockClients.map(cloneClient),
  fetchAppointmentHistory: async () => MOCK_APPOINTMENT_HISTORY,
  fetchAppointmentHistoryLite: async () => MOCK_APPOINTMENT_HISTORY,
  fetchAppointmentDetail: async (appointmentId) =>
    MOCK_APPOINTMENT_HISTORY.find((entry) => entry.id === appointmentId) ?? null,
  fetchOverviewMetrics: async (input) => computeOverviewMetrics(input),
  fetchColorAnalysisByClient: async () => MOCK_COLOR_ANALYSIS_BY_CLIENT,
  fetchColorAnalysisForClient: async (clientId) => resolveMockColorAnalysis(clientId),
  fetchImagesByClient: async () => MOCK_IMAGES_BY_CLIENT,
  fetchClientGroups: async (active) => {
    const groups = mockClientGroups.map(cloneClientGroup)
    if (active === 'all') return groups
    if (active === 'false') return groups.filter((group) => group.archivedAt)
    return groups.filter((group) => !group.archivedAt)
  },
  fetchServices: async (active) => {
    if (active === 'all') return MOCK_SERVICES
    if (active === 'false') return MOCK_SERVICES.filter((service) => !service.isActive)
    return MOCK_SERVICES.filter((service) => service.isActive)
  },
  exportMyData: async () => readOnlyError('export your real client data'),
  createClient: createMockClient,
  deleteClient: deleteMockClient,
  deleteAccount: async () => readOnlyError('delete your account'),
  updateClient: updateMockClient,
  createClientGroup: createMockClientGroup,
  updateClientGroup: updateMockClientGroup,
  archiveClientGroup: archiveMockClientGroup,
  reactivateClientGroup: reactivateMockClientGroup,
  createService: async () => readOnlyError('manage services in the v2 backend'),
  updateService: async () => readOnlyError('manage services in the v2 backend'),
  deactivateService: async () => readOnlyError('manage services in the v2 backend'),
  reactivateService: async () => readOnlyError('manage services in the v2 backend'),
  permanentlyDeleteService: async () => readOnlyError('manage services in the v2 backend'),
  createAppointmentLog: async () => readOnlyError('create appointment logs in the v2 backend'),
  updateAppointmentLog: async () => readOnlyError('update appointment logs in the v2 backend'),
  deleteAppointmentLog: async () => readOnlyError('delete appointment logs in the v2 backend'),
  upsertColorAnalysisForClient: async () =>
    readOnlyError('save color charts in the v2 backend'),
}
