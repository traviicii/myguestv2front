import { request } from './core'

export type ClientGroup = {
  id: number
  name: string
  normalizedName: string
  sortOrder: number
  archivedAt: string | null
  clientCount: number
}

type ApiClientGroup = {
  id: number
  owner_user_id: number
  name: string
  normalized_name: string
  sort_order: number
  archived_at: string | null
  client_count: number
  created_at: string
  updated_at: string
}

type ApiClientGroupListResponse = {
  items: ApiClientGroup[]
}

export type CreateClientGroupInput = {
  name: string
  sortOrder?: number
}

export type UpdateClientGroupInput = {
  groupId: number
  name?: string
  sortOrder?: number
  archived?: boolean
}

const toClientGroup = (group: ApiClientGroup): ClientGroup => ({
  id: group.id,
  name: group.name,
  normalizedName: group.normalized_name,
  sortOrder: group.sort_order,
  archivedAt: group.archived_at ?? null,
  clientCount: group.client_count ?? 0,
})

export async function fetchClientGroupsFromApi(
  active: 'true' | 'false' | 'all' = 'true'
): Promise<ClientGroup[]> {
  const response = await request<ApiClientGroupListResponse | ApiClientGroup[]>(
    `/client-groups?active=${active}`,
    { method: 'GET' }
  )
  const items = Array.isArray(response) ? response : response.items
  return items.map(toClientGroup)
}

export async function createClientGroupViaApi(
  input: CreateClientGroupInput
): Promise<ClientGroup> {
  const response = await request<ApiClientGroup>('/client-groups', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      sort_order: input.sortOrder,
    }),
  })
  return toClientGroup(response)
}

export async function updateClientGroupViaApi(
  input: UpdateClientGroupInput
): Promise<ClientGroup> {
  const payload: Record<string, unknown> = {}
  if (input.name !== undefined) payload.name = input.name
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder
  if (input.archived !== undefined) payload.archived = input.archived

  const response = await request<ApiClientGroup>(`/client-groups/${input.groupId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return toClientGroup(response)
}

export async function archiveClientGroupViaApi(groupId: number): Promise<void> {
  await request<unknown>(`/client-groups/${groupId}`, {
    method: 'DELETE',
  })
}

export async function reactivateClientGroupViaApi(groupId: number): Promise<ClientGroup> {
  return updateClientGroupViaApi({
    groupId,
    archived: false,
  })
}
