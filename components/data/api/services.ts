import { request, ApiRequestError } from './core'

type ApiService = {
  id: number
  owner_user_id: number
  name: string
  normalized_name: string
  sort_order: number
  default_price_cents: number | null
  is_active: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

type ApiServiceListResponse = {
  items: ApiService[]
}

export type ServiceOption = {
  id: number
  name: string
  normalizedName: string
  sortOrder: number
  defaultPriceCents: number | null
  isActive: boolean
  usageCount: number
}

export type CreateServiceInput = {
  name: string
  sortOrder?: number
  defaultPriceCents?: number | null
}

export type UpdateServiceInput = {
  serviceId: number
  name?: string
  sortOrder?: number
  defaultPriceCents?: number | null
  isActive?: boolean
}

const toServiceOption = (service: ApiService): ServiceOption => ({
  id: service.id,
  name: service.name,
  normalizedName: service.normalized_name,
  sortOrder: service.sort_order,
  defaultPriceCents: service.default_price_cents ?? null,
  isActive: service.is_active,
  usageCount: service.usage_count ?? 0,
})

export async function fetchServicesFromApi(
  active: 'true' | 'false' | 'all' = 'true'
): Promise<ServiceOption[]> {
  const response = await request<ApiServiceListResponse | ApiService[]>(
    `/services?active=${active}`,
    { method: 'GET' }
  )
  const items = Array.isArray(response) ? response : response.items
  return items.map(toServiceOption)
}

export async function createServiceViaApi(
  input: CreateServiceInput
): Promise<ServiceOption> {
  const response = await request<ApiService>('/services', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      sort_order: input.sortOrder,
      default_price_cents: input.defaultPriceCents ?? null,
    }),
  })
  return toServiceOption(response)
}

export async function updateServiceViaApi(
  input: UpdateServiceInput
): Promise<ServiceOption> {
  const payload: Record<string, unknown> = {}
  if (input.name !== undefined) payload.name = input.name
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder
  if (input.defaultPriceCents !== undefined) {
    payload.default_price_cents = input.defaultPriceCents
  }
  if (input.isActive !== undefined) payload.is_active = input.isActive

  const response = await request<ApiService>(`/services/${input.serviceId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return toServiceOption(response)
}

export async function deactivateServiceViaApi(serviceId: number): Promise<void> {
  await request<unknown>(`/services/${serviceId}`, {
    method: 'DELETE',
  })
}

export async function reactivateServiceViaApi(
  serviceId: number
): Promise<ServiceOption> {
  return updateServiceViaApi({
    serviceId,
    isActive: true,
  })
}

export async function permanentlyDeleteServiceViaApi(serviceId: number): Promise<void> {
  try {
    await request<unknown>(`/services/${serviceId}/permanent`, {
      method: 'DELETE',
    })
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      throw new Error(
        'Permanent delete is not available on your current backend deployment yet.'
      )
    }
    throw error
  }
}
