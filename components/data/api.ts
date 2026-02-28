import type {
  AppointmentImageRef,
  AppointmentHistory,
  Client,
  ClientType,
  ColorAnalysis,
} from 'components/mockData'
import { normalizeServiceName } from 'components/utils/services'

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

class ApiRequestError extends Error {
  status: number
  code: string | null

  constructor(message: string, status: number, code: string | null) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

type ApiClient = {
  id: number
  owner_user_id: number
  first_name: string
  last_name: string
  created_at?: string | null
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
  services?: ApiFormulaService[]
  notes: string | null
  price_cents: number | null
  service_at: string
  images?: ApiFormulaImage[]
}

type ApiFormulaService = {
  service_id: number
  name: string
  position: number
  label_snapshot: string
}

type ApiFormulaImage = {
  id: number
  formula_id: number
  storage_provider: string
  public_url: string | null
  object_key: string | null
  file_name: string
}

export type FormulaImageInput = {
  storageProvider?: string
  publicUrl?: string | null
  objectKey?: string | null
  fileName?: string
}

type ApiFormulaListResponse = {
  total: number
  limit: number
  offset: number
  items: ApiFormula[]
}

type ApiService = {
  id: number
  owner_user_id: number
  name: string
  normalized_name: string
  sort_order: number
  is_active: boolean
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
  isActive: boolean
}

type ApiColorChart = {
  id: number
  client_id: number
  porosity: string | null
  hair_texture: string | null
  elasticity: string | null
  scalp_condition: string | null
  natural_level: string | null
  desired_level: string | null
  contrib_pigment: string | null
  gray_front: string | null
  gray_sides: string | null
  gray_back: string | null
  skin_depth: string | null
  skin_tone: string | null
  eye_color: string | null
}

type ApiColorChartListResponse = {
  total: number
  limit: number
  offset: number
  items: ApiColorChart[]
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
  const normalized = normalizeServiceName(rawType ?? '')
  if (!normalized) return 'Service'
  return normalized
}

const normalizeColorValue = (value: string | null | undefined) => {
  const trimmed = (value ?? '').trim()
  return trimmed || '—'
}

function toClientModel(client: ApiClient): Client {
  const clientType = normalizeClientType(client.client_type)
  return {
    id: String(client.id),
    name: `${client.first_name} ${client.last_name}`.trim(),
    email: client.email ?? '',
    phone: client.phone ?? '',
    createdAt: client.created_at ?? undefined,
    lastVisit: '—',
    type: clientType,
    revenueYtd: 0,
    tag: clientType,
    status: 'Inactive',
    notes: client.notes ?? '',
  }
}

function toAppointmentModel(formula: ApiFormula): AppointmentHistory {
  const imageRefs: AppointmentImageRef[] =
    formula.images?.map((image) => ({
      storageProvider: image.storage_provider,
      publicUrl: image.public_url ?? null,
      objectKey: image.object_key ?? null,
      fileName: image.file_name,
    })) ?? []
  const images = imageRefs
    .map((image) => image.publicUrl ?? image.objectKey ?? '')
    .filter((url) => Boolean(url))
  const serviceRows = [...(formula.services ?? [])].sort((a, b) => a.position - b.position)
  const serviceLabels = serviceRows
    .map((item) => normalizeServiceName(item.name || item.label_snapshot || ''))
    .filter(Boolean)
  const serviceIds = serviceRows.map((item) => item.service_id)
  const primaryService = serviceLabels[0] ?? normalizeServiceType(formula.service_type)

  return {
    id: `h-${formula.id}`,
    clientId: String(formula.client_id),
    date: formula.service_at,
    services: primaryService,
    serviceIds: serviceIds.length ? serviceIds : undefined,
    serviceLabels: serviceLabels.length ? serviceLabels : undefined,
    price: formula.price_cents ? formula.price_cents / 100 : 0,
    notes: formula.notes ?? '',
    images,
    imageRefs: imageRefs.length ? imageRefs : undefined,
  }
}

const toServiceOption = (service: ApiService): ServiceOption => ({
  id: service.id,
  name: service.name,
  normalizedName: service.normalized_name,
  sortOrder: service.sort_order,
  isActive: service.is_active,
})

const toFormulaId = (formulaId: string) => {
  const normalized = formulaId.replace(/^h-/, '').trim()
  if (!/^\d+$/.test(normalized)) {
    throw new Error('Invalid appointment id.')
  }
  return Number(normalized)
}

const toServiceAtIso = (value: string) => {
  const trimmed = (value || '').trim()
  if (!trimmed) {
    throw new Error('Appointment date is required.')
  }

  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slashMatch) {
    const month = slashMatch[1]
    const day = slashMatch[2]
    const year = slashMatch[3]
    return `${year}-${month}-${day}T00:00:00Z`
  }

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoDateMatch) {
    return `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}T00:00:00Z`
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString()
  }

  throw new Error('Invalid appointment date format.')
}

