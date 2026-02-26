import type { AppointmentHistory, Client, ClientType } from 'components/mockData'

const DEFAULT_API_BASE_URL = 'https://myguestv2back.onrender.com/api/v1'

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/+$/, '')

const DEV_ID_TOKEN = process.env.EXPO_PUBLIC_DEV_ID_TOKEN?.trim()
type AuthTokenProvider = () => Promise<string | null>

type ApiErrorEnvelope = {
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

type ApiClient = {
  id: number
  owner_user_id: number
  first_name: string
  last_name: string
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

type ApiFormula = {
  id: number
  client_id: number
  service_type: string | null
  notes: string | null
  price_cents: number | null
  service_at: string
  images?: ApiFormulaImage[]
}

type ApiFormulaImage = {
  id: number
  formula_id: number
  storage_provider: string
  public_url: string | null
  object_key: string | null
  file_name: string
}

type ApiFormulaListResponse = {
  total: number
  limit: number
  offset: number
  items: ApiFormula[]
}

let syncPromise: Promise<void> | null = null
let syncedToken: string | null = null
let authTokenProvider: AuthTokenProvider | null = null

function hasDevToken() {
  return Boolean(DEV_ID_TOKEN)
}

function getDevToken() {
  if (!DEV_ID_TOKEN) {
    throw new Error(
      'Not authenticated. Sign in with Google or set EXPO_PUBLIC_DEV_ID_TOKEN in .env.'
    )
  }
  return DEV_ID_TOKEN
}

async function getRequestToken() {
  if (authTokenProvider) {
    const token = await authTokenProvider()
    if (token) return token
  }
  return getDevToken()
}

function normalizeClientType(rawType: string | null | undefined): ClientType {
  const normalized = (rawType ?? '').trim().toLowerCase()
  if (normalized === 'cut') return 'Cut'
  if (normalized === 'color') return 'Color'
  return 'Cut & Color'
}

function normalizeServiceType(rawType: string | null | undefined) {
  const normalized = (rawType ?? '').trim()
  if (!normalized) return 'Service'
  if (normalized.toLowerCase() === 'cut') return 'Cut'
  if (normalized.toLowerCase() === 'color') return 'Color'
  if (normalized.toLowerCase() === 'cut & color') return 'Cut & Color'
  return normalized
}

function toClientModel(client: ApiClient): Client {
  const clientType = normalizeClientType(client.client_type)
  return {
    id: String(client.id),
    name: `${client.first_name} ${client.last_name}`.trim(),
    email: client.email ?? '',
    phone: client.phone ?? '',
    lastVisit: '—',
    type: clientType,
    revenueYtd: 0,
    tag: clientType,
    status: 'Inactive',
    notes: client.notes ?? '',
  }
}

function toAppointmentModel(formula: ApiFormula): AppointmentHistory {
  const images =
    formula.images
      ?.map((image) => image.public_url ?? image.object_key ?? '')
      .filter((url) => Boolean(url)) ?? []

  return {
    id: `h-${formula.id}`,
    clientId: String(formula.client_id),
    date: formula.service_at,
    services: normalizeServiceType(formula.service_type),
    price: formula.price_cents ? formula.price_cents / 100 : 0,
    notes: formula.notes ?? '',
    images,
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const payload = text ? (JSON.parse(text) as T | ApiErrorEnvelope) : ({} as T)
  if (!response.ok) {
    const errorPayload = payload as ApiErrorEnvelope
    const message =
      errorPayload.error?.message ||
      `Request failed with status ${response.status}.`
    throw new Error(message)
  }
  return payload as T
}

async function requestRaw<T>(
  path: string,
  init: RequestInit,
  token: string
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)

  const hasJsonBody =
    typeof init.body === 'string' && init.body.length > 0 && !headers.has('Content-Type')
  if (hasJsonBody) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })
  return parseResponse<T>(response)
}

async function ensureSessionSynced(token: string) {
  if (syncedToken === token) return
  if (!syncPromise) {
    syncPromise = requestRaw('/auth/sync', { method: 'POST' }, token)
      .then(() => {
        syncedToken = token
      })
      .finally(() => {
        syncPromise = null
      })
  }
  await syncPromise
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getRequestToken()
  if (path !== '/auth/sync') {
    await ensureSessionSynced(token)
  }
  return requestRaw<T>(path, init, token)
}

export function hasStaticDevToken() {
  return hasDevToken()
}

export function setAuthTokenProvider(provider: AuthTokenProvider | null) {
  authTokenProvider = provider
  syncedToken = null
}

export async function fetchClientsFromApi(): Promise<Client[]> {
  const response = await request<ApiClientListResponse>(
    '/clients?limit=100&offset=0&sort=first_name&order=asc',
    { method: 'GET' }
  )
  return response.items.map(toClientModel)
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

export async function fetchAppointmentHistoryFromApi(): Promise<AppointmentHistory[]> {
  const clientsResponse = await request<ApiClientListResponse>(
    '/clients?limit=100&offset=0&sort=first_name&order=asc',
    { method: 'GET' }
  )

  const appointmentHistory: AppointmentHistory[] = []

  for (const client of clientsResponse.items) {
    const formulasResponse = await request<ApiFormulaListResponse>(
      `/clients/${client.id}/formulas?limit=100&offset=0`,
      { method: 'GET' }
    )

    for (const formula of formulasResponse.items) {
      appointmentHistory.push(toAppointmentModel(formula))
    }
  }

  return appointmentHistory.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
