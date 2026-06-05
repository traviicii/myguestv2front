import type { Client, ClientGroup, ClientType } from '../models'
import { normalizePhoneForStorage } from 'components/utils/phone'

import { request, toClientIdString } from './core'

type ApiClient = {
  id: number
  owner_user_id: number
  first_name: string
  last_name: string
  created_at?: string | null
  last_service_at?: string | null
  email: string | null
  phone: string | null
  birthday: string | null
  client_type: string | null
  groups?: ApiClientGroup[] | null
  notes: string | null
}

type ApiClientGroup = {
  id: number
  owner_user_id: number
  name: string
  normalized_name: string
  sort_order: number
  archived_at?: string | null
  client_count?: number | null
  created_at?: string
  updated_at?: string
}

type ApiClientListResponse = {
  total: number
  limit: number
  offset: number
  items: ApiClient[]
}

type ApiAccountDeleteResponse = {
  deleted: boolean
  images_deleted: number
  images_failed: number
  firebase_user_deleted: boolean
}

export type CreateClientInput = {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  birthday?: string
  clientType?: ClientType
  groupIds?: number[]
  notes?: string
}

export type UpdateClientInput = {
  clientId: string
  firstName?: string
  lastName?: string
  email?: string | null
  phone?: string | null
  birthday?: string | null
  clientType?: ClientType
  groupIds?: number[]
  notes?: string | null
}

export type DeleteAccountInput = {
  email?: string | null
}

function normalizeClientType(rawType: string | null | undefined): ClientType {
  return (rawType ?? '').trim()
}

function toClientGroup(group: ApiClientGroup): ClientGroup {
  return {
    id: group.id,
    name: group.name,
    normalizedName: group.normalized_name,
    sortOrder: group.sort_order,
    archivedAt: group.archived_at ?? null,
    clientCount: group.client_count ?? 0,
  }
}

function summarizeClientGroups(groups: ClientGroup[], fallbackType: string) {
  if (groups.length === 0) return fallbackType || 'Ungrouped'
  if (groups.length === 1) return groups[0]?.name ?? fallbackType ?? 'Ungrouped'
  if (groups.length === 2) return groups.map((group) => group.name).join(' + ')
  return `${groups[0]?.name ?? 'Group'} +${groups.length - 1}`
}

function toClientModel(client: ApiClient): Client {
  const groups = (client.groups ?? []).map(toClientGroup)
  const clientType = summarizeClientGroups(groups, normalizeClientType(client.client_type))
  const hasLastVisit = Boolean(client.last_service_at)
  return {
    id: String(client.id),
    firstName: client.first_name,
    lastName: client.last_name,
    name: `${client.first_name} ${client.last_name}`.trim(),
    email: client.email ?? '',
    phone: client.phone ?? '',
    birthday: client.birthday ?? null,
    createdAt: client.created_at ?? undefined,
    lastVisit: hasLastVisit ? (client.last_service_at as string) : 'No visits yet',
    type: clientType,
    groupIds: groups.map((group) => group.id),
    groups,
    revenueYtd: 0,
    tag: '',
    status: 'Inactive',
    notes: client.notes ?? '',
  }
}

export async function fetchClientsFromApi(): Promise<Client[]> {
  const limit = 100
  let offset = 0
  let total = 0
  const items: ApiClient[] = []

  do {
    const response = await request<ApiClientListResponse>(
      `/clients?limit=${limit}&offset=${offset}&sort=created_at&order=desc`,
      { method: 'GET' }
    )
    total = response.total
    items.push(...response.items)
    offset += limit
    if (response.items.length === 0) break
  } while (items.length < total)

  return items.map(toClientModel)
}

export async function createClientViaApi(input: CreateClientInput): Promise<Client> {
  const payload = {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email?.trim() || null,
    phone: normalizePhoneForStorage(input.phone ?? '') || null,
    birthday: input.birthday?.trim() || null,
    client_type: input.clientType?.trim() || null,
    group_ids: input.groupIds ?? [],
    notes: input.notes?.trim() || null,
  }

  const response = await request<ApiClient>('/clients', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return toClientModel(response)
}

export async function updateClientViaApi(input: UpdateClientInput): Promise<Client> {
  const clientId = toClientIdString(input.clientId)
  if (!clientId) {
    throw new Error('Invalid client id.')
  }

  const payload: Record<string, unknown> = {}
  if (input.firstName !== undefined) {
    const firstName = input.firstName.trim()
    if (!firstName) {
      throw new Error('First name is required.')
    }
    payload.first_name = firstName
  }
  if (input.lastName !== undefined) {
    const lastName = input.lastName.trim()
    if (!lastName) {
      throw new Error('Last name is required.')
    }
    payload.last_name = lastName
  }
  if (input.email !== undefined) payload.email = input.email?.trim() || null
  if (input.phone !== undefined) {
    payload.phone = normalizePhoneForStorage(input.phone ?? '') || null
  }
  if (input.birthday !== undefined) payload.birthday = input.birthday?.trim() || null
  if (input.clientType !== undefined) payload.client_type = input.clientType?.trim() || null
  if (input.groupIds !== undefined) payload.group_ids = input.groupIds
  if (input.notes !== undefined) payload.notes = input.notes?.trim() || null

  if (Object.keys(payload).length === 0) {
    throw new Error('No client fields to update.')
  }

  const response = await request<ApiClient>(`/clients/${clientId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return toClientModel(response)
}

export async function deleteClientViaApi(clientId: string): Promise<void> {
  const normalizedClientId = toClientIdString(clientId)
  if (!normalizedClientId) {
    throw new Error('Invalid client id.')
  }

  await request<unknown>(`/clients/${normalizedClientId}`, {
    method: 'DELETE',
  })
}

export async function deleteAccountViaApi(
  input: DeleteAccountInput
): Promise<ApiAccountDeleteResponse> {
  const payload = {
    email: input.email ?? null,
  }
  return request<ApiAccountDeleteResponse>('/account/delete', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