const toPriceCents = (price: number | null | undefined) => {
  if (price === null || price === undefined || Number.isNaN(price)) return null
  return Math.round(price * 100)
}

type FlexibleColorChart = Partial<ApiColorChart> &
  Partial<{
    clientId: number | string | null
    texture: string | null
    scalpCondition: string | null
    naturalLevel: string | null
    desiredLevel: string | null
    contributingPigment: string | null
    grayFront: string | null
    graySides: string | null
    grayBack: string | null
    skinDepth: string | null
    skinTone: string | null
    eyeColor: string | null
  }>

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNotFoundError = (error: unknown) =>
  error instanceof ApiRequestError &&
  (error.status === 404 || error.code === 'not_found')

const toClientIdString = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    if (/^\d+$/.test(trimmed)) return trimmed
    const digits = trimmed.match(/\d+/)
    return digits ? digits[0] : null
  }
  return null
}

const getColorChartClientId = (value: unknown): string | null => {
  if (!isRecord(value)) return null
  return toClientIdString(value.client_id ?? value.clientId)
}

const coerceColorChartItems = (payload: unknown): FlexibleColorChart[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is FlexibleColorChart => isRecord(item))
  }
  if (!isRecord(payload)) return []

  const items =
    payload.items ??
    payload.colorcharts ??
    payload.color_charts ??
    payload.colorchart ??
    null

  if (Array.isArray(items)) {
    return items.filter((item): item is FlexibleColorChart => isRecord(item))
  }
  if (isRecord(items)) {
    return [items as FlexibleColorChart]
  }
  if ('client_id' in payload || 'clientId' in payload) {
    return [payload as FlexibleColorChart]
  }
  return []
}

const mapColorChartItemsByClient = (
  items: FlexibleColorChart[]
): Record<string, ColorAnalysis> => {
  return items.reduce<Record<string, ColorAnalysis>>((acc, chart) => {
    const clientId = getColorChartClientId(chart)
    if (!clientId) return acc
    acc[clientId] = toColorAnalysisModel(chart)
    return acc
  }, {})
}

const colorChartClientPathBuilders = [
  (clientId: number | string) => `/clients/${clientId}/color-chart`,
  (clientId: number | string) => `/clients/${clientId}/colorchart`,
  (clientId: number | string) => `/client/${clientId}/colorchart`,
]

const getColorChartForClientFromPayload = (
  payload: unknown,
  clientId: string
): ColorAnalysis | null => {
  const charts = coerceColorChartItems(payload)
  if (!charts.length) return null

  const match =
    charts.find((item) => getColorChartClientId(item) === clientId) ?? charts[0]
  return toColorAnalysisModel(match)
}

function toColorAnalysisModel(chart: FlexibleColorChart): ColorAnalysis {
  return {
    porosity: normalizeColorValue(chart.porosity),
    texture: normalizeColorValue(chart.hair_texture ?? chart.texture),
    elasticity: normalizeColorValue(chart.elasticity),
    scalpCondition: normalizeColorValue(chart.scalp_condition ?? chart.scalpCondition),
    naturalLevel: normalizeColorValue(chart.natural_level ?? chart.naturalLevel),
    desiredLevel: normalizeColorValue(chart.desired_level ?? chart.desiredLevel),
    contributingPigment: normalizeColorValue(
      chart.contrib_pigment ?? chart.contributingPigment
    ),
    grayFront: normalizeColorValue(chart.gray_front ?? chart.grayFront),
    graySides: normalizeColorValue(chart.gray_sides ?? chart.graySides),
    grayBack: normalizeColorValue(chart.gray_back ?? chart.grayBack),
    skinDepth: normalizeColorValue(chart.skin_depth ?? chart.skinDepth),
    skinTone: normalizeColorValue(chart.skin_tone ?? chart.skinTone),
    eyeColor: normalizeColorValue(chart.eye_color ?? chart.eyeColor),
  }
}

