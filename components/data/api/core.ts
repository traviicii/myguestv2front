import { API_BASE_URL, USE_MOCK_DATA } from '../config'

const DEV_ID_TOKEN = process.env.EXPO_PUBLIC_DEV_ID_TOKEN?.trim()

type AuthTokenProvider = () => Promise<string | null>

type ApiErrorEnvelope = {
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

export class ApiRequestError extends Error {
  status: number
  code: string | null

  constructor(message: string, status: number, code: string | null) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

const tokenSyncPromises = new Map<string, Promise<void>>()
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
  const existingSync = tokenSyncPromises.get(token)
  if (existingSync) {
    await existingSync
    return
  }

  const syncForToken = requestRaw('/auth/sync', { method: 'POST' }, token)
    .then(() => {
      syncedToken = token
    })
    .finally(() => {
      tokenSyncPromises.delete(token)
    })

  tokenSyncPromises.set(token, syncForToken)
  await syncForToken
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getRequestToken()
  if (path !== '/auth/sync') {
    await ensureSessionSynced(token)
  }
  return requestRaw<T>(path, init, token)
}

export function hasStaticDevToken() {
  return USE_MOCK_DATA || hasDevToken()
}

export function setAuthTokenProvider(provider: AuthTokenProvider | null) {
  authTokenProvider = provider
  syncedToken = null
  tokenSyncPromises.clear()
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const isNotFoundError = (error: unknown) =>
  error instanceof ApiRequestError &&
  (error.status === 404 || error.code === 'not_found')

export const toClientIdString = (value: unknown): string | null => {
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
