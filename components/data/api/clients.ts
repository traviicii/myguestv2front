import type { Client, ClientType } from '../models'

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
  notes: string | null
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
  clientType: ClientType
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
  notes?: string | null
}

export type DeleteAccountInput = {
  email?: string | null
}

function normalizeClientType(rawType: string | null | undefined): ClientType {
  const normalized = (rawType ?? '').trim().toLowerCase()
  if (normalized === 'cut') return 'Cut'
  if (normalized === 'color') return 'Color'
  return 'Cut & Color'
}

function toClientModel(client: ApiClient): Client {
  const clientType = normalizeClientType(client.client_type)
  const hasLastVisit = Boolean(client.last_service_at)
  return {
    id: String(client.id),
    name: `${client.first_name} ${client.last_name}`.trim(),
    email: client.email ?? '',
    phone: client.phone ?? '',
    createdAt: client.created_at ?? undefined,
    lastVisit: hasLastVisit ? (client.last_service_at as string) : 'No visits yet',
    type: clientType,
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
    phone: input.phone?.trim() || null,
    birthday: input.birthday?.trim() || null,
    client_type: input.clientType,
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
  if (input.phone !== undefined) payload.phone = input.phone?.trim() || null
  if (input.birthday !== undefined) payload.birthday = input.birthday?.trim() || null
  if (input.clientType !== undefined) payload.client_type = input.clientType
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