async function fetchColorAnalysisByClientViaClientFallback() {
  const limit = 200
  let offset = 0
  let total = 0
  const clients: ApiClient[] = []

  do {
    const response = await request<ApiClientListResponse>(
      `/clients?limit=${limit}&offset=${offset}&sort=first_name&order=asc`,
      { method: 'GET' }
    )
    total = response.total
    clients.push(...response.items)
    offset += limit
    if (response.items.length === 0) break
  } while (clients.length < total)

  const entries = await Promise.all(
    clients.map(async (client) => {
      for (const buildPath of colorChartClientPathBuilders) {
        try {
          const payload = await request<unknown>(buildPath(client.id), {
            method: 'GET',
          })
          const colorAnalysis = getColorChartForClientFromPayload(
            payload,
            String(client.id)
          )
          if (!colorAnalysis) continue
          return [String(client.id), colorAnalysis] as const
        } catch (error) {
          if (isNotFoundError(error)) {
            continue
          }
          throw error
        }
      }

      return null
    })
  )

  return entries.reduce<Record<string, ColorAnalysis>>((acc, entry) => {
    if (!entry) return acc
    const [clientId, colorAnalysis] = entry
    acc[clientId] = colorAnalysis
    return acc
  }, {})
}

export async function fetchColorAnalysisForClientFromApi(
  clientId: string
): Promise<ColorAnalysis | null> {
  const normalizedClientId = toClientIdString(clientId)
  if (!normalizedClientId) return null

  for (const buildPath of colorChartClientPathBuilders) {
    try {
      const payload = await request<unknown>(buildPath(normalizedClientId), {
        method: 'GET',
      })
      const colorAnalysis = getColorChartForClientFromPayload(
        payload,
        normalizedClientId
      )
      if (colorAnalysis) return colorAnalysis
    } catch (error) {
      if (isNotFoundError(error)) continue
      throw error
    }
  }

  try {
    const payload = await request<unknown>(`/color-charts?limit=500&offset=0`, {
      method: 'GET',
    })
    return getColorChartForClientFromPayload(payload, normalizedClientId)
  } catch (error) {
    if (isNotFoundError(error)) return null
    throw error
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
    throw new ApiRequestError(message, response.status, errorPayload.error?.code ?? null)
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
    '/clients?limit=100&offset=0&sort=created_at&order=desc',
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

export type CreateFormulaInput = {
  clientId: string
  serviceIds: number[]
  serviceType?: string | null
  notes?: string
  price?: number | null
  date: string
  images?: FormulaImageInput[]
}

export type UpdateFormulaInput = {
  formulaId: string
  serviceIds?: number[]
  serviceType?: string | null
  notes?: string | null
  price?: number | null
  date?: string
  images?: FormulaImageInput[]
}

const toApiFormulaImagePayload = (image: FormulaImageInput) => ({
  storage_provider: image.storageProvider ?? null,
  public_url: image.publicUrl ?? null,
  object_key: image.objectKey ?? null,
  file_name: image.fileName ?? null,
})

export async function createFormulaViaApi(input: CreateFormulaInput): Promise<AppointmentHistory> {
  const clientId = toClientIdString(input.clientId)
  if (!clientId) {
    throw new Error('Invalid client id.')
  }

  const payload = {
    service_ids: input.serviceIds,
    service_type: input.serviceType ?? null,
    notes: input.notes?.trim() || null,
    price_cents: toPriceCents(input.price),
    service_at: toServiceAtIso(input.date),
    images: input.images?.map(toApiFormulaImagePayload) ?? [],
  }

  const response = await request<ApiFormula>(`/clients/${clientId}/formulas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return toAppointmentModel(response)
}

export async function updateFormulaViaApi(input: UpdateFormulaInput): Promise<AppointmentHistory> {
  const formulaId = toFormulaId(input.formulaId)
  const payload: Record<string, unknown> = {}

  if (input.serviceIds !== undefined) payload.service_ids = input.serviceIds
  if (input.serviceType !== undefined) payload.service_type = input.serviceType
  if (input.notes !== undefined) payload.notes = input.notes?.trim() || null
  if (input.price !== undefined) payload.price_cents = toPriceCents(input.price)
  if (input.date !== undefined) payload.service_at = toServiceAtIso(input.date)
  if (input.images !== undefined) payload.images = input.images.map(toApiFormulaImagePayload)

  const response = await request<ApiFormula>(`/formulas/${formulaId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return toAppointmentModel(response)
}

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

export type CreateServiceInput = {
  name: string
  sortOrder?: number
}

export async function createServiceViaApi(input: CreateServiceInput): Promise<ServiceOption> {
  const response = await request<ApiService>('/services', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      sort_order: input.sortOrder,
    }),
  })
  return toServiceOption(response)
}

export type UpdateServiceInput = {
  serviceId: number
  name?: string
  sortOrder?: number
  isActive?: boolean
}

export async function updateServiceViaApi(input: UpdateServiceInput): Promise<ServiceOption> {
  const payload: Record<string, unknown> = {}
  if (input.name !== undefined) payload.name = input.name
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder
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

export async function reactivateServiceViaApi(serviceId: number): Promise<ServiceOption> {
  return updateServiceViaApi({
    serviceId,
    isActive: true,
  })
}

export async function fetchAppointmentHistoryFromApi(): Promise<AppointmentHistory[]> {
  try {
    const limit = 200
    let offset = 0
    let total = 0
    const items: ApiFormula[] = []

    do {
      const formulasResponse = await request<ApiFormulaListResponse>(
        `/formulas?limit=${limit}&offset=${offset}`,
        { method: 'GET' }
      )
      total = formulasResponse.total
      items.push(...formulasResponse.items)
      offset += limit
      if (formulasResponse.items.length === 0) break
    } while (items.length < total)

    return items
      .map(toAppointmentModel)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    const notFound =
      error instanceof ApiRequestError &&
      (error.status === 404 || error.code === 'not_found')
    if (!notFound) {
      throw error
    }

    // Backward-compatible fallback for backends that don't yet expose GET /formulas.
    const clientsResponse = await request<ApiClientListResponse>(
      '/clients?limit=100&offset=0&sort=first_name&order=asc',
      { method: 'GET' }
    )

    const formulaResponses = await Promise.all(
      clientsResponse.items.map((client) =>
        request<ApiFormulaListResponse>(
          `/clients/${client.id}/formulas?limit=100&offset=0`,
          { method: 'GET' }
        )
      )
    )

    return formulaResponses
      .flatMap((response) => response.items.map(toAppointmentModel))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}

export async function fetchColorAnalysisByClientFromApi(): Promise<
  Record<string, ColorAnalysis>
> {
  let primaryResult: Record<string, ColorAnalysis> = {}

  try {
    const limit = 200
    let offset = 0
    let total: number | null = null
    const items: FlexibleColorChart[] = []

    while (true) {
      const response = await request<unknown>(
        `/color-charts?limit=${limit}&offset=${offset}`,
        { method: 'GET' }
      )

      const responseItems = coerceColorChartItems(response)
      items.push(...responseItems)

      const payload = response as Partial<ApiColorChartListResponse>
      const hasPaginatedShape = Array.isArray(payload.items)
      if (!hasPaginatedShape) {
        break
      }

      total = typeof payload.total === 'number' ? payload.total : null
      offset += limit
      if (responseItems.length === 0) break
      if (total !== null && items.length >= total) break
    }

    primaryResult = mapColorChartItemsByClient(items)
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error
    }
  }

  if (Object.keys(primaryResult).length > 0) {
    return primaryResult
  }

  try {
    return await fetchColorAnalysisByClientViaClientFallback()
  } catch (error) {
    if (isNotFoundError(error)) {
      // Backward-compatible fallback for backends that don't expose color charts yet.
      return {}
    }
    throw error
  }
}
