export const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true'

export const MISSING_API_BASE_URL_ERROR =
  'Real API mode requires EXPO_PUBLIC_API_BASE_URL. Set it in .env or enable EXPO_PUBLIC_USE_MOCK_DATA=true.'

export function normalizeApiBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '')
}

export function normalizeExternalUrl(value: string) {
  return value.trim()
}

export function resolveApiBaseUrl({
  apiBaseUrl,
  useMockData,
}: {
  apiBaseUrl?: string | null
  useMockData: boolean
}) {
  const normalizedApiBaseUrl = apiBaseUrl ? normalizeApiBaseUrl(apiBaseUrl) : ''
  if (normalizedApiBaseUrl) {
    return normalizedApiBaseUrl
  }
  if (useMockData) {
    return ''
  }
  // Fail closed so local development cannot silently hit the hosted API.
  throw new Error(MISSING_API_BASE_URL_ERROR)
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL
  ? normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL)
  : ''

export const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL
  ? normalizeExternalUrl(process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL)
  : ''

export const SUPPORT_URL = process.env.EXPO_PUBLIC_SUPPORT_URL
  ? normalizeExternalUrl(process.env.EXPO_PUBLIC_SUPPORT_URL)
  : ''

export function getApiBaseUrl() {
  return resolveApiBaseUrl({
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    useMockData: USE_MOCK_DATA,
  })
}
